'use strict';

module.exports = function($q, dbGet, httpSendService, operationService){
	var self = this;

	self.selectedNotification = {};
	self.selectedNotification.pictures = [];
	self.selectedAttachment = {};
	self.selectedTab = 1;

	self.setSelectedTab = function(tab){
	    self.selectedTab = tab;
	};

	self.getSelectedTab = function(){
	    return self.selectedTab;
	};

	self.setCurrentNotification = function (notification) {
	    self.selectedNotification = notification;
	};

	self.setCurrentAttachment = function(attachment){
	    self.selectAttachment = attachment;
	};

	self.createNotification = function (notification, attachments) {
	    notification.StartDate = new Date(+notification.StartDate);
	    notification.EndDate = new Date(+notification.EndDate);

	    notification.StartDate = notification.StartDate.toISOString().slice(0,10).replace(/-/g,"");
	    notification.EndDate = notification.EndDate.toISOString().slice(0,10).replace(/-/g,"");

	    notification.CustomerNr = notification.Customer.CustomerNr;
	    //notification.Customer;

	    notification.PriorityNr = notification.Priority.PriorityNr;
	    //notification.Priority;

	    var parameters = {};
	    parameters.attachments = attachments;
	    parameters.attachmentParameters = {};
	    parameters.attachmentParameters.objectType = "BUS2080";
	    parameters.attachmentParameters.attachmentType = "ZPMNOTJPG";
	    parameters.attachmentParameters.contentType = "image/jpeg";


	    return dbGet.get('settings_ZMOB_FS_WORKCENTER').then(function (settings) {
	        notification.WorkCenter = settings.Value;
	        return operationService.createNotificationOperation(notification, parameters);
	    });
	};
};
