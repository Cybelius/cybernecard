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
         *
         * @type {boolean}
         */
        $scope.isValid = true;

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
         * object errors
         * @type {*[]}
         */
        $scope.errors = [];

        /**
         *
         * @type {Array}
         */
        $scope.imageSizeByFrame = [];

        /**
         *
         * @type {Array}
         */
        $scope.markers = [];

        /**
         *
         */
        $scope.selectedMarker;

        /**
         *
         */
        $scope.selectedColorName = "";

        /**
         *
         * @type {number}
         */
        $scope.selectedImageIndex = 0;

        /**
         *
         */
        $scope.selectedPriceObj;

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

        /**
         *
         * @type {Array}
         */
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

            accordion();

            $('#designer').on("click", rectHidden);
        };

        /**
         * watch if the errors array change and apply show error if needed
         */
        $scope.$watchCollection('errors', function () {
            if ($scope.errors != null) {
                showErrorClass();
            }
        });

        /**
         * initializeProduct the first product
         */
        $scope.initializeProduct = function () {
            logger.debug('initializeProduct');

            DesignerToolService.getFirstProduct().then(function (data) {
                $scope.product = data;
                $scope.selectedMarker = $scope.product.markers[0].id;

                initializeArrayResponse();

            }, function (data) {
                logger.error('initializeProduct: ' + JSON.stringify(data));
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
                        if (typeof arr[i] === 'undefined') {
                            continue;
                        }

                        if (arr[i].id === $index) {
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
         * @param color
         */
        $scope.selectedColor = function (color) {
            logger.debug("selectedColor: " + JSON.stringify(color));

            $scope.selectedImageIndex = color.id;
            $scope.selectedColorName = color.name;

        };

        /**
         *
         * @param price
         */
        $scope.selectedPrice = function (price) {
            logger.debug("selectedPrice: " + JSON.stringify(price));

            $scope.selectedPriceObj = price;
        };

        /**
         *
         */
        $scope.createResponseObject = function (index) {
            logger.debug('createResponseObject at index: ' + index);

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
                'price': $scope.selectedPriceObj,
                'marker' : $scope.selectedMarker,
                'color': $scope.product.colors[$scope.selectedImageIndex].name,
                'index_image': $scope.product.colors[$scope.selectedImageIndex].images[$scope.lastIndex].id,
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
                .attr("x", $scope.product.colors[$scope.selectedImageIndex].images[currentIndex].zone.x)
                .attr("y", $scope.product.colors[$scope.selectedImageIndex].images[currentIndex].zone.y)
                .attr("width", $scope.product.colors[$scope.selectedImageIndex].images[currentIndex].zone.width)
                .attr("height", $scope.product.colors[$scope.selectedImageIndex].images[currentIndex].zone.height);

            update();

        };

        /**
         * remove zones
         */
        $scope.removeZones = function () {
            logger.debug("removeZones");

            let svg = d3.select("g#product-type-view-id");
            if ($scope.isZoneCreated || $('g.print-area')) {
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
                // console.log($scope.product);
                $scope.selectedMarker = $scope.product.markers[0].id;
                initializeArrayResponse();
                removeErrorMessageClass();
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

            console.log($scope.errors);
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

        function accordion() {
            var acc = document.getElementsByClassName("accordion");
            var i;

            for (i = 0; i < acc.length; i++) {
                acc[i].addEventListener("click", function() {
                    /* Toggle between adding and removing the "active" class,
                    to highlight the button that controls the panel */
                    this.classList.toggle("active");

                    /* Toggle between hiding and showing the active panel */
                    var panel = this.nextElementSibling;
                    if (panel.style.display === "block") {
                        panel.style.display = "none";
                    } else {
                        panel.style.display = "block";
                    }
                });
            }
        }

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
            let length = $scope.product.colors[0].images.length;
            $scope.response = Array.apply(null, Array(length)).map(function () {
            });
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

            let OFFSET_X = d.x - $scope.product.colors[$scope.selectedImageIndex].images[$scope.lastIndex].zone.x;
            let OFFSET_Y = d.y - $scope.product.colors[$scope.selectedImageIndex].images[$scope.lastIndex].zone.y;

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

            arr[$scope.lastIndex] = {
                id: $scope.lastIndex,
                x: position[0].x,
                y: position[0].y,
                width: position[0].width,
                height: position[0].height
            };

            for (var i = 0; i < $scope.response.length; i++) {
                if (typeof $scope.response[i] === 'undefined') {
                    continue;
                }
                var responseId = $scope.response[i].id;
                for (var j = 0; j < arr.length; j++) {
                    if (typeof arr[j] == 'undefined') {
                        continue;
                    }
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
            //console.log(arr);
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
         * construct the message error to display in html element
         */
        function showErrorMessageClass() {
            let parent = $('#designer');
            if (parent.find('.error-message').length > 0) {
                //do nothing
            } else {
                let errorMessageDiv = document.createElement('div');
                errorMessageDiv.className = 'error-message';
                let message = document.createElement('p');
                message.textContent = "! L'image sélectionnée est hors cadre d'impression";
                errorMessageDiv.appendChild(message);
                parent.append(errorMessageDiv);
            }
        }

        /**
         * remove the error-message for the current frame
         */
        function removeErrorMessageClass() {
            let parent = $('#designer');

            if (parent.find('.error-message').length > 0) {
                let messageErrorDiv = parent.find('div.error-message');
                messageErrorDiv.remove();
            }
        }

        /**
         *
         */
        function showErrorClass() {
            $('.product-view-selector li').each(function (i) {
                for (var j = 0; j < $scope.errors.length; j++) {
                    if (typeof $scope.errors[j] == 'undefined') {
                        continue;
                    } else {
                        if (i == $scope.errors[j].frame) {
                            showErrorMessageClass();
                            $(this).addClass("error");
                            $(this).find('.product-thumbnail').css("border-color", "#D9385A");
                        }

                        if ($scope.errors[j].hasError == true) {
                            $('.add-to-cart-button').attr("disabled", "true");
                        }
                    }
                }
            });
        }

        /**
         * showing errors and construct the errors array
         */
        function showWarning() {
            let rect = d3.select('.bg');
            rect.attr("stroke", "#D9385A")
                .attr("stroke-width", 3);

            $('.add-to-cart-button').attr("disabled", "true");

            //update the currentindex with an error
            $scope.errors[currentIndex] = {
                frame: currentIndex, hasError: true
            };

            showErrorClass();
        }

        /**
         *
         */
        function hideWarning() {
            let rect = d3.select('.bg');
            rect.attr("stroke", "black")
                .attr("stroke-width", 2);

            $('.product-view-selector li').each(function (i) {
                if (i == currentIndex) {
                    // console.log($(this));
                    $(this).removeClass("error");
                    $(this).find('.product-thumbnail').css("border-color", "#d3d3d3");
                    $scope.errors.splice(currentIndex);
                }
            });

            removeErrorMessageClass();
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

            /**
             *
             * @type {{width: *, height: *}}
             */
            $scope.imageSizeByFrame[currentIndex] = {
                width: position[0].width,
                height: position[0].height
            };

            if (position[0].x - $scope.product.colors[$scope.selectedImageIndex].images[currentIndex].zone.x < 0 ||
                position[0].y - $scope.product.colors[$scope.selectedImageIndex].images[currentIndex].zone.y < 0 ||
                (position[0].x - $scope.product.colors[$scope.selectedImageIndex].images[currentIndex].zone.x + position[0].width) > $scope.product.colors[$scope.selectedImageIndex].images[currentIndex].zone.width ||
                (position[0].y - $scope.product.colors[$scope.selectedImageIndex].images[currentIndex].zone.y + position[0].height) > $scope.product.colors[$scope.selectedImageIndex].images[currentIndex].zone.height) {
                showWarning();
            } else {
                if (typeof $scope.errors === 'undefined' || $scope.errors.length == 0) {
                    $('.add-to-cart-button').removeAttr("disabled");
                }
                hideWarning();
            }
        }
    }
]);