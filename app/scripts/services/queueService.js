'use strict';

module.exports = function($interval, $q, OPERATION, dbGet, httpSendService) {
	var self = this;

	var intervalId = null,
		storageKey = 'operations';

	self.start = function() {
		console.info('Queue working!');
		intervalFunction();
		intervalId = $interval(intervalFunction, 2000);
	};

	self.stop = function() {
		console.info('Queue stopped');
		if (intervalId) {
			$interval.cancel(intervalId);
		}
	};

	function intervalFunction() {

		if (self.getLength() > 0) {
			var operationId = self.pop();
			dbGet.get(operationId).then(function(operation) {
				console.log(operation);
				if (operation.type === OPERATION.CONFIRMORDER) {
					httpSendService.confirmOrderTask(operation).catch(self.push);
				} else if (operation.type === OPERATION.GOODSMOVEMENT) {
					httpSendService.createGoodsMovement(operation).catch(self.push);
				} else if (operation.type === OPERATION.CREATENOTIFICATION) {
					httpSendService.createNotification(operation).catch(self.push);
				} else if (operation.type === OPERATION.CREATESIGNATURE) {
					httpSendService.createSignature(operation).catch(self.push);
				} else if (operation.type === OPERATION.CREATEATTACHMENT) {
					httpSendService.createAttachment(operation).catch(self.push);
				} else {
					console.error('Unknown operation');
				}
			});
		} else {
			self.stop();
		}
	}

	self.push = function(item) {
		console.log(item);
		var temp = JSON.parse(window.localStorage.getItem(storageKey)) || [];
		if (!temp) {
			temp = [];
		}
		temp.unshift(item);
		window.localStorage.setItem(storageKey, JSON.stringify(temp));
	};

	self.pop = function() {
		var temp = JSON.parse(window.localStorage.getItem(storageKey)) || [];
		if (!temp) {
			return null;
		}
		var item = temp.pop();
		window.localStorage.setItem(storageKey, JSON.stringify(temp));
		return item;
	};

	self.remove = function(index) {
		var temp = JSON.parse(window.localStorage.getItem(storageKey)) || [];
		if (!temp) {
			temp = [];
		}
		if(index >= temp.length) {
			console.error('Index greater then queue length.');
		} else {
			temp.splice(index, 1);
		}

		window.localStorage.setItem(storageKey, JSON.stringify(temp));
		return temp;
	};

	self.getLength = function() {
		return (JSON.parse(window.localStorage.getItem(storageKey)) || []).length;
	};

	self.get = function() {
		return (JSON.parse(window.localStorage.getItem(storageKey)) || []);
	};
};
