'use strict';

angular.module('typewriteApp')
  .service('Diffmatchpatch', function Diffmatchpatch() {
    return {

      /* jshint ignore:start */
      patchDocument: function(oldContent, newContent) {

        var dmp = new diff_match_patch(),
            diff = dmp.diff_main(oldContent, newContent, true),
            patch_list = dmp.patch_make(oldContent, newContent, diff);

        return dmp.patch_toText(patch_list);
      },
      diffSemantic: function(oldContent, newContent) {

      var oldC = String(oldContent).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
          newC = String(newContent).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

        var dmp = new diff_match_patch(),
            diff = dmp.diff_main(oldC, newC);

        dmp.diff_cleanupSemantic(diff);

        return diff;
      },
      patchApply: function(content, patch) {

        var dmp = new diff_match_patch(),
            patchA = dmp.patch_fromText(patch),
            contentPatched = dmp.patch_apply(patchA, content);
            
        return contentPatched[0];
      }
      /* jshint ignore:end */
    };
  });
