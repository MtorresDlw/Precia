'use strict';

module.exports = function($scope, $state, $sce, $filter, orderService, dbGet, cordova, toaster) {
	//Setting some variables for the scope
	$scope.currentOrder = orderService.selectedOrder;
	console.log($scope.currentOrder);

	dbGet.getCustomer($scope.currentOrder.CustomerNr).then(function(res) {
		$scope.currentOrder.Customer = res;
	});
	$scope.longTextHTML = $sce.trustAsHtml($filter('longTextFilter')($scope.currentOrder.LongText));
	$scope.activateInformation = orderService.getSelectedTab() == 1;
	$scope.activateAttachments = orderService.getSelectedTab() == 2;

	orderService.setSelectedTab(1);

	// Navigate back to the dashboard
	$scope.goToDashboard = function() {
		$state.go('dashboard');
	};

	// Navigate to the order list
	$scope.goToOrderList = function() {
		orderService.cleanSelectedTask();
		$state.go('orderList');
	};

	// Navigate to the order information
	$scope.goToOrderInfo = function() {
		$state.go('orderInfo');
	};

	// Navigate to the service report
	$scope.goToServiceReport = function() {
		$state.go('orderServiceReport');
	};

	$scope.gotoAttachment = function(document) {
		dbGet.attachmentBlob(document.DocumentId).then(function(res) {
			cordova.open(res);
		}).catch(function(err){
			console.error(err);
			toaster.pop('error', 'Document', 'Document not found.');
		});
	};
};
