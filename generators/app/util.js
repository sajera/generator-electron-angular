
'use strict'

var mkdirp = require('mkdirp');
var chalk = require('chalk');
var path = require('path');
var del = require('del');
var is = require('s-is');
var fs = require('fs');
/**
 * delegator of utils
 *
 * @factory
 */
function factory ( name ) {
	if ( is.function(factory[name]) ) {
		return factory[name].call(generator, arguments[1], arguments[2], arguments[3], arguments[4]);
	}
};

/**
 * make a link to yeoman generator context =)
 */
var generator = null;
factory.generator = function () {
	if ( !generator ) {
		return generator = this;
	} else return generator;
}

/**
 * to writing (package/bower).json
 *
 * @param: { String } - name of package
 * @param: { Object }
 * @returns: { Object }
 */
factory.writePackage = function ( pkgName, options ) {
	if ( !is.object(options) ) { options = {}; }
	// get package as default vals
	var tpl = JSON.parse( fs.readFileSync(factory.sourceDir(pkgName), {encoding: 'utf8'}) );
	// get package from output dir as origin
	try { var dist = JSON.parse( fs.readFileSync(factory.destDir(pkgName), {encoding: 'utf8'}) );
	} catch ( err ) { var dist = {}; };
	// write extendet package
	generator.write( pkgName, JSON.stringify( Object.assign(dist, options, tpl), null, 2) );
}

// define highlighting colors
factory.highlight = function ( text ) { return chalk.blue( text ); }

/**
 * get a ABBR from source string or returns toLowerCase
 *
 * @param: { String } 
 * @returns: { String }
 */
factory.abbr = function ( name, test1, test2 ) {
	test1 = name.split(/[\d\W\\\-\._]/g);
	test2 = name.match(/[A-Z]/g);
	if ( test1&&test1.length >= 2 ) {
		name = '';
		for ( var part of test1 ) {
			name+=part[0];
		}
		return name.toLowerCase();
	} else if ( test2&&test2.length >= 2 ) {
		return test2.join('').toLowerCase();
	} else {
		return name.substring(0,8).toLowerCase();
	}
}

/**
 * Make text fine to human
 *
 * @param: { String }
 * @returns: { String }
 */
