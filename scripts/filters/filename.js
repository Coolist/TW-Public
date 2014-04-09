'use strict';

angular.module('typewriteApp')
  .filter('filename', function () {
    return function (input) {
      return input.replace(/^.*[\\\/]/, '');
    };
  });
