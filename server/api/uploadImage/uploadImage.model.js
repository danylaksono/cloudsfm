'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UploadImageSchema = new Schema({
  projectName: String,
  projectDesc: String,
  date: { type: Date, default: Date.now },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

UploadImageSchema.statics = {
  loadRecent: function(cb) {
    this.find({})
      .populate({path:'author', select: 'name'})
      .sort('-date')
      .limit(5)
      .exec(cb);
  }
};

module.exports = mongoose.model('UploadImage', UploadImageSchema);
