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
    connect = require('gulp-connect'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
    minifyHTML = require('gulp-minify-html'),
    minifyJSON = require('gulp-jsonminify'),
    imagemin = require('gulp-imagemin'),
    pngcrush = require('imagemin-pngcrush');

var sassDir = 'components/sass/',
    scriptsDir = 'components/scripts/',
    env,
    outputDir,
    sassStyle,
    paths;
 
env = process.env.NODE_ENV || 'development';

// in terminal change to production: NODE_ENV=production gulp

if(env === 'development'){
  outputDir = 'builds/development/';
  sassStyle = 'expanded';
} else {
  outputDir = 'builds/production/';
  sassStyle = 'compressed';
}

// paths object of source files
paths = {
  styles: {
    dir: sassDir,
    sass: sassDir + '*.scss',
    styleSass: sassDir + 'style.scss',
    dest: outputDir + 'css'
  },
  scripts: {
    dir: scriptsDir,
    coffee: 'components/coffee/*.coffee',
    js: scriptsDir + '*js',
    // could also be an array to re-arrange order of concatenation
    jsOrder: [
      scriptsDir + 'rclick.js',
      scriptsDir + 'pixgrid.js',
      scriptsDir + 'taline.js',
      scriptsDir + 'template.js',
    ],
    dest: outputDir + 'js'
  },
  images: {
    dest: 'builds/development/images/'
  },
  builds: {
    html: 'builds/development/*.html',
    json: 'builds/development/js/*.json'
  }
};

// example to output log during a gulp task
gulp.task('log', function(){
  gutil.log(paths.styles.sass);
});

// process coffee scripts into javascript using gulp-coffee
gulp.task('coffee', function(){
  gulp.src(paths.scripts.coffee) //src('location of file to process'), or src([]) array of files.
      .pipe(coffee({ bare: true }) //pipe() sends source to coffee() w/object parameters bare:true so it formats w/no safety wrapper
      .on('error', gutil.log))//outputs a log error in the terminal
      .pipe(gulp.dest(paths.scripts.dir)); //write out processed script into scripts directory
});

// process js files with gulp-concat and browserify into one js file
gulp.task('js', function(){ // you can process other tasks by adding array: gulp.task('js', ['coffee', 'compass']), function(){}
  gulp.src(paths.scripts.js) //src('location of file to process'), or src([]) array of files.
      .pipe(concat('script.js')) //pipe() sends js sources to concat() library to process into script.js which is the name of js file in html.
      .pipe(browserify()) //pipe() takes in browserify() method that adds jquery and mustache libraries to the script.js
      .pipe(babel({ presets: ['es2015'] }))
      .pipe(gulpif(env === 'production', uglify())) //pipe() uses gulpif(check if env is production, then use uglify() method to process js)
      .pipe(gulp.dest(paths.scripts.dest)) //pipe() sends script.js to destination folder.
      .pipe(connect.reload()); //pipe() triggers the connect reload() method to reload page when task is run.
});

// process SASS/Compas files with gulp-compass
gulp.task('compass', function(){
  gulp.src(paths.styles.styleSass) //src('location of style.scss file to process')
      .pipe(compass({
        sass: paths.styles.dir, //src of all .scss files
        image: paths.images.dest, //src of images
        css: paths.styles.dest, //destination to send processed style.css (bug in program, if not specified, a copy of css folder is written in the root folder)
        style: sassStyle, //other option is compressed, see sass api for different styles
        comments: true //adds comments/line numbers in css where the style originated from
      })) //pipe() sends style.scss to compass() library to process into style.css
      .on('error', gutil.log) //outputs a log error in the terminal
      .pipe(gulp.dest(paths.styles.dest)) //pipe() sends style.css to destination folder.
      .pipe(connect.reload()); //pipe() triggers the connect reload() method to reload page when task is run.
});

// task to reload html and minify only in production environment
gulp.task('html', function(){
    gulp.src(paths.builds.html)
        .pipe(gulpif(env === 'production', minifyHTML())) //pipe() uses gulpif(check if env is production, then use minifyHTML() method to process .html)
        .pipe(gulpif(env === 'production', gulp.dest(outputDir))) //pipe() sends .html to destination folder.
        .pipe(connect.reload());
});

// task to minify images
gulp.task('images', function(){
    gulp.src(paths.images.dest + '**/*.*')
        .pipe(gulpif(env === 'production', imagemin({
          progressive: true,
          svgoPlugins: [{ removeViewBox: false }],
          use: [pngcrush()]
        })))
        .on('error', gutil.log)
        .pipe(gulpif(env === 'production', gulp.dest(outputDir + "images"))) //pipe() sends .html to destination folder.
        .pipe(connect.reload());
});

// task to reload json and minify only in production environment
gulp.task('json', function(){
    gulp.src(paths.builds.json)
        .pipe(gulpif(env === 'production', minifyJSON())) //pipe() uses gulpif(check if env is production, then use minifyJSON() method to minify .json)
        .pipe(gulpif(env === 'production', gulp.dest(paths.scripts.dest))) //pipe() sends .html to destination folder.
        .pipe(connect.reload());
});

// task to watch for changes gulp.watch(source, task)
gulp.task('watch', function(){
  gulp.watch(paths.scripts.coffee, ['coffee']);
  gulp.watch(paths.scripts.js, ['js']);
  gulp.watch(paths.styles.sass, ['compass']);
  gulp.watch(paths.builds.html, ['html']);
  gulp.watch(paths.builds.json, ['json']);
  gulp.watch(paths.images.dest + '**/*.*', ['images']);
});

// task to launch a webserver and do a live reload
gulp.task('connect', function(){
  connect.server({
    root: outputDir,
    livereload: true
  });
});

// if task name is 'default' just type: gulp in terminal
gulp.task('default', ['coffee', 'js', 'compass', 'html', 'images', 'json', 'connect', 'watch']); 

