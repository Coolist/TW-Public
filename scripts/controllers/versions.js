'use strict';

angular.module('typewriteApp')
  .controller('VersionsCtrl', function ($scope, $location, $routeParams, Document, Version, Diffmatchpatch) {

    $scope.documentId = $routeParams.documentId;
    $scope.loading = true;
    $scope.differences = [];
    $scope.documentView = 'Loading...';
    $scope.loading = true;

    $scope.compareFirst = 0;
    $scope.compareSecond = 0;
    $scope.comparePrevious = true;

    $scope.errorControl = {};

    var dmp = Diffmatchpatch;

    $scope.document = Document.get({documentId: $scope.documentId}, function () {

      $scope.versionInfo = Version.query({documentId: $scope.documentId}, function(version) {
        var lastContent = version.last_content; // jshint ignore:line

        $scope.loading = false;

        $scope.compareFirst = version.total;
        $scope.totalVersions = version.total;

        for (var i in version.versions) {
          $scope.differences.push(version.versions[i].differences);
        }

        $scope.documentView = htmlDifferences(dmp.diffSemantic(dmp.patchApply(lastContent, combineDifferences($scope.totalVersions - 1, $scope.totalVersions)), lastContent));
      }, function (error) {
        $scope.errorControl.setError('<strong>Error:</strong> ' + error.data.message, 5);
      });

    }, function (error) {
      $scope.errorControl.setError('<strong>Error:</strong> ' + error.data.message, 5);
    });

    
    $scope.goto = function(place) {
      $location.path(place);
    };

    $scope.setViewVersion = function(version) {
      $scope.compareFirst = version;

      if ($scope.comparePrevious) {
        $scope.compareVersions(version, version - 1);
      }
    };

    $scope.compareVersions = function(versionA, versionB) {
      var lastContent = $scope.versionInfo.last_content; // jshint ignore:line

      $scope.compareFirst = versionA;
      $scope.compareSecond = versionB;

      $scope.documentView = htmlDifferences(dmp.diffSemantic(dmp.patchApply(lastContent, combineDifferences(versionB, $scope.totalVersions)), dmp.patchApply(lastContent, combineDifferences(versionA, $scope.totalVersions))));
    };

    var combineDifferences = function(version, total) {
      var ret = '';

      for (var i = total - 1; i >= version; i--) {
        ret += $scope.differences[i];
      }

      return ret;
    };

    var htmlDifferences = function(diffs) {
      var ret = '';

      for (var i in diffs) {
        if (diffs[i][0] === 0) {
          ret += diffs[i][1].replace(/\n/g, '<br />');
        }
        else if (diffs[i][0] === 1) {
          ret += '<ins>' + diffs[i][1].replace(/\n/g, '<br />') + '</ins>';
        }
        else if (diffs[i][0] === -1) {
          ret += '<del>' + diffs[i][1].replace(/\n/g, '&para;') + '</del>';
        }
      }

      return ret;
    };
  });
