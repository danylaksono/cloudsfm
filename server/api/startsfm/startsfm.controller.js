'use strict';

var _ = require('lodash');
var Startsfm = require('./startsfm.model');
var shell = require('shelljs');
var fs = require('fs');
var path = require('path');


// Whole processing route
exports.startProcess = function(req, res, next) {
	var message = {};
	
	
	// export variable as global
	exports.currentDir = shell.pwd();
	exports.usernameDir = req.body.username;
	exports.projectnameDir= req.body.projectname;
	exports.workingDir = exports.currentDir + '/uploaded' + '/' + exports.usernameDir + '/' + exports.projectnameDir;
	
	console.log(exports.usernameDir);
	
	// Defining SfM pipeline parameters
	var GlobalSfM = 'python SfM_GlobalPipeline.py -i ' + exports.workingDir + '/images -o '+ exports.workingDir + '/output -f 2000';
	var SequentialSfM = 'python SfM_GlobalPipeline.py -i ' + exports.workingDir + '/images -o '+ exports.workingDir + '/output -f 2000';
	var MVS = "printf \\r\\n | python MVE_FSSR_MVS.py -i " + exports.workingDir + '/images -o '+ exports.workingDir + '/scene';
	
	
	//Select SfM Method based on user input. Default is Global
	var SfMmethod = 'Global';
	
	var global_sfm_dir = exports.workingDir + '/output/reconstruction_global/';
	var sequential_sfm_dir = exports.workingDir + '/output/reconstruction_sequential/';
	
	var HTMLreport = '';
	if(SfMmethod == 'Global') {
		HTMLreport = global_sfm_dir + 'SfMReconstruction_Report.html';
		//shell.exec(GlobalSfM);
	} else {
		HTMLreport = sequential_sfm_dir + 'SfMReconstruction_Report.html';
		//shell.exec(SequentialSfM);
		
	}
	//executing MVS
	//shell.exec(MVS);
	 
		
	// Check to see if the process has finished
	var stats = fs.lstatSync(HTMLreport);
	if (stats.isFile()) {
		console.log('File found!');
		message.msg='Completed';
		message.report = HTMLreport;
	} else { 
		console.log('Failed');
		message.msg='Unknown error occured. Please try again';
	}
		
	return res.json(message);
	
};

// Download
exports.download = function(req, res) {
	console.log(exports.usernameDir);
	var filepath = exports.currentDir + '/uploaded/' + exports.usernameDir +'/'
	   + exports.projectnameDir + '/output/reconstruction_global/colorized.ply';
	return res.download(filepath, 'colorized.ply');
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
