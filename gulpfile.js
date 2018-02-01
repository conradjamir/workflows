/*
    https://github.com/gulpjs/gulp
*/
/* jshint node: true */

// Use node.js require() to bring in gulp libraries and assign them to a variable.
var gulp = require('gulp'),
    gutil = require('gulp-util');

// example to output log during a gulp task
gulp.task('log', function(){
  gutil.log('A message using gulp-util');
});