'use strict';

module.exports = function($compile, $parse, dbGet) {
	return {
		restrict: 'AE',
		scope: true,
		compile: function() {
			return function link(scope, iElement, iAttr) {
				iAttr.$observe('faStoragelocation', function(id) {
					iElement.html('');
					dbGet.getStorageLocation(id).then(function(res) {
						iElement.html(res.Description);
					}).catch(function() {
						iElement.html(id);
					});
				});
			};
		}
	};
};
