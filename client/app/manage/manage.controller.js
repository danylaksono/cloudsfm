'use strict';

angular.module('cloudsfmApp')
  .controller('ManageCtrl', function ($scope, $http, $window, Auth) {
    
    $scope.currentUsername = Auth.getCurrentUser().name;
    $scope.currentProject ='';
    $scope.downloadReady = false;
    $scope.message = '';
            
    $http.get('/api/uploadImages').success(function(projects) {           
      for (var i=0; i < projects.length; i++) {
		  var username = projects[i].author.name;
		  if ($scope.currentUsername === username) {
			  $scope.currentProject = projects[i];
		  }
		  else {
			  console.log('project not found');
		  }
	  }
	  checkAvailability();	  
	   
	});
	
	var checkAvailability = function(){
		var url = '/api/startsfms/' + '?name=' + $scope.currentUsername + '&project=' + $scope.currentProject.projectName;
		console.log(url);
		$http.get(url).success(function(msg){
			$scope.message = msg;
		if ($scope.message === 'Completed') {
			$scope.downloadReady = true;
		} else {
			$scope.downloadReady = false;
		}
		});	
	};
	
	//for list
	$scope.param = 'none';
	$scope.paramsopt = [
      {value:'colorized-cloud', name:'Colorized Point-cloud'},
      {value:'sfmreport', name:'HTML Report'},
      {value:'textured', name:'Textured OBJ'}
      ];
      
      
    $scope.changedVal = function(theparam) {
		$scope.downloadUrl = '/api/startsfms/' + Auth.getCurrentUser()._id + '?download=' + theparam;
		
		$http({method:'GET', url:$scope.downloadUrl}).success(function(data,status,headers,config){
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
		  		
		$http(request).success(function(msg){
			if (msg === 'Completed') {
				$scope.message = msg;
				$scope.downloadReady = true;
			} 				
			}).error(function(err){
				console.log('Error occured!', err);
				});
				
	};
	
      
});
