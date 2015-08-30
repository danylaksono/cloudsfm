'use strict';

angular.module('cloudsfmApp')
  .controller('DeleteProjectCtrl', function($scope, $modalInstance) {

    $scope.closeConfirm = function() {
      $modalInstance.close('affirmative');
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };



  });
