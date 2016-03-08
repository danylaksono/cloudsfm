'use strict';

describe('Controller: MainpageCtrl', function () {

  // load the controller's module
  beforeEach(module('cloudsfmApp'));

  var MainpageCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainpageCtrl = $controller('MainpageCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
