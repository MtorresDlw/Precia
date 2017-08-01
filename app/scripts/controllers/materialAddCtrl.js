'use strict';

module.exports = function($scope, dbGet, $state, $translate, $timeout,
	orderService, toaster, materialService) {
	$scope.currentOrder = orderService.getCachedPartialConfirmations();
	$scope.currentTask = $scope.currentOrder.Tasks[orderService.selectedTask];
	//$scope.currentTask.Components = [];

	$scope.materials = [];

	$scope.loading = true;
	var defaultStorageLocation;
	dbGet.getSetting().then(function(setting){
		defaultStorageLocation = setting.Value;
		return dbGet.allDocs({
			startkey: "material_",
			endkey: "material_\u02ad",
			include_docs: true
		});
	}).then(function(docs){
		$scope.materials = docs.rows.map(function(item) {
			item.doc.StorageLocationNr = defaultStorageLocation;
			return item.doc;
		});

		for (var i = 0; i < $scope.materials.length; i++) {
			for (var j = 0; j < $scope.currentTask.Components.length; j++) {
				if ($scope.materials[i].MaterialNr === $scope.currentTask.Components[j].MaterialNr) {
					$scope.materials[i].added = true;
				}
			}
		}
	}).finally(function(){
		$scope.loading = false;
	});

	$scope.scanMaterial = function() {
		materialService.scanMaterial().then(function(scanResult) {
			$scope.query = scanResult;
		});
	};

	$scope.goToOrderInfoEdit = function() {
		$state.go('orderInfoEdit');
		// window.history.back();
	};

	$scope.addMaterial = function(material) {
		material.added = true;
		var component = {};
		component.Ordernr = orderService.selectedOrder.OrderNr;
		component.TaskNr = $scope.currentTask.TaskNr;
		component.Material = material;
		component.UsedQuantity = material.UsedQuantity;
		component.RequirementQuantity = ''; //material.UsedQuantity;
		component.BaseUnit = material.BaseUnit;
		component.StorageLocationNr = material.StorageLocationNr;
		component.MaterialNr = material.MaterialNr;

		orderService.addComponent(component);

		//$scope.currentTask.Components.push(component);
		toaster.pop('success', $translate.instant('Material'), $translate.instant('_Material_Added'), 1500);
	};

	$scope.showFlyout = false;
	var selectedMaterial = null;
	$scope.addStorageLocation = function(material){
		$scope.showFlyout = true;
		selectedMaterial = material;
	};

	$scope.selectStorageLocation = function(storageLocation) {
		selectedMaterial.StorageLocationNr = storageLocation.StorageLocationNr;
		$scope.showFlyout = false;
	};

	$scope.storageLocations = [];
	dbGet.allDocs({
		startkey: "storagelocation_",
		endkey: "storagelocation_\u02ad",
		include_docs: true
	}).then(function(docs) {
		$scope.storageLocations = docs.rows.map(function(doc){
			return doc.doc;
		});
	});


};
