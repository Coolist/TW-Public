'use strict';

angular.module('typewriteApp')
  .factory('Document', function ($resource, TWAPI, ipCookie) {

    var token = ipCookie('token');

    return $resource(TWAPI + '/documents/:documentId', {documentId:'@documentId', token: token}, {
      query: {method: 'GET', isArray: true},
      get: {method: 'GET'},
      update: {method: 'PUT'},
      delete: {method: 'DELETE'}
    });
  });
