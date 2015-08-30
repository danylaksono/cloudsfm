'use strict';

describe('Controller: DeleteProjectCtrl', function () {

  // load the controller's module
  beforeEach(module('cloudsfmApp'));

  var DeleteProjectCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DeleteProjectCtrl = $controller('DeleteProjectCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
