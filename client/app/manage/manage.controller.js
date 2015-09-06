'use strict';

angular.module('cloudsfmApp')
  .controller('ManageCtrl', function($scope, $http, $window, Auth, socket,
    $modal) {

    $scope.clicked = false;
    $scope.downloadAvailable = false;


    $http.get('/api/projects/' + Auth.getCurrentUser()._id).success(function(
      projects) {

      $scope.projects = projects;
      console.log($scope.projects);

      // socketJS update the data
      socket.syncUpdates('project', $scope.projects, function(event,
        project, projects) {
        //the socket listeners

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


    $scope.changedVal = function(theparam) {
      $scope.downloadUrl = '/api/startsfms/' + Auth.getCurrentUser()._id +
        '?download=' + theparam;

      $http({
        method: 'GET',
        url: $scope.downloadUrl
      }).success(function(data, status, headers, config) {
        console.log(status);
      });
    };

    $scope.getfile = function() {
      $window.open($scope.downloadUrl, '_blank');
    };


    $scope.startsfm = function() {
      $scope.message = 'Processing Request...';
      console.log('requesting pipelines');
      var request = {
        method: 'POST',
        url: '/api/startsfms',
        data: {
          username: $scope.currentUsername,
          projectname: $scope.currentProject.projectName
        }
      };

      $http(request).success(function(msg) {
        if (msg === 'Completed') {
          $scope.message = msg;
          $scope.downloadReady = true;
        }
      }).error(function(err) {
        console.log('Error occured!', err);
      });

    };


  });
