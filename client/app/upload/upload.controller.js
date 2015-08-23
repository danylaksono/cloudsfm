'use strict';

angular.module('cloudsfmApp')
  .controller('UploadCtrl', function($scope, $modal, $window, Upload, $http) {

    $scope.showThumb = true;
    $scope.uploaded = false;

    // for GET request
    $http.get('/api/uploadImages').success(function(index) {
      $scope.index = index;
    });


    // for advanced setting's modal
    $scope.openAdvanced = function() {
      $scope.modalInstance = $modal.open({
        templateUrl: 'myModalContent.html',
        controller: 'ModalInstanceCtrl',
        backdrop: 'static',
        keyboard: false
      });
    };



    // for upload router
    $scope.upload = function(files) {
      $scope.numUploaded = 0;
      $scope.uploaded = true;
      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          Upload.upload({
            url: 'api/uploadImages',
            method: 'POST',
            fields: {
              projectName: $scope.projectName,
              projectDescription: $scope.projectDescription
            },
            file: file,
            fileFormDataName: 'cloudsfm'
          }).progress(function(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config
              .file.name);
            $scope.progress = progressPercentage;
            // bind progress bar style
            $scope.progressStyle = {
              width: $scope.progress + '%'
            };

          }).success(function(data, status, headers, config) {
            console.log(headers);
            console.log('file ' + config.file.name +
              ' uploaded. Response: ' + data);
            $scope.numUploaded += 1;
            if ($scope.numUploaded === files.length) {
              $window.location.href = '/manage';
            }
          });
        }
      }
    };

  });
