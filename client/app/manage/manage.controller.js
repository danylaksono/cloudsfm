'use strict';

angular.module('sfmApp')
  .controller('ManageCtrl', function ($scope, $http, $window, Auth) {
    
    $scope.currentUsername = Auth.getCurrentUser().name;
    $scope.currentProject ='';
            
    $http.get('/api/uploadImages').success(function(projects) {           
      for (var i=0; i < projects.length; i++) {
		  var username = projects[i].author.name;
		  if ($scope.currentUsername == username) {
			  $scope.currentProject = projects[i];
		  }
		  else {
			  console.log('project not found')
		  }
	  } 
	});
	
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
	}
			
	
	$scope.startsfm = function() {
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
			$scope.message = msg;
			if (msg == 'Completed') {
				$scope.downloadReady = true;
			}
			}).error(function(err){
				console.log('Error occured!', err)
				});
	};
	
      
});
