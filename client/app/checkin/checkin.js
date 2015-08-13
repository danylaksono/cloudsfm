'use strict';

angular.module('cloudsfmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('checkin', {
        url: '/checkin',
        templateUrl: 'app/checkin/checkin.html',
        controller: 'CheckinCtrl'
      });
  });