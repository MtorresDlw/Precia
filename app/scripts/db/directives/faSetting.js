'use strict';

module.exports = function($compile, $parse, dbGet){
	return {
		restrict: 'AE',
		scope: true,
		compile: function(){
			return function link(scope, iElement, iAttr){
				iElement.html('');
				dbGet.getSetting().then(function(res){
					return dbGet.getStorageLocation(res.Value);
				}).then(function(res){
					iElement.html(res.Description);
				}).catch(function(err){
					console.log(err);
					iElement.html('');
				});
			};
		}
	};
};
