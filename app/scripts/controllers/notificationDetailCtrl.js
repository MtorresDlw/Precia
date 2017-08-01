'use strict';

module.exports = function($scope, $state, $translate, notificationService, dbGet, toaster, cordova, log) {
	//Setting some variables for the scope
	$scope.currentNotification = notificationService.selectedNotification;

	$scope.activateInformation = notificationService.getSelectedTab() == 1;
	$scope.activateAttachments = notificationService.getSelectedTab() == 2;

	/***/
	//$scope.activateAttachments = true;
	//	/***/

	notificationService.setSelectedTab(1);

	$scope.offlineCheck = function(item) {
		return item.NotificationNr.substring(0, 7) === "offline";
	};

	//Go back to Notification List
	$scope.goToNotificationList = function() {
		$state.go('notificationList');
	};

	$scope.gotoAttachment = function(document) {
		dbGet.attachmentBlob(document.DocumentId).then(function(res) {
			cordova.open(res);
		}).catch(console.error);
	};
};
