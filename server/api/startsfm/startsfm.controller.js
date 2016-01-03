'use strict';

var _ = require('lodash');
var Startsfm = require('./startsfm.model');
var shell = require('shelljs');
var fs = require('fs');
var path = require('path');
var zip = require('express-zip');
var present = require('present');


exports.check = function(files) {
	// Check to see if the process has finished
	var message = '';
	try {
		var stats = fs.lstatSync(files);
		if (stats.isFile()) {
			console.log('File found!');
			message = 'Completed';
		}
	} catch (err) {
		console.log(err);
		console.log('File Not Found');
		message = 'Ready to Start';
	}
	return message;
}


// Check if output already exist
exports.index = function(req, res) {
	var pwd = shell.pwd();
	var name = req.query.name;
	var project = req.query.project;


	var mvsobj = pwd + '/uploaded/' + name + '/' + project;
	console.log(mvsobj);
	var checkExist = exports.check(mvsobj);
	console.log(checkExist);

	return res.json(checkExist);

};



// Whole processing route
exports.startProcess = function(req, res, next) {

	// identifying working directories
	var currentDir = shell.pwd();

	var usernameDir = req.body.username;
	var projectnameDir = req.body.projectname;
	var workingDir = currentDir + '/uploaded' + '/' + usernameDir + '/' +
		projectnameDir;

	console.log(workingDir);

	// Running the python SfM processing commands
	var GlobalSfM = 'python SfM_GlobalPipeline.py -w ' + workingDir + ' > ' +
		workingDir + '/report_global.txt';

	//log execution time of function
	var start = present();
	//shell.exec(GlobalSfM);
	var end = present();
	var run_time = "Process took " + ((end - start).toFixed(3)) / 60000 +
		" minute(s)."
	console.log(run_time)


	var lateststatus;
	fs.readFile(workingDir + '/settings.json', 'utf-8', function(err, data) {
		if (err) {
			console.log(err);
			lateststatus = {
				projectStatus: "Error during reconstruction"
			}
			return res.json(lateststatus)
		} else {
			//console.log(data);
			lateststatus = data;
			console.log(lateststatus)
			return res.json(lateststatus)
		}
	});



};


// Download
exports.download = function(req, res, next) {
	//console.log(req)
	console.log(req.query)

	var workingdir = path.join(req.query.projectpath, "..");
	console.log(workingdir)

	var localpath = {
		colorcloud: workingdir + '/output/global/robust_colorized.ply',
		sfmreport: workingdir + '/output/global/SfMReconstruction_Report.html',
		sfmgraph: workingdir + '/output/global/Reconstruction_Report.html',
		textured: workingdir + '/output/mve/MVE/Reconstruction_Report.html',
	}

	//return res.json('Unknown query parameter')

	if (req.query.item == 'colorized-cloud') {
		console.log('Requesting colorized cloud..');
		return res.download(localpath.colorcloud);
	} else if (req.query.item == 'sfmreport') {
		console.log('Requesting SfM Report...');
		return res.download(localpath.sfmreport);
	} else if (req.query.item == 'textured') {
		console.log('Requesting textured model...');
		//return res.download(out_textured);
		return res.zip([{
				path: exports.mvs_scene_dir + 'textured.obj',
				name: 'out_textured.obj'
			}, {
				path: exports.mvs_scene_dir + 'textured.mtl',
				name: 'out_textured.mtl'
			}
			//{path: exports.mvs_scene_dir + 'textured_data_costs.spt', name: 'out_textured_data_costs.spt'},
			//{path: exports.mvs_scene_dir + 'textured_labeling.vec', name: 'out_textured_labeling.vec'},
			//{path: exports.mvs_scene_dir + 'textured_material0000_map_Kd.png', name: 'out_textured_material0000_map_Kd.png'}
		]);

	} else {
		return res.json('Unknown query parameter')
	}

};



// Creates a new startsfm in the DB.
exports.create = function(req, res) {
	Startsfm.create(req.body, function(err, startsfm) {
		if (err) {
			return handleError(res, err);
		}
		return res.json(201, startsfm);
	});
};


// Deletes a startsfm from the DB.
exports.destroy = function(req, res) {
	Startsfm.findById(req.params.id, function(err, startsfm) {
		if (err) {
			return handleError(res, err);
		}
		if (!startsfm) {
			return res.send(404);
		}
		startsfm.remove(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.send(204);
		});
	});
};

function handleError(res, err) {
	return res.send(500, err);
}
