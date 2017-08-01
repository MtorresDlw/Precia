'use strict';

module.exports = function($scope, $state, $animate,
	dbGet, notificationService, toaster, cordova, queue){

	$scope.saving = false;

	//Go back to Notification List
	$scope.goToNotificationList = function () {
	    if(!$scope.saving){
	        $state.go('notificationList');
	    }
	};

	$scope.dateOptions = {
	    startingDay: 1,
	    showWeeks: true,
	    minDate: +new Date()
	};

	$scope.$watch('notification.StartDate', function (newVal) {
	    if(!newVal) return;
	    if($scope.notification.EndDate){
	        if( +$scope.notification.EndDate < +$scope.notification.StartDate ){
	            $scope.notification.EndDate = +newVal;
	        }
	    } else {
	        $scope.notification.EndDate = +newVal;
	    }
	});

	//Setting some variables for the scope
	$scope.notification={};

	//Getting All Priorities from DB
	dbGet.allDocs({startkey: "priority_E", endkey: "priority_E\u02ad", include_docs: true}).then(function (docs) {
	    $scope.priorities = docs.rows.reduce(function (all, item) {
	        all.push(item.doc);
	        return all;
	    }, []);
	});

	//Getting All Customers from DB
	dbGet.allDocs({startkey: 'customer_', endkey: "customer_\u02ad", include_docs: true}).then(function (docs) {
	    $scope.customers = docs.rows.map(function(doc){
	    	return doc.doc;
	    });
	});

	//Validate the entered fields
	function validateRequiredField() {
	    $scope.requiredStartDate = !!($scope.notification.StartDate === undefined || $scope.notification.StartDate === '');

	    $scope.requiredEndDate = !!($scope.notification.EndDate === undefined || $scope.notification.EndDate === '');

	    $scope.requiredPriority = !!($scope.notification.Priority === undefined || $scope.notification.Priority === '');

	    $scope.requiredCustomer = !!($scope.notification.Customer === undefined || $scope.notification.Customer === '');

	    $scope.notificationForm.Description.isRequired = !($scope.notificationForm.Description.$error.maxlength || $scope.notificationForm.Description.$valid);

	    $scope.notificationForm.ReportedBy.isRequired = !($scope.notificationForm.ReportedBy.$error.maxlength || $scope.notificationForm.ReportedBy.$valid);
	}

	//Save the created notification
	$scope.saveNotification = function () {
	    $scope.saving = true;
	    notificationService.createNotification($scope.notification, $scope.slides).then(function (result) {
	        $scope.notification = {};
	        $scope.saving = false;
	        console.log('starting queue');
	        queue.start();
	        $state.go('notificationList');
	    });
	};

	//Take a picture
	$scope.takepicture = function () {
	    cordova.takePicture().then(function(fileUrl){
	    	notificationService.selectedNotification.pictures.push(fileUrl);
	    	$scope.slides.push({ img: fileUrl });
	    });
	};

	//Date picker functions
	$scope.today = function () {
	    $scope.dt = new Date();
	};
	$scope.today();

	$scope.format = 'dd-MM-yyyy';

	$scope.clear = function () {
	    $scope.dt = null;
	};
	$scope.openStartDate = function ($event) {
	    $event.preventDefault();
	    $event.stopPropagation();
	    $scope.notification.StartDate.open = true;

	};
	$scope.openEndDate = function ($event) {
	    $event.preventDefault();
	    $event.stopPropagation();
	    $scope.notification.EndDate.open = true;
	};

	//Open dropdown
	$scope.open = function($event, elementOpened) {
	    $event.preventDefault();
	    $event.stopPropagation();

	    $scope.notification[elementOpened] = !$scope.notification[elementOpened];
	};

	//Code for carousel
	$scope.myInterval = 3000;
	$scope.slides = [];
};
