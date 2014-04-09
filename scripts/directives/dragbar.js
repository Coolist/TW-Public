'use strict';

angular.module('typewriteApp')
  .directive('dragbar', function () {
    return {
      template: '<div class="dragbar" style="position: relative"><div class="left">-</div><div id="dragbar" class="dragdealer"><div class="handle">Version 1</div></div><div class="right">+</div><div class="current">Latest</div></div>',
      restrict: 'EA',
      scope: {
        versionUpdate: '&'
      },
      link: function postLink(scope, element, attrs) {

        /* globals $, Dragdealer */

        attrs.$observe('versionNumber', function () {

          if (attrs.versionNumber) {

            var numberSteps = attrs.versionNumber,
                currentStep = numberSteps;

            var slider = new Dragdealer('dragbar', {
              steps: numberSteps,
              speed: 20,
              x: 1,
              snap: false,
              animationCallback: function (x) {
                var v = Math.round(x * (numberSteps - 1)) + 1;

                $('.dragbar .handle').html('Version <strong>' + v + '</strong>');
              },
              callback: function (x) {
                currentStep = Math.round(x * (numberSteps - 1)) + 1;
                scope.versionUpdate({version: currentStep});
                scope.$apply();
              }
            });

            $('.dragbar .left').click(function() {
              if (currentStep > 1) {
                currentStep--;
                slider.setStep(currentStep);
                scope.versionUpdate({version: currentStep});
                scope.$apply();
              }
            });

            $('.dragbar .right').click(function() {
              if (currentStep < numberSteps) {
                currentStep++;
                slider.setStep(currentStep);
                scope.versionUpdate({version: currentStep});
                scope.$apply();
              }
            });

            $('.dragbar .current').click(function() {
              currentStep = numberSteps;
              slider.setStep(currentStep);
              scope.versionUpdate({version: currentStep});
              scope.$apply();
            });
          }
        });
      }
    };
  });
