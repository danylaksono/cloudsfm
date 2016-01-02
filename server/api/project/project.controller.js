'use strict';

var _ = require('lodash');
var Project = require('./project.model');
var fs = require('fs-extra')

// Get list of projects
exports.index = function(req, res) {

  Project.loadRecent(function(err, projects) {
    if (err) {
      return handleError(res, err);
    }
    /*console.log(req.user._id)
    var userProjects = {};
    projects.forEach(function(project) {
      if (project.author._id == req.user._id) {

      }
    });

    console.log(userProjects); */
    return res.status(200).json(userProjects);
  });
};

// Get a single project
exports.show = function(req, res) {
  Project.find({
    'userName': req.user.name
  }, function(err, projects) {
    if (err) {
      return handleError(res, err);
    }
    /*if (!project) {
      return res.status(404).send('Not Found');
    }*/
    console.log(req.user)
    return res.json(projects);
  });
};

// Creates a new project in the DB.
exports.create = function(req, res) {
  // don't include the date, if a user specified it
  delete req.body.date;
  req.body.projectPath = "./uploaded/" + req.body.userName + "/" + req.body.projectName +
    "/images/";
  req.body.projectStatus = 'Ready to Proceed';
  console.log(req.body);

  //write file project settings
  var settingsFile = "./uploaded/" + req.body.userName + "/" + req.body.projectName +
    '/settings.json';
  fs.writeFile(settingsFile, JSON.stringify(req.body, null, 4), function(err,
    data) {
    if (err) {
      return console.log(err);
    }
    console.log(data);
  });

  // create and save new project in Mongo collection
  var project = new Project(_.merge({
    author: req.user._id
  }, req.body));

  project.save(function(err, comment) {
    if (err) {
      console.log(err);
      return handleError(res, err);

    }
    return res.status(201).json(project);
  });

};



// Updates an existing project in the DB.
exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Project.findById(req.params.id, function(err, project) {
    if (err) {
      return handleError(res, err);
    }
    if (!project) {
      return res.status(404).send('Not Found');
    }
    var updated = _.merge(project, req.body);
    updated.save(function(err) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json(project);
    });
  });
};

// Deletes a project from the DB.
exports.destroy = function(req, res) {
  console.log('hapus proyek:' + req.query.projectid);
  console.log(req.query);

  // delete physical data
  var str = req.query.projectpath;
  var rmDirectory = str.substring(0, str.length - 7);
  fs.removeSync(rmDirectory);
  console.log('Project directory erased')

  //delete project's mongo data
  Project.findById(req.query.projectid, function(err, project) {
    if (err) {
      return handleError(res, err);
    }
    if (!project) {
      return res.status(404).send('Not Found');
    }
    project.remove(function(err) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
