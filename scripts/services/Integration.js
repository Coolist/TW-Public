'use strict';

angular.module('typewriteApp')
  .factory('Integration', function ($resource, TWAPI, ipCookie) {

    var token = ipCookie('token');

    return $resource(TWAPI + '/integrations/:integration/:request', {integration:'@integration', request: '@request', token: token}, {
      query: {method: 'GET', isArray: true},
      get: {method: 'GET'}
    });
  });
