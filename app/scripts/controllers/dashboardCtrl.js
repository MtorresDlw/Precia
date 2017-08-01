'use strict';

module.exports = function($scope, httpGetService, dbGet, $state, $modal, $timeout,
	toaster, syncService, queue) {
	//Get the last synchronisation, if there is none do an initial sync
	dbGet.lastSync().then(function(doc) {
		$scope.lastSyncDate = new Date(doc.date);
		$scope.$applyAsync();
	}).catch(function(error) {
		if (error.message === "missing") {
			$scope.synchronize();
		} else {
			console.log(error);
		}
	});

	//Start synchronizing the database
	$scope.synchronize = function synchronize() {
		queue.start();
		$scope.syncing = true;
		httpGetService.test().then(function(result) {
			if (result) {
				return syncService.start();
			}
		}).then(function() {
			return dbGet.lastSync();
		}).then(function(doc) {
			$scope.lastSyncDate = new Date(doc.date);
		}).finally(function() {
			$scope.syncing = false;
		});
	};
	$scope.syncing = false;

	//Go to Orders
	$scope.viewOrders = function viewOrders() {
		$state.go('orderList');
	};

	//Go to Notifications
	$scope.viewNotifications = function viewNotifications() {
		$state.go('notificationList');
	};

	$scope.pageClass = 'page-dashboard';

	//Setting ready for languages
	$scope.languages = [{
		code: "en",
		text: "English"
	}, {
		code: "de",
		text: "Deutsch"
	}, {
		code: "nl",
		text: "Nederlands"
	}];
	$scope.selectedLanguage = $scope.languages[0];
	$scope.open = function(size) {
		var modalInstance = $modal.open({
			templateUrl: 'myModalContent.html',
			controller: 'ModalInstanceCtrl',
			size: size,
			backdrop: false,
			resolve: {
				languages: function() {
					return $scope.languages;
				}
			}
		});
		modalInstance.result.then(function(selectedlanguage) {
			$scope.selected = selectedlanguage;
		}, function() {

		});
	};

	//activate log screen
	var leftCounter = 0;
	$scope.swipeLeft = function() {
		leftCounter++;
		$timeout(function(){
			leftCounter = 0;
		}, 2000);
	};

	var rightCounter = 0;
	$scope.swipeRight = function() {
		rightCounter++;
		if(leftCounter === 3 && rightCounter === 2){
			$state.go('log');
		}
		$timeout(function(){
			rightCounter = 0;
		}, 2000);
	};
};
