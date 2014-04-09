'use strict';

angular.module('typewriteApp')
  .service('Realtime', function Realtime(socket, ipCookie) {
    var authenticated = false,
        token = ipCookie('token');

    return {
      isAuthenticated: function () {
        return authenticated;
      },
      authenticate: function (callback, force) {
        if (authenticated === false || force === true) {
          socket.emit('connect:authenticate', {
            token: token
          });

          socket.removeAllListeners('connect:authenticate');

          socket.on('connect:authenticate', function (success) {
            if (success) {
              authenticated = true;
              callback();
            }
            else {
              //RE-DIRECT TO LOGIN?
            }
          });
        }
        else {
          callback();
        }
      }
    };
  });
