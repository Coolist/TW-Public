'use strict';

angular.module('typewriteApp')
  .controller('DocumentsCtrl', function ($scope, $location, $timeout, Document, Workspace, Authcheck) {
    Authcheck.redirectNoCookie();

    $scope.newDocumentInput = false;
    $scope.settingsInput = -1;
    $scope.clickTimer = [];
    $scope.clickTimerIsSet = [];
    $scope.loading = true;
    $scope.errorControl = {};
    $scope.workspace = 0;

    $scope.documents = Document.query(function () {
      $scope.loading = false;
    }, function (error) {
      $scope.errorControl.setError('<strong>Error:</strong> ' + error.data.message, 5);
    });

    $scope.workspaces = Workspace.query(function () {
      
    }, function (error) {
      $scope.errorControl.setError('<strong>Error:</strong> ' + error.data.message, 5);
    });

    $scope.workspaceName = function(id) {
      var name = '';

      if ($scope.workspace === 0) {
        name = 'all workspaces';
      }
      else {
        for (var i in $scope.workspaces) {
          console.log($scope.workspaces[i]);
          if ($scope.workspaces[i].id === id) {
            name = $scope.workspaces[i].name;
          }
        }
      }

      return name;
    };

    $scope.newDocument = function(event) {

      var doc = new Document({
        name: $scope.documentName,
        public: false,
        color: 1
      });

      doc.$save(function (ret) {
        $location.path('/document/' + ret.id);
      });

      $scope.newDocumentInput = false;
      $scope.documentName = '';
      event.preventDefault();
    };

    $scope.toggleSettings = function(index) {
      if ($scope.settingsInput !== index) {
        $scope.settingsInput = index;
      }
      else {
        $scope.settingsInput = -1;
      }
      return false;
    };

    $scope.changeDocumentColor = function(color, document) {
      var col;

      switch (color) {
        case 2:
          col = 'E2491A';
          break;
        case 3:
          col = '71CC29';
          break;
        case 4:
          col = '999999';
          break;
        default:
          col = 'E8C018';
      }

      $scope.documents[$scope.documents.indexOf(document)].color = col;
      Document.update({documentId: document.id}, {
        color: color
      });
    };

    $scope.clickTimerSet = function(document) {
      $scope.clickTimerIsSet[document.id] = true;
      $scope.clickTimer[document.id] = $timeout(function () {
        Document.delete({documentId: document.id});
        $scope.settingsInput = -1;
        $scope.documents.splice($scope.documents.indexOf(document), 1);
      }, 1000);
    };

    $scope.clickTimerUnset = function(document) {
      $scope.clickTimerIsSet[document.id] = false;
      if ($scope.clickTimer[document.id]) {
        $timeout.cancel($scope.clickTimer[document.id]);
      }
    };

    $scope.newDocumentClear = function(event) {
      $scope.newDocumentInput = false;
      $scope.documentName = '';
      event.preventDefault();
    };

    $scope.goto = function(place) {
      $location.path(place);
    };

    $scope.openDocument = function(document, params) {

      if (!params) {params = {};}

      $location.path('/document/' + document.id).search(params);
    };
  });