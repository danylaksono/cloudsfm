'use strict';

var _ = require('lodash');
var UploadImage = require('./uploadImage.model');
var shell = require('shelljs');



// Get list of uploadImages
exports.index = function(req, res) {
  //UploadImage.find({}, function(err, uploadImages) {
  UploadImage.loadRecent(function (err, uploadImages) {
    if(err) { return handleError(res, err); }
    //return res.json(200, uploadImages);
    return res.json(uploadImages);
  });
};


//Express route to handle uploaded files
exports.postUpload = function(req, res) {
    var file = req.files;
    exports.projectname = req.body.projectName;
    console.log(file);
    console.log(exports.projectname);
    console.log(req.body)
    console.log("Images successfully retrieved");
    delete req.body.date;
	
	
    var project = new UploadImage(_.merge({author:req.user._id}, req.body));
    project.save(function(err, project) {
      if(err) { return handleError(res, err); }
      return res.json(201, project);
      console.log('project saved successfully');
    });
}


// Get a single uploadImage
exports.show = function(req, res) {
  UploadImage.findById(req.params.id, function (err, uploadImage) {
    if(err) { return handleError(res, err); }
    if(!uploadImage) { return res.send(404); }
    return res.json(uploadImage);
  });
};

// Creates a new uploadImage project description in the DB.
exports.create = function(req, res) {
  delete req.body.date;

  var project = new UploadImage(_.merge({author:req.user._id}, req.body));
  UploadImage.save(function(err, uploadImage) {
    if(err) { return handleError(res, err); }
    return res.json(201, uploadImage);
  });
};

// Updates an existing uploadImage in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  UploadImage.findById(req.params.id, function (err, uploadImage) {
    if (err) { return handleError(res, err); }
    if(!uploadImage) { return res.send(404); }
    var updated = _.merge(uploadImage, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, uploadImage);
    });
  });
};

// Deletes a uploadImage from the DB.
exports.destroy = function(req, res) {
  UploadImage.findById(req.params.id, function (err, uploadImage) {
    if(err) { return handleError(res, err); }
    if(!uploadImage) { return res.send(404); }
    uploadImage.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
