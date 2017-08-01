'use strict';

module.exports = function($q, $translate, dataUtil, dbGet, dbPut, dbRemove, httpGetService, httpSendService, toaster) {
	var self = this;
	var operations = [];

	self.start = function() {
		return dbGet.allDocs({
			include_docs: true,
			startkey: 'operation_',
			endkey: 'operation_\uffff'
		}).then(function(result) {
			httpSendService.toggleFullSync(true);

			operations = [];
			result.rows.forEach(function(document) {
				operations.push(document.doc);
			});

		}).then(function(result) {
			return cleanAndSyncDatabase();
		}).then(function(result) {
			return result;
		});
	};

	self.cleanFullDatabase = function() {
		console.info('Cleaning full database');
		var deferred = $q.defer();
		// dbGet.allDocs().then(function(result) {
		// 	return $q.all(result.rows.map(function(row) {
		// 		return dbRemove.remove(row.id, row.value.rev);
		// 	}));
		// }).catch(function(err) {
		// 	console.error(err);
		// 	deferred.resolve(err);
		// });
		//
		dbRemove.destroy().then(function(res){
			deferred.resolve(res);
		});
		return deferred.promise;
	};

	function cleanAndSyncDatabase() {
		var deferred = $q.defer();
		cleanDatabase().then(function(result) {
			syncDatabase().then(function(result) {
				toaster.pop('success', $translate.instant('_Database'), $translate.instant('_Synchronize_Finished'));
				httpSendService.toggleFullSync(false);
				deferred.resolve(result);
			});
		});
		return deferred.promise;
	}

	function cleanDatabase() {
		var deferred = $q.defer();
		dbGet.allDocs({
			include_docs: true
		}).then(function(result) {
			result.rows.forEach(function(document) {
				if ((document.id.substring(0, 10) != 'operation_') && (document.id.substring(0, 11) != "credentials")) {
					dbRemove.remove(document.doc._id);
				}
			});
			deferred.resolve();
		}).catch(function(err) {
			deferred.resolve(err);
		});
		return deferred.promise;
	}

	function syncDatabase() {
		var deferred = $q.defer();
		toaster.pop('info', $translate.instant('_Database'), $translate.instant('_Synchronizing...'), 5000);

		httpGetService.makeGatewayRequests().then(function(res) {
			var lastSyncDate = {};
			lastSyncDate._id = "last_sync";
			lastSyncDate.date = new Date().valueOf();

			dbPut.put(lastSyncDate).then(function(response) {
				deferred.resolve(response);
			}).catch(function(err) {
				console.error(err);
				deferred.resolve(err);
			});
		});

		return deferred.promise;
	}
};
