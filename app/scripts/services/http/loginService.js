'use strict';

module.exports = function($http, $timeout, $cookies, $q, $rootScope, urlService) {
	var self = this;
	self.tempUsername = null;
	self.tempPassword = null;

	self.login = function(username, password) {
		var d = $q.defer();

		document.execCommand("ClearAuthenticationCache");

		var authdata = window.btoa(username + ':' + password);
		$http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line

		var url = urlService.get('/?$metadata&_=' + new Date());
		$http({
			url: url,
			method: 'GET',
			headers: {
				"X-CSRF-Token": "Fetch",
				"Accept": "application/json",
				"Content-Type": "application/json",
				"Authorization": "Basic " + window.btoa(username + ':' + password)
			},
			withCredentials: true
		}).then(function(response) {
			$cookies.token = response.headers('x-csrf-token');
			$http.defaults.headers.post['X-CSRF-Token'] = response.headers('x-csrf-token');
			response.data.success = true;
			d.resolve(response.data);
		}).catch(function(response) {
			console.log(response);
			if(status === 403) {
				d.reject({
				    success : false,
				    authenticationError : true,
				    message : 'Authentication failed, please check credentials.',
				    messageCode: response.status

				});
			} else {
				var errorMessage = 'Not able to connect to the server. Offline mode is only available for the most recent user.';
				if(response.hasOwnProperty('data.error')){
					errorMessage = response.data.error.message.value;
				}
				var res = {
					success: username === self.tempUsername && password === self.tempPassword,
					authenticationError: false,
					message: errorMessage,
					messageCode: response.status
				};
				if (!res.success) {
					res.message = response.data.error.message.value + '\n - ' + 'Offline mode is only available for the most recent user.';
				}
				d.reject(res);
			}
		});

		return d.promise;
	};

	self.SetTemporaryCredentials = function(username, password) {
		self.tempUsername = username;
		self.tempPassword = password;
	};

	self.ClearCredentials = function () {
	    $rootScope.globals = {};
	    $cookies.globals = {};
	    $http.defaults.headers.common.Authorization = 'Basic ';
	};


};
