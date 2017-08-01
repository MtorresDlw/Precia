'use strict';

module.exports = function($scope, $state, dbPut, dbGet, orderService, toaster) {
	var _imgData = null;
	$scope.saving = false;
	$scope.signature = {
		data: '',
		name: '',
		email: '',
		exists: false,
		// callback is executed on mouseup and touchend
		cb: function(data) {
			_imgData = data;
		},
		reset: function() {
			$scope.signature.name = '';
			$scope.signature.email = '';
			$scope.$broadcast('resetCanvas');
		}
	};

	$scope.signatureExist = false;
	$scope.currentOrder = orderService.selectedOrder;
	$scope.signatureData = null;

	// we first search the Documents that where synced
	// if ($scope.currentOrder.Documents.length) {
	// 	$scope.currentOrder.Documents.forEach(function(document) {
	// 		if (document.MimeType === "image/jpeg") {
	// 			$scope.signature = {
	// 				data: document.Data,
	// 				name: '',
	// 				exists: true
	// 			};
	// 			return;
	// 		}
	// 	});
	// }

	var signatureId = 'orderSignature_' + $scope.currentOrder.OrderNr + '_' + new Date().getTime();
	// if we already found a document no need to check again
	// if (!$scope.signature.exists) {
	// 	dbGet.get(signatureId).then(function(doc) {
	// 		$scope.signature = {
	// 			data: doc.data,
	// 			name: doc.name,
	// 			exists: true
	// 		};
	// 	}).catch(function(err) {
	// 		console.error(err);
	// 	});
	// }

	// Navigate to the order list
	$scope.goToServiceReport = function() {
		if (!$scope.saving) {
			$state.go('orderServiceReport');
		}
	};

	$scope.saveSignature = function() {
		var signatureName = $scope.signature.name;
		var signatureEmail = $scope.signature.email;
		var imgContent = _imgData;

		if (validateEmail($scope.signature.email)) {
			$scope.saving = true;
			orderService.createSignature(signatureName, signatureEmail, $scope.currentOrder.OrderNr, imgContent).then(function() {
				if (!$scope.signature.exists) {
					dbPut
						.put({
							_id: signatureId,
							data: imgContent,
							name: signatureName
						})

						.catch(function(err) {
							console.error(err);
						});
				}

				$scope.saving = false;
				$state.go('orderServiceReport');
			});
		} else {
			toaster.pop('error', 'Invalid email', 'Invalid email entered', 3000);
		}
	};

	function validateEmail(email) {
		var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}
};
