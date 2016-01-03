'use strict';

angular.module('cloudsfmApp')
  .controller('ManageCtrl', function($scope, $http, $window, Auth, socket,
    $modal) {

    $scope.clicked = false;
    $scope.downloadAvailable = false;
    $scope.currentStatus = '';


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

    $scope.summonInfo = function(key) {
      $scope.activeProject = key;
      $scope.clicked = true;
      console.log($scope.activeProject.userName);

      $scope.currentStatus = $scope.activeProject.projectStatus;

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
        console.log(projectsetting);
        var setting = JSON.parse(projectsetting);
        if (setting.projectStatus == 'Finished') {
          $scope.currentStatus = 'Finished';
        } else {
          $scope.currentStatus = 'Finished with Error';
        }


        // update project.model
        $http.put('/api/projects/' + Auth.getCurrentUser()._id, {
          params: {
            projectid: project._id,
            projectstatus: $scope.currentStatus
          }
        });
      }).error(function(err) {
        console.log('Error occured!', err);
      });

    };



    //for list
    $scope.param = 'none';
    $scope.paramsopt = [{
      value: 'colorized-cloud',
      name: 'Colorized Point-cloud'
    }, {
      value: 'sfmreport',
      name: 'HTML Report'
    }, {
      value: 'textured',
      name: 'Textured OBJ'
    }];



    $scope.getfile = function() {
      $window.open($scope.downloadUrl, '_blank');
    };



  });
