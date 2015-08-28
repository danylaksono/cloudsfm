'use strict';

angular.module('cloudsfmApp')
  .controller('ModalInstanceCtrl', function($scope, $http, $modalInstance,
    formData) {

    // take the value from formData service

    $modalInstance.opened.then(function() {
      $scope.form = formData.getProperty();
    });



    $scope.save = function() {
      formData.setProperty($scope.form);
      $modalInstance.close('');
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };


  });