factory.humanize = function ( string ) {
	return String( string )
		// from camel case
		.replace( /([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g, '$1$4 $2$3$5' )
		// .replace(/([a-z]){1,1}([A-Z])/g, function ( sib, f, s ) { return f+" "+s; })
		// spec
		.replace(/[_-]+/g, ' ')
		// normalize
		.replace(/\s+/g, ' ')
		// trim
		.replace(/^\s*|\s*$/g, '')
		// capitalize
		.toLowerCase()
		.replace(/^.{1,1}/, function ( sib ) { return sib.toUpperCase(); });
};
/**
 * Make name fine to angular injections
 *
 * @param: { String }
 * @returns: { String }
 */
factory.angularize = function ( string, firstCapital ) {

	return string
		// spec
		.replace(/[\W_]+/g, ' ')
		// normalize
		.replace(/\s+/g, ' ')
		// trim
		.replace(/^\s*|\s*$/g, '')
		// first capital only if cpecified
		.replace(/^.{1,1}/, function ( match ) {
			return firstCapital ? match.toUpperCase() : match.toLowerCase();
		})
		// lazy format camelcase
		.replace(/(\s\w)/g, function ( match ) {
			return match[1].toUpperCase();
		});
},

/*-------------------------------------------------
	GENERATOR deep origin generator to create custom methods
---------------------------------------------------*/

/**
 * source directory path control
 *
 * @param: { String } 
 * @returns: { String }
 */
factory.sourceDir = function ( filePath ) {
	if ( filePath.toLowerCase() == 'dir_name' ) {
		return path.normalize( generator.sourceRoot() ).split(path.sep).pop();
	} else if ( is.undefined(filePath) ) {
		return generator.sourceRoot();
	} else {
		return generator.templatePath(filePath);
	}
}

/**
 * source directory path control
 *
 * @param: { String } - 'dir_name' - special else make a global path to root directori
 * @returns: { String }
 */
factory.destDir = function ( filePath ) {
	if ( filePath.toLowerCase() == 'dir_name' ) {
		return path.normalize( process.cwd() ).split(path.sep).pop();
	} else if ( typeof filePath == 'undefined' ) {
		return generator.destinationRoot();
	} else {
		return generator.destinationPath(filePath);
	}
}

/**
 * wrapper for del module
 * https://www.npmjs.com/package/del
 *
 * @param: { Object }
 * @returns: { Object }
 */
factory.removeFiles = function ( list ) {
	// console.log('factory.removeFiles', list );
	return del.sync(list, {force: true});
}

/**
 *
 * @param: { Object }
 * @returns: { Object }
 */
factory.createDirs = function ( dirs ) {
	if ( is.array(dirs) ) {
		for ( var dir of dirs ) {
			// console.log('factory.createDir', dir, '\n'+path.join(generator.destinationRoot(), dir) );
			mkdirp.sync(path.join(generator.destinationRoot(), dir));
		}
	} else if (typeof dirs == 'string') {
		return factory.createDirs([dirs]);
	} 
}

/**
 * to prevent instal using "throw new Error"
 */
factory.preventInstalation = function ( silently ) {
	generator.env.error(
		silently ? '' :
		chalk.red.bold('Too bad.')+
		'\n'+chalk.blue.bold('I hope')+
		' that we can find common ground'+
		chalk.blue(' in the next time')+'.\x1B[0m'
	);
}

/**
 * aliasses for generator copy file
 *
 * @param: { Array }
 * @param: { Object }
 */
factory.copy = function ( fileList, variables ) {
	if ( is.array(fileList) ) {
		if ( is._object(variables) ) {
			// copy file with reading and overwriting by variables
			for ( var file of fileList ) {
				generator.fs.copyTpl( factory.sourceDir(file) , factory.destDir(file), variables );
			}
		} else {
			// copy buffering file without reading and overwriting
			for ( var file of fileList ) {
				generator.fs.copy( factory.sourceDir(file) , factory.destDir(file) );
			}
		}
	} else if ( is.string(fileList) ) {
		factory.copy( [fileList], variables );
	}
}

/**
 * set variables to ".yo-rc.json"
 *
 * @param: { Object || String } properits or field name
 * @param: { Object } || value to saving
 * @returns: { Object } actual variables
 */
factory.set = function ( field, val ) {
	if ( is.string(field) ) {
		field = { [ field ]: val };
	}
	if ( is._object(field) ) {
		generator.config.set( field );
	}
}

/**
 * get variables from ".yo-rc.json"
 * without arguments its return all
 * @param: { String || undefined } field name
 * @returns: { Object || value } actual variable
 */
factory.get = function ( field ) {
	if ( is.string(field) )
		return generator.config.get( field );
	else return generator.config.getAll();
}
/**
 * remove variables from ".yo-rc.json"
 * without arguments its cliar all
 * @param: { String || undefined } field name
 */
factory.clearConfig = function ( field ) {
	if ( is.string(field) ) {
		generator.config.delete(field);
	} else { // clear all
		for (var key in generator.config.getAll() ) {
			generator.config.delete(key);
		}
	}
}

/**
 * confirm from user
 *
 * @param: { String } - text of message
 * @param: { Object } - options
 * @returns: { Promise }
 */
factory.askСonfirm = function ( text, options ) {
	options = options&&(typeof options == 'object') ? options : {};
	return new Promise( function ( resolve, reject ) {
		// get answers from user
		generator
			.prompt({
				type: 'confirm',
				name: 'dummy',
				message: text,
				default: !!options.default,
			})
			.then(
				function ( answer ) {
					if ( typeof options.store == 'string' ) {
						factory.set( options.store, answer.dummy );
					}
					resolve( answer.dummy );
				},
				function ( error ) { reject( error ); }
			);
	});
};


/**
 * get a string from user
 *
 * @param: { String } - text of message
 * @param: { Object } - options
 * @returns: { Promise }
 */
factory.askString = function ( text, options ) {
	options = options&&(typeof options == 'object') ? options : {};
	return new Promise( function ( resolve, reject ) {
		// get answers from user
		generator
			.prompt({
				type: 'input',
				name: 'dummy',
				message: text,
				default: options.default||'',
			})
			.then(
				function ( answer ) {
					if ( typeof options.store == 'string' ) {
						factory.set( options.store, answer.dummy );
					}
					resolve( answer.dummy );
				},
				function ( error ) { reject( error ); }
			);
	});
};


/**
 * get a choose from user
 *
 * @param: { String } - text of message
 * @param: { Object } - options
 * @returns: { Promise }
 */
factory.askChoose = function ( text, options ) {
	options = options&&(typeof options == 'object') ? options : {};
	// choices must be specified
	options.choices = is.array( options.choices ) ? options.choices : [{name: 'empty', value: null }];
	return new Promise( function ( resolve, reject ) {
		// get answers from user
		generator
			.prompt({
				type: 'list',
				name: 'dummy',
				message: text,
				choices: options.choices,
				default: options.default||0,
			})
			.then(
				function ( answer ) {
					if ( typeof options.store == 'string' ) {
						factory.set( options.store, answer.dummy );
					}
					resolve( answer.dummy );
				},
				function ( error ) { reject( error ); }
			);
	});
};

/**
 * get a choose list from user
 *
 * @param: { String } - text of message
 * @param: { Object } - options
 * @returns: { Promise }
 */
factory.askChooseFew = function ( text, options ) {
	options = options&&(typeof options == 'object') ? options : {};
	// choices must be specified
	options.choices = is.array( options.choices ) ? options.choices : [{name: 'empty', value: null, checked: true }];
	return new Promise( function ( resolve, reject ) {  
		// get answers from user
		generator
			.prompt({
				type: 'checkbox',
				name: 'dummy',
				message: text,
				choices: options.choices,
			})
			.then(
				function ( answer ) {
					if ( typeof options.store == 'string' ) {
						factory.set( options.store, answer.dummy );
					}
					resolve( answer.dummy );
				},
				function ( error ) { reject( error ); }
			);
	});
};

/**
 * util factory specific prepare needed
 *
 * @pablick
 */
module.exports = factory;

// "run-dev": "node -e \"require('child_process').spawn(require('electron-prebuilt'), ['./app'], { stdio: 'inherit'})\"",
