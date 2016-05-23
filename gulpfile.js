'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')(); //lazy load some of gulp plugins

var fs = require('fs');
var watch = require('gulp-watch');
var spritesmith = require('gulp.spritesmith');
var posthtml = require('gulp-posthtml');

var devMode = process.env.NODE_ENV || 'dev';

var destFolder = devMode === 'dev' ? 'dev' : 'production';

var packageJson = JSON.parse(fs.readFileSync('./package.json'));

var CDN = packageJson.cdn;

if (!CDN){
	console.error('SET THE CDN!!!');
	return;
}

// STYLES
gulp.task('sass', function () {

	return gulp.src('src/sass/style.scss')
		.pipe($.if(devMode !== 'prod', $.sourcemaps.init())) 
		.pipe($.sass({outputStyle: 'expanded'})) 
		.on('error', $.notify.onError())
		.pipe($.autoprefixer({
			browsers: ['> 1%'],
			cascade: false
		}))
		.pipe($.cssImageDimensions())
		.pipe($.if(devMode !== 'prod', $.sourcemaps.write())) 
		.pipe(gulp.dest(destFolder + '/assets/css'));  
});

// image urls
gulp.task('modifyCssUrls', function () {
	fs = require('fs');
	$.revHash = require('rev-hash');

	return gulp.src(destFolder + '/assets/css/style.css')
		.pipe($.modifyCssUrls({
			modify: function (url, filePath) {
				var buffer = fs.readFileSync(url.replace('../', destFolder + '/assets/'));				
				return url + '?_v=' + $.revHash(buffer);
			},
		}))		
		.pipe($.minifyCss({compatibility: 'ie8'}))
		.pipe(gulp.dest(destFolder + '/assets/css'));

});

// ASSETS
gulp.task('assets-files', function(){
	return gulp.src(['src/assets/**/*.*', '!src/assets/sprite/*.*', '!src/assets/favicon.ico'], {since: gulp.lastRun('assets-files')})
		.pipe($.newer(destFolder + '/assets'))
		.pipe(gulp.dest(destFolder + '/assets'))
});
gulp.task('assets-favicon', function(){
	return gulp.src('src/assets/favicon.ico', {since: gulp.lastRun('assets-favicon')})
		.pipe($.newer(destFolder))
		.pipe(gulp.dest(destFolder))
});
gulp.task('sprite', function(callback) {

	var spriteData = 
		gulp.src('src/assets/sprite/*.png') // путь, откуда берем картинки для спрайта
		.pipe(spritesmith({
			imgName: 'sprite.png',
			cssName: '_sprites.scss',
			imgPath: '../images/sprite.png'
		}))
		.on('error', $.notify.onError())
		

	spriteData.img
		.pipe(gulp.dest(destFolder + '/assets/images/'))

	spriteData.css.pipe(gulp.dest('src/sass/'));

	callback();
});
gulp.task('assets', gulp.parallel('assets-files', 'assets-favicon', 'sprite'));


// HTML
gulp.task('html', function() {

	let folders = devMode === 'dev' ? 'local' : '{dnevnik,mosreg}';

	return gulp.src(['src/html/' + folders + '/**/*.html', 'src/html/*.html'])
		.pipe($.fileInclude({
			prefix: '@@',
			basepath: '@file',
			indent: true
		}))
		.on('error', $.notify.onError())
		.pipe($.if(devMode === 'prod', $.htmlmin({collapseWhitespace: true}))
		)
		.pipe(gulp.dest(destFolder));
});

//set new images,css and js hash versions
gulp.task('vers', function(){	

	$.revHash = require('rev-hash');

	const plugins = [
		function imgVers(tree) {
			tree.match({ tag: 'img' }, function (node) {
				return setVestion(node, 'src');
			})
		},
		function cssVers(tree) {
			tree.match({ tag: 'link' }, function (node) {
				return setVestion(node, 'href');
			})
		},
		function jsVers(tree) {
			tree.match({ tag: 'script' }, function (node) {
				return setVestion(node, 'src');
			})
		},
	];

	function getVersion(file){
		return fs.existsSync(destFolder + '/' + file) && $.revHash(fs.readFileSync(destFolder + '/' +  file));
	}

	function setVestion(node, attrName){
		const attr = node.attrs && node.attrs[attrName] ? node.attrs[attrName] : false;
		
		if (!attr || attr.indexOf('assets') !== 0){
			return node;
		}
		
		const version =  getVersion(attr);

		if (!version){
			return node;
		}

		node.attrs[attrName]=  CDN + attr.replace('assets/', '') + '?_v=' + version;
		return node;
	}

	return gulp.src([destFolder + '/{dnevnik,mosreg}/*.html'])
		.pipe(posthtml(plugins))
		.on('error', $.notify.onError())
		.pipe(gulp.dest(destFolder));

});

//JS
gulp.task('webpack', function(callback) {
	$.webpack = require('webpack');
	$.webpackConfig = require('./webpack.config.js');
	
	var myConfig = Object.create($.webpackConfig);

	$.webpack(myConfig, 
	function(err, stats) {
		if(err) throw new $.util.PluginError('webpack', err);
		$.util.log('[webpack]', stats.toString({
			// output options
		}));
		callback();
	});
});

// BUILD
gulp.task('server', function () {
	$.server = require('gulp-server-livereload');

	gulp.src(destFolder)
	.pipe($.server({
		livereload: true,
		directoryListing: false,
		open: false,
		port: 9000
	}));
})

gulp.task('watch', function(){
	gulp.watch('src/sass/**/*.scss', gulp.series('sass'));
	gulp.watch('src/assets/**/*', gulp.series('assets'));
	gulp.watch('src/js/**/*.js', gulp.series('webpack'));
	gulp.watch('src/html/**/*.html', gulp.series('html'));
});

gulp.task('clean', function(callback) {
	$.del = require('del');
	return $.del([destFolder]);
});

gulp.task('build', gulp.series('assets', gulp.parallel('sass', 'html', 'webpack')));


//PUBLIC TASKS

//production

// npm run prod - build whole project to deploy in 'production' folder
gulp.task('prod', gulp.series('clean', 'build', 'modifyCssUrls', 'vers'));

// npm run test - build whole test project to deploy in 'production' folder
gulp.task('test', gulp.series('build', 'modifyCssUrls', 'vers'));

// npm run prod-html - build only html in 'production' folder
gulp.task('prod-html', gulp.series('html', 'vers'));

// npm run prod-css - build only css in 'production' folder
gulp.task('prod-css', gulp.series('sass', 'modifyCssUrls'));

//development

// gulp start - very first start to build the project and run server in 'dev' folder
gulp.task('start', gulp.series('clean', 'build', gulp.parallel('server', 'watch')));

// gulp - just run server in 'dev' folder
gulp.task('default', gulp.parallel('server', 'watch'));



