'use strict';

angular.module('typewriteApp')
  .factory('Auth', function ($resource, TWAPI) {

    return $resource(TWAPI + '/auth/:option/:documentId/:option2/:userId', {option: '@option', documentId: '@documentId', option2: '@option2', userId: '@userId'}, {
      get: {method: 'GET'},
      query: {method: 'GET', isArray: true},
      post: {method: 'POST'},
      update: {method: 'PUT'},
      delete: {method: 'DELETE'}
    });
  });