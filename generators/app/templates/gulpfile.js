'use strict';

/**
 *  Welcome to your gulpfile!
 */
var path = require('path');
var gulp = require('gulp');
var inject = require('gulp-inject');
var electron = require('electron');
var gulpsync = require('gulp-sync')(gulp);

var options = {
	// root directory application
	app: {
		src: './source',
		temp: './.tmp',
		dist: './dist',
	},
	// js processing pathes
	js: {
		root: '/scripts',
		src: '/**/*.js',
		typescript: '/index.ts',
		coffeescript: '/index.coffee',
	},
	// js processing pathes
	css: {
		root: '/styles',
		src: '/**/*.css',
		less: '/all.less',
		sass: '/all.sass',
		stylus: '/all.styl',
	},
	// images, fonts and others processing paths
	assets: {
		root: '/assets',
		img: '/images/**',
		font: '/fonts/**',
	}
};

/*-------------------------------------------------
		DECLARATION of TASKS
---------------------------------------------------*/
gulp.task('default', ['clean'], function ( done ) {
	console.log('default task - clean');
	done();
});
/*-------------------------------------------------
		run electron
---------------------------------------------------*/
var child;
function restartElectron () {
	child && child.kill('SIGTERM');
	child = require('child_process').spawn(electron, [options.app.src], { stdio: 'inherit'});
}
gulp.task('run', ['start-inject'], function() {
	restartElectron();
	gulp.start('watch');
});
gulp.task('start-inject', gulpsync.async([['inject-bower', <%- js %>'inject-scripts'], [<%- css %>'inject-styles']]));
/*-------------------------------------------------
    "del": "^2.2.2",
---------------------------------------------------*/
gulp.task('clean', function() {
    return (require('del'))([path.join(options.app.dist, '/'), path.join(options.app.temp, '/')]);
});
/*-------------------------------------------------
    watch all preprocessing files
---------------------------------------------------*/
gulp.task('watch', function ( done ) {
    /*-------------------------------------------------
        When preprocessors source is changed
    ---------------------------------------------------*/
    gulp.watch(typescriptPath, ['typescript']);
    gulp.watch(coffeescriptPath, ['coffeescript']);
    gulp.watch(stylusPath, ['stylus']);
    gulp.watch(lessPath, ['less']);
    gulp.watch(sassPath, ['sass']);
    /*-------------------------------------------------
        When source is changed
    ---------------------------------------------------*/
    gulp.watch(path.join(options.app.src, options.assets.root, '/**/*.*'), restartElectron);
    gulp.watch(path.join(options.app.src, options.css.root, options.css.src) ['inject-styles'], restartElectron);
    gulp.watch(path.join(options.app.src, options.js.root, options.js.src), ['inject-scripts'], restartElectron);
    gulp.watch([options.app.src+'/**/*.html', '!'+options.app.src+'/index.html'], [], restartElectron);
    gulp.watch(path.join(options.app.src, '/index.html'), restartElectron);
    gulp.watch(path.join('.', '/bower.json'), ['inject-bower'], restartElectron);
});
/*-------------------------------------------------
    INJECT
---------------------------------------------------*/
// "wiredep": "^4.0.0",
gulp.task('inject-bower', function() {
    return gulp.src( path.join(options.app.src, '/index.html') )
        .pipe( (require('wiredep')).stream({}) )
        .pipe( gulp.dest(options.app.src) );
});
// "gulp-inject": "^4.1.0"
// "gulp-angular-filesort": "^1.1.1"
gulp.task('inject-scripts', ['eslint'], function () {
    return gulp.src( path.join(options.app.src, '/index.html') )
        .pipe( inject( angularFilesort(), {addRootSlash: false,addPrefix: '..'}) )
        .pipe( gulp.dest(path.dirname(path.join(options.app.src, '/index.html'))) );
});
function angularFilesort () {
    // before inject sortin by angular rules
    return gulp.src( path.join(options.app.src, options.js.root, options.js.src) )
        .pipe( (require('gulp-angular-filesort'))() )
        .on('error', function ( error ) {
            console.log( 'ERROR:[ Angular-Filesort ]', String(error) );
            this.emit('end');
        });
}
// "gulp-inject": "^4.1.0"
gulp.task('inject-styles', function () {
    return gulp.src( path.join(options.app.src, '/index.html') )
        .pipe( inject( gulp.src(
            path.join(options.app.src, options.css.root, options.css.src) ),
            {addRootSlash: false, addPrefix: '..'}
        ))
        .pipe( gulp.dest(path.dirname(path.join(options.app.src, '/index.html'))) );
});

