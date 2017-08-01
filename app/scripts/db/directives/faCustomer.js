'use strict';

module.exports = function($compile, $parse, dbGet) {
	return {
		restrict: 'AE',
		scope: true,
		compile: function() {
			return function link(scope, iElement, iAttr) {
				iAttr.$observe('faCustomer', function(id) {
					iElement.html('');
					dbGet.getCustomer(id).then(function(res) {
						iElement.html(res.Name);
					}).catch(function() {
						iElement.html(id);
					});
				});
			};
		}
	};
};
