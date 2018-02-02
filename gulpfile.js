/*
    https://github.com/gulpjs/gulp
*/
/* jshint node: true */

// Use node.js require() to bring in gulp libraries and assign them to a variable.
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee'),
    concat = require('gulp-concat'),
    browserify = require('gulp-browserify'),
    compass = require('gulp-compass'),
    paths;
 
// paths object of source files
paths = {
  styles: {
    src: 'components/sass',
    sass: 'components/sass/*.scss',
    styleSass: 'components/sass/style.scss',
    devDest: 'builds/development/css',
    proDest: 'builds/production/css'
  },
  scripts: {
    src: 'components/scripts',
    coffee: 'components/coffee/*.coffee',
    js: 'components/scripts/*js',
    jsOrder: [
      'components/scripts/rclick.js',
      'components/scripts/pixgrid.js',
      'components/scripts/taline.js',
      'components/scripts/template.js',
    ],
    devDest: 'builds/development/js',
    proDest: 'builds/production/js'
  },
  images: {
    devDest: 'builds/development/images',
    proDest: 'builds/development/images'
  }
};

// example to output log during a gulp task
gulp.task('log', function(){
  gutil.log(paths.styles.sass);
});

// process coffee scripts into javascript using gulp-coffee
gulp.task('coffee', function(){
  gulp.src(paths.scripts.coffee) //src('location of file to process'), or src([]) array of files.
      .pipe(coffee({
          bare: true
        }).on('error', gutil.log) //outputs a log error in the terminal
      ) //pipe() sends source to coffee() library with object parameters bare:true so it formats w/no safety wrapper
      .pipe(gulp.dest(paths.scripts.src)); //write out processed script into directory location
});

// process js files with gulp-concat and browserify into one js file
gulp.task('js', function(){ // you can process other tasks by adding array: gulp.task('js', ['coffee', 'compass']), function(){}
  gulp.src(paths.scripts.js) //src('location of file to process'), or src([]) array of files.
      .pipe(concat('script.js')) //pipe() sends js sources to concat() library to process into script.js which is the name of js file in html.
      .pipe(browserify()) //pipe() takes in browserify() method that adds jquery and mustache libraries to the script.js
      .pipe(gulp.dest(paths.scripts.devDest)); //pipe() sends script.js to destination folder.
});

// process SASS/Compas files with gulp-compass
gulp.task('compass', function(){
  gulp.src(paths.styles.styleSass) //src('location of style.scss file to process')
      .pipe(compass({
        sass: paths.styles.src, //src of all .scss files
        image: paths.images.devDest, //src of images
        css: paths.styles.devDest, //destination to send processed style.css (bug in program, if not specified, a copy of css folder is written in the root folder)
        style: 'expanded', //other option is compressed, see sass api for different styles
        comments: true //adds comments/line numbers in css where the style originated from
      })) //pipe() sends style.scss to compass() library to process into style.css
      .on('error', gutil.log) //outputs a log error in the terminal
      .pipe(gulp.dest(paths.styles.devDest)); //pipe() sends style.css to destination folder.
});

gulp.task('default', ['coffee', 'js', 'compass']); // if task name is 'default' just type: gulp in terminal