var typescriptPath = path.join(options.app.src, options.js.root, options.js.typescript);
var coffeescriptPath = path.join(options.app.src, options.js.root, options.js.coffeescript);
var lessPath = path.join(options.app.src, options.css.root, options.css.less);
var sassPath = path.join(options.app.src, options.css.root, options.css.sass);
var stylusPath = path.join(options.app.src, options.css.root, options.css.stylus);
var eslintPath = path.join(options.app.src, options.js.root, options.js.src);
/*-------------------------------------------------
    PREPROCESSORS (lazy load)
---------------------------------------------------*/
// "gulp-eslint": "^3.0.1",
gulp.task('eslint', function () {
    var eslint = require('gulp-eslint');
    // var config = require('./.eslintrc');
    return gulp.src( eslintPath )
        .pipe( eslint({ globals: ["angular", "jQuery", "require"], rules: (require('./.eslintrc.json')).rules }) )
        .pipe( eslint.format() )
        // stop on error if need - just uncomment next line
        // .pipe( eslint.failAfterError() );
});
// "typescript": "^2.0.10"
// "gulp-typescript": "^3.1.3"
gulp.task('typescript', function () {
    return gulp.src( typescriptPath )
        .pipe( (require('gulp-typescript'))() )
        .pipe( gulp.dest(path.dirname(typescriptPath)) );
});
// "gulp-coffee": "^2.3.3"
gulp.task('coffeescript', function () {
    return gulp.src( coffeescriptPath )
        .pipe( (require('gulp-coffee'))({bare: true}) )
        .pipe( gulp.dest(path.dirname(coffeescriptPath)) );
});
// "gulp-less": "^3.1.0",
// "less-plugin-autoprefix": "^1.5.1",
gulp.task('less', function () {
    return gulp.src( lessPath )
        .pipe( (require('gulp-less'))({plugins:[(new (require('less-plugin-autoprefix'))({browsers:['last 2 versions']}))]}) )
        .pipe( gulp.dest(path.dirname(lessPath)) );
});
// "gulp-sass": "^2.3.2",
gulp.task('sass', function () {
    return gulp.src( sassPath )
        .pipe( (require('gulp-sass'))() )
        .pipe( gulp.dest(path.dirname(sassPath)) );
});
// "gulp-stylus": "^2.6.0",
gulp.task('stylus', function () {
    return gulp.src( stylusPath )
        .pipe( (require('gulp-stylus'))() )
        .pipe( gulp.dest(path.dirname(stylusPath)) );
});
/*-------------------------------------------------
        DIST
---------------------------------------------------*/
// package imagemin dependencies
// "gulp-imagemin": "^3.0.3"
gulp.task('imagemin', function() {
    return gulp.src( path.join(options.app.src, options.assets.root, options.assets.img) )
        .pipe( (require('gulp-imagemin'))() )
        .pipe( gulp.dest(path.dirname(path.join(options.app.dist, options.assets.root, options.assets.img))) );
});
gulp.task('copy-fonts', function () {
    return gulp.src( path.join(options.app.src, options.assets.root, options.assets.font) )
        .pipe( gulp.dest(path.dirname(path.join(options.app.dist, options.assets.root, options.assets.font))) );
});
// "main-bower-files": "^2.13.1"
// "gulp-filter": "^4.0.0"
gulp.task('bower-fonts', function () {
    return gulp.src( (require('main-bower-files'))() )
        .pipe( (require('gulp-filter'))('**/*.{eot,otf,svg,ttf,woff,woff2}') )
        .pipe( gulp.dest(path.dirname(path.join(options.app.dist, options.assets.root, options.assets.font))) );
});
// "gulp-htmlmin": "^3.0.0"
// "gulp-angular-templatecache": "^2.0.0"
gulp.task('templatecache', function () {
    return gulp.src( path.join(options.app.src, options.js.root, '/**/*.html') )
        .pipe( (require('gulp-htmlmin'))({
            removeEmptyAttributes: false,
            removeAttributeQuotes: false,
            collapseBooleanAttributes: false,
            collapseWhitespace: true
        }) )
        .pipe( (require('gulp-angular-templatecache'))('templateCacheHtml.js', {
            standalone: false,
            module: '<%=app%>',
            root: options.js.root,
        }) )
        .pipe( gulp.dest(path.join(options.app.src, options.js.root)) );
});
gulp.task('main-copy', function () {
    return gulp.src([
            // maybe you have more than one main file
            path.join(options.app.src, 'main.js'),
            path.join(options.app.src, 'LICENSE'),
            path.join(options.app.src, 'package.json'),
        ])
        .pipe( gulp.dest(options.app.dist) );
});
gulp.task('node-modules-copy', function () {
    return gulp.src( path.join(options.app.src, 'node_modules/**/*.*') )
        .pipe( gulp.dest(path.join(options.app.dist, 'node_modules')) );
});
gulp.task('assets', gulpsync.async([['clean', 'imagemin', 'copy-fonts', 'bower-fonts', 'main-copy', 'node-modules-copy'], 'templatecache']));

