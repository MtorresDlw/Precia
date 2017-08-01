'use strict';

module.exports = function($scope, $state, $translate, orderService, toaster, cordova) {
	$scope.saving = false;

	$scope.currentOrder = angular.copy(orderService.selectedOrder);
	$scope.idSelectedRow = orderService.getSelectedTaskIndex();

	//add empty partial confirmations
	var cachedPartialConfirmations = orderService.getCachedPartialConfirmations();
	if(cachedPartialConfirmations){
		$scope.currentOrder = cachedPartialConfirmations;
	} else {
		for(var i = 0; i < $scope.currentOrder.Tasks.length; i++){
			$scope.currentOrder.Tasks[i].Confirmations.unshift({
				amount: 0,
				confirmationText: ''
			});

			$scope.currentOrder.Tasks[i].Components = [];
		}
	}

	//check if any partials have been partially completed
	function checkPartialConfirmations() {
		for(var i = 0; i < $scope.currentOrder.Tasks.length; i++){
			if(($scope.currentOrder.Tasks[i].Confirmations[0].amount !== 0 &&
				$scope.currentOrder.Tasks[i].Confirmations[0].amount !== null )||
				$scope.currentOrder.Tasks[i].Confirmations[0].confirmationText !== '' ||
				$scope.currentOrder.Tasks[i].Components.length !== 0){
				return false;
			}
		}
		return true;
	}

	// $scope.partialConfirmation = orderService.getPartialConfirmation() || {
	// 	amount: 0,
	// 	confirmationText: ''
	// };
	// $scope.partialConfirmation.task = orderService.selectedTask;
	$scope.partialConfirmation = $scope.currentOrder.Tasks[$scope.idSelectedRow].Confirmations[0];

	var decimalPattern = new RegExp('^[0-9]*(\\.{0,1}[0-9]{1})?$');

	$scope.$watch('partialConfirmation.amount', function(newVal, oldVal){
		if(!decimalPattern.test(newVal)&&newVal !== null){
			$scope.partialConfirmation.amount = oldVal;
		}
	});

	$scope.taskItemClick = function(selectItem, index) {
		if (!$scope.saving) {
			if (selectItem.Confirmations[0] && selectItem.Confirmations[0].FinalConfirmation) {
				orderService.selectedTask = selectItem;
				$state.go('orderInfo');
			} else {
				$scope.idSelectedRow = index;
				$scope.partialConfirmation = $scope.currentOrder.Tasks[index].Confirmations[0];
				orderService.setSelectedTask(selectItem);
			}
		}
	};

	$scope.goToOrderInfo = function() {
		var unconfirmedPartialConfirmations = checkPartialConfirmations();
		if (!$scope.saving && unconfirmedPartialConfirmations) {
			orderService.setCachedPartialConfirmations(null);
			$state.go('orderDetail');
		} else if(!unconfirmedPartialConfirmations){
			cordova.confirm('Unsent partial confirmations, are you sure?',
				'Confirmation',
				['Cancel', 'Ok'],
				[function(){
				}, function(){
					orderService.setCachedPartialConfirmations(null);
					$state.go('orderDetail');
				}]);
		}
	};

	$scope.goToAddMaterial = function() {
		orderService.setSelectedTask($scope.idSelectedRow);
		// orderService.setPartialConfirmation($scope.partialConfirmation);
		orderService.setCachedPartialConfirmations($scope.currentOrder);
		$state.go('materialAdd');
	};

	$scope.createFinalConfirmation = function() {
		if ($scope.currentOrder.Tasks[$scope.idSelectedRow].FinalConfirmation !== 'X') {
			$scope.saving = true;

			//validate input
			orderService.confirmOrderTask($scope.currentOrder, $scope.partialConfirmation, $scope.currentOrder.Tasks[$scope.idSelectedRow].Components).then(function(result) {
				if (Array.isArray($scope.currentOrder.Tasks[$scope.idSelectedRow].Components)) {
					$scope.currentOrder.Tasks[$scope.idSelectedRow].Components.forEach(function(taskComponent) {
						var added = false;
						orderService.selectedOrder.Components.forEach(function(orderComponent) {
							if (taskComponent.MaterialNr === orderComponent.MaterialNr) {
								added = true;
								var newQuantity = parseInt(orderComponent.UsedQuantity) + parseInt(taskComponent.UsedQuantity);
								orderComponent.UsedQuantity = newQuantity.toString();
							}
						});
						if (!added) {
							orderService.selectedOrder.Components.push(taskComponent);
						}
					});
				}

				$scope.currentOrder.Tasks[$scope.idSelectedRow].Confirmations[0].amount = 0;
				$scope.currentOrder.Tasks[$scope.idSelectedRow].Confirmations[0].confirmationText = '';
				$scope.currentOrder.Tasks[$scope.idSelectedRow].Components = [];
				orderService.setCachedPartialConfirmations(null);
				$scope.saving = false;
			});
		}
	};

	$scope.removeComponent = function(index) {
		if (!$scope.saving) {
			$scope.currentOrder.Tasks[$scope.idSelectedRow].Components.splice(index, 1);
		}
	};
};
