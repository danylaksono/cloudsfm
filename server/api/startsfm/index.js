'use strict';

var express = require('express');
var controller = require('./startsfm.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

//var username = controller.usernameDir;

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.download);
router.post('/', auth.isAuthenticated(), controller.startProcess);
router.delete('/:id', controller.destroy);

module.exports = router;
