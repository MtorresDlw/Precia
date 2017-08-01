'use strict';

module.exports = function($scope, $state, orderService){
	$scope.currentOrder = orderService.selectedOrder;

	$scope.selectedTask = orderService.selectedTask ;
	$scope.idSelectedRow = orderService.getSelectedTaskIndex();

	$scope.currentOrder.Tasks.forEach(function(task)
	{
	    if(task.Confirmations[0] && task.Confirmations[0].FinalConfirmation){
	        task.ActualWork = 0;
	        task.Confirmations.forEach(function (confirmation)
	        {
	            task.ActualWork += parseFloat(confirmation.ActualWork);
	        });
	    }
	});

	$scope.taskItemClick = function (selectItem, index) {
	    if(selectItem.Confirmations[0] && selectItem.Confirmations[0].FinalConfirmation){
	        $scope.idSelectedRow = index;
	        $scope.selectedTask = selectItem;
	        orderService.setSelectedTask(selectItem);
	    }
	    else{
	        orderService.selectedTask = selectItem;
	        $scope.goToOrderInfoEdit();
	    }
	};

	$scope.goToOrderDetail = function () {
	    $state.go('orderDetail');

	};
	$scope.goToOrderInfoEdit = function () {
	    $state.go('orderInfoEdit');
	};

	if(!($scope.currentOrder.Tasks[$scope.idSelectedRow].Confirmations[0] && $scope.currentOrder.Tasks[$scope.idSelectedRow].Confirmations[0].FinalConfirmation)){
	    $scope.goToOrderInfoEdit();
	}
};
