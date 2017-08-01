'use strict';

module.exports = function($q, db) {
	var self = this;

	self.put = function(document) {
		return db.get().put(document);
	};

	self.bulkDocs = function(docs) {
		return db.get().bulkDocs(docs);
	};

	self.credentials = function(username, password) {
		return db.get().get('credentials').then(function(doc){
			doc.username = username;
			doc.password = password;
			return db.get().put(doc);
		}).catch(function(err){
			return self.put({
				_id: 'credentials',
				username: username,
				password: password
			});
		});
	};

	self.saveNotifications = function(notifications) {
		var d = $q.defer(),
			arr = [];

		for (var i = 0; i < notifications.length; i++) {
			var notif = notifications[i];
			notif._id = "notification_" + notif.NotificationNr;
			notif.LongText = notif.LongText.replace(/\\n/g, "\\n");

			for (var j = 0; j < notifications[i].Documents.length; j++) {
				notifications[i].Documents[j].ObjectId.replace(/^0+/, '');
				notifications[i].Documents[j]._id = "document_" + notifications[i].Documents[j].DocumentId;
			}
			arr.push(notif);
		}
		db.get().bulkDocs(arr).then(function(res) {
			d.resolve(res);
		}).catch(function(err) {
			d.reject(err);
		});
		return d.promise;
	};

	self.saveCustomers = function(customers) {
		var d = $q.defer(),
			arr = [];

		db.get().bulkDocs(customers.map(function(customer) {
			customer._id = 'customer_' + customer.CustomerNr;
			return customer;
		})).then(function(res) {
			d.resolve(res);
		}).catch(function(err) {
			d.reject(err);
		});
		return d.promise;
	};

	self.savePriorities = function(priorities) {
		var d = $q.defer();

		db.get().bulkDocs(priorities.map(function(prio) {
			prio._id = 'priority_' + prio.Language + prio.PriorityNr;
			return prio;
		})).then(function(res) {
			d.resolve(res);
		}).catch(function(err) {
			d.reject(err);
		});
		return d.promise;
	};

	self.saveSettings = function(settings) {
		var d = $q.defer();

		db.get().bulkDocs(settings.map(function(setting) {
			setting._id = 'settings_' + setting.Parameter;
			return setting;
		})).then(function(res) {
			d.resolve(res);
		}).catch(function(err) {
			d.reject(err);
		});
		return d.promise;
	};

	self.saveStorageLocations = function(storageLocations) {
		var d = $q.defer();

		db.get().bulkDocs(storageLocations.map(function(storageLocation) {
			storageLocation._id = 'storagelocation_' + storageLocation.StorageLocationNr;
			return storageLocation;
		})).then(function(res) {
			d.resolve(res);
		}).catch(function(err) {
			d.reject(err);
		});
		return d.promise;
	};

	self.saveMaterials = function(materials){
		var d = $q.defer();

		db.get().bulkDocs(materials.map(function(material) {
			material._id = 'material_' + material.MaterialNr;
			material.UsedQuantity = '';
			material.RequirementQuantity = '';
			return material;
		})).then(function(res) {
			d.resolve(res);
		}).catch(function(err) {
			d.reject(err);
		});
		return d.promise;
	};

	self.saveOrders = function(orders){
		var d = $q.defer(), arr = [];

		for(var i = 0; i < orders.length; i++){
			var order = orders[i];
			order._id = 'order_' + order.OrderNr;

			for(var j = 0; j < orders[i].Documents.length; j++){
				var doc = orders[i].Documents[j];
				orders[i].Documents[j].ObjectId = orders[i].Documents[j].ObjectId.replace(/^0+/, '');
				orders[i].Documents[j]._id = "document_" + orders[i].Documents[j].DocumentId;
			}

			for(var k = 0; k < orders[i].Tasks.length; k++){
				var task = orders[i].Tasks[k];

				if (task.OrderNr === order.OrderNr) {
					task._id = "task_" + task.OrderNr + "_" + task.TaskNr;

					for(var l = 0; l < task.Confirmations.length; l++){
						var confirmation = task.Confirmations[l];
						confirmation._id = "confirmation_" + confirmation.ConfirmationNr;
						confirmation.FinalConfirmation = confirmation.FinalConfirmation === 'X';
					}

					for(var m = 0 ; m < task.Components.length; m ++){
						var component = task.Components[m];

						if (task.FinalConfirmation !== 'X') {
							//component.StorageLocation = storageLocation;
						}
						if (component.MaterialNr !== undefined && component.MaterialNr !== "") {
							// materials.forEach(function(material) {
							// 	if (material.MaterialNr === component.MaterialNr) {
							// 		component.Material = material;
							// 	}
							// });
						}
					}
				}

			}
			arr.push(order);
		}

		db.get().bulkDocs(arr).then(function(res) {
			d.resolve(res);
		}).catch(function(err) {
			d.reject(err);
		});
		return d.promise;
	};


};
