/** @license Geoffrey Limmacher v1.0.0
 * DesignerTool.js
 *
 * Copyright (c) 2018-present, CESI
 *
 * This source code is licensed under the CESI license.
 */
controllers.controller('DesignerController', ['$location', '$rootScope', '$route', '$scope', '$timeout', 'growl', 'DesignerToolService', '$mdDialog',
    function ($location, $rootScope, $route, $scope, $timeout, growl, DesignerToolService, $mdDialog) {
        let logger = log4javascript.getLogger('DesignerTool');

        logger.debug('DesignerController');

        /**
         * product object
         */
        $scope.product = {};

        /**
         * the last index of the image object before selectImage | index = 2, lastIndex = 1
         * @type {int} index
         */
        $scope.lastIndex = 0;

        /**
         * check if the zone is already created | if not : create a zone when image is selected
         * @type {boolean}
         */
        $scope.isZoneCreated = false;

        /**
         * check if the zone is already hidden | if not : create a zone when image is selected
         * @type {boolean}
         */
        $scope.isHidden = false;

        /**
         * session user object
         * @type {{}}
         */
        $scope.session = {};

        /**
         * return the objects with associated images
         * @type {*[]}
         */
        $scope.response = [];

        /**
         * images container to push into response and send to cybernecard api | json
         * @type {Array}
         */
        $scope.imagesSelectedForProductIndex = [];

        /**
         * image container to send into imagesSelectedForProductIndex
         * @type {{}}
         */
        $scope.imageForSelect = {};

        /**
         * g container
         */
        var gCont;

        /**
         * position data of g object
         * standard x, y, width and height values
         *
         * @type {{}}
         */
        var position = [
            {id: 0, x: (MAX_TRANSLATE_X / 2) - 75, y: (MAX_TRANSLATE_Y / 2) - 75, width: 150, height: 150}
        ];

        /**
         * image file uploaded
         */
        var file, tempFile;

        /**
         *
         * @type {Array}
         */
        var files = [];

        /**
         * position at index when clicking on selectImage
         * @type {number}
         */
        var currentIndex = 0;

        var arr = [];

        /**
         * initialization
         */
        $scope.init = function () {
            logger.debug('init');

            let session = {
                authenticated: true,
                email: 'cybernecard@cybernecard.fr',
                agreement: true,
                role: 'user'
            };

            $scope.initializeProduct();
            setUserSession(session);
            ensureUserIsAuthenticated();

            $('.product-view-selector').on('click', '.product-thumbnail', function () {
                $('.product-view-selector .product-thumbnail.active').removeClass('active');
                $(this).addClass('active');
            });

            $('#designer').on("click", rectHidden);
        };

        /**
         * initializeProduct the first product
         */
        $scope.initializeProduct = function () {
            logger.debug('initializeProduct');

            DesignerToolService.getFirstProduct().then(function (data) {

                $scope.product = data;

                initializeArrayResponse();

            }, function (data) {
                logger.error("data.message.join('<br>')");
            });
        };

        /**
         * change the main image
         */
        $scope.selectImage = function ($index) {
            logger.debug('selectImage: ' + $index);

            currentIndex = $index;
            if (typeof arr[$scope.lastIndex] === 'undefined' && file) {
                arr.push({
                    'id': $scope.lastIndex,
                    'x': position[0].x,
                    'y': position[0].y,
                    'width': position[0].width,
                    'height': position[0].height
                });

                if (arr.length > 1 && typeof arr[$index] !== 'undefined') {
                    updateArrPosition($index)
                }
            } else {
                if (arr.length > 1) {
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i].id == $index) {
                            let size = i;
                            updateArrPosition(size)
                        }
                    }
                }
                // if (arr.length > 1 && typeof arr[$index] !== 'undefined') {
                //     updateArrPosition($index)
                // }
            }

            if (file) {
                if (typeof $scope.response[$scope.lastIndex] === 'undefined') {
                    $scope.createResponseObject($scope.lastIndex);
                    $scope.removeZones();

                    if (typeof $scope.response[$index] !== 'undefined') {
                        file = $scope.response[$index].images[0];
                        $scope.createZone();
                    }
                } else {
                    file = $scope.response[$index].images[0];
                    $scope.createZone();
                }
            } else {
                $scope.removeZones();

                if (typeof $scope.response[$index] !== 'undefined') {
                    file = $scope.response[$index].images[0];
                    $scope.createZone();
                }
            }

            tempFile = file;
            file = null;
            $scope.lastIndex = $index;
        };

        /**
         *
         */
        $scope.createResponseObject = function (index) {
            logger.debug('createResponseObject');

            $scope.imageForSelect = {
                'name': file.name,
                'image_url': SERVER_URL + '/img/' + file.name,
                'x': position[0].x,
                'y': position[0].y,
                'image_width': position[0].width,
                'image_height': position[0].height
            };

            $scope.imagesSelectedForProductIndex.push($scope.imageForSelect);
            $scope.response[index] = {
                'id': $scope.lastIndex,
                'product': $scope.product.name,
                'index_image': $scope.product.images[$scope.lastIndex].id,
                'images': $scope.imagesSelectedForProductIndex
            };

            $scope.imagesSelectedForProductIndex = [];
            $scope.imageForSelect = {};
        };

        /**
         * create g and rect for zone and position element
         */
        $scope.createZone = function () {
            logger.debug('createZone');

            $scope.createImage();
        };

        /**
         * create the image
         */
        $scope.createImage = function () {
            logger.debug('createImage');

            let svg = d3.select("g#product-type-view-id");

            $scope.removeZones();

            // for the background
            svg.append("rect")
                .style("fill", "transparent")
                .attr("width", "100%")
                .attr("height", "100%");

            gCont = svg.append("g")
                .classed('print-area', true);

            gCont.append("rect")
                .classed('rect_container', true)
                .style("fill", "transparent")
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .attr("x", $scope.product.images[currentIndex].zone.x)
                .attr("y", $scope.product.images[currentIndex].zone.y)
                .attr("width", $scope.product.images[currentIndex].zone.width)
                .attr("height", $scope.product.images[currentIndex].zone.height);

            update();

        };

        /**
         * remove zones
         */
        $scope.removeZones = function () {
            logger.debug("removeZones");

            let svg = d3.select("g#product-type-view-id");
            if ($scope.isZoneCreated) {
                svg.selectAll("rect").remove();
                svg.selectAll("g.print-area").remove();
                $scope.isZoneCreated = false;
            }
        };

        /**
         * Open the products modal and return the product selected
         *
         * @param ev
         */
        $scope.showProducts = function (ev) {
            $mdDialog.show({
                controller: 'ProductsController',
                templateUrl: 'views/products-modal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                scope: $scope,
                preserveScope: true,
                clickOutsideToClose: true,
                multiple: true
            }).then(function (answer) {
                $scope.product = answer;
                initializeArrayResponse();
                $scope.removeZones();
                $scope.isZoneCreated = false;
            }, function () {
                logger.error('could not create element');
            });
        };

        /**
         * Open the upload image modal and return the image selected
         *
         * @param ev
         */
        $scope.showUpload = function (ev) {
            $mdDialog.show({
                controller: 'UploadController',
                templateUrl: 'views/upload-modal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                scope: $scope,
                preserveScope: true,
                clickOutsideToClose: true,
                multiple: true
            }).then(function (answer) {
                file = answer;
                files.push(file);
                $scope.createZone();
            }, function () {
                logger.error('could not create element');
            });
        };

        /**
         *
         */
        $scope.svgFormSave = function () {
            logger.debug("svgFormSave");

            if ($scope.svgForm.$invalid) {
                return;
            }

            //TODO: call DesignerToolService & send data to cybernecard
            console.log($scope.response);

            M.toast({html: JSON.stringify($scope.response)});

            //TODO: if success -> redirect to cybernecard
        };

        $scope.init();

        // //////////////////////////////////////
        // methods shared
        // //////////////////////////////////////

        /**
         * remove the file extension
         *
         * @param file
         * @returns {*}
         */
        $scope.removeFileExtension = function (file) {
            logger.debug('removeFileExtension: ' + JSON.stringify(file));

            let filename = '';
            if (file) {
                filename = file.name;
                return filename.replace(/\.[^/.]+$/, "");
            }
            return null;
        };

        // //////////////////////////////////////
        // private methods
        // //////////////////////////////////////

        /**
         * update the arr position
         * @param index
         */
        function updateArrPosition(index) {
            logger.debug('updateArrPosition: ' + index);

            position[0] = {
                id: arr[index].id,
                x: arr[index].x,
                y: arr[index].y,
                width: arr[index].width,
                height: arr[index].height
            };
        }

        /**
         * initialize array of object response
         */
        function initializeArrayResponse() {
            let length = $scope.product.images.length;
            $scope.response = Array.apply(null, Array(length)).map(function () {});
        }

        /**
         * verify is the user is authenticated
         */
        function ensureUserIsAuthenticated() {
            logger.debug('ensureUserIsAuthenticated: ' + $scope.session.user.authenticated);

            if ($scope.session.user.authenticated) {
                $rootScope.$broadcast(EVENT_CURRENT_USER_SUCCESS);
            }
        }

        /**
         * set user session info
         * @param session data
         */
        function setUserSession(session) {
            logger.debug('setUserSession: ' + JSON.stringify(session));

            if (session == null) {
                $scope.session.user = {
                    authenticated: false,
                    email: null,
                    agreement: null,
                    role: null
                }
            } else {
                $scope.session.user = session;
            }
        }

        /**
         * hidden the black frame anchors
         */
        function rectHidden() {
            logger.debug('rectHidden');

            if (gCont && !$scope.isHidden) {
                gCont.select("rect.rect_container").style("visibility", "hidden");
                gCont.select("rect.bg").style("visibility", "hidden");
                gCont.select("g.circles").style("visibility", "hidden");
                gCont.select("g.trash").style("visibility", "hidden");
                gCont.select("text").classed("active", false);
                $scope.isHidden = true;
                $scope.isZoneCreated = false;
            } else {
                gCont.select("rect.rect_container").style("visibility", "visible");
                gCont.select("rect.bg").style("visibility", "visible");
                gCont.select("g.circles").style("visibility", "visible");
                gCont.select("g.trash").style("visibility", "visible");
                gCont.select("text").classed("active", true);
                $scope.isHidden = false;
                $scope.isZoneCreated = true;
            }
        }

        /**
         * start resizing
         */
        function rectResizeStartEnd() {
            let el = d3.select(this), isStarting = d3.event.type === "start";
            d3.select(this)
                .classed("resizing", isStarting)
                .attr(
                    "r",
                    isStarting || el.classed("hovering") ?
                        HANDLE_R_ACTIVE : HANDLE_R
                );
        }

        /**
         * resize rectangle
         * @param d
         */
        function rectResizing(d) {
            let dragX = Math.max(
                Math.min(d3.event.x, MAX_TRANSLATE_X),
                MIN_TRANSLATE_X
            );

            let dragY = Math.max(
                Math.min(d3.event.y, MAX_TRANSLATE_Y),
                MIN_TRANSLATE_Y
            );

            if (d3.select(this).classed("topleft")) {

                let newWidth = Math.max(d.width + d.x - dragX, MIN_RECT_WIDTH);

                d.x += d.width - newWidth;
                d.width = newWidth;

                let newHeight = Math.max(d.height + d.y - dragY, MIN_RECT_HEIGHT);

                d.y += d.height - newHeight;
                d.height = newHeight;

            } else {
                d.width = Math.max(dragX - d.x, MIN_RECT_WIDTH);
                d.height = Math.max(dragY - d.y, MIN_RECT_HEIGHT);
            }

            update();
        }

        /**
         * method when resizing ends
         * @param d
         */
        function rectResizingEnd(d) {
            updatePosition();

            let el = d3.select(this), isStarting = d3.event.type === "start";
            d3.select(this)
                .classed("resizing", isStarting)
                .attr("r", HANDLE_R);
        }

        /**
         * start moving rectangle
         * @param d
         */
        function rectMoveStartEnd(d) {
            d3.select(this).classed("moving", d3.event.type === "start");

            gCont.selectAll("text").classed("active", true);
        }

        function rectMoving(d) {
            let dragX = Math.max(
                Math.min(d3.event.x, MAX_TRANSLATE_X - d.width),
                MIN_TRANSLATE_X
            );

            let dragY = Math.max(
                Math.min(d3.event.y, MAX_TRANSLATE_Y - d.height),
                MIN_TRANSLATE_Y
            );

            d.x = dragX;
            d.y = dragY;

            let OFFSET_X = d.x - $scope.product.images[$scope.lastIndex].zone.x;
            let OFFSET_Y = d.y - $scope.product.images[$scope.lastIndex].zone.y;

            let text = "X: " + OFFSET_X + " mm, Y: " + OFFSET_Y + " mm";
            gCont.select("text").text(text);

            update();
        }

        /**
         * event on rect move end
         * @param d
         */
        function rectMoveEnd(d) {
            updatePosition();
        }

        /**
         * update position of image element
         */
        function updatePosition() {
            logger.debug('updatePosition');

            if ($scope.lastIndex < arr.length) {
                arr[$scope.lastIndex] =  {
                    id: position[0].id,
                    x: position[0].x,
                    y: position[0].y,
                    width: position[0].width,
                    height: position[0].height
                };
            } else {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].id == currentIndex) {
                        arr[i] = {
                            id: position[0].id,
                            x: position[0].x,
                            y: position[0].y,
                            width: position[0].width,
                            height: position[0].height
                        };
                    }
                }
            }

            for (var i = 0; i < $scope.response.length; i++) {
                if (typeof $scope.response[i] === 'undefined') {
                    continue;
                }

                var responseId = $scope.response[i].id;

                for (var j = 0; j < arr.length; j++) {
                    var arrId = arr[j].id;

                    if (responseId == arrId) {
                        $scope.response[i].images[0] = {
                            name: $scope.response[i].images[0].name,
                            image_url: $scope.response[i].images[0].image_url,
                            x: arr[j].x,
                            y: arr[j].y,
                            image_width: arr[j].width,
                            image_height: arr[j].height
                        }
                    }

                }

            }
        }

        /**
         * remove current image on svg canvas and clean response object
         */
        function removeModifications() {
            logger.debug('removeModifications');

            let g = d3.select('g#product-type-view-id');
            g.select("rect").remove();
            d3.select('.print-area').remove();

            $scope.response[currentIndex] = undefined;
        }

        /**
         */
        function update() {
            let rects = gCont
                .selectAll("g.rectangle")
                .data(position, function (d) {
                    return d;
                });

            rects.exit().remove();

            let newRects =
                rects.enter()
                    .append("g")
                    .classed("rectangle", true);

            var filename = file == null ? tempFile.name : file.name;

            newRects.append("svg:image")
                .classed('uploaded-image', true)
                .attr('width', MIN_IMAGE_WIDTH)
                .attr("xlink:href", SERVER_URL + '/img/' + filename);

            newRects
                .append("rect")
                .classed("bg", true)
                .attr("fill", "transparent")
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .call(d3.drag()
                    .container(gCont.node())
                    .on("start", rectMoveStartEnd)
                    .on("drag", rectMoving)
                    .on("end", rectMoveEnd)
                );

            newRects.append("text")
                .attr("text-anchor", "start")
                .style("fill", "steelblue")
                .attr("transform", "translate(" + MARGIN.LEFT + "," + MARGIN.BOTTOM + ")");

            newRects
                .append("g")
                .classed("circles", true)
                .each(function (d) {
                    var circleG = d3.select(this);

                    circleG
                        .append("circle")
                        .classed("bottomright", true)
                        .attr("r", HANDLE_R)
                        .call(d3.drag()
                            .container(gCont.node())
                            .subject(function () {
                                return {x: d3.event.x, y: d3.event.y};
                            })
                            .on("start", rectResizeStartEnd)
                            .on("drag", rectResizing)
                            .on("end", rectResizingEnd)
                        );
                });

            newRects
                .append("g")
                .classed("trash", true)
                .each(function (d) {
                    var trashG = d3.select(this);

                    trashG
                        .append("rect")
                        .classed("bottomleft", true)
                        .attr("fill", "white")
                        .attr("stroke", "black")
                        .attr("stroke-width", 2)
                        .attr("width", 17)
                        .attr("height", 20)
                        .call(d3.drag()
                            .container(gCont.node())
                            .subject(function () {
                                return {x: d3.event.x, y: d3.event.y};
                            })
                            .on("start", rectResizeStartEnd)
                            .on("drag", rectResizing)
                            .on("end", rectResizingEnd)
                        );

                    trashG
                        .append("g")
                        .classed("configuration-delete", true)
                        .call(d3.drag()
                            .container(gCont.node())
                            .subject(function () {
                                return {x: d3.event.x, y: d3.event.y};
                            })
                            .on("start", rectResizeStartEnd)
                            .on("drag", rectResizing)
                            .on("end", rectResizingEnd)
                        );

                    trashG.select("g.configuration-delete")
                        .append("svg:image")
                        .classed('icon-trash', true)
                        .attr('width', TRASH_WIDTH)
                        .attr("xlink:href", SERVER_URL + '/img/trash.svg')
                        .on('click', removeModifications);
                });

            let allRects = newRects.merge(rects);

            allRects
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            allRects
                .select("rect.bottomleft")
                .attr("y", function (d) {
                    return d.height;
                })
                .attr("x", function (d) {
                    return -17;
                });

            allRects
                .select("rect.bg")
                .attr("height", function (d) {
                    return d.height;
                })
                .attr("width", function (d) {
                    return d.width;
                });

            allRects
                .select("image.icon-trash")
                .attr("y", function (d) {
                    return d.height;
                })
                .attr("x", function (d) {
                    return -17;
                });

            allRects
                .select("image")
                .attr("height", function (d) {
                    return d.height;
                })
                .attr("width", function (d) {
                    return d.width;
                });

            allRects
                .select('text')
                .attr("x", function (d) {
                    return 0;
                })
                .attr("y", function (d) {
                    return 0;
                });

            allRects
                .select("circle.bottomright")
                .attr("cx", function (d) {
                    return d.width;
                })
                .attr("cy", function (d) {
                    return d.height;
                });

            $scope.isZoneCreated = true;
        }

    }
]);