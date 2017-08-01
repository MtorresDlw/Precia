'use strict';

module.exports = function() {
	var self = this;

	self.cleanJsonOrders = function cleanJsonOrders(orders) {
		return orders.reduce(function(_orders, order) {
			delete order.__metadata;
			order.Documents = self.clearJson(order.Documents.results);
			order.Components = self.clearJson(order.Components.results);
			order.Tasks = self.clearJson(order.Tasks.results, true);
			_orders.push(order);
			return _orders;
		}, []);
	};

	self.cleanJsonNotifications = function cleanJsonNotifications(notifications) {
		return notifications.reduce(function(_notifications, notif) {
			delete notif.__metadata;
			notif.Documents = self.clearJson(notif.Documents.results);
			_notifications.push(notif);
			return _notifications;
		}, []);
	};

	self.clearJson = function clearJson(jsonValues, goDeeper) {
		return jsonValues.reduce(function(all, jsonValue) {
			delete jsonValue.__metadata;
			if (goDeeper) {
				jsonValue.Confirmations = clearJson(jsonValue.Confirmations.results);
				jsonValue.Components = clearJson(jsonValue.Components.results);
			}
			all.push(jsonValue);
			return all;
		}, []);
	};

	self.getDocumentStructuredData = function(orders, notifications, customers, priorities, settings, materials) {
		var storageLocation;
		settings.forEach(function(setting) {
			if (setting.Parameter === "ZMOB_FS_STORLOC") {
				storageLocation = setting.Value;
			}
			setting._id = "settings_" + setting.Parameter;
		});

		materials = materials.map(function(material) {
			material._id = "material_" + material.MaterialNr;
			material.UsedQuantity = "";
			material.RequirementQuantity = "";
			material.StorageLocation = storageLocation;
			return material;
		});

		customers.forEach(function(customer) {
			customer._id = "customer_" + customer.CustomerNr;
		});

		priorities.forEach(function(prio) {
			prio._id = "priority_" + prio.Language + prio.PriorityNr;
		});

		// Add customer, priority & documents to notifications
		notifications.forEach(function(notification) {
			notification._id = "notification_" + notification.NotificationNr;
			notification.LongText = notification.LongText.replace(/\\n/g, "\\n");

			if (notification.CustomerNr !== "") {
				customers.forEach(function(customer) {
					if (customer.CustomerNr === notification.CustomerNr) {
						notification.Customer = customer;
					}
				});
			}

			if (notification.PriorityNr !== "") {
				priorities.forEach(function(prio) {
					if (prio.PriorityNr === notification.PriorityNr && prio.Language === 'E') {
						notification.Priority = prio;
					}
				});
			}

			notification.Documents.forEach(function(document) {
				document.ObjectId = document.ObjectId.replace(/^0+/, '');
				document._id = "document_" + document.DocumentId;
			});
		});

		orders.forEach(function(order) {
			order._id = "order_" + order.OrderNr;

			if (order.CustomerNr !== "") {
				customers.forEach(function(customer) {
					if (customer.CustomerNr === order.CustomerNr) {
						order.Customer = customer;
					}
				});
			}
			if (order.PriorityNr !== "") {
				priorities.forEach(function(prio) {
					if (prio.PriorityNr === order.PriorityNr && prio.Language === 'E') {
						order.Priority = prio;
					}
				});

				notifications.forEach(function(notif) {
					if (notif.OrderNr !== null && notif.OrderNr === order.OrderNr) {
						order.ReportedBy = notif.ReportedBy;
					}
				});
			}

			order.Tasks.forEach(function(task) {
				if (task.OrderNr === order.OrderNr) {
					task._id = "task_" + task.OrderNr + "_" + task.TaskNr;

					task.Confirmations.forEach(function(confirmation) {
						confirmation._id = "confirmation_" + confirmation.ConfirmationNr;
						confirmation.FinalConfirmation = confirmation.FinalConfirmation === 'X';
					});

					order.Components.forEach(function(component) {
						component._id = "component_" + component.ConfirmationNr;

						if (task.FinalConfirmation !== 'X') {
							component.StorageLocation = storageLocation;
						}
						if (component.MaterialNr !== undefined && component.MaterialNr !== "") {
							materials.forEach(function(material) {
								if (material.MaterialNr === component.MaterialNr) {
									component.Material = material;
								}
							});
						}
					});
				}
			});

			order.Documents.forEach(function(document) {
				document.ObjectId = document.ObjectId.replace(/^0+/, '');
				document._id = "document_" + document.DocumentId;
			});
		});

		// Concat arrays and store in pouch
		return notifications.concat(orders, customers, priorities, settings, materials);
	};
};
