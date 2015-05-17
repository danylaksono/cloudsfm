'use strict';

angular.module('sfmApp')
  .controller('ManageCtrl', function ($scope, $http, Auth) {
    
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
		
		
	var download = function(pesan){
	$scope.downloadUrl = '/api/startsfms/download/' + Auth.getCurrentUser()._id;
	$http({method:'GET', url:$scope.downloadUrl}).success(function(data,status,headers,config){
			$scope.data=data;
            if (status == 200) {
				$scope.downloadButton = true;
			}
        });
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
			$scope.message = msg.msg;
			$scope.report = msg.report;
			}).error(function(err){
				console.log('Error occured!', err)
				});
		
		download();
	};
	
	

	           
});
