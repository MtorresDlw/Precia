'use strict';

module.exports = function(OPERATION, $q, dbPut, dbGet, queue, cordova) {
	var self = this;

	//Partial Order Confirmation
	self.createConfirmOrderOperation = function(data, params) {
		var operation = {
			_id: 'operation_' + Date.now(),
			type: OPERATION.CONFIRMORDER,
			payload: data,
			parameters: params
		};

		return saveOperation(operation).then(function(){
			return processConfirmOrder(operation);
		});
	};

	//processing function
	function processConfirmOrder(operation) {
		//get original order
		return dbGet.getOrder(operation.payload.OrderNr).then(function(order) {
			//edit original order
			if (Array.isArray(order.Tasks[operation.parameters.taskIndex].Confirmations)) {
				order.Tasks[operation.parameters.taskIndex].Confirmations.push(operation.payload);
			} else {
				order.Tasks[operation.parameters.taskIndex].Confirmations = [operation.payload];
			}
			//save order
			return dbPut.put(order);
		});
	}

	//Goods Movement
	self.createGoodsMovementOperation = function(data, params) {
		var operation = {
			_id: 'operation_' + Date.now(),
			type: OPERATION.GOODSMOVEMENT,
			payload: data,
			parameters: params
		};

		return saveOperation(operation).then(function(){
			return processGoodsMovement(operation);
		});
	};

	//processing function
	function processGoodsMovement(operation) {
		//nothing to do
		return dbGet.getOrder(operation.parameters.selectedTask.OrderNr).then(function(order){
			if (Array.isArray(order.Components)) {
				for(var i = 0; i < operation.parameters.components.length; i++) {
					order.Components.push(operation.parameters.components[i]);
				}
			} else {
				order.Components = operation.parameters.components;
			}
			//save order
			return dbPut.put(order);
		});
	}

	//Create notification
	self.createNotificationOperation = function(data, params) {
		delete data.Customer;
		delete data.StartDateOpen;
		delete data.EndDateOpen;
		delete data.Priority;

		var operation = {
			_id: 'operation_' + Date.now(),
			type: OPERATION.CREATENOTIFICATION,
			payload: data,
			parameters: params
		};

		return saveOperation(operation).then(function(res){
			return processCreateNotification(operation);
		});
	};

	//processing function
	function processCreateNotification(operation) {
		operation.payload._id = "notification_offline_" + operation._id.replace('operation_', '');
		operation.payload.OrderNr = "";
		operation.payload.NotificationNr = "offline_" + operation._id.replace('operation_', '');
		operation.payload.Status = "";
		operation.payload.Documents = [];

		if (operation.parameters.attachments.length > 0) {
			operation.parameters.attachments.forEach(function(attachment, index) {
				var document = {};
				document.Data = "data:image/jpeg;base64," + attachment.img;
				document.DocumentId = 'A' + Date.now();
				document.DocumentType = "";
				document.FileName = "";
				document.MimeType = operation.parameters.attachmentParameters.contentType;
				document.ObjectId = operation.parameters.attachmentParameters.objectID;
				document.ObjectType = operation.parameters.attachmentParameters.objectType;
				document.StorageDate = "";
				document.Uri = "";
				operation.payload.Documents.push(document);
			});
		}

		return dbPut.put(operation.payload);
	}

	//create signature
	self.createSignatureOperation = function(data, params) {
		var operation = {
			_id: 'operation_' + Date.now(),
			type: OPERATION.CREATESIGNATURE,
			payload: data,
			parameters: params
		};

		return saveOperation(operation);
	};

	//Processing function
	function processCreateSignature() {

	}

	self.createAttachmentOperation = function(data, params) {
		var binary = atob(data.img);
		var len = binary.length;
		var buffer = new ArrayBuffer(len);
		var view = new Uint8Array(buffer);
		for (var i = 0; i < len; i++) {
			view[i] = binary.charCodeAt(i);
		}

		var operation = {
			_id: 'operation_' + Date.now(),
			type: OPERATION.CREATEATTACHMENT,
			payload: new Blob([view]),
			parameters: params,
			img: data.img,
			headers: {
				headers: {
					'Accept': 'application/json',
					'Content-Type': params.contentType,
					'Slug': params.objectType + '#' + params.objectID + '#' + params.attachmentType
				}
			}
		};

		return saveOperation(operation).then(function(res) {
			return processCreateAttachment(operation);
		});
	};

	//processing function
	function processCreateAttachment(operation) {
		var prefix = "",
			documentId = "A" + Date.now();
		if (operation.parameters.objectType === "BUS2080") {
			prefix = "notification_";
		} else if (operation.parameters.objectType === "BUS2088") {
			prefix = "order_";
		}

		return dbGet.get(prefix + operation.parameters.objectID).then(function(doc) {
			var document = {};

			document.Data = "data:image/jpeg;base64," + operation.img;
			document.DocumentId = documentId;
			document.DocumentType = operation.parameters.attachmentType;
			document.FileName = "";
			document.MimeType = operation.parameters.contentType;
			document.ObjectId = operation.parameters.objectID;
			document.ObjectType = operation.parameters.objectType;
			document.StorageDate = "";
			document.Uri = "";
			document._id = 'document_' + documentId;

			if (Array.isArray(doc.Documents)) {
				doc.Documents.push(document);
			} else {
				doc.Documents = [document];
			}

			return dbPut.put(doc);
		}).then(function(res) {
			//create attachment
			var platform = cordova.getPlatform();

			if (platform === '' || platform === 'Android' || platform === 'windows') {
				var buffer;
				var fileReader = new FileReader();
				fileReader.onload = function() {
					buffer = fileReader.result;

					var obj = {};
					obj._id = documentId;
					obj._attachments = {};
					obj._attachments[documentId] = {
						content_type: operation.parameters.contentType,
						data: buffer.split(',')[1]
					};
					dbPut.put(obj);
				};
				fileReader.readAsDataURL(operation.payload);

			} else {
				console.warn('Platform not supported to save attachment.');
			}

			return $q.when(true);
		});
	}

	function saveOperation(operation) {
		queue.push(operation._id);
		return dbPut.put(operation);
	}
};
