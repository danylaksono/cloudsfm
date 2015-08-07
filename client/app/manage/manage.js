'use strict';

angular.module('cloudsfmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('manage', {
        url: '/manage',
        templateUrl: 'app/manage/manage.html',
        controller: 'ManageCtrl'
      });
  });
