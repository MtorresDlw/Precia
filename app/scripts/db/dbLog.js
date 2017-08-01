'use strict';

var PouchDB = require('PouchDB');

module.exports = function($q, dbSettings) {
	var self = this;

	var db = new PouchDB('log', {
		adapter: dbSettings.getAdapter(),
		auto_compaction: true
	});

	self.types = {
		info: 0,
		warn: 1,
		error: 2,
		log: 3
	};

	function getLogs(type) {
		var d = $q.defer();
		db.allDocs({
			startkey: 'log_' + type,
			endkey: 'log_' + type + '\u02ad',
			include_docs: true
		}).then(function(res) {
			d.resolve(res.rows.map(function(doc){
				return doc.doc;
			}));
		}).catch(function(err) {
			d.reject(err);
		});
		return d.promise;
	}

	self.info = function(msg, tag) {
		if (!tag) {
			tag = 'NO TAG';
		}
		var timestamp = new Date().getTime();
		db.put({
			_id: 'log_' + self.types.info + '_' + timestamp,
			message: msg,
			tag: tag,
			date: timestamp,
			type: self.types.info
		});
		console.info(tag + ' - ' + JSON.stringify(msg));
	};

	self.getInfo = function() {
		return getLogs(self.types.info);
	};

	self.warn = function(msg, tag) {
		if (!tag) {
			tag = 'NO TAG';
		}
		var timestamp = new Date().getTime();
		db.put({
			_id: 'log_' + self.types.warn + '_' + timestamp,
			message: msg,
			tag: tag,
			date: timestamp,
			type: self.types.warn
		});
		console.warn(tag + ' - ' + JSON.stringify(msg));
	};

	self.getWarn = function() {
		return getLogs(self.types.warn);
	};

	self.error = function(msg, tag) {
		if (!tag) {
			tag = 'NO TAG';
		}
		var timestamp = new Date().getTime();
		db.put({
			_id: 'log_' + self.types.error + '_' + timestamp,
			message: msg,
			tag: tag,
			date: timestamp,
			type: self.types.error
		});
		console.error(tag + ' - ' + JSON.stringify(msg));
	};

	self.getError = function() {
		return getLogs(self.types.error);
	};

	self.log = function(msg, tag) {
		if (!tag) {
			tag = 'NO TAG';
		}
		var timestamp = new Date().getTime();
		db.put({
			_id: 'log_' + self.types.log + '_' + timestamp,
			message: msg,
			tag: tag,
			date: timestamp,
			type: self.types.log
		});
		console.log(tag + ' - ' + JSON.stringify(msg));
	};

	self.getLog = function() {
		return getLogs(self.types.log);
	};
};
