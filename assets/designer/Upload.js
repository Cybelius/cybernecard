/** @license Geoffrey Limmacher v1.0.0
 * Upload.js
 *
 * Copyright (c) 2018-present, CESI
 *
 * This source code is licensed under the CESI license.
 */
controllers.controller('UploadController', ['$scope', '$mdDialog', '$localForage', 'DesignerToolService',
    function ($scope, $mdDialog, $localForage, DesignerToolService) {
        let logger = log4javascript.getLogger('Upload');

        logger.debug('UploadController');

        /**
         *
         * @type {boolean}
         */
        $scope.agreement = false;

        /**
         *
         * @type array []
         */
        $scope.images = [];

        /**
         */
        $scope.init = function () {
            logger.debug('init');

            $scope.agreement = $scope.session.user.agreement;

            $localForage.iterate(function(value, key, iterationNumber) {
                $scope.images.push(value);
            }).then(function() {
                logger.info('Images successfully retrieved');
            }).catch(function(err) {
                logger.error(err);
            });

            $scope.unlock();
        };

        /**
         * upload image form disk to div. not storing actually inside db
         *
         * @param event
         */
        $scope.previewFile = function (event) {
            logger.debug('previewFile');

            if ($scope.agreement) {
                //selects the query file
                let file = document.querySelector('input[type=file]').files[0];

                let fd = new FormData();
                fd.append("image", document.querySelector('input[type=file]').files[0]);

                // console.log(document.querySelector('input[type=file]').files[0]);
                $scope.add(file);
            } else {
                M_Modal.toast({html: "Vous devez accepter les droits applicables à l'utilisation des images"})
            }
        };

        /**
         * add image to array
         * @param file
         */
        $scope.add = function (file) {
            logger.debug('add: ' + JSON.stringify(file));

            if (file) {
                $scope.images.push(file);
            }
        };

        /**
         * TODO: create list element on push object inside $scope.images array()
         * @param images
         */
        $scope.addImages = function (images) {
            logger.debug('addImages: ' + images);

            let ul = document.getElementById("upload-container");

            //images is an array
            if (images) {
                let li = "";
                for (let i = 0; i < images.length; i++) {
                    let file = images[i];

                    li += "<li style='width: 134px; height: 134px;'>" +
                        "       <a href='#' ng-click='selectedImage()'>" +
                        "             <img id='img-preview' src='/img/" + file.name + "' width='134' height='134' alt='Image preview'>" +
                        "       </a>" +
                        "  </li>";
                }
                ul.innerHTML = li;
            }
        };

        /**
         * unlock the button
         */
        $scope.unlock = function () {
            logger.debug('unlock');

            if ($scope.agreement) {
                $('#file-label').removeAttr('disabled');
            } else {
                $('#file-label').attr('disabled', 'disabled');
            }
        };

        $scope.init();

        // ////////////////////////////////////////
        // modal main methods
        // ////////////////////////////////////////


        /**
         *
         */
        $scope.hide = function () {
            logger.debug('modal hide');

            $mdDialog.hide();
        };

        /**
         *
         */
        $scope.cancel = function () {
            logger.debug('modal cancel');

            $mdDialog.cancel();
        };

        /**
         *
         * @param answer
         */
        $scope.answer = function (answer) {
            logger.debug('modal answer');

            if ($scope.agreement) {
                let file = {
                    'name': answer.name,
                    'size': answer.size,
                    'type': answer.type
                };

                //store array of images
                $localForage.setItem($scope.removeFileExtension(answer), file).then(function () {});

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