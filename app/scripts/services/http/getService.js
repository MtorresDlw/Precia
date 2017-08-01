'use strict';

module.exports = function($q, $http, $cookies, $rootScope, $translate,
	$state, dataUtil, urlService, toaster, cordova, db, dbPut) {
	var self = this;

	self.test = function() {
		var deferred = $q.defer();
		var url = urlService.get('/?$format=json');

		$http.get(url, {
			headers: {
				"X-Requested-With": "XMLHttpRequest",
				"X-CSRF-Token": "Fetch",
				"timeout": "3000"
			}
		}).success(function(data, status, headers, config, statusText) {
			$cookies.token = headers('x-csrf-token');
			deferred.resolve(true);
		}).error(function(data, status, headers, config, statusText) {
			if(status === 403){
				dbGet.credentials().then(function(doc){
					return dbPut.credentials(doc.username, '');
				}).then(function(){
					$state.go('authentication');
					toaster.pop('error', $translate.instant('_Connection'), $translate.instant('_Authentication_Failed'));
				});
			}else{
				toaster.pop('error', $translate.instant('_Connection'), $translate.instant('_Server_Unreachable'));
			}
			deferred.resolve(false);
		});

		return deferred.promise;
	};

	self.makeGatewayRequests = function() {
		return $q.when(true)
			.then(function() {
				return getNotifications();
			})
			.then(function(res) {
				console.info('Saving notifications: ' + res.length);
				return dbPut.saveNotifications(res);
			})
			.then(function() {
				toaster.pop('info', 'Sync', 'Notifications done', 3000);
				return getCustomers();
			})
			.then(function(res) {
				console.info('Saving customers: ' + res.length);
				return dbPut.saveCustomers(res);
			})
			.then(function() {
				toaster.pop('info', 'Sync', 'Customers done', 3000);
				return getPriorities();
			})
			.then(function(res) {
				console.info('Saving priorities: ' + res.length);
				return dbPut.savePriorities(res);
			})
			.then(function() {
				toaster.pop('info', 'Sync', 'Priorities done', 3000);
				return getSettings();
			})
			.then(function(res) {
				console.info('Saving settings: ' + res.length);
				return dbPut.saveSettings(res);
			})
			.then(function() {
				toaster.pop('info', 'Sync', 'Settings done', 3000);
				return getMaterials();
			})
			.then(function(res) {
				console.info('Saving materials: ' + res.length);
				return dbPut.saveMaterials(res);
			})
			.then(function() {
				toaster.pop('info', 'Sync', 'Materials done', 3000);
				return getStorageLocations();
			})
			.then(function(res){
				console.info('Saving storage locations: ' + res.length);
				return dbPut.saveStorageLocations(res);
			})
			.then(function() {
				toaster.pop('info', 'Sync', 'Storage locations done', 3000);
				return getOrders();
			})
			.then(function(res) {
				console.info('Saving orders: ' + res.length);
				toaster.pop('info', 'Sync', 'Orders done', 3000);
				return dbPut.saveOrders(res);
			})
			.catch(function(err) {
				console.error(err);
			});
	};

	function getCustomers() {
		var url = urlService.get('/Customers?$format=json');
		return $http.get(url)
			.then(function(res) {
				return dataUtil.clearJson(res.data.d.results);
			})
			.catch(function(res) {
				return res.data;
			});
	}

	function getMaterials() {
		var url = urlService.get('/Materials?$format=json');
		return $http.get(url)
			.then(function(res) {
				return dataUtil.clearJson(res.data.d.results);
			})
			.catch(function(res) {
				return res.data;
			});
	}

	function getNotifications() {
		var url = urlService.get('/Notifications?$expand=Documents&$format=json');
		return $http.get(url)
			.then(function(res) {
				var attachments = [];
				res.data.d.results.forEach(function(notif) {
					notif.Documents.results.forEach(function(document) {
						attachments.push(getAttachment(document));
					});
				});
				return $q.all(attachments).then(function() {
					return dataUtil.cleanJsonNotifications(res.data.d.results);
				});
			})
			.catch(function(res) {
				return res.data;
			});
	}

	function getOrders() {
		var url = urlService.get('/Orders?$expand=Documents,Tasks/Confirmations,Components,Tasks/Components&$format=json');
		return $http.get(url)
			.then(function(res) {
				var attachments = [];
				res.data.d.results.forEach(function(order) {
					order.Documents.results.forEach(function(document) {
						attachments.push(getAttachment(document));
					});
				});
				return $q.all(attachments).then(function() {
					return dataUtil.cleanJsonOrders(res.data.d.results);
				});
			})
			.catch(function(res) {
				return res.data;
			});
	}

	function getPriorities() {
		var url = urlService.get('/Priorities?$format=json');

		return $http.get(url)
			.then(function(res) {
				return dataUtil.clearJson(res.data.d.results);
			})
			.catch(function(res) {
				return res.data;
			});
	}

	function getSettings() {
		var url = urlService.get('/Settings?$format=json');
		return $http.get(url)
			.then(function(res) {
				return dataUtil.clearJson(res.data.d.results);
			})
			.catch(function(res) {
				return res.data;
			});
	}

	function getStorageLocations() {
		var url = urlService.get('/StorageLocs?$format=json');
		return $http.get(url)
			.then(function(res) {
				return dataUtil.clearJson(res.data.d.results);
			})
			.catch(function(res) {
				return res.data;
			});
	}

	//Methods to get data
	function getAttachment(doc) {
		var deferred = $q.defer();
		var url = urlService.get("/Documents(ObjectType='" + doc.ObjectType + "',ObjectId='" + doc.ObjectId + "',DocumentId='" + doc.DocumentId + "')/$value");

		$http.get(url, {
			responseType: "blob"
		}).success(function(data, status, headers, config) {

			var platform = cordova.getPlatform();

			if (platform === '' || platform === 'Android' || platform === 'windows') {
				var buffer;
				var fileReader = new FileReader();
				fileReader.onload = function() {
					buffer = fileReader.result;

					var obj = {};
					obj._id = doc.DocumentId;
					obj._attachments = {};
					obj._attachments[doc.DocumentId] = {
						content_type: doc.MimeType,
						data: buffer.split(',')[1]
					};
					db.get().put(obj).then(function() {
						deferred.resolve();
					});
				};
				fileReader.readAsDataURL(data);

			} else {
				console.warn('Platform not supported to save attachment.');
				console.log(JSON.stringify(data));
				deferred.resolve();
			}
		}).error(function(err) {
			deferred.resolve();
		});
		return deferred.promise;
	}
};
