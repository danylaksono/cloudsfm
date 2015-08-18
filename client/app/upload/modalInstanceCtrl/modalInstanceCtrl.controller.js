'use strict';

angular.module('cloudsfmApp')
  .controller('ModalInstanceCtrl', function ($scope, $modalInstance) {
    
    
    $scope.message = 'Hello';
    
    
	$scope.save = function () {
		$modalInstance.close('');
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
  
  
  });
