'use strict';

angular.module('sfmApp')
  .controller('ManageCtrl', function ($scope, $http) {
    $scope.message = 'Hello';	
    
    
    $http.get('/api/uploadImages').success(function(projects) {
      $scope.projects = projects;
    });
      
      
      
  });
