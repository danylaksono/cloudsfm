'use strict';

angular.module('sfmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('manage', {
        url: '/manage',
        templateUrl: 'app/manage/manage.html',
        controller: 'ManageCtrl'
      });
  });