'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UploadImageSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('UploadImage', UploadImageSchema);