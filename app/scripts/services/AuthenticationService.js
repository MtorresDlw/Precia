'use strict';

module.exports = function($rootScope, $http, $cookies, loginService){
	var self = this;

	var tempUsername;
	var tempPassword;

	//Method for authentication to the gateway server
	self.Login = function (username, password, offline) {
		return loginService.login(username, password);
	};

	self.SetCredentials = function(username, password) {
	    var authdata = window.btoa(username + ':' + password);

	    $rootScope.globals = {
	        currentUser: {
	            username: username,
	            authdata: authdata
	        }
	    };

	    $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
	    $cookies.globals =  $rootScope.globals;
	    $cookies.authdata =  authdata;
	};

	self.SetTemporaryCredentials = function(username, password){
		loginService.SetTemporaryCredentials(username, password);
	};

	self.ClearCredentials = function () {
	    loginService.ClearCredentials();
	};
};
