'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')(); //lazy load some of gulp plugins

var watch = require('gulp-watch');
var spritesmith = require('gulp.spritesmith');

var devMode = process.env.NODE_ENV || 'dev';

var destFolder = 'dist';

gulp.task('clean', function(callback) {
	$.del = require('del');

	if (devMode == 'prod'){
		return $.del(['dist']);
	}else{
		callback();
	}
});

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
	$.fs = require('fs');
	$.revHash = require('rev-hash');

	return gulp.src(destFolder + '/assets/css/style.css')
		.pipe($.modifyCssUrls({
			modify: function (url, filePath) {
				var buffer = $.fs.readFileSync(url.replace('../', destFolder + '/assets/'));				
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
		.pipe($.if(function(file){ //if not local - $.htmlmin it
				return file.path.indexOf('/local/') === -1;
			}, $.htmlmin({collapseWhitespace: true}))
		)
		.pipe(gulp.dest(destFolder));
});






//set new css and js versions
gulp.task('vers', function(){	
	$.fs = require('fs');
	$.revHash = require('rev-hash');

	var cssVer =  $.fs.existsSync(destFolder + '/assets/css/style.css') && $.revHash($.fs.readFileSync(destFolder + '/assets/css/style.css'));
	var dnevnikVer =  $.fs.existsSync(destFolder + '/assets/js/dnevnik.js') && $.revHash($.fs.readFileSync(destFolder + '/assets/js/dnevnik.js'));
	var mosregVer =  $.fs.existsSync(destFolder + '/assets/js/mosreg.js') && $.revHash($.fs.readFileSync(destFolder + '/assets/js/mosreg.js'));

	return gulp.src([destFolder + '/{dnevnik,mosreg}/*.html'])
		.pipe($.if(!!cssVer, $.replace( /style\.css(\S*)\"/g, 'style.css?_v=' + cssVer + '"' )))
		.pipe($.if(!!dnevnikVer, $.replace( /dnevnik\.js(\S*)\"/g, 'dnevnik.js?_v=' + dnevnikVer + '"' )))
		.pipe($.if(!!mosregVer, $.replace( /mosreg\.js(\S*)\"/g, 'mosreg.js?_v=' + mosregVer + '"' )))
		.pipe($.if(!!cssVer, $.replace( /\.png(\S*)\"/g, '.png?_v=' + cssVer + '"')))
		.pipe($.if(!!cssVer, $.replace( /\.jpg(\S*)\"/g, '.jpg?_v=' + cssVer + '"')))
		.pipe($.if(!!cssVer, $.replace( /\.gif(\S*)\"/g, '.gif?_v=' + cssVer + '"')))
		.on('error', $.notify.onError())
		.pipe(gulp.dest(destFolder));

});



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

gulp.task('build', 
	gulp.series(
		'clean', 
		gulp.parallel('assets', 'sass', 'html', 'webpack')
	)
);

gulp.task('prod', gulp.series('build', 'modifyCssUrls', 'vers'));

gulp.task('prod-fast', gulp.series('assets', 'sass', 'html', 'modifyCssUrls', 'vers'));

gulp.task('default', gulp.parallel('server', 'watch'));



