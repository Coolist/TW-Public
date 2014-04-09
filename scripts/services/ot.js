'use strict';

angular.module('typewriteApp')
  .service('OT', function Operationaltransform() {

    /* globals ot */

    var cma = ot.CodeMirrorAdapter,
        otext = ot.TextOperation,
        preBuffer,
        buffer,
        revision = 0,
        cancelSave = false,
        locked = false;

    return {

      init: function() {
        preBuffer = null;
        buffer = null;
        locked = false;
      },
      prepareSend: function() {

        if (locked) {

          return false;
        }

        var comp;

        if (preBuffer) {

          comp = preBuffer;
        }

        if (!comp) {
          return false;
        }

        locked = true;

        var ret = [
          comp,
          revision
        ];

        return ret;
      },
      getCancelSave: function() {
        return cancelSave;
      },
      setCancelSave: function(v) {
        cancelSave = v;
      },
      setRevision: function(v) {
        revision = v;
      },
      operationCodeMirrorChange: function(cm, change) {

        var opp = cma.operationFromCodeMirrorChange(change, cm)[0];

        if (!preBuffer) {
          preBuffer = opp;
        }
        else {
          if (buffer) {
            if (buffer.targetLength === opp.baseLength) {
              buffer = buffer.compose(opp);
            }
          }
          else {
            buffer = opp;
          }
        }
      },
      operationCodeMirrorApply: function(cm, operation) {

        var op = otext.fromJSON(operation);

        if (preBuffer) {
          op = otext.transform(preBuffer, op);

          preBuffer = op[0];
          op = op[1];

          if (buffer) {
            op = otext.transform(buffer, op);

            console.log(op[0], buffer);
            buffer = op[0];
            op = op[1];
          }
        }

        revision++;

        cancelSave = true;

        cma.applyOperationToCodeMirror(op, cm);
      },
      serverClipped: function(callAgain) {

        if (preBuffer) {

          preBuffer = null;

          if (buffer) {

            preBuffer = buffer;

            buffer = null;

            callAgain();
          }
        }

        locked = false;
        revision++;
      }
    };
  });
