'use strict';

var express = require('express');
var controller = require('./project.controller');
var auth = require('../../auth/auth.service');
var multer = require('multer');
var fs = require('fs-extra');

var router = express.Router();

var ulFolder = "./uploaded/";

var storeFiles = multer.diskStorage({
  destination: function(req, file, cb) {
    var newDestination = ulFolder + req.body.userName + "/" + req.body.projectName +
      "/images/";
    cb(null, newDestination);
    console.log('writing images to' + newDestination);

    fs.mkdirsSync(newDestination, function(err) {
      console.log('Error creating directory ', err);
    });
  }
});

var destination = multer({
  storage: storeFiles
});


router.get('/:id', auth.isAuthenticated(), controller.index);
//router.get('/:id', controller.show);
router.post('/', auth.isAuthenticated(), destination.array('file'), controller.create);
//router.put('/:id', controller.update);
//router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
