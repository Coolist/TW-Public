'use strict';

angular.module('typewriteApp')
  .directive('errorbox', function () {
    return {
      restrict: 'E',
      template: '<div class="errorbox"><span></span></div>',
      replace: true,
      scope: {
        control: '='
      },
      link: function postLink(scope, element) {

        /* globals $ */

        scope.control.setError = function(error, fadeOut, color) {
          $(element).stop();
          $(element).fadeIn();

          if (fadeOut) {
            $(element).delay(fadeOut * 1000).fadeOut();
          }

          if (color === 'green') {
            $(element).css({'background': '#71CC29'});
          }
          else {
            $(element).css({'background': '#E2491A'});
          }

          $(element).children('span').html(error);
        };
      }
    };
  });
