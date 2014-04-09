'use strict';

angular.module('typewriteApp')
  .controller('DocumentCtrl', function ($scope, $routeParams, $location, $rootScope, $timeout, Document, Version, Diffmatchpatch, socket, Realtime, OT, Authcheck, Marked, Auth, ipCookie, Integration) {

    Authcheck.redirectNoCookie({document: $routeParams.documentId});

    $scope.documentWordCount = 0;
    $scope.documentVersions = 0;
    $scope.documentContent = '';
    $scope.documentOldContent = '';
    $scope.documentSaved = true;
    $scope.documentLoading = true;
    $scope.documentSettings = false;
    $scope.notificationMessage = '';
    $scope.notificationVisible = false;
    $scope.documentId = $routeParams.documentId;
    $scope.realtimeOnline = false;
    $scope.codemirrorControl = {};
    $scope.codemirrorFunctions = {};
    $scope.documentAllowSave = false;
    $scope.windows = [];
    $scope.windowsSaving = [];
    $scope.preview = false;
    $scope.previewHtml = '';
    $scope.errorControl = {};
    $scope.sharingSettings = {};
    $scope.sharingSettings.email = '';
    $scope.integration = {
      dropbox: {
        status: 0,
        loading: true,
        folder: '/',
        file: '',
        listing: []
      }
    };

    if (navigator.appVersion.indexOf('Mac') !== -1) {
      $scope.actionSymbol = '&#8984;';
    }
    else {
      $scope.actionSymbol = '<span class="ctrl">CTRL</span>';
    }

    var realTimer, saveTimer;

    $scope.document = Document.get({documentId: $routeParams.documentId}, function (document) {

      if (!document.content) {
        document.content = '';
      }

      $scope.documentContent = document.content;
      //$scope.codemirrorControl.editorSetText(document.content);
      $scope.documentVersions = document.versions;
      $scope.documentOldContent = String($scope.documentContent);

      if ($scope.documentContent && $scope.documentContent.match(/([a-zA-Z0-9\.\-]+)/g)) {
        $scope.documentWordCount = $scope.documentContent.match(/([a-zA-Z0-9\.\-]+)/g).length;
      }

      if ($routeParams.settings) {
        $scope.openWindow(0);
        $location.search({});
      }
      
      //$scope.documentLoading = false;

    }, function(error) {
      $scope.errorControl.setError('<strong>Error:</strong> ' + error.data.message, 5);
    });

    var token = ipCookie('token');

    Auth.query({option: 'documents', documentId: $routeParams.documentId, token: token}, function (userList) {
      $scope.sharingSettings.users = userList;
    });

    Integration.get({integration: 'dropbox'}, function (response) {
      if (response.success) {
        $scope.integration.dropbox.status = 1;

        Integration.get({integration: 'dropbox', request: 'directory', path: '/'}, function (listing) {
          $scope.integration.dropbox.listing = listing.listing;
          $scope.integration.dropbox.loading = false;
        });
      }
      else {
        $scope.integration.dropbox.status = 0;
      }
    });

    $scope.editorOptions = {
      lineWrapping: true,
      mode: 'markdown',
      theme: 'markdown',
      indentWithTabs: true,
      extraKeys: {'Enter': 'newlineAndIndentContinueMarkdownList'}
    };

    $scope.editorFocus = function() {
      $scope.codemirrorControl.editorSetFocus();
    };

    $scope.goto = function(place) {
      $location.path(place);
    };

    /* ========= REALTIME =========== */

    var setRoom = function() {
      Realtime.authenticate(function () {
        socket.emit('document:setDocument', {
          id: $scope.documentId
        });
      });
    };

    if (Realtime.isAuthenticated()) {
      setRoom();
    }

    socket.on('connect:handshake', function (message) {
      if (message === 'auth') {
        setRoom();
      }
    });

    socket.on('connect:reauthenticate', function () {
      Realtime.authenticate(function () {
        socket.emit('document:setDocument', {
          id: $scope.documentId
        });
      }, true);
    });

    socket.on('document:receiveDocument', function (message) {

      var prevDocument = $scope.documentContent;

      OT.init();
      OT.setRevision(message[1]);

      if ($scope.documentAllowSave === true) {
        OT.setCancelSave(true);
      }

      $scope.documentContent = message[0];
      $scope.codemirrorControl.editorSetText(message[0]);
      $scope.documentOldContent = String($scope.documentContent);

      if (prevDocument && $scope.documentContent !== prevDocument) {
        $scope.mergeDifferencesTitle = 'Unsaved Document Changes';
        $scope.mergeDifferencesMessage = 'Oh no!  You were momentarily disconnected from Typewrite while you were working on this document.  To prevent you from losing work, you can choose which changes you want to keep here.  A new version of the current document will be saved for future reference.';
        
        $scope.createMergeDifferences($scope.documentContent, prevDocument);
      }

      $scope.documentAllowSave = true;
      $scope.realtimeOnline = true;
      $scope.documentLoading = false;
      $scope.documentSaved = true;
    });

    socket.on('document:update', function (message) {
      var cm = $scope.codemirrorControl.cmInstance();

      OT.operationCodeMirrorApply(cm, message);

      if ($scope.preview) {
        $scope.processPreview();
      }
    });

    socket.on('document:clipped', function () {

      if (saveTimer) {
        $timeout.cancel(saveTimer);
      }

      saveTimer = $timeout(function () {
        $scope.documentSaved = true;
        saveTimer = null;
      }, 500);

      OT.serverClipped(function () {
        if (!realTimer) {
          sendClip();
        }
      });
    });

    var sendClip = function() {

      realTimer = $timeout(function () {

        realTimer = null;

        var comp = OT.prepareSend();

        if (comp) {

          socket.emit('document:clip', comp);
        }

      }, 200);
    };

    $scope.$on('$destroy', function () {
      socket.removeAllListeners();
    });

    /* ========= END : REALTIME =========== */

    /* ========= KEYBOARD =========== */

    /* globals Mousetrap */

    Mousetrap.bind(['command+s', 'ctrl+s'], function() {
      if ($scope.preview === false) {
        $scope.saveVersion();
        return false;
      }
    });
    
    Mousetrap.bind(['command+b', 'ctrl+b'], function() {
      if ($scope.preview === false) {
        $scope.insertMarkdown('bold');
        return false;
      }
    });

    Mousetrap.bind(['command+i', 'ctrl+i'], function() {
      if ($scope.preview === false) {
        $scope.insertMarkdown('italic');
        return false;
      }
    });

    Mousetrap.bind(['command+k', 'ctrl+k'], function() {
      if ($scope.preview === false) {
        $scope.insertMarkdown('url');
        return false;
      }
    });

    Mousetrap.bind(['shift+command+i', 'shift+ctrl+i'], function() {
      if ($scope.preview === false) {
        $scope.insertMarkdown('image');
        return false;
      }
    });

    Mousetrap.bind(['shift+command+l', 'shift+ctrl+l'], function() {
      if ($scope.preview === false) {
        $scope.preview = true;
        $scope.processPreview();
        $scope.closeDocumentSettings();

        if (!$scope.$$phase) {
          $scope.$apply();
        }

        return false;
      }
      else {
        $scope.preview = false;

        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }
    });

    Mousetrap.bind(['esc', 'esc'], function() {
      if ($scope.preview === true) {
        $scope.preview = false;

        if (!$scope.$$phase) {
          $scope.$apply();
        }
        
        return false;
      }
    });

    /* ========= END : KEYBOARD =========== */

    var saveTimeout = $timeout(function () {});

    $scope.codemirrorFunctions.onValueChange = function (cm, change) {

      var nc = cm.getValue();
      $scope.documentContent = nc;

      if (nc !== undefined && $scope.documentAllowSave === true) {

        if (OT.getCancelSave() === false) {

          if ($scope.realtimeOnline === false) {

            if ($scope.documentOldContent !== nc) {

              $timeout.cancel(saveTimeout);

              $scope.documentSaved = false;

              /* globals CryptoJS */

              saveTimeout = $timeout(function () {
                var och = CryptoJS.MD5($scope.documentOldContent || '').toString(CryptoJS.enc.Hex),
                    nch = CryptoJS.MD5(nc || '').toString(CryptoJS.enc.Hex);
                
                var saveDiff = new Document({
                  documentId: $scope.document.id
                });

                saveDiff.old_content_hash = och; // jshint ignore:line
                saveDiff.new_content_hash = nch; // jshint ignore:line
                saveDiff.differences = Diffmatchpatch.patchDocument($scope.documentOldContent, nc);

                saveDiff.$save(function () {
                  $scope.documentOldContent = nc;
                  $scope.documentSaved = true;
                });
                
              }, 1000);
            }
          }
          else {

            $scope.documentSaved = false;

            OT.operationCodeMirrorChange(cm, change);

            if (!realTimer) {
              sendClip();
            }
          }
        }
        else {
          OT.setCancelSave(false);
        }
      }

      if (nc && nc.match(/([a-zA-Z0-9\.\-]+)/g)) {
        $scope.documentWordCount = nc.match(/(?!\-|\')([a-zA-Z0-9\.\-\']+)/g).length;
      }
      else {
        if (nc === '') {
          $scope.documentWordCount = 0;
        }
      }

      if (!$scope.$$phase) {
        $scope.$apply();
      }
    };

    $scope.insertMarkdown = function(type) {
      var ib = '',
          ia = '',
          selB,
          selL,
          line;

      switch(type) {
        case 'bold':
          ib = '**';
          ia = '**';
          break;
        case 'italic':
          ib = '*';
          ia = '*';
          break;
        case 'url':
          ib = '[';
          ia = '](http://)';
          selB = 2;
          selL = 7;
          break;
        case 'image':
          ib = '![';
          ia = '](http://)';
          selB = 2;
          selL = 7;
          break;
        case 'quote':
          ib = '> ';
          line = true;
          break;
        default:
          return false;
      }

      $scope.documentSettings = false;

      if (line) {
        $scope.codemirrorControl.insertAtSelectionLine(ib);
      }
      else {
        $scope.codemirrorControl.insertAtSelection(ib, ia, selB, selL);
      }
    };

    $scope.processPreview = function() {
      Marked.parseMarkdown($scope.codemirrorControl.editorGetText(), function (html) {
        $scope.previewHtml = html;
      });
    };

    $scope.saveVersion = function(callback) {
      var version = new Version({
        documentId: $scope.document.id,
      });

      version.content = String($scope.documentContent);

      version.$save(function (ver) {
        $scope.documentVersions = ver.version;
        $scope.notificationMessage = 'Version ' + ver.version + ' saved';
        $scope.notificationVisible = true;

        if (callback) {
          callback();
        }

        $timeout(function () {
          $scope.notificationVisible = false;
        }, 4000);

      });
    };

    $scope.removeAccess = function(user) {

      if ($scope.sharingSettings.users.length > 1) {
        Auth.delete({
          option: 'documents',
          option2: 'users',
          userId: user.id,
          documentId: $routeParams.documentId,
          token: token
        }, function() {
          $scope.sharingSettings.users.splice($scope.sharingSettings.users.indexOf(user), 1);
        });
      }
      else {
        $scope.errorControl.setError('<strong>Error:</strong> There should be at least one person with access to this document.', 5);
      }
    };

    $scope.createMergeDifferences = function(version1, version2) {
      var diffs = Diffmatchpatch.diffSemantic(version1, version2);

      $scope.mergeDifferences = [];

      for (var i in diffs) {
        $scope.mergeDifferences.push({
          action: diffs[i][0],
          content: diffs[i][1],
          perform: true
        });
      }

      $scope.openWindow(2);
    };

    $scope.saveMergeDifferences = function() {
      var content = '',
          diffs = $scope.mergeDifferences;

      for (var i in diffs) {
        switch (diffs[i].action) {
          case -1:
            if (diffs[i].perform === false) {
              content += diffs[i].content;
            }
            break;
          case 0:
            content += diffs[i].content;
            break;
          case 1:
            if (diffs[i].perform === true) {
              content += diffs[i].content;
            }
            break;
        }
      }

      $scope.saveVersion(function () {
        $scope.documentContent = content;
        $scope.codemirrorControl.editorSetText(content);

        $scope.closeWindow(2);
      });
    };

    $scope.saveDocumentSettings = function() {
      Document.update({
        documentId: $routeParams.documentId
      },
      {
        name: $scope.document.name
      }, function() {
        $scope.closeWindow(0);
      });
    };

    $scope.saveSharingSettings = function() {
      var email = $scope.sharingSettings.email;

      $scope.sharingSettings.email = '';

      Auth.post({
        option: 'documents',
        documentId: $routeParams.documentId,
        token: token
      },
      {
        email: email
      }, function() {
        $scope.windowsSaving[1] = false;

        $scope.sharingSettings.users.push({
          name: 'Invited',
          email: email
        });
      });
    };

    $scope.openWindow = function(id) {
      $scope.windows[id] = true;
      $scope.windowsSaving[id] = false;
    };

    $scope.closeWindow = function(id) {
      $scope.windows[id] = false;
      $scope.windowsSaving[id] = false;
    };

    $scope.dropboxBrowse = function(item) {

      if (item && item.is_dir === true) { //jshint ignore:line
        $scope.integration.dropbox.loading = true;

        Integration.get({integration: 'dropbox', request: 'directory', path: item.path}, function (listing) {
          $scope.integration.dropbox.folder = item.path;
          $scope.integration.dropbox.listing = listing.listing;
          $scope.integration.dropbox.loading = false;
        });
      } else {
        if (item) {
          $scope.integration.dropbox.file = item.path;
        }
        else {

          $scope.integration.dropbox.loading = true;

          var path = $scope.integration.dropbox.folder,
              newPath = path.substring(0, path.lastIndexOf('/'));

          Integration.get({integration: 'dropbox', request: 'directory', path: newPath}, function (listing) {
            $scope.integration.dropbox.folder = newPath;
            $scope.integration.dropbox.listing = listing.listing;
            $scope.integration.dropbox.loading = false;
          });
        }
      }
    };

    $scope.openPopup = function(url) {
      var width = 1200,
          height = 800,
          leftPosition = (window.screen.width / 2) - ((width / 2) + 10),
          topPosition = (window.screen.height / 2) - ((height / 2) + 50);

      var w = window.open(url, 'smallWindow', 'status=no,height=' + height + ',width=' + width + ',resizable=yes,left=' + leftPosition + ',top=' + topPosition + ',screenX=' + leftPosition + ',screenY=' + topPosition + ',toolbar=no,menubar=no,scrollbars=no,location=no,directories=no');

      if (window.focus) {
        w.focus();
      }

      return false;
    };

    $scope.openDocumentSettings = function() {
      $timeout(
        function () {
          $scope.documentSettings = true;
        }, 1);
    };

    $scope.closeDocumentSettings = function() {
      if ($scope.documentSettings === true) {
        $scope.documentSettings = false;
      }
    };
  });
