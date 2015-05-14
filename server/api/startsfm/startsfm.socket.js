/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Startsfm = require('./startsfm.model');

exports.register = function(socket) {
  Startsfm.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Startsfm.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('startsfm:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('startsfm:remove', doc);
}