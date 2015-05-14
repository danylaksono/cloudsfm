'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UploadImageSchema = new Schema({
  projectName: String,
  projectDescription: String,
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
	  .sort('date')
	  //.limit(1)
      .exec(cb);
  }
};


/*
UploadImageSchema.statics = {
  loadRecent: function(cb) {
    this.aggregate([
        { $sort: {'_date':-1}},
        { $limit: 5}
        //{ $group: {'author':'name'}}
    
    ], function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(result);
    });
}
};
*/

module.exports = mongoose.model('UploadImage', UploadImageSchema);
