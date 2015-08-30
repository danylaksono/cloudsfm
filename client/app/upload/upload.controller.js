'use strict';

angular.module('cloudsfmApp')
  .controller('UploadCtrl', function($scope, $modal, $window, Upload, $http,
    formData, Auth, uuid4) {

    $scope.showThumb = true;
    $scope.uploaded = false;

    var userName = Auth.getCurrentUser().name;
    var userID = Auth.getCurrentUser()._id

    // Default settings
    $scope.form = {
      userID: userID,
      userName: userName,
      projectID: uuid4.generate(),
      projectName: '',
      projectDescription: '',
      projectPath: '',
      projectStatus: '',
      intrinsic: "focal",
      focal: "2000",
      kmatrix: "",
      featDetector: "SIFT",
      detPreset: "NORMAL",
      isUpright: "1",
      annRatio: "0.8",
      geomModel: "e",
      seqModel: "X",
      nearMethod: "AUTO"

    };

    // GET request
    $http.get('/api/projects/' + userID).success(function(index) {
      $scope.index = index;
    });

    // using advanced settings
    $scope.useAdvanced = function() {
      formData.setProperty($scope.form);
      $scope.modalInstance = $modal.open({
        templateUrl: 'myModalContent.html',
        controller: 'ModalInstanceCtrl',
        backdrop: 'static',
        keyboard: false
      });
    };

    $scope.saveProjectParameters = function() {
      $scope.advancedParams = formData.getProperty();
      angular.extend($scope.form, $scope.advancedParams);
      console.log($scope.form);
    }


    // for upload router
    $scope.upload = function(files) {
      $scope.numUploaded = 0;
      $scope.uploaded = true;
      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          Upload.upload({
            url: '/api/projects/',
            method: 'POST',
            file: file,
            fields: $scope.form
          }).progress(function(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config
              .file.name);
            $scope.progress = progressPercentage;
            // bind progress bar style
            $scope.progressStyle = {
              width: $scope.progress + '%'
            }
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
