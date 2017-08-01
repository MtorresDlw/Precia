'use strict';

module.exports = function($scope, $state, orderService, materialService, dbGet) {
	$scope.currentOrder = orderService.selectedOrder;

	$scope.getAllConfirmations = function() {
		var confirmations = [];
		$scope.currentOrder.Tasks.forEach(function(task) {
			task.Confirmations.forEach(function(confirmation) {
				confirmation.ActualWork = parseFloat(confirmation.ActualWork);
				confirmation.TaskDescription = task.Description;
				confirmations.push(confirmation);
			});
		});

		return confirmations;

	};

	function containsComponent(list, component){
		for(var i = 0; i < list.length; i++){
			if(list[i].MaterialNr === component.MaterialNr){
				return true;
			}
		}
		return false;
	}

	function getComponentIndex(list, component) {
		for(var i = 0; i < list.length; i++){
			if(list[i].MaterialNr === component.MaterialNr){
				return i;
			}
		}
		return false;
	}

	$scope.components = [];
	var components = angular.copy($scope.currentOrder.Components);
	components.forEach(function(component) {
		if(!containsComponent($scope.components, component)){
			$scope.components.push(component);
		} else {
			var index = getComponentIndex($scope.components, component);
			var currentQuantity = parseInt($scope.components[index].UsedQuantity, 10);
			$scope.components[index].UsedQuantity = currentQuantity + parseInt(component.UsedQuantity, 10);
		}
	});

	// Navigate to the order list
	$scope.goToOrderDetail = function() {
		$state.go('orderDetail');
	};

	$scope.goToOrderSignature = function() {
		$state.go('orderSignature');
	};

	$scope.getTotalUnitsOfWork = function() {
		if ($scope.getAllConfirmations() === undefined || !(Array.isArray($scope.getAllConfirmations()))) {
			return "";
		}
		var total = 0;
		$scope.getAllConfirmations().forEach(function(confirmation) {
			total += parseFloat(confirmation.ActualWork);
		});

		return total.toString() + "H";
	};

	$scope.getMaterialDescription = function(materialNr) {
		return materialService.getMaterialDescription(materialNr);
	};

	$scope.status = {
		confirmationsOpen: true,
		componentsOpen: true
	};

	$scope.signature = {
		data: '',
		name: '',
		exists: false
	};

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

	// var signatureId = 'orderSignature_' + $scope.currentOrder.OrderNr;
	// // if we already found a document no need to check again
	// if (!$scope.signature.exists) {
	// 	dbGet.get(signatureId).then(function(document) {
	// 		$scope.signature = {
	// 			data: document.data,
	// 			name: document.name,
	// 			exists: true
	// 		};
	// 	}).catch(function(err) {
	// 		console.error(err);
	// 	});
	// }
};
