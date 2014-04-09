'use strict';

angular.module('typewriteApp')
  .controller('AccountSettingsCtrl', function ($scope, Auth, ipCookie, $location, Integration) {

    $scope.loading = false;
    $scope.submitted = false;
    $scope.errorControl = {};
    $scope.dropbox = [];

    $scope.dropbox.step = 0;

    var token = ipCookie('token');

    Auth.get({option: 'info', token: token}, function (data) {
      $scope.name = data.name;
      $scope.email = data.email;
    });

    Integration.get({integration: 'dropbox'}, function (response) {
      if (response.success) {
        $scope.dropbox.step = 3;
      }
      else {
        $scope.dropbox.step = 1;
      }
    });
    
    $scope.openPopup = function(url) {
      var width = 1200,
          height = 800,
          leftPosition = (window.screen.width / 2) - ((width / 2) + 10),
          topPosition = (window.screen.height / 2) - ((height / 2) + 50);

      var w = window.open(url, 'smallWindow', 'status=no,height=' + height + ',width=' + width + ',resizable=yes,left=' + leftPosition + ',top=' + topPosition + ',screenX=' + leftPosition + ',screenY=' + topPosition + ',toolbar=no,menubar=no,scrollbars=no,location=no,directories=no');

      if (window.focus) {
        w.focus();
      }

      return false;
    };

    $scope.changeIntegrationStatus = function(integration, step) {
      switch(integration) {
        case 'dropbox':

          switch(step) {
            case 2:
              $scope.dropbox.step = 0;

              Integration.get({integration: 'dropbox'}, function (response) {
                if (response.success) {
                  $scope.dropbox.step = 3;
                }
                else {
                  $scope.dropbox.step = 1;
                }
              });
              break;
          }
          break;
      }
    };

    $scope.changeSettings = function() {

      if (!$scope.settingsForm.$valid) {

        $scope.submitted = true;
        return false;
      }

      $scope.loading = true;

      var update = {};

      update.name = $scope.name;
      update.email = $scope.email;

      if ($scope.password) {
        update.password = $scope.password;
      }

      Auth.update({token: token}, update, function (res) {
        if (res.success) {
          $scope.loading = false;
          $scope.submitted = false;
          $scope.errorControl.setError('Settings successfully saved.', 3, 'green');
        }
      }, function (error) {
        $scope.loading = false;

        $scope.errorControl.setError('<strong>Error:</strong> ' + error.data.message, 5);
      });
      
    };

    $scope.goto = function(place) {
      $location.path(place);
    };

  });
