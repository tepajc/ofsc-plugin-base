/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
define([
    'jquery'
], function (
    $
) {

        var signature = function(canvas)
        {

            var empty = true;

            //initialization
            if (!canvas)
            {
                throw new Error("Cannot find canvas element");
            }

            if (!canvas.getContext)
            {
                throw new Error("Canvas' getContext method isn't supported");
            }

            var context = canvas.getContext("2d");

            if (!context)
            {
                throw new Error("Failed to get canvas' 2d context");
            }
            // We set relative position for correct resolving layerX/layerY from mouse event
            canvas.style.position = 'relative';

            //var w = canvas.parentNode ? canvas.parentNode.offsetWidth : 450;
            //w = Math.min(w, 450);
            var w = 450;
            var h = w * 2 / 3;
            canvas.width = w;
            canvas.height = h;

            context.fillStyle = "#fff";
            context.strokeStyle = "#444";
            context.lineWidth = 1.5;
            context.lineCap = "round";

            context.fillRect(0, 0, canvas.width, canvas.height);

            canvas.setAttribute('data-blank', canvas.toDataURL());

            //-- PRIVATE METHODS AND PROPERTIES SECTION --//
           var isTouch = ('ontouchstart' in window) ||
           window.DocumentTouch &&
           document instanceof DocumentTouch || false;

            //disable saving empty canvas
            var disableSave = true;
            var pixels = [];
            var cpixels = [];
            var xyLast = {};
            var xyAddLast = {};
            var calculate = false;
            var offsetx = 0;
            var offsety = 0;
            // var isTouch = toa.dom.isTouch;
            var isPointer = window.PointerEvent;
            var canvasDataChanged = true;
            var canvasData = null;

            /*var methods = {
                getLayerCoords: function (data, coord)
                {
                    coord.x = data.layerX;
                    coord.y = data.layerY;
                }
            };*/
            /*
             * @description Resolve layer coordinates from event data and store it to passed object
             * @function
             */
            var getLayerCoords = function (data, coord)
            {
                coord.x = data.layerX;
                coord.y = data.layerY;
            };
            /*
             * @description Resolve offset coordinates from event data and store it to passed object
             * @function
             */
            var getOffsetCoords = function (data, coord)
            {
                coord.x = data.offsetX;
                coord.y = data.offsetY;
            };
            /*
             * @description Resolve client coordinates from event data and store it to passed object
             * @function
             */
            var getClientCoords = function (data, coord)
            {
                coord.x = data.clientX - offsetx;
                coord.y = data.clientY - offsety;
            };
            /*
             * @description Resolve page coordinates from event data and store it to passed object
             * @function
             */
            var getPageCoords = function (data, coord)
            {
                coord.x = data.pageX - offsetx;
                coord.y = data.pageY - offsety;
            };

            var getClickCoordinates = function getClickCoordinates (event)
            {
                var coord =
                {
                    x : null,
                    y : null
                };
                /**
                 * When we handle first mouse event we chose function for resolving coordinate
                 * If event has pair layerX/layerY or offsetX/offsetY we resolve coordinates from these properties
                 * because they are no calculate relative canvas element
                 * In other cases we serarch for coordinates in properties whcih specified in w3c documentation
                 */
                if (getClickCoordinates.resolve === undefined)
                {
                    //TODO not working correctly in iframe
                    // if ((event.layerX !== undefined) && (event.layerY !== undefined))
                    // {
                    //     getClickCoordinates.resolve = getLayerCoords;
                    // }
                     if ((event.offsetX !== undefined) && (event.offsetY !== undefined))
                    {
                        getClickCoordinates.resolve = getOffsetCoords;
                    }
                    else if ((event.clientX !== undefined) && (event.clientY !== undefined))
                    {
                        getClickCoordinates.resolve = getClientCoords;
                    }
                    else if ((event.pageX !== undefined) && (event.pageY !== undefined))
                    {
                        getClickCoordinates.resolve = getPageCoords;
                    }
                }

                getClickCoordinates.resolve(event, coord);

                if ( (!coord.x && coord.x != 0) || (!coord.y && coord.y != 0) )
                {
                    return false;
                }

                var scaleFactor = canvas.offsetWidth / canvas.width;
                if (scaleFactor != 0) {
                    coord.x /= scaleFactor;
                    coord.y /= scaleFactor;
                }

                return coord;
            };

            var getTochCoordinates = function (event)
            {
                var coord =
                {
                    x : null,
                    y : null
                };

                if (event.changedTouches && event.changedTouches[0])
                {
                    getPageCoords(event.changedTouches[0], coord);
                }

                if ( (!coord.x && coord.x != 0) || (!coord.y && coord.y != 0) )
                {
                    return false;
                }

                var scaleFactor = canvas.offsetWidth / canvas.width;
                if (scaleFactor != 0) {
                    coord.x /= scaleFactor;
                    coord.y /= scaleFactor;
                }

                return coord;
            };

            var getPointerCoordinates = function (event)
            {
                var coord =
                    {
                        x : null,
                        y : null
                    };

                /**
                 * Fires only for PointerType "pen" and "touch" events
                 * "mouse" PointerType event ignored
                 */
                if (event.pointerType == "pen" || event.pointerType == "touch")
                {
                    if (getPointerCoordinates.resolve === undefined)
                    {
                        if ((event.pageX !== undefined) && (event.pageY !== undefined))
                        {
                            getPointerCoordinates.resolve = getPageCoords;
                        }
                    }

                    getPointerCoordinates.resolve(event, coord);

                    if ( (!coord.x && coord.x != 0) || (!coord.y && coord.y != 0) )
                    {
                        return false;
                    }

                    var scaleFactor = canvas.offsetWidth / canvas.width;
                    if (scaleFactor != 0) {
                        coord.x /= scaleFactor;
                        coord.y /= scaleFactor;
                    }

                    return coord;
                }

            };

            if (isTouch)
            {
                var onTouchStart = onStart.bind(null, getTochCoordinates),
                    onTouchMove  = onMove.bind(null, getTochCoordinates),
                    onTouchEnd   = onEnd;

                if (isPointer) {
                    var onPointerStart = onStart.bind(null, getPointerCoordinates),
                        onPointerMove  = onMove.bind(null, getPointerCoordinates),
                        onPointerEnd   = onEnd;
                }
            }
            else
            {
                var onMouseDown = onStart.bind(null, getClickCoordinates),
                    onMouseMove = onMove.bind(null, getClickCoordinates),
                    onMouseUp   = onEnd;
            }

            function removeEventListeners()
            {
                canvas.removeEventListener('mousemove', onMouseMove);
                canvas.removeEventListener('mouseup',   onMouseUp);

                canvas.removeEventListener('touchmove', onTouchMove);
                canvas.removeEventListener('touchend',  onTouchEnd);
                canvas.removeEventListener('touchcancel',  onTouchEnd);

                document.body.removeEventListener('mouseup',  onMouseUp);

                document.body.removeEventListener('touchend', onTouchEnd);
                document.body.removeEventListener('touchcancel',  onTouchEnd);

                /**
                 * canvas Pointer event listeners
                 */
                canvas.removeEventListener('pointermove', onPointerMove);

                canvas.removeEventListener('pointercancel', onPointerEnd);
                canvas.removeEventListener('pointerup', onPointerEnd);

                /**
                 * This block required not to lose coordinates drawing
                 * outside the signature box
                 */
                document.body.removeEventListener('pointerup',  onPointerEnd);

                document.body.removeEventListener('pointermove', onPointerMove);
                document.body.removeEventListener('pointerenter', onPointerMove);
            }

            function attachEventListeners()
            {
                canvas.addEventListener('mousemove', onMouseMove, false);
                canvas.addEventListener('mouseup',   onMouseUp,   false);

                canvas.addEventListener('touchmove', onTouchMove, false);
                canvas.addEventListener('touchend',  onTouchEnd,   false);
                canvas.addEventListener('touchcancel',  onTouchEnd,   false);

                /**
                 * This block required not to lose coordinates drawing
                 * outside the signature box
                 */
                document.body.addEventListener('mouseup',  onMouseUp, false);

                document.body.addEventListener('touchend', onTouchEnd, false);
                document.body.addEventListener('touchcancel',  onTouchEnd);

                /**
                 * canvas Pointer event listeners
                 */
                canvas.addEventListener('pointermove', onPointerMove, false);

                canvas.addEventListener('pointercancel', onPointerEnd, false);
                canvas.addEventListener('pointerup', onPointerEnd, false);


                document.body.addEventListener('pointerup',  onPointerEnd, false);

                document.body.addEventListener('pointermove', onPointerMove, false);
                document.body.addEventListener('pointerenter', onPointerMove, false);

            }

            function onStart(getCoordinates, event)
            {
                event.preventDefault();
                event.stopPropagation();

                var offset = $(canvas).offset();
                offsetx = offset.left;
                offsety = offset.top;

                attachEventListeners();

                empty = false;

                var xy = getCoordinates(event);
                if (!xy)
                {
                    return;
                }
                context.beginPath();
                pixels.push('moveStart');
                context.moveTo(xy.x, xy.y);
                pixels.push(xy.x, xy.y);
                xyLast = xy;
            }

            function _resetEmpty(emptyState)
            {
                empty = !!emptyState;
            }

            function onMove (getCoordinates, event, finish)
            {
                event.preventDefault();
                event.stopPropagation();

                var xy = getCoordinates(event);
                if(!xy)
                {
                    return;
                }
                var xyAdd = {
                    x: (xyLast.x + xy.x) / 2,
                    y: (xyLast.y + xy.y) / 2
                };

                if (calculate)
                {
                    var xLast = (xyAddLast.x + xyLast.x + xyAdd.x) / 3;
                    var yLast = (xyAddLast.y + xyLast.y + xyAdd.y) / 3;
                    pixels.push(xLast, yLast);
                }
                else
                {
                    calculate = true;
                }

                context.quadraticCurveTo(xyLast.x,xyLast.y,xyAdd.x, xyAdd.y);
                pixels.push(xyAdd.x, xyAdd.y);
                context.stroke();
                context.beginPath();
                context.moveTo(xyAdd.x, xyAdd.y);
                xyAddLast = xyAdd;
                xyLast = xy;

            }

            function onEnd (event)
            {

                removeEventListeners();
                disableSave = false;
                context.stroke();
                pixels.push('e');
                calculate = false;
                touchType = 0;
                canvasDataChanged = true;
                canvasData = null;
            }

            canvas.addEventListener('mousedown',  onMouseDown, false);
            canvas.addEventListener('touchstart', onTouchStart, false);
            canvas.addEventListener('pointerdown', onPointerStart, false);

            var that =
            {
                clear: function()
                {
                    context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    pixels = [];

                    disableSave = true;
                    empty = true;
                    canvasDataChanged = true;
                    canvasData = null;
                },

                getDataString: function()
                {
                    if (canvasDataChanged)
                    {
                        canvasData = canvas.toDataURL();
                        canvasDataChanged = false;
                    }

                    return canvasData;
                },

                getPixels: function()
                {
                    return (pixels.join(", "));
                },

                isEmpty: function()
                {
                    return empty;
                },

                resetEmpty: function(state)
                {
                    _resetEmpty(state);
                }
            };

            return that;
        };

        //for compatibility

        if (window)
        {
            window.signature = signature;
        }
        else
        {
            window.MobileSignature = signature;
        }

    return signature;
});
