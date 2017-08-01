'use strict';

module.exports = function($q, $http, $translate, $cookies, $state,
	httpGetService, urlService, toaster, dbGet, dbPut, dbRemove) {
	var self = this;

	var fullSync = false;

	self.toggleFullSync = function(_fullSync) {
		fullSync = _fullSync;
	};

	self.test = function() {
		var deferred = $q.defer();
		var url = urlService.get('/?$format=json');

		$http.get(url, {
			headers: {
				"X-Requested-With": "XMLHttpRequest",
				"X-CSRF-Token": "Fetch",
				"timeout": "3000",
				"Authorization": $http.defaults.headers.common.Authorization
			}
		}).success(function(data, status, headers, config, statusText) {
			$cookies.token = headers('x-csrf-token');
			deferred.resolve(true);
		}).error(function(data, status, headers, config, statusText) {
			if (status === 403) {
				dbGet.credentials().then(function(doc) {
					return dbPut.credentials(doc.username, '');
				}).then(function() {
					$state.go('authentication');
					toaster.pop('error', $translate.instant('_Connection'), $translate.instant('_Authentication_Failed'));
				});
			} else {
				console.error($translate.instant('_Connection'), $translate.instant('_Server_Unreachable'));
			}
			deferred.reject(false);
		});

		return deferred.promise;
	};

	self.confirmOrderTask = function(operation) {
		var d = $q.defer();
		self.test().then(function(res) {
			var url = urlService.get('/Confirmations?');

			$http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.authdata;
			$http.defaults.headers.post['X-CSRF-Token'] = $cookies.token;

			return $http.post(url, operation.payload);
		}).then(function(res){
			dbRemove.remove(operation._id);
			d.resolve(res);
		}).catch(function(err){
			d.reject(operation._id);
		});

		return d.promise;
	};

	self.createGoodsMovement = function(operation) {
		var d = $q.defer();
		self.test().then(function(res) {
			var url = urlService.get('/MaterialDocs?');

			$http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.authdata;
			$http.defaults.headers.post['X-CSRF-Token'] = $cookies.token;

			return $http.post(url, operation.payload);
		}).then(function(response) {
			dbRemove.remove(operation._id);
			d.resolve(response);
		}).catch(function(err) {
			d.reject(operation._id);
		});

		return d.promise;
	};

	self.createNotification = function(data) {
		var d = $q.defer();

		self.test().then(function(res) {
			var url = urlService.get('/Notifications?');

			$http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.authdata;
			$http.defaults.headers.post['X-CSRF-Token'] = $cookies.token;

			return $http.post(url, data.payload);
		}).then(function(response) {
			dbRemove.remove(data._id);
			dbRemove.remove('notification_offline_' + data._id.replace('operation_', '')).then(function(){
				response.data.d._id = 'notification_' + response.data.d.NotificationNr;
				delete response.data.d.__metadata;
				dbPut.put(response.data.d);
			}).catch(function(err){
				console.log(err);
			});
			d.resolve(response);
		}).catch(function(err) {
			d.reject(data._id);
		});

		return d.promise;
	};

	self.createSignature = function(data) {
		var d = $q.defer();

		self.test().then(function(res) {
			var url = urlService.get('/EmailSet');

			$http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.authdata;
			$http.defaults.headers.post['X-CSRF-Token'] = $cookies.token;

			return $http.post(url, data.payload);
		}).then(function(response) {
			d.resolve(response);
		}).catch(function(err) {
			if(err.status === 400){
				d.resolve();
			}else{
				d.reject(data._id);
			}
		});

		return d.promise;
	};

	self.createAttachment = function(data) {
		var d = $q.defer();

		self.test().then(function(res) {
			var url = urlService.get('/Documents');

			$http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.authdata;
			$http.defaults.headers.post['X-CSRF-Token'] = $cookies.token;

			return $http.post(url, data.payload, data.headers);
		}).then(function(response) {
			d.resolve(response);
		}).catch(function(err) {
			d.reject(data._id);
		});

		return d.promise;
	};

	//Method to store the operation result to the Database
	function storeOperationResult(operation) {
		var deferred = $q.defer();

		if (operation.type == "createNotification") {
			if (operation.success) {
				operation.mainObject._id = "notification_" + operation.data.d.NotificationNr;
				operation.mainObject.OrderNr = operation.data.d.OrderNr;
				operation.mainObject.NotificationNr = operation.data.d.NotificationNr;
				operation.mainObject.Status = operation.data.d.Status;
				operation.mainObject.Documents = [];
			} else {
				operation.mainObject._id = "notification_offline_" + operation._id;
				operation.mainObject.OrderNr = "";
				operation.mainObject.NotificationNr = "offline_" + operation._id;
				operation.mainObject.Status = "";
				operation.mainObject.Documents = [];
				if (operation.parameters.attachments.length > 0) {
					operation.parameters.attachments.forEach(function(attachment, index) {
						var document = {};
						document.Data = "data:image/jpeg;base64," + attachment.img;
						document.DocumentId = "";
						document.DocumentType = "";
						document.FileName = "";
						document.MimeType = operation.parameters.attachmentParameters.contentType;
						document.ObjectId = operation.parameters.attachmentParameters.objectID;
						document.ObjectType = operation.parameters.attachmentParameters.objectType;
						document.StorageDate = "";
						document.Uri = "";
						operation.mainObject.Documents.push(document);
					});
				}
			}

			dbPut.put(operation.mainObject).then(function(response) {
				if (operation.success && operation.parameters.attachments.length > 0) {
					operation.parameters.attachmentParameters.objectID = operation.mainObject.NotificationNr;
					operation.parameters.attachments.forEach(function(attachment, index) {
						self.createOperation("createAttachment", attachment, operation.parameters.attachmentParameters).then(function(response) {
							if (index === (operation.parameters.attachments.length - 1)) {
								deferred.resolve(operation);
							}
						});
					});
				} else {
					deferred.resolve(operation);
				}
			}).catch(function(error) {
				console.error("ERROR: Error on attempt to save operation result to database");
				deferred.resolve(operation);
			});
		}
	}

};
