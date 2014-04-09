'use strict';

angular.module('typewriteApp')
  .service('Marked', function Marked() {
    /* globals marked */

    marked.setOptions({
      gfm: false,
      tables: false,
      breaks: false,
      pedantic: false,
      sanitize: true,
      smartLists: true,
      smartypants: true,
    });

    return {

      parseMarkdown: function(input, callback) {

        marked(input, function (err, content) {

          callback(content);
        });
      }
    };
  });
