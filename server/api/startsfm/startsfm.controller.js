'use strict';

var _ = require('lodash');
var Startsfm = require('./startsfm.model');
var shell = require('shelljs');
var fs = require('fs');
var path = require('path');
var zip = require('express-zip');



var check = function(files) {
	// Check to see if the process has finished
	var message = '';
	var stats = fs.lstatSync(files);
	if (stats.isFile()) {
		console.log('File found!');
		message='Completed';
	} else { 
		console.log('Failed');
		message='Unknown error occured. Please try again';
	}
	return message;
}




// Whole processing route
exports.startProcess = function(req, res, next) {
		
	// identifying working directories
	var currentDir = shell.pwd();
	var usernameDir = req.body.username;
	var projectnameDir= req.body.projectname;
	var workingDir = currentDir + '/uploaded' + '/' + usernameDir + '/' + projectnameDir;
	
	console.log(exports.usernameDir);
	
	// Defining SfM processing commands
	// (initial sfm parameter are set to default now. future release will use parameter based on user input)
	var GlobalSfM = 'python SfM_GlobalPipeline.py -i ' + workingDir + '/images/ -o '+ workingDir + '/output/ -f 2000';
	var SequentialSfM = 'python SfM_GlobalPipeline.py -i ' + workingDir + '/images/ -o '+ workingDir + '/output/ -f 2000';
	var MVS = "printf \\r\\n | python MVE_FSSR_MVS.py -i " + workingDir + '/images/ -o '+ workingDir + '/scene/';
	
	//Select SfM Method based on user input. Default is Global
	var SfMmethod = 'Global';
	
	exports.global_sfm_dir = workingDir + '/output/reconstruction_global/';
	exports.sequential_sfm_dir = workingDir + '/output/reconstruction_sequential/';
	exports.mvs_scene_dir = workingDir + '/scene/';
	
	var HTMLreport = '';
	if(SfMmethod == 'Global') {
		HTMLreport = exports.global_sfm_dir + 'SfMReconstruction_Report.html';
		shell.exec(GlobalSfM);
	} else {
		HTMLreport = exports.sequential_sfm_dir + 'SfMReconstruction_Report.html';
		shell.exec(SequentialSfM);	
	}
	//executing MVS
	shell.exec(MVS);
	 
	var fileExist = check(HTMLReport);	

	return res.json(fileExist);
};


// Download
exports.download = function(req, res, next) {
	//console.log(exports.usernameDir);
	var out_colorizedSfM = exports.global_sfm_dir + 'robust_colorized.ply';
	var out_SfMReport = exports.global_sfm_dir + 'SfMReconstruction_Report.html';
	var out_textured = exports.mvs_scene_dir + 'out_textured.obj';
	
	if (req.query.download == 'colorized-cloud'){
		console.log('Requesting colorized cloud..');
		return res.download(out_colorizedSfM);
	} else if (req.query.download == 'sfmreport') {
		console.log('Requesting SfM Report...');
		return res.download(out_SfMReport);
	} else if (req.query.download == 'textured') {
		console.log('Requesting textured model...');
		//return res.download(out_textured);
		return res.zip([
			{path: exports.mvs_scene_dir + 'out_textured.obj', name: 'out_textured.obj'},
			{path: exports.mvs_scene_dir + 'out_textured.mtl', name: 'out_textured.mtl'},
			{path: exports.mvs_scene_dir + 'out_textured_data_costs.spt', name: 'out_textured_data_costs.spt'},
			{path: exports.mvs_scene_dir + 'out_textured_labeling.vec', name: 'out_textured_labeling.vec'},
			{path: exports.mvs_scene_dir + 'out_textured_material0000_map_Kd.png', name: 'out_textured_material0000_map_Kd.png'}
			]);
			
	} else {
		return res.json('Unknown query parameter')
	}
		
};


// Get list of startsfms
exports.index = function(req, res) {
  var pwd = shell.pwd();
  var name = req.query.name;
  var project = req.query.project;
  console.log(name);
  console.log(project);
  
  var mvsobj = pwd + '/uploaded' + '/' + name + '/' + project + '/scene/out_textured.obj';
  var checkExist = check(mvsobj);
  console.log(checkExist);		
/*	
  Startsfm.find(function (err, startsfms) {
    if(err) { return handleError(res, err); } */
    return res.json(200, checkExist);
  //});
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
