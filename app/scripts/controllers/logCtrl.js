'use strict';

module.exports = function($scope, $state, cordova, log, queue, dbGet, dbRemove){

	$scope.goToDashboard = function(){
		$state.go('dashboard');
	};
	$scope.logs = [];

	log.getInfo().then(function(res){
		$scope.logs = $scope.logs.concat(res);
	});

	log.getError().then(function(res){
		$scope.logs = $scope.logs.concat(res);
	});

	log.getWarn().then(function(res){
		$scope.logs = $scope.logs.concat(res);
	});

	log.getLog().then(function(res){
		$scope.logs = $scope.logs.concat(res);
	});

	$scope.operations = queue.get();
	$scope.operationDetail = {};

	for(var i = 0; i < $scope.operations.length; i++) {
		dbGet.get($scope.operations[i]).then(function(res){
			$scope.operationDetail[res._id] = res;
		});
	}

	$scope.removeOperation = function(index, operation) {
		$scope.operations.splice(index, 1);
		queue.remove(index);
		dbRemove.remove(operation).catch(console.error);
		delete $scope.operationDetail[operation];
	};

	$scope.openOperation = function(operationId){
		cordova.alert('Payload:\n' + JSON.stringify($scope.operationDetail[operationId].payload) +
		 '\n\nParameters:\n' + JSON.stringify($scope.operationDetail[operationId]));
	};
};
