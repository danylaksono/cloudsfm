'use strict';

var express = require('express');
var controller = require('./uploadImage.controller');
var multer = require('multer');
var auth = require('../../auth/auth.service');
var fs = require('fs-extra');
//var mkdirp = require('mkdirp');

var router = express.Router();

var destination = multer({
	dest: "./uploaded/",
	changeDest: function(dest, req, res) {
		var newDestination = dest + req.user.name + "/" + req.body.projectName +
			"/images/";
		fs.mkdirsSync(newDestination, function(err) {
			console.log('Error creating directory ', err);
		});
		/*
		var stat = null;
		try {
			stat = fs.statSync(newDestination);
		} catch (err) {
			fs.mkdirSync(newDestination);
		}
		if (stat && !stat.isDirectory()) {
			throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
		} */
		return newDestination

	}
});


router.get('/', auth.isAuthenticated(), controller.index);
//router.get('/:id', controller.show);
router.post('/', auth.isAuthenticated(), controller.postUpload);
//router.post('/', auth.isAuthenticated(), controller.postUpload);
//router.put('/:id', controller.update);
//router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
