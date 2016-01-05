'use strict';

angular.module('cloudsfmApp')
  .controller('ManageCtrl', function($scope, $http, $window, Auth, socket,
    $modal) {

    $scope.clicked = false;
    $scope.isFinished = false;
    $scope.currentStatus = '';
    $scope.downloadactive = false;
    $scope.downloadready = false;


    //moving between tab seamlesly using angular ui
    $scope.active = {
      basic: true
    };

    $scope.activateTab = function(tab) {
      $scope.active = {}; //reset
      $scope.active[tab] = true;
    }


    // get all projects in mongodb

    $http.get('/api/projects/' + Auth.getCurrentUser()._id).success(function(
      projects) {

      $scope.projects = projects;
      console.log($scope.projects);

      // socketJS update the data
      socket.syncUpdates('project', $scope.projects, function(event,
        project, projects) {
        // sort the array every time its modified
        projects.sort(function(a, b) {
          a = new Date(a.date);
          b = new Date(b.date);
          return a > b ? -1 : a < b ? 1 : 0;
        });
      });
    });

    // Clean up listeners when the controller is destroyed
    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('project');
    });

    $scope.summonInfo = function(key) {
      $scope.activeProject = key;
      $scope.clicked = true;
      $scope.activateTab('basic');
      console.log($scope.activeProject.projectName);
      console.log($scope.activeProject.projectStatus);

      $scope.currentStatus = $scope.activeProject.projectStatus;

      if ($scope.currentStatus = 'Finished') {
        $scope.isFinished = true;
      }

      //checking project status
      var summonUrl = '/api/startsfms/' + '?name=' + $scope.activeProject.userName +
        '&project=' + $scope.activeProject.projectName;
      $http.get(summonUrl).success(function(msg) {
        console.log(msg);
      }).error(function(err) {
        console.log('Error occured!', err);
      });

    };


    // Delete confirmation
    $scope.confirmDelete = function() {
      $scope.modalInstance = $modal.open({
        templateUrl: 'deleteConfirmation.html',
        controller: 'DeleteProjectCtrl',
        size: 'sm',
        backdrop: 'static',
        keyboard: true
      });
    }


    $scope.deleteProject = function(project) {
      $scope.confirmDelete();
      $scope.modalInstance.result.then(function(value) {
        if (value === 'affirmative') { //delete the project
          $http.delete('/api/projects/' + Auth.getCurrentUser()._id, {
            params: {
              projectid: project._id,
              projectpath: project.projectPath,
              projectname: project.projectName
            }
          });
        }
      });
      $scope.clicked = false;
    };


    $scope.isprocessing = false;

    $scope.startsfm = function(project) {
      $scope.activeProject.projectStatus = 'Running SfM Reconstruction...';
      $scope.currentStatus = 'Running SfM Reconstruction...';
      if ($scope.currentStatus != project.projectstatus) {
        $scope.isprocessing = true;
      }

      console.log('starting sfm reconstruction')
      var request = {
        method: 'POST',
        url: '/api/startsfms',
        data: {
          username: project.userName,
          projectname: project.projectName,
          projectstatus: project.projectStatus
        }
      };

      $http(request).success(function(projectsetting) {
        var setting = JSON.parse(projectsetting);
        console.log('read settingjson', setting);
        if (setting.projectStatus == 'Finished') {
          $scope.currentStatus = 'Finished';
          $scope.isprocessing = false;
        } else {
          $scope.currentStatus = 'Finished with Error';
        }
        // update project.model
        $http.put('/api/projects/' + Auth.getCurrentUser()._id, {
          params: {
            projectid: project._id,
            projectstatus: setting.projectStatus
          }
        });
      }).error(function(err) {
        console.log('Error occured!', err);
      });

    };



    /*
    var checkAvailability = function(){
        var url = '/api/startsfms/' + '?name=' + $scope.currentUsername + '&project=' + $scope.currentProject.projectName;
        console.log(url);
        $http.get(url).success(function(msg){
          $scope.message = msg;
        if ($scope.message == 'Completed') {
          $scope.downloadReady = true;
        } else {
          $scope.downloadReady = false;
        }
        });
      };
      */



    //List of downloadable items
    $scope.downloadParams = [{
      value: 'sfmreport',
      name: 'HTML Report'

    }, {
      value: 'colorized-cloud',
      name: 'Colorized Point-cloud'
    }, {
      value: 'textured',
      name: 'Textured OBJ'
    }];

    $scope.downloadItem = function(project, item) {
      $scope.downloadUrl = '/api/startsfms/download/' + Auth.getCurrentUser()
        ._id + '?item=' + item + '&path=' + project.projectPath;
      $window.open($scope.downloadUrl, '_blank');

      console.log('downloading ', item)

      var request = {
        method: 'GET',
        url: '/api/startsfms/download',
        params: {
          projectid: project._id,
          username: project.userName,
          projectname: project.projectName,
          projectpath: project.projectPath,
          item: item
        }
      };

      $http(request).success(function(data, status, headers, config) {
        console.log(status);
      });

    }



  });
