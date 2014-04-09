'use strict';

angular.module('typewriteApp', [
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngAnimate',
  'ui.keypress',
  'ui.codemirror',
  'ivpusic.cookie',
  'btford.socket-io'
])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/documents', {
        templateUrl: 'views/documents.html',
        controller: 'DocumentsCtrl'
      })
      .when('/document/:documentId', {
        templateUrl: 'views/document.html',
        controller: 'DocumentCtrl',
        reloadOnSearch: false
      })
      .when('/document/:documentId/versions', {
        templateUrl: 'views/versions.html',
        controller: 'VersionsCtrl'
      })
      .when('/account/register', {
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl'
      })
      .when('/account/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/account/logout', {
        templateUrl: 'views/blank.html',
        controller: 'LogoutCtrl'
      })
      .when('/account/settings', {
        templateUrl: 'views/accountSettings.html',
        controller: 'AccountSettingsCtrl'
      })
      .otherwise({
        redirectTo: '/documents'
      });

    $locationProvider.html5Mode(false);
  });