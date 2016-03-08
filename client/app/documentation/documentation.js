'use strict';

angular.module('cloudsfmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('documentation', {
        url: '/documentation',
        templateUrl: 'app/documentation/documentation.html',
        controller: 'DocumentationCtrl'
      });
  });