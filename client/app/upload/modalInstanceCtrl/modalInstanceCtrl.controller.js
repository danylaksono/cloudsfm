'use strict';

angular.module('cloudsfmApp')
  .controller('ModalInstanceCtrl', function($scope, $http, $modalInstance,
    formData) {


    $scope.message = 'Hello';
    $scope.form = {};

    $scope.save = function() {
      console.log($scope.form);

      //$modalInstance.close('');
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };


  });
