'use strict';

angular.module('sfmApp')
  .controller('UploadCtrl', function ($scope, $window, Upload, $http) {

    $scope.showThumb = true;
    $scope.uploaded = false;

    // for GET request
    $http.get('/api/uploadImages').success(function(index) {
	$scope.index = index;
      });
     

/*
 Latest version of anguoar file upload support img thumbnail, so we dont need this
 * 
    $scope.$watch('files', function(files) {
 	$scope.formUpload = false;
	if (files != null) {
		for (var i = 0; i < files.length; i++) {
			$scope.errorMsg = null;
			(function(file) {
				imgThumbnail(file);
			})(files[i]);
		}
	}
    });

*/   
    $scope.upload = function(files) {
        $scope.uploaded = true;
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    url: 'api/uploadImages',
                    method: 'POST',
                    fields: {projectName: $scope.projectName,
							 projectDescription: $scope.projectDescription
							},
                    file: file,
                    fileFormDataName: 'cloudsfm'
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    	console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
		    $scope.progress = progressPercentage;
  		    // bind progress bar style
		    $scope.progressStyle = {width: $scope.progress + '%'};
			
		}).success(function (data, status, headers, config) {
                    console.log('file ' + config.file.name + ' uploaded. Response: ' + data);
                    $window.location.href='/manage';
                });
            }
        }
    };

/*
  $scope.uploadPic = function(files) {
	$scope.formUpload = true;
 		if (files != null) {
			upload(files);
			imgThumbnail(files[0]);
			
		}
	};


   var getReader = function(deferred, scope){
	var reader = new FileReader();
	return reader;
   } */
   
   /*

   var imgThumbnail = function(file, scope) {
	//var deferred = $q.defer();
	if (file != null) {
		var reader = new FileReader(); //getReader(deferred,scope);
		reader.onload = function(e) {
			file.dataUrl = e.target.result;
		};
		
		reader.readAsDataURL(file);

		// call upload function
		//$scope.upload($scope.files);
	}

	//return deferred.promise;
  };
*/

  });
