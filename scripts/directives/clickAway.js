'use strict';

angular.module('typewriteApp')
  .directive('clickAway', function ($document) {
    return {
      restrict: 'A',
      link: function(scope, elem, attr) {

        elem.bind('click', function(e) {
          e.stopPropagation();
        });

        $document.bind('click', function() {
          scope.$apply(attr.clickAway);
        });
      }
    };
  });
