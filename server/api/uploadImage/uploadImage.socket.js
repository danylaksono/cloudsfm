/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var UploadImage = require('./uploadImage.model');

exports.register = function(socket) {
  UploadImage.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  UploadImage.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
 UploadImage.populate(doc, {path:'author', select: 'name'}, function(err, project) {
  socket.emit('uploadImage:save', project);
}

function onRemove(socket, doc, cb) {
  socket.emit('uploadImage:remove', doc);
}
