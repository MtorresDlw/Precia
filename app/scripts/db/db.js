'use strict';
var PouchDB = require('pouchdb');
require('pouchdb/extras/localstorage');
//var PouchLocal = require('');

module.exports = function(dbSettings) {
	var self = this;
	var db;
	self.get = function() {
		if (db) {
			return db;
		} else {
			db = new PouchDB(dbSettings.getName(), {
				adapter: dbSettings.getAdapter(),
				auto_compaction: true
			});
			return db;
		}
	};
};
