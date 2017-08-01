'use strict';

module.exports = function($scope, dbGet, $state, notificationService) {
	//Go back to Dashboard
	$scope.goToDashboard = function() {
		$state.go('dashboard');
	};

	//Setting some variables for the scope
	$scope.notifications = [];
	$scope.descriptionCheck = false;
	$scope.dateCheck = false;
	$scope.offlineCheck = function(item) {
		return item.NotificationNr.substring(0, 7) === "offline";
	};

	//Getting All Notifications from DB
	dbGet.allDocs({
		startkey: "notification_",
		endkey: "notification_\u02ad",
		include_docs: true
	}).then(function(docs) {
		$scope.notifications = docs.rows.map(function(item) {
			return item.doc;
		});
	});

	//View the details of a Notification
	$scope.viewDetails = function(notification) {
		notificationService.setCurrentNotification(notification);
		$state.go('notificationDetail');
	};

	//Sort on description
	$scope.descriptionToggle = function() {
		$scope.descriptionCheck = true;
		$scope.dateCheck = false;
	};

	//Sort on date
	$scope.dateToggle = function() {
		$scope.dateCheck = true;
		$scope.descriptionCheck = false;

	};

	//Go to the view to Create a Notification
	$scope.goToCreateNotification = function() {
		var notification = {};
		notification.pictures = [];
		notificationService.setCurrentNotification(notification);
		$state.go('notificationCreate');
	};
};
