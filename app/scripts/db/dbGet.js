module.exports = function($q, $translate, db) {
	var self = this;

	self.get = function(doc) {
		var d = $q.defer();
		db.get().get(doc).then(function(res) {
			d.resolve(res);
		}).catch(function(err) {
			d.reject(err);
		});
		return d.promise;
	};

	self.credentials = function() {
		return db.get().get('credentials');
	};

	self.lastSync = function() {
		return db.get().get('last_sync');
	};

	self.allDocs = function(options) {
		var d = $q.defer();
		db.get().allDocs(options).then(function(res) {
			d.resolve(res);
		}).catch(function(err) {
			d.reject(err);
		});
		return d.promise;
	};

	self.attachment = function(attachmentId) {
		var d = $q.defer();
		db.get().get(attachmentId, {
			attachments: true
		}).then(function(res) {
			d.resolve(res);
		}).catch(function(err) {
			d.reject(err);
		});
		return d.promise;
	};

	self.attachmentBlob = function(attachmentId) {
		var d = $q.defer();
		db.get().getAttachment(attachmentId, attachmentId).then(function(res) {
			d.resolve(res);
		}).catch(function(err) {
			d.reject(err);
		});
		return d.promise;
	};

	self.getOrder = function(id) {
		return self.get('order_' + id);
	};

	self.getCustomer = function(id) {
		return self.get('customer_' + id);
	};

	self.getMaterial = function(id) {
		return self.get('material_' + id);
	};

	self.getPriority = function(id) {
		return self.get('priority_' + $translate.use()[0].toUpperCase() + id);
	};

	self.getSetting = function() {
		return self.get('settings_ZMOB_FS_STORLOC');
	};

	self.getStorageLocation = function(id) {
		return self.get('storagelocation_' + id);
	};
};
