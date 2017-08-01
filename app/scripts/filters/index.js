'use strict';

angular.module('stowApp.filters', [])
	.filter('dateFilter', require('./dateFilter'))
	.filter('timeFilter', require('./timeFilter'))
	.filter('longTextFilter', require('./longTextFilter'));
