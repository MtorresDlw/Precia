'use strict';

angular.module('stowApp.db', [])
	.service('db', require('./db'))
	.service('dbGet', require('./dbGet'))
	.service('dbRemove', require('./dbRemove'))
	.service('dbPut', require('./dbPut'))
	.service('dbSettings', function(cordova) {
		this.getAdapter = function() {
			if (cordova.getPlatform().indexOf('windows') !== -1) {
				return 'idb';
			}
			return 'idb';
		};

		this.getName = function() {
			return 'stow-db';
		};
	})
	.service('log', require('./dbLog'))

	//directives
	.directive('faSetting', require('./directives/faSetting'))
	.directive('faCustomer', require('./directives/faCustomer'))
	.directive('faMaterial', require('./directives/faMaterial'))
	.directive('faPriority', require('./directives/faPriority'))
	.directive('faStoragelocation', require('./directives/faStoragelocation'))
;
