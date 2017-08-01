'use strict';

module.exports = function($cookies, $q, dbGet, httpSendService, operationService, queue) {
	var self = this;

	self.selectedOrder = {};
	self.selectedTask = {};
	self.selectAttachment = {};
	self.selectedTab = 1;

	self.setSelectedTab = function(tab) {
		self.selectedTab = tab;
	};

	self.getSelectedTab = function() {
		return self.selectedTab;
	};

	self.setCurrentOrder = function(order) {
		self.selectedOrder = order;
		self.selectedTask = self.selectedOrder.Tasks[0];
	};

	self.refreshSelectedOrder = function(){
		dbGet.get(self.selectedOrder._id).then(function(res){
			self.selectedOrder = res;
		});
	};

	self.setSelectedTask = function(task) {
		self.selectedTask = task;
	};

	self.cleanSelectedTask = function() {
		self.selectedTask = {};
	};

	self.setCurrentAttachment = function(attachment) {
		self.selectAttachment = attachment;
	};

	self.addComponent = function(component) {
		if (Array.isArray(cachedPartialConfirmations.Tasks[self.selectedTask].Components)) {
			cachedPartialConfirmations.Tasks[self.selectedTask].Components.push(component);
		} else {
			cachedPartialConfirmations.Tasks[self.selectedTask].Components = [component];
		}
	};

	self.createSignature = function(signatureName, signatureEmail, orderId, signature) {
		var parameters = {};
		parameters.attachmentName = signatureName;
		parameters.objectID = orderId;
		parameters.objectType = "BUS2088";
		parameters.attachmentType = "ZPMORDJPG";
		parameters.contentType = "image/jpeg";
		var image = signature.replace("data:image/jpeg;base64,", "");

		return operationService.createSignatureOperation({
				EmailAddress: signatureEmail,
				OrderNumber: orderId
			}, {})
			.then(function(response) {
				return operationService.createAttachmentOperation({
					img: image
				}, parameters);
			}).then(function(){
				queue.start();
				self.refreshSelectedOrder();
			});
	};


	self.getSelectedTaskIndex = function() {
		if(angular.isNumber(this.selectedTask)){
			return this.selectedTask;
		}
		for (var i = 0; i < this.selectedOrder.Tasks.length; i++) {
			if (this.selectedOrder.Tasks[i].TaskNr === this.selectedTask.TaskNr) {
				return i;
			}
		}
		return 0;
	};

	self.confirmOrderTask = function(order, partialConfirmation, components) {
		var deferred = $q.defer();

		var parameters = {};var gmParameters = {};
		parameters.taskIndex = self.getSelectedTaskIndex();
		parameters.confirmation = {};
		parameters.confirmation.OrderNr = order.OrderNr;
		parameters.confirmation.TaskNr = order.Tasks[parameters.taskIndex].TaskNr;
		parameters.confirmation.ConfText = partialConfirmation.confirmationText.slice(0,40);
		parameters.confirmation.LongText = partialConfirmation.confirmationText;
		parameters.confirmation.FinalConfirmation = "";
		parameters.confirmation.ActualWork = partialConfirmation.amount + "";
		parameters.confirmation.UnitWork = order.Tasks[parameters.taskIndex].UnitWork;
		parameters.materials = components;

		var rightNow = new Date();
		var gmPostingDate = rightNow.toISOString().slice(0, 10).replace(/-/g, "");
		var gmMaterialDocItems = [];

		//Create next operation for Goods Movement
		if (components.length > 0) {
			gmParameters.selectedTask = order.Tasks[parameters.taskIndex];
			gmParameters.components = components;

			for (var i = 0; i < gmParameters.components.length; i++) {
				gmMaterialDocItems.push({
					"OrderNr": gmParameters.components[i].Ordernr,
					"TaskNr": gmParameters.components[i].TaskNr,
					"MaterialNr": gmParameters.components[i].MaterialNr,
					"StorageLocationNr": gmParameters.components[i].StorageLocationNr,
					"Quantity": gmParameters.components[i].UsedQuantity
				});
			}
		}

		operationService.createConfirmOrderOperation(parameters.confirmation, parameters).then(function(res){
			if(gmMaterialDocItems.length) {
				return operationService.createGoodsMovementOperation({
					"PostingDate": gmPostingDate,
					"MaterialDocItems": gmMaterialDocItems
				}, gmParameters);
			} else {
				return $q.when(true);
			}
		}).then(function(res){
			queue.start();
			self.refreshSelectedOrder();
			deferred.resolve(res);
		});

		return deferred.promise;
	};

	var cachedPartialConfirmations = null;

	self.setCachedPartialConfirmations = function(order) {
		cachedPartialConfirmations = order;
	};

	self.getCachedPartialConfirmations = function() {
		return cachedPartialConfirmations;
	};
};
