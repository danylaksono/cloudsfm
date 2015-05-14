'use strict';

angular.module('sfmApp')
  .controller('ManageCtrl', function ($scope, $http, Auth) {
    
    $scope.currentUsername = Auth.getCurrentUser().name;
    $scope.currentProject ='';
    //$scope.message ='';
        
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
	
	
	$scope.startsfm = function() {
		var request = {
			method: 'POST',
			url: '/api/startsfms',
			data: {
				username: $scope.currentUsername,
				projectname: $scope.currentProject.projectName
			}
		};	
		
		//$http(request).success(function(msg) {$scope.message = msg;}      		
		$http(request).success(function(msg){$scope.message = msg;}).error(function(){});
	};
	           
});
