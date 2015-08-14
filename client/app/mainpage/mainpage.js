'use strict';

angular.module('cloudsfmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('mainpage', {
        url: '/main',
        templateUrl: 'app/mainpage/mainpage.html',
        controller: 'MainpageCtrl'
      });
  });