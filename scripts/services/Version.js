'use strict';

angular.module('typewriteApp')
  .factory('Version', function ($resource, TWAPI, ipCookie) {

    var token = ipCookie('token');

    return $resource(TWAPI + '/documents/:documentId/versions', {documentId:'@documentId', token: token}, {
      query: {method: 'GET'}
    });
  });
