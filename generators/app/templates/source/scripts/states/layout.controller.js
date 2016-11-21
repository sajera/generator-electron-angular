
'use strict';

angular
	/**
	 * root controller
	 */
	.module('<%= app %>.layout')

	.controller('layoutController', function ( $scope, toastr ) {

		var root = $scope.root = {
			sayNo: function ( state ) {
				toastr.error('Sorry but this state not specified by scaffolding.', state);
			}
		};

	});