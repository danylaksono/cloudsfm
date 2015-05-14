'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StartsfmSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Startsfm', StartsfmSchema);