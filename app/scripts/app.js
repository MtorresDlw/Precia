'use strict';
/// <reference path="../scripts/angular.js" />

require('./winstore-jscompat');

require('angular');
require('angular-touch');
require('angular-animate');
require('angular-translate');
require('angular-carousel');
require('angular-sanitize');
require('angular-ui-router');
require('angular-ui-bootstrap');
require('angular-cookies');
require('angularjs-toaster');

require('./templates');
require('./controllers');
require('./services');
require('./db');
require('./directives');
require('./filters');

angular
    .module('stowApp', ['ngAnimate', 'ngTouch', 'ngSanitize', 'ngCookies', 'angular-carousel',
        'ui.bootstrap', 'ui.router', 'pascalprecht.translate', 'toaster', 'templates',
        'stowApp.controllers', 'stowApp.services', 'stowApp.db', 'stowApp.directives', 'stowApp.filters'])
    .constant('homeStateName', 'authentication')
    .config(function ($stateProvider, $translateProvider, $compileProvider, datepickerConfig, datepickerPopupConfig) {

        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(blob|ms-appx):|data:image\//);

        $stateProvider
            .state('authentication', {
                url: '/authentication',
                templateUrl: 'login.html',
                controller: 'authenticationCtrl'
            })
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'dashboard.html',
                controller: 'dashboardCtrl'
            })
            .state('notificationList', {
                url: '/notification',
                templateUrl: 'notificationList.html',
                controller: 'notificationListCtrl'
            })
            .state('notificationDetail', {
                url: '/notification',
                templateUrl: 'notificationDetail.html',
                controller: 'notificationDetailCtrl'
            })
            .state('notificationCreate', {
                url: '/notification',
                templateUrl: 'notificationCreate.html',
                controller: 'notificationCreateCtrl'
            })
            .state('notificationAttachment', {
                url: '/notificationAttachment',
                templateUrl: 'js/notification/views/notificationAttachment.html',
                controller: 'notificationAttachmentCtrl'
            })


            .state('orderList', {
                url: '/order',
                templateUrl: 'orderList.html',
                controller: 'orderListCtrl'
            })
            .state('orderDetail', {
                url: '/orderDetail',
                templateUrl: 'orderDetail.html',
                controller: 'orderDetailCtrl'
            })
            .state('orderInfo', {
                url: '/order',
                templateUrl: 'orderInfo.html',
                controller: 'orderInfoCtrl'
            })
            .state('orderInfoEdit', {
                url: '/orderInfoEdit',
                templateUrl: 'orderInfoEdit.html',
                controller: 'orderInfoEditCtrl'
            })
            .state('orderServiceReport', {
                url: '/orderService',
                templateUrl: 'orderServiceReport.html',
                controller: 'orderServiceReportCtrl'
            })
            .state('orderSignature', {
                url: '/orderSignature',
                templateUrl: 'orderSignature.html',
                controller: 'orderSignatureCtrl'
            })
            .state('orderAttachment', {
                url: '/orderAttachment',
                templateUrl: 'js/order/views/orderAttachment.html',
                controller: 'orderAttachmentCtrl'
            })

            .state('materialAdd', {
                url: '/material',
                templateUrl: 'materialAdd.html',
                controller: 'materialAddCtrl'
            })

            .state('log', {
                url: '/log',
                templateUrl: 'log.html',
                controller: 'logCtrl'
            });

        $translateProvider.translations('en', require('../locales/en'));
        $translateProvider.translations('de', require('../locales/de'));
        $translateProvider.translations('nl', require('../locales/nl'));
        $translateProvider.preferredLanguage('en');

        datepickerConfig.showWeeks = false;
        datepickerPopupConfig.datepickerPopup = 'dd-MM-yyyy';
        $translateProvider.useSanitizeValueStrategy(null);
    })
    .run(function ($rootScope, $state, $cookies, $http, queue) {
        $rootScope.globals = $cookies.globals || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line

        }

        $state.go('authentication');
        //$state.go('orderList');

        //start queue
        queue.start();
    });
