'use strict';

var express = require('express');
var controller = require('./project.controller');
var auth = require('../../auth/auth.service');
var multer = require('multer');
var path = require('path');
var fs = require('fs-extra');

var router = express.Router();

var ulFolder = "./uploaded/";


var storeFiles = multer.diskStorage({
  destination: function(req, file, cb) {
    var newDestination = ulFolder + req.body.userName + "/" + req.body.projectName +
      "/images/";
    cb(null, newDestination);

    console.log('writing images to ' + newDestination);
    console.log(req.body);
    console.log('content of file request')
    console.log(file);

    fs.mkdirsSync(newDestination, function(err) {
      console.log('Error creating directory ', err);
    });
  },
  filename: function(req, file, cb) {
    cb(null, (Math.random().toString(36) + '00000000000000000').slice(2,
      10) + Date.now() + path.extname(file.originalname));
  }
});

var destination = multer({
  storage: storeFiles
});


router.get('/:id', auth.isAuthenticated(), controller.show);
//router.get('/', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), destination.array('file'), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
//router.patch('/:id', controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
