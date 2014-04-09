'use strict';

angular.module('typewriteApp')
  .factory('Workspace', function ($resource, TWAPI, ipCookie) {

    var token = ipCookie('token');

    return $resource(TWAPI + '/workspaces/:workspaceId', {workspaceId:'@workspaceId', token: token}, {
      query: {method: 'GET', isArray: true},
      get: {method: 'GET'},
      update: {method: 'PUT'},
      delete: {method: 'DELETE'}
    });
  });
