/** @license Geoffrey Limmacher v1.0.0
 * Products.js
 *
 * Copyright (c) 2018-present, CESI
 *
 * This source code is licensed under the CESI license.
 */
controllers.controller('ProductsController', ['$scope', '$mdDialog', 'DesignerToolService',
    function ($scope, $mdDialog, DesignerToolService) {
        let logger = log4javascript.getLogger('Products');

        logger.debug('ProductsController');

        /**
         *
         * @type {Array}
         */
        $scope.items = [];

        /**
         *
         * @type {Array}
         */
        $scope.images = [];

        /**
         */
        $scope.init = function () {
            logger.debug('init');

            //init modal
            $scope.getFiles();

        };

        /**
         * get files from local disk
         */
        $scope.getFiles = function () {
            logger.debug('getFiles');

            DesignerToolService.getJsonFiles().then(function (data) {
                if (data) {
                    $scope.images.push(data.images);
                    $scope.items = data;
                } else {
                    logger.error('getFiles: ' + JSON.stringify(data));
                }
            }, function (data) {
                logger.error(data.message.join('<br>'));
            });
        };

        $scope.init();

        // ////////////////////////////////////////
        // modal main methods
        // ////////////////////////////////////////

        $scope.hide = function() {
            logger.debug('modal hide');

            $mdDialog.hide();
        };

        $scope.cancel = function() {
            logger.debug('modal cancel');

            $mdDialog.cancel();
        };

        $scope.answer = function(answer) {
            logger.debug('modal answer');

            if (answer) {
                $mdDialog.hide(answer);
            } else {
                $scope.cancel();
            }
        };

        // ////////////////////////////////////////
        //
        // ////////////////////////////////////////
    }
]);