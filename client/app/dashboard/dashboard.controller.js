'use strict';

angular.module('cloudsfmApp')
  .controller('DashboardCtrl', function($scope, $http, Auth) {
    $scope.message = 'Hello';



    $http.get('/api/uploadImages').success(function(index) {
      $scope.index = index;
    });

    $scope.getCurrentUser = Auth.getCurrentUser;



  });
