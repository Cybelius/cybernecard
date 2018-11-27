/** @license Geoffrey Limmacher v1.0.0
 * App.js
 *
 * Copyright (c) 2018-present, CESI
 *
 * This source code is licensed under the CESI license.
 */
let layout = new log4javascript.PatternLayout("%d{HH:mm:ss} | %-5p | %-40c  | %m");

let appender = new log4javascript.BrowserConsoleAppender();
appender.setLayout(layout);
// appender.setThreshold(configuration.log4javascript.threshold);

let rootLogger = log4javascript.getRootLogger();
rootLogger.addAppender(appender);

/**
 * declare module
 * @type {angular.Module}
 */
let designertool = angular.module('DesignerTool', [
    'ngAnimate', 'ngRoute', 'ngMaterial', 'ngAria', 'angular-growl', 'LocalForageModule', 'DesignerToolControllers'
]);

/**
 * configuration app
 */
designertool.config([
    '$compileProvider',
    '$httpProvider',
    '$routeProvider',
    '$localForageProvider',
    'growlProvider',
    function ($compileProvider, $httpProvider, $routeProvider, $localForageProvider, growlProvider) {

        // $compileProvider.debugInfoEnabled(configuration.angular.compileProvider.debugInfoEnabled);

        $localForageProvider.config({
            name: 'myApp'
        });

        $routeProvider.when('/designer', {
            controller: 'DesignerController',
            templateUrl: '/designer.html'
        }).otherwise({
            redirectTo: '/designer'
        });

        growlProvider.globalDisableCountDown(true);
        growlProvider.globalPosition('top-center');
        growlProvider.globalTimeToLive(5000);
        growlProvider.onlyUniqueMessages(false);
    }
]);

let controllers = angular.module('DesignerToolControllers', []);

/**
 * onchange input file custom directive
 */
designertool.directive('fileOnChange', function() {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            let onChangeHandler = scope.$eval(attrs.fileOnChange);
            element.bind('change', onChangeHandler);
        }
    };
});