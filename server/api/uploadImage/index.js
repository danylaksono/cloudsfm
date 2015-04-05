'use strict';

var express = require('express');
var controller = require('./uploadImage.controller');
var multer = require('multer');
var auth = require('../../auth/auth.service');

var router = express.Router();

var destination = multer({dest:"./uploaded/"});

router.get('/', auth.isAuthenticated(), controller.index);
//router.get('/:id', controller.show);
router.post('/', auth.isAuthenticated(), destination, controller.postUpload);
//router.put('/:id', controller.update);
//router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
