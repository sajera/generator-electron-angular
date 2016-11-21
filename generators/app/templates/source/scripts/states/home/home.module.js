
'use strict';

angular

	.module('layout.home', [

	])

	.config( function ( $stateProvider ) {

		$stateProvider.state('layout.home', {
			url: '/home',
			templateUrl: '/scripts/states/home/home.html',
			controller: 'homeController',
		});
	});