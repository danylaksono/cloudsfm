'use strict';

var _ = require('lodash');
var Startsfm = require('./startsfm.model');
var shell = require('shelljs');
var fs = require('fs-extra');
var PythonShell = require('python-shell');


// Creates a new startsfm in the DB.
exports.startProcess = function(req, res) {
	
	// Defining processing directories
	var currentDir = shell.pwd();
	var usernameDir = req.body.username;
	var projectnameDir = req.body.projectname;
	var workingDir = currentDir + '/uploaded' + '/' + usernameDir + '/' + projectnameDir;
	
	//defining SfM pipeline parameters
	var GlobalSfM = 'python SfM_GlobalPipeline.py -i ' + workingDir + '/images -o '+ workingDir + '/output -f 2000';
	var SequentialSfM = 'python SfM_GlobalPipeline.py -i ' + workingDir + '/images -o '+ workingDir + '/output -f 2000';
	var MVS = 'printf "\r\n" | python MVE_FSSR_MVS.py -i ' + workingDir + '/images -o '+ workingDir + '/scene';
	
	//execute processing
	shell.exec(MVS);
	
		
	var message = "Started";
	return res.json(message);
  
};


// Get list of startsfms
exports.index = function(req, res) {
  Startsfm.find(function (err, startsfms) {
    if(err) { return handleError(res, err); }
    return res.json(200, startsfms);
  });
};

// Creates a new startsfm in the DB.
exports.create = function(req, res) {
  Startsfm.create(req.body, function(err, startsfm) {
    if(err) { return handleError(res, err); }
    return res.json(201, startsfm);
  });
};


// Deletes a startsfm from the DB.
exports.destroy = function(req, res) {
  Startsfm.findById(req.params.id, function (err, startsfm) {
    if(err) { return handleError(res, err); }
    if(!startsfm) { return res.send(404); }
    startsfm.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
