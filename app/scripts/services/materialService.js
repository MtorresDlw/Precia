'use strict';

module.exports = function($q, cordova, toaster, dbGet) {
	var self = this;

	self.scanMaterial = function() {
		return cordova.getBarcode();
	};

	self.getMaterialDescription = function(materialNr) {
		var deferred = $q.defer();

		var materialInput = "material_" + materialNr;

		dbGet.allDocs({
			startkey: materialInput,
			endkey: materialInput + "\u02ad",
			include_docs: true
		}).then(function(docs) {
			deferred.resolve(docs.rows[0].doc.Description);
		});

		return deferred.promise;
	};
};
