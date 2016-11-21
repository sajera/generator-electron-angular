
'use strict';

var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
/*-------------------------------------------------
	GENERATOR
---------------------------------------------------*/
var $ = require('./util.js');

module.exports = yeoman.Base.extend({
	/*-------------------------------------------------
	PHASE INITIALIZING  
	---------------------------------------------------*/
	initializing: {
		// prepare util to work with this generator generator
		makeUtils: $.generator,
		// try to get a user data
		getUser: function () {
			$.set(Object.assign({
				'appName': $.destDir('DIR_NAME'),
				'appVersion': '0.0.1',
				'instalation': 'progress', // checking and store state of instalation
			}, $.get()));
			// try get user name
			var username = $.get('user') || this.user.git.name();
			if ( !username ) { // if can`t find user name ask from user
				return new Promise( function ( resolve, reject ) {
					$.askString('Sorry, I could not identify your name. Enter it please.', {default: 'Freeman'})
					.then( function ( name ) { $.set('user', name); resolve(); });
				});
			} else { $.set('user', username); }
		},
		// say hello or hello again
		hello: function () {
			if ( $.get('instalation') == 'progress' ) {
				this.log(yosay( 'Hello '+$.highlight($.get('user'))+' !\nlet`s create a '+ $.highlight('electron-angular')+'\nproject - '+ chalk.magenta.bold($.get('appName'))+' ?' ));
			} else {
				this.log(yosay('\nHello again '+$.highlight($.get('user'))+' !\nWhat would you like to do ?'));
				return new Promise( function ( resolve, reject ) {
					$.askChoose('\nelectron-angular '+$.highlight('TODO:'), {choices: [
						{ name: 'Sorry nothing. (prevent)', value: 'prevent'},
						{ name: 'Something broke. (repair)', value: 'repair'},
						{ name: 'I cannot use this shit! (clear all)', value: 'clear'},
					]})
					.then( function ( res ) {
						if ( res == 'clear' ) {
							$('removeFiles', [
								'.gitignore', '.npmignore', '.bowerrc', '.eslintrc', '.eslintrc.json', '.bower/**',
								'.tmp/**', '.yo-rc.json', '**/*.*', '**'
							]);
							$.preventInstalation(); // throw error and poor message
						} else if ( res == 'prevent' ) {
							$.preventInstalation('silently'); // throw error
						}else if ( res == 'repair' ) {
							$.set('instalation', 'progress');
							resolve();
						}
					});
				});
			}
		}
	},
	/*-------------------------------------------------
	PHASE DEFINATION extend generator variables from user options
	---------------------------------------------------*/
	prompting: {
		instalation: function () {
			if ( $.get('instalation') == 'progress' ) {
				return new Promise( function ( resolve, reject ) {
					// 
					$.askString('Enter the project '+$.highlight('name')+':', {default: $.get('appName')})
					.then( function ( name ) {
						// app name to "package.json" format
						name = name.toLowerCase().replace(/^\s+|\s+$/g, '').replace(/\s+/g,'_');
						if ( !/^[a-zA-Z0-9@\/][a-zA-Z0-9@\/\.\-_]*$/.test(name) ) {
							name = $.get('appName');
						}
						$.askString('Enter a project '+$.highlight('version')+':', {default: $.get('appVersion')})
						.then( function ( version ) {
							// app version to "package.json" format
							var valid = /^[0-9]+\.[0-9]+[0-9+a-zA-Z\.\-]+$/;
							if ( !valid.test(version) ) {
								version = valid.test(parseInt(version)+'.0.0') ? parseInt(version)+'.0.0' : $.get('appVersion');
							}
							$.askString('Enter a project '+$.highlight('description')+':', {default: 'test application'})
							.then( function ( description ) {
								// 
								$.askChoose('\nSelect the application '+$.highlight('license'), {choices: [
									{ name: 'No shanks (do not touch the license)', value: null},
									{ name: 'Apache License Version 2.0 (Apache-2.0)', value: 'Apache-2.0'},
									{ name: 'The BSD 3-Clause License (FreeBSD 3)', value: 'BSD'},
									{ name: 'CC0 1.0 Universal (CC0 1.0)', value: 'CC0-1.0'},
									{ name: 'ISC License (ISC)', value: 'ISC'},
									{ name: 'The MIT License (MIT)', value: 'MIT'},
									{ name: 'Whatever you want (unlicense)', value: 'unlicense'},
								]})
								.then( function ( license ) {
									license && $.set('license', license);
									// 
									$.askString('Angular root module '+$.highlight('name')+':', {default: $.abbr(name)+'app'})
									.then( function ( root ) {
										// validation app angular root
										var valid = /^[^0-9\W\_]+$/g;
										if ( !valid.test(root) ) { root = root.replace(/^[^0-9\W\_]+$/g, ''); }
										$.set({
											'appName': name,
											'appVersion': version,
											'description': description,
											'angularRoot': root
										});
										resolve();
									});
								});
							});
						});
					});
				});
			}
		},
		/**
		 * method to get choosen preprocessors
		 */
		preprocessors: function () {
			return new Promise( function ( resolve, reject ) {
				//
				$.askChoose('Choose a preprocessing for '+$.highlight('javascript')+':', {choices: [
					{ name: 'None (js)', value: null },
					// { name: 'Babel', value: 'babel' },
					{ name: 'TypeScript (ts)', value: 'typescript' },
					{ name: 'CofeeScript (cofee)', value: 'coffeescript' }
				]})
				.then( function ( js ) {
					//
					$.askChoose('Choose a preprocessing for '+$.highlight('css')+':', {choices: [
						{ name: 'None (css)', value: null },
						{ name: 'LESS (less)', value: 'less' },
						{ name: 'STYLUS (styl)', value: 'stylus' },
						{ name: 'SASS (sass/scss)', value: 'sass' },
					]})
					.then( function ( css ) {
						$.set('preprocessors', { 'css': css, 'js': js });
						resolve();
					});
				});
			});
		},
	},
	/*-------------------------------------------------
		PHASE CONFIGURATION 
	---------------------------------------------------*/
	configuring: function () {
		var config = $.get();
		var email = this.user.git.email()||(config.user+'@unknown.com');
		if ( config['instalation'] == 'progress') {
			var options = {
				name: config.appName,
				version: config.appVersion,
				description: config.description,
				author: {
					name: config.user,
					email: email
				}
			};
			// merge project/template bower.json and options from variables
			$.writePackage('bower.json', options);
			// if user won add license
			config.license && (options.license = config.license);
			// package for application dependencies !!!!!!!!
			$.writePackage('source/package.json', options);
			// add owner like a contributor
			options.contributors = [options.author];
			// merge project/template package.json and options from variables
			$.writePackage('package.json', options);
		}
	},
	/*-------------------------------------------------
		PHASE DEFAULT
	---------------------------------------------------*/
	default: function () {
		if ( $.get('instalation') == 'progress' ) {
			this.log('\ninstalation default\n');
		}
	},
	/*-------------------------------------------------
		PHASE WRITING
	---------------------------------------------------*/
	writing: function () {
		var generator = this;
		var config = $.get();
		if ( config['instalation'] == 'progress' ) {
			// .gitignore isn't copying https://github.com/yeoman/generator/issues/812
			// make a file copy with change destination filename
			generator.fs.copyTpl( $.sourceDir('template.gitignore'), $.destDir('.gitignore'), {});
			// copy license if user won add license
			if (config.license) {
				var ld = {
					email: generator.user.git.email()||'',
					year: (new Date()).getFullYear(),
					author: config.user,
				};
				generator.fs.copyTpl( $.sourceDir(require('path').join('license', config.license+'.txt')), $.destDir('LICENSE'), ld);
				generator.fs.copyTpl( $.sourceDir(require('path').join('license', config.license+'.txt')), $.destDir('source/LICENSE'), ld);
				
			}
			// just empty dirs - map of futures project
			$.createDirs([
				'source/assets/fonts',
				'source/styles/less',
				'source/styles/sass',
				'source/styles/styl',
				'source/scripts/states',
				'source/scripts/models',
				'source/scripts/filters',
				'source/scripts/services',
				'source/scripts/directives',
				'source/scripts/interceptors',
			]);
			// simple copy static files
			$.copy([
				'.bowerrc',
				'.npmignore',
				'.eslintrc.json',
				'source/assets/images/favicon.ico',
				'source/assets/images/favicon-16x16.png',
				'source/assets/images/favicon-32x32.png',
			]);
			// application dummy
			$.copy([
				'source/main.js',
				'source/index.html',
				'source/scripts/app.js',
				'source/scripts/states/layout.html',
				'source/scripts/states/layout.module.js',
				'source/scripts/states/layout.controller.js',
				'source/scripts/states/home/home.html',
				'source/scripts/states/home/home.module.js',
				'source/scripts/states/home/home.controller.js',
				'source/scripts/filters/humanize.filter.js',
			], {
				title: $.humanize(config.appName),
				app: config.angularRoot
			});
			// configure application preprocessor
			var pp = $.get('preprocessors')
			$.copy([
				'gulpfile.js',
			], {
				app: config.angularRoot,
				css: pp.css ? '"'+pp.css+'",' : '',
				js: pp.js ? '"'+pp.js+'",' : '',
			});

		}
	},
	/*-------------------------------------------------
		PHASE CONFLICTS (changing exist files)
	---------------------------------------------------*/
	conflicts: function () {
		if ( $.get('instalation') == 'progress' ) {
			console.log('instalation conflicts', '\n CONFIG:\n', $.get(), '\n\n');
		}
	},
	/*-------------------------------------------------
		PHASE INSTALATION
	---------------------------------------------------*/
	install: function () {
		var generator = this;
		if ( $.get('instalation') == 'progress' ) {
			$.set('instalation', 'complete');
			$.clearConfig('appVersion');
			$.clearConfig('license');
			return new Promise( function ( resolve, reject ) {
				$.askСonfirm('Initialize the '+$.highlight('pre-install')+' ?')
				.then( function ( preInstall ) {
					generator.___preInstall___ = preInstall;
					resolve();
				});
			});
		}
	},
	/*-------------------------------------------------
		PHASE AFTER ALL
	---------------------------------------------------*/
	end: function () {
		// say bye
		this.log(yosay(
			chalk.white('\nThank you, it`s been a')+' '+
			chalk.red.bold('pleasure')+'\ndoing business with you '+
			chalk.cyan($.get('user'))+'.'
		));
		if ( this.___preInstall___ ) {
			require('child_process').spawn('npm.cmd', ['run', 'pre-install'], {stdio: 'inherit'})
		}
	}
	/*-------------------------------------------------
		Something else you need ?
	---------------------------------------------------*/
});