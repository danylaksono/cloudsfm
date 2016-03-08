'use strict';

angular.module('cloudsfmApp')
  .service('formData', function($rootScope) {

    //initial variables for advanced SfM parameters
    var tosend = {};


    return {
      getProperty: function() {
        return tosend;
      },
      setProperty: function(value) {
        angular.extend(tosend, value);
      }
    };
  });
