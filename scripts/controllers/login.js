'use strict';

angular.module('typewriteApp')
  .controller('LoginCtrl', function ($scope, $routeParams, Auth, $location, ipCookie) {

    $scope.loading = false;
    $scope.submitted = false;
    $scope.errorControl = {};

    var documentId = $routeParams.document,
        token = ipCookie('token');

    if (token) {
      window.location = '/documents';
    }
    
    $scope.login = function() {

      if (!$scope.loginForm.$valid) {

        $scope.submitted = true;
        return false;
      }

      $scope.loading = true;

      Auth.get({
        email: $scope.email,
        password: $scope.password
      },
      function (res) {

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
