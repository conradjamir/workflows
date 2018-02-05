'use strict';

var $, fill;

$ = require('jquery');

(fill = function fill(item) {
  return $('.tagline').append('' + item);
})('The most creative minds in Art');

fill;