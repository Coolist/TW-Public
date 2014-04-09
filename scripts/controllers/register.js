'use strict';

angular.module('typewriteApp')
  .controller('RegisterCtrl', function ($scope, $routeParams, Auth, $location, ipCookie) {

    $scope.loading = false;
    $scope.submitted = false;
    $scope.errorControl = {};


    var documentId = $routeParams.document,
        email = $routeParams.email;

    $scope.email = email;
    
    $scope.register = function() {

      if (!$scope.registerForm.$valid) {

        $scope.submitted = true;
        return false;
      }

      $scope.loading = true;

      var auth = new Auth({
        name: $scope.name,
        email: $scope.email,
        password: $scope.password
      });

      auth.$save(function (res) {
        if (res.success === true) {
          ipCookie('token', res.token, { expires: 7, path: '/' });

          if (documentId) {
            window.location = '/document/' + documentId;
          }
          else {
            window.location = '/documents';
          }
        }
        else {
          $scope.loading = false;
        }
      }, function (error) {
        $scope.loading = false;

        $scope.errorControl.setError('<strong>Error:</strong> ' + error.data.message, 5);
      });
    };

  });
