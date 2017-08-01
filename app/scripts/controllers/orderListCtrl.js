'use strict';

module.exports = function($scope, $state, dbGet, orderService) {
	//Go back to Dashboard
	$scope.goToDashboard = function() {
		$state.go('dashboard');
	};

	//Setting some variables for the scope
	$scope.orders = [];
	$scope.dateCheck = false;
	$scope.descriptionCheck = false;

	//Getting All Orders from DB
	dbGet.allDocs({
			startkey: 'order_',
			endkey: "order_\u02ad",
			include_docs: true
		})
		.then(function(docs) {
			$scope.orders = docs.rows.map(function(item) {
				dbGet.getCustomer(item.doc.CustomerNr).then(function(res){
					item.doc.CustomerName = res.Name;
				});
				return item.doc;
			});
		});

	//View the details of an Order
	$scope.viewDetailsOrder = function(order) {
		orderService.setCurrentOrder(order);
		$state.go('orderDetail');
	};

	//Sort on customer
	$scope.customerToggle = function() {
		$scope.descriptionCheck = true;
		$scope.dateCheck = false;
	};

	//Sort on date
	$scope.dateToggle = function() {
		$scope.dateCheck = true;
		$scope.descriptionCheck = false;
	};
};
