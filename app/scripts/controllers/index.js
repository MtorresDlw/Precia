'use strict';

angular.module('stowApp.controllers', [])
	.controller('authenticationCtrl', require('./authenticationCtrl'))
	.controller('dashboardCtrl', require('./dashboardCtrl'))

	.controller('notificationListCtrl', require('./notificationListCtrl'))
	.controller('notificationDetailCtrl', require('./notificationDetailCtrl'))
	.controller('notificationCreateCtrl', require('./notificationCreateCtrl'))
	.controller('notificationAttachmentCtrl', require('./notificationAttachmentCtrl'))

	.controller('orderListCtrl', require('./orderListCtrl'))
	.controller('orderDetailCtrl', require('./orderDetailCtrl'))
	.controller('orderInfoCtrl', require('./orderInfoCtrl'))
	.controller('orderServiceReportCtrl', require('./orderServiceReportCtrl'))
	.controller('orderSignatureCtrl', require('./orderSignatureCtrl'))
	.controller('orderInfoEditCtrl', require('./orderInfoEditCtrl'))
	.controller('orderAttachmentCtrl', require('./orderAttachmentCtrl'))

	.controller('materialAddCtrl', require('./materialAddCtrl'))

	.controller('ModalInstanceCtrl', require('./ModalInstanceCtrl'))

	.controller('logCtrl', require('./logCtrl'))
	;
