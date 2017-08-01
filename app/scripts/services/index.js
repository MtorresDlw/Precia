'use strict';

angular.module('stowApp.services', [])
//constants
	.constant('OPERATION', require('./operationTypes'))
//servicees
	.service('AuthenticationService', require('./AuthenticationService'))
	.service('dataUtil', require('./dataUtil'))
	.service('cordova', require('./cordova'))

	.service('notificationService', require('./notificationService'))
	.service('orderService', require('./orderService'))
	.service('materialService', require('./materialService'))
	.service('operationService', require('./operationService'))
	.service('queue', require('./queueService'))

	//HTTP SERVICES
	.service('urlService', require('./http/urlService'))
	.service('loginService', require('./http/loginService'))
	.service('httpGetService', require('./http/getService'))
	.service('httpSendService', require('./http/sendService'))
	.service('syncService', require('./syncService'))
	;