// "gulp-useref": "^3.1.2"
// "gulp-if": "^2.0.2"
// "gulp-rev": "^7.1.2"
// "gulp-rev-replace": "^0.4.3"
// "gulp-ng-annotate": "^2.0.0"
// "gulp-uglify": "^2.0.0"
// "gulp-cssnano": "^2.1.2"
// "uglify-save-license": "^0.4.1"
// "gulp-replace": "^0.5.4"
// "gulp-htmlmin": "^3.0.0"
gulp.task('dist', ['start-inject', 'assets'], function() {
    var IF = require('gulp-if');
    return gulp.src( path.join(options.app.src, 'index.html') )
        .pipe( (require('gulp-useref'))() )
        .pipe( IF('**/app.js', (require('gulp-ng-annotate'))()) )
        .pipe( IF('**/app.js', (require('gulp-uglify'))({ preserveComments: require('uglify-save-license') })) )
            // replace font path in css libs like a bootstrap or font-awesome
        .pipe( IF('**/all.css', (require('gulp-replace'))('../fonts/', 'assets/fonts/')) )
        .pipe( IF('*.css', (require('gulp-cssnano'))()) )
        .pipe( IF('!*.html', (require('gulp-rev'))()) )
        .pipe( (require('gulp-rev-replace'))() )
        .pipe( IF('index.html', (require('gulp-htmlmin'))({
            removeEmptyAttributes: true,
            removeAttributeQuotes: false,
            collapseBooleanAttributes: true,
            collapseWhitespace: true
        })) )
        .pipe( gulp.dest(path.join(options.app.dist, '/')) )
});


/*-------------------------------------------------
    ELECTRIFY
// "electron-packager": "^8.3.0"
---------------------------------------------------*/
gulp.task('electrify-win', ['dist'], function () {
    var pkg = require(options.app.src+'/package.json');
    (require('del')).sync(['./'+pkg.name+'-win32-ia32', './'+pkg.name+'-win32-x64']);
    require('electron-packager')( {
        dir: options.app.dist,
        name: pkg.name,
        'app-version': pkg.version,
        icon: path.join(options.app.src, options.assets.root, options.assets.img.replace(/[\\|\/|\*]*/g,''), 'favicon.ico'),
        platform: ['win32'],
        arch: ['ia32', 'x64']
    }, function ( err, src ) {
        console.log('electron-packager-win', arguments);
    });
});

gulp.task('electrify-linux', ['dist'], function () {
    var pkg = require(options.app.src+'/package.json');
    (require('del')).sync(['./'+pkg.name+'-linux-ia32', './'+pkg.name+'-linux-x64', './'+pkg.name+'-linux-armv7l']);
    require('electron-packager')( {
        dir: options.app.dist,
        name: pkg.name,
        'app-version': pkg.version,
        icon: path.join(options.app.src, options.assets.root, options.assets.img.replace(/[\\|\/|\*]*/g,''), 'favicon.png'),
        platform: ['linux'],
        arch: ['ia32', 'x64', 'armv7l']
    }, function ( err, src ) {
        console.log('electron-packager-linux', arguments);
    });
});

gulp.task('electrify-mas', ['dist'], function () {
    var pkg = require(options.app.src+'/package.json');
    (require('del')).sync(['./'+pkg.name+'-mas-ia32', './'+pkg.name+'-mas-x64', './'+pkg.name+'-mas-armv7l']);
    require('electron-packager')( {
        dir: options.app.dist,
        name: pkg.name,
        'app-version': pkg.version,
        icon: path.join(options.app.src, options.assets.root, options.assets.img.replace(/[\\|\/|\*]*/g,''), 'favicon.icns'),
        platform: ['mas'],
        arch: ['ia32', 'x64', 'armv7l']
    }, function ( err, src ) {
        console.log('electron-packager-mas', arguments);
    });
});

/*-------------------------------------------------
    ШАБЛОН КОМАНДЫ
electron-packager <sourcedir> <appname> --platform=<platform> --arch=<arch> --version=<version>
electron-packager . source --all --version=0.33.3 --app-version=0.1.0 --out=dist --ignore=dist --prune

    Обязательные аргументы
---------------------------------------------------*/
// platform — платформа (all или win32, linux, darwin)
// arch — разрядность (all или ia32, x64)
// version — версия Электрона для сборки
/*-------------------------------------------------
        Опциональные аргументы
---------------------------------------------------*/
// all — эквивалент --platform=all --arch=all
// out — директория, в которую будут помещены сборки
// icon — иконка приложения (.icns или .ico)
// app-bundle-id — идентификатор приложения в plist
// app-version — версия приложения
// build-version — версия сборки приложения для OS X
// cache — директория, в которой будет располагаться кэш приложения
// helper-bundle-id — идентификатор приложения для помощника plist
// ignore — исключение файлов из сборки
// prune — запуск команды npm prune --production в приложении
// overwrite — перезапись уже созданных сборок
// asar — упаковка исходников приложения в asar-архив
// asar-unpack — распаковка указанных файлов в директорию app.asar.unpacked
// sign — идентификатор для входа в codesign (OS X)
// version-string — ключи для сборки (Windows). Список ключей смотрите в документации пакета