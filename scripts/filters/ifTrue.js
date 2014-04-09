'use strict';

angular.module('typewriteApp')
  .filter('ifTrue', function () {
    return function(input, trueValue, falseValue) {
      return input ? trueValue : falseValue;
    };
  });
