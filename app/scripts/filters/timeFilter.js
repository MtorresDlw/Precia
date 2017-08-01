'use strict';

module.exports = function() {
	return function(dateValue) {
		var resultTime = '';
		if (dateValue !== undefined && dateValue !== null && dateValue !== '' && dateValue.length === 11) {
			var hour = dateValue.substr(2, 2);
			var minute = dateValue.substr(5, 2);
			var second = dateValue.substr(8, 2);
			resultTime = hour + ':' + minute + ':' + second;
		}
		return resultTime;
	};
};
