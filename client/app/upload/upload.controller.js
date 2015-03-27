'use strict';

angular.module('sfmApp')
  .controller('UploadCtrl', function ($scope, $upload, $http) {


    $scope.message = 'Hello';


    $http.get('/api/uploadImages').success(function(index) {
	$scope.index = index;
      });
     
 
	$scope.showThumb = true;
	
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



/*
     $scope.$watch('files', function () {
        $scope.upload($scope.files);
     });
*/
     $scope.upload = function(files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                $upload.upload({
                    url: 'api/uploadImages',
                    fields: {'username': $scope.username},
                    file: files
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);

		    $scope.progress = progressPercentage;
  		    // bind progress bar style
		    $scope.progressStyle = {width: $scope.progress + '%'};
			
		}).success(function (data, status, headers, config) {
                    console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
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
*/

   function imgThumbnail(file) {
	if (file != null) {
		var reader = new FileReader();
		reader.onload = function(e) {
			file.dataUrl = e.target.result;
		};
		
		reader.readAsDataURL(file);

		// call upload function
		$scope.upload($scope.files);
	}
  };


  });
