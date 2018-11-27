/** @license Geoffrey Limmacher v1.0.0
 * Service.js
 *
 * Copyright (c) 2018-present, CESI
 *
 * This source code is licensed under the CESI license.
 */
designertool.factory('DesignerToolService', [
    '$http', '$q', function ($http, $q) {
        let logger = log4javascript.getLogger('DesignerToolService');

        let Product = {
            id: '',
            name: '',
            code_article: '',
            images: [{}],
            description: ''
        };

        let File = {
            $$hashKey: '',
            lastModified: '',
            lastModifiedDate: {},
            name: '',
            size: '',
            type: ''
        };

        return {

            // /////////////////////////////////////////////
            // construct object product
            // /////////////////////////////////////////////

            getProduct: function () {
                return Product;
            },

            setProduct: function (product) {
                logger.debug('setProduct: ' + JSON.stringify(product));

                Product = product;
            },

            getFile: function () {
                return File;
            },

            setFile: function (file) {
                logger.debug('setFile: ' + JSON.stringify(file));

                File = file;
            },

            // /////////////////////////////////////////////
            // simulate api call
            // /////////////////////////////////////////////

            /**
             *
             * @returns {*}
             */
            getFirstProduct: function () {
                logger.debug("getFirstProduct");

                let deferred = $q.defer();

                $http.get(SERVER_URL + '/api/').then(function (response) {
                    let file = response.data[0];
                    if (file) {
                        $http.get(SERVER_URL + '/api/' + file).then(function (response) {
                            deferred.resolve(response.data);
                        }, function (response) {
                            logger.error('getFirstProduct: ' + JSON.stringify(response.data));
                        });
                    } else {
                        logger.error('getFirstProduct: file is empty or undefined');
                    }
                }, function (response) {
                    logger.error('getFirstProduct: ' + JSON.stringify(response.data));
                });

                return deferred.promise;
            },

            /**
             *
             * @returns {*}
             */
            getJsonFiles: function () {
                logger.debug("getJsonFiles");

                let deferred = $q.defer();

                $http({
                    method: 'GET',
                    url: SERVER_URL + '/api/',
                    dataType: 'json',
                    contentType: 'application/json'
                }).then(function successCallback(response) {

                    let items = [];
                    let arr = [];
                    arr = response.data;

                    for (let i = 0; i < arr.length; i++) {
                        let item = response.data[i];
                        $http({
                            method: 'GET',
                            url: SERVER_URL + '/api/' + item,
                            dataType: 'json',
                            contentType: 'application/json'
                        }).then(function successCallback(response) {

                            items.push(response.data);
                            deferred.resolve(items);

                        }, function errorCallback(response) {
                            logger.error('getJsonFiles: ' + JSON.stringify(response.data));
                        });
                    }
                }, function errorCallback(response) {
                    logger.error('getJsonFiles: ' + JSON.stringify(response.data));

                });

                return deferred.promise;
            }
        }
    }
]);