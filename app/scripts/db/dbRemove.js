'use strict';
var PouchDB = require('PouchDB');

module.exports = function($q, db, dbSettings) {
	var self = this;

	self.operations = function() {
		var d = $q.defer();
		db.get().allDocs({
			include_docs: true,
			startkey: 'operation_',
			endkey: 'operation_\uffff'
		}).then(function(result) {
			for (var i = 0; i < result.rows.length; i++) {
				db.get().remove(result.rows[i].doc);
			}
			d.resolve('Removing operation documents');
		}).catch(function(err) {
			d.reject(err);
		});

		return d.promise;
	};

	self.removeOperation = function(operation){
		return self.remove(operation._id);
	};

	self.remove = function(docId) {
		var d = $q.defer();

		db.get().get(docId).then(function(doc){
			return db.get().remove(doc);
		}).then(function(res) {
			d.resolve(res);
		}).catch(function(err) {
			d.reject(err);
		});

		return d.promise;
	};

	self.destroy = function() {
		var d = $q.defer();
		db.get().destroy().then(function(res) {
			d.resolve(res);
		});
		return d.promise;
	};
};
