var gulp = require('gulp');
var watch = require('gulp-watch');
var sass = require('gulp-sass');

var minifyCss = require('gulp-minify-css');
var spritesmith = require('gulp.spritesmith');
var autoprefixer = require('gulp-autoprefixer');
var server = require('gulp-server-livereload');
var fileinclude = require('gulp-file-include');
var strip = require('gulp-strip-comments');
var cssImageDimensions = require("gulp-css-image-dimensions");

var gutil = require("gulp-util");
var webpack = require("webpack");
var webpackConfig = require("./webpack.config.js");


var runSequence = require('run-sequence');

var md5File = require('md5-file')

var replace = require('gulp-replace');


gulp.task('buildCss', function(callback) {
  runSequence('sass',
              //'cssversion',
              callback);
});

gulp.task('buildJs', function(callback) {
  runSequence('webpack',
              //'jsversion',
              callback);
});

gulp.task('buildHtml', function(callback) {
  runSequence('include',
              //'cssversion',
              //'jsversion',
              callback);
});

//compile sass
gulp.task('sass', function () {
    gulp.src('./sass/style.scss')
    .pipe(sass({outputStyle: 'expanded'})) // Converts Sass to CSS with gulp-sass      
    .on('error', console.log)
    .pipe(gulp.dest('./app/css'))
    .pipe(autoprefixer({
        browsers: ['> 1%'],
        cascade: false
    }))
    .on('error', console.log)
    .pipe(cssImageDimensions(''))
    .on('error', console.log)
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(gulp.dest('./app/css'));
  
});

//autoprefixer
gulp.task('autoprefixer', function () {
    gulp.src('./app/css/style.css')
    .pipe(autoprefixer({
        browsers: ['> 1%'],
        cascade: false
    }))
    .pipe(gulp.dest('./app/css'));
});

// generate sprite.png and _sprite.scss
gulp.task('sprite', function() {
    var spriteData = 
        gulp.src('./app/images/sprite/*.png') // путь, откуда берем картинки для спрайта
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: '_sprites.scss',
            imgPath: '../images/sprite.png' 
        }));

    spriteData.img.pipe(gulp.dest('./app/images/')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest('./sass/'))
});

// include htmls
gulp.task('include', function() {

    gulp.src(['html/*.html', '!html/_*.html', '!html/* *.html'])
    .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file',
        indent: true
    }))
    .on('error', console.log)   
    .pipe(gulp.dest('./app'));
});

//set new css and js versions
gulp.task('vers', function(){

    var cssVer =  md5File('./app/css/style.css');

    var localVer =  md5File('./app/js/local.js');
    var dnevnikVer =  md5File('./app/js/dnevnik.js');
    var mosregVer =  md5File('./app/js/mosreg.js');

    gulp.src(['./app/*.html'])
    .pipe(replace( /style\.css(\S*)\"/g, 'style.css?_v=' + cssVer + '"' ))
    .pipe(replace( /local\.js(\S*)\"/g, 'local.js?_v=' + localVer + '"' ))
    .pipe(replace( /dnevnik\.js(\S*)\"/g, 'dnevnik.js?_v=' + dnevnikVer + '"' ))
    .pipe(replace( /mosreg\.js(\S*)\"/g, 'mosreg.js?_v=' + mosregVer + '"' ))
    .pipe(replace( /\.png(\S*)\"/g, '.png?_v=' + cssVer + '"'))
    .pipe(replace( /\.jpg(\S*)\"/g, '.jpg?_v=' + cssVer + '"'))
    .pipe(replace( /\.gif(\S*)\"/g, '.gif?_v=' + cssVer + '"'))
    .on('error', console.log)
    .pipe(gulp.dest('./app'));

});

//set new img versions in css
gulp.task('imgver', function(){

    var cssVer =  md5File('./app/css/style.css');

    gulp.src(['./app/css/style.css'])
    .pipe(replace( /\.png/g, '.png?_v=' + cssVer ))
    .pipe(replace( /\.jpg/g, '.jpg?_v=' + cssVer ))
    .pipe(replace( /\.gif/g, '.gif?_v=' + cssVer ))
    .pipe(gulp.dest('./app/css'));
});


gulp.task("webpack", function(callback) {
    // run webpack
    var myConfig = Object.create(webpackConfig);
    myConfig.devtool = "eval";
    myConfig.debug = true;
    myConfig.devtool = 'source-map';

    webpack(myConfig, 
    function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        callback();
    });
});

gulp.task('default', function () {
    gulp.src('./app')
    .pipe(server({
        livereload: true,
        directoryListing: false,
        open: false,
        port: 9000
    }));
    gulp.watch('./sass/**/*.scss', ['buildCss']);
    gulp.watch('./app/images/sprite/*.png', ['sprite']);
    gulp.watch(['./js/**/*.js', './my_modules/**/*.js', './js/**/*.hbs'], ['buildJs']);
    gulp.watch('./html/**/*.html', ['buildHtml']);
});