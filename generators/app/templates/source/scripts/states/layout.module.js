
'use strict';

angular
	/**
	 * default bootstraping of angular application
	 * structure dependencies application
	 */
	.module('<%= app %>.layout', [
		'layout.home'
	])

	.config( function ( $stateProvider ) {

		$stateProvider.state('layout', {
			url: '/layout',
			abstract: true,
			templateUrl: 'scripts/states/layout.html',
			controller: 'layoutController',
		});

	});