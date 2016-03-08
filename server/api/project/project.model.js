'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


// define each project attribute
var ProjectSchema = new Schema({
  userName: String,
  projectID: String,
  projectName: String,
  projectDescription: String,
  projectPath: String,
  projectStatus: String,
  date: {
    type: Date,
    default: Date.now
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  intrinsic: String, // is the project using focal length or K-matrix?
  focal: Number, //for the focal number
  kmatrix: String, //for K Matrix Intrinsic parameters
  featDetector: String, // feature detector (SIFT, AKAZE, AK-FLOAT)
  detPreset: String, // detection preset: Normal, HIGH, ULTRA
  isUpright: Boolean, // is camera upright
  annRatio: Number,
  geomModel: String,
  seqModel: String,
  nearMethod: String
});


ProjectSchema.statics = {
  loadRecent: function(cb) {
    this.find({})
      .populate({
        path: 'author',
        select: 'name'
      })
      .sort('-date')
      //.limit(1)
      .exec(cb);
  }
};


module.exports = mongoose.model('Project', ProjectSchema);
