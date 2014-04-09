'use strict';

angular.module('typewriteApp')
  .controller('LogoutCtrl', function ($scope, ipCookie) {

    ipCookie.remove('token');
    
    window.location = '/';

  });
