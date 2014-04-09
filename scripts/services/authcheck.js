'use strict';

angular.module('typewriteApp')
  .service('Authcheck', function Authcheck(ipCookie) {

    var token = ipCookie('token');

    return {
      redirectNoCookie: function(params) {

        /* globals $ */

        if (!params) {params = {};}

        var urlQuery = decodeURIComponent($.param(params));

        if (urlQuery) {
          urlQuery = '?' + urlQuery;
        }

        if (!token) {
          window.location = '/account/login' + urlQuery;
        }
      },
      redirectToLogin: function() {
        window.location = '/account/login';
      }
    };
  });
