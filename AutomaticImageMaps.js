/*
 *
 * Automatically Create Image Maps for Images
 *
 */


function _automaticallyCreateLabels(src) {
	return [{'topleft': {'y': 1723, 'x': 1275}, 'confidence': 0.86230516, 'bottomright': {'y': 5276, 'x': 3252}, 'label': 'person'}, {'topleft': {'y': 1629, 'x': 2817}, 'confidence': 0.87317395, 'bottomright': {'y': 5276, 'x': 5112}, 'label': 'person'}, {'topleft': {'y': 2122, 'x': 4563}, 'confidence': 0.78930086, 'bottomright': {'y': 5276, 'x': 6646}, 'label': 'person'}, {'topleft': {'y': 2716, 'x': 3842}, 'confidence': 0.26768887, 'bottomright': {'y': 3280, 'x': 4206}, 'label': 'tie'}, {'topleft': {'y': 0, 'x': 2821}, 'confidence': 0.38086066, 'bottomright': {'y': 2838, 'x': 5275}, 'label': 'pottedplant'}]
	return [{'topleft': {'y': 136, 'x': 93}, 'confidence': 0.82764685, 'bottomright': {'y': 566, 'x': 433}, 'label': 'cat'}, {'topleft': {'y': 36, 'x': 401}, 'confidence': 0.84778845, 'bottomright': {'y': 558, 'x': 882}, 'label': 'dog'}]
	// return false;
}

// Add attribute to an element
function _addAttribute(element, attribute, value) {
	var attr = document.createAttribute(attribute);       
	attr.value = value;
	element.setAttributeNode(attr);
	return element;
}

// Insert a node after another
function _insertAfter(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}

/*! Adapted from Image Map Resizer
 *  Copyright: (c) 2014-15 David J. Bradshaw
 *  License: MIT
 */
(function(){
    'use strict';

    function scaleImageMap(){

        function resizeMap() {
            function resizeAreaTag(cachedAreaCoords,idx){
                function scale(coord){
                    var dimension = ( 1 === (isWidth = 1-isWidth) ? 'width' : 'height' );
                    return Math.floor(Number(coord) * scallingFactor[dimension]);
                }

                var isWidth = 0;

                areas[idx].coords = cachedAreaCoords.split(',').map(scale).join(',');
            }

            var scallingFactor = {
                width  : image.width  / image.naturalWidth,
                height : image.height / image.naturalHeight
            };

            cachedAreaCoordsArray.forEach(resizeAreaTag);
        }

        function getCoords(e){
            //Normalize coord-string to csv format without any space chars
            return e.coords.replace(/ *, */g,',').replace(/ +/g,',');
        }

        function debounce() {
            clearTimeout(timer);
            timer = setTimeout(resizeMap, 250);
        }

        function start(){
            if ((image.width !== image.naturalWidth) || (image.height !== image.naturalHeight)) {
                resizeMap();
            }
        }

        function addEventListeners(){
            image.addEventListener('load',  resizeMap, false); //Detect late image loads in IE11
            window.addEventListener('focus',  resizeMap, false); //Cope with window being resized whilst on another tab
            window.addEventListener('resize', debounce,  false);
            window.addEventListener('readystatechange', resizeMap,  false);
            document.addEventListener('fullscreenchange', resizeMap,  false);
        }

        function beenHere(){
            return ('function' === typeof map._resize);
        }

        function setup(){
            areas                 = map.getElementsByTagName('area');
            cachedAreaCoordsArray = Array.prototype.map.call(areas, getCoords);
            image                 = document.querySelector('img[usemap="#'+map.name+'"]');
            map._resize           = resizeMap; //Bind resize method to HTML map element
        }
        var
            /*jshint validthis:true */
            map   = this,
            areas = null, cachedAreaCoordsArray = null, image = null, timer = null;

        if (!beenHere()){
            setup();
            addEventListeners();
            start();
        } else {
            map._resize(); //Already setup, so just resize map
        }
    }

    function factory(){
        function chkMap(element){
            if(!element.tagName) {
                throw new TypeError('Object is not a valid DOM element');
            } else if ('MAP' !== element.tagName.toUpperCase()) {
                throw new TypeError('Expected <MAP> tag, found <'+element.tagName+'>.');
            }
        }

        function init(element){
            if (element){
                chkMap(element);
                scaleImageMap.call(element);
                maps.push(element);
            }
        }

        var maps;

        return function imageMapResizeF(target){
            maps = [];  // Only return maps from this call

            switch (typeof(target)){
                case 'undefined':
                case 'string':
                    Array.prototype.forEach.call(document.querySelectorAll(target||'map'),init);
                    break;
                case 'object':
                    init(target);
                    break;
                default:
                    throw new TypeError('Unexpected data type ('+typeof target+').');
            }

            return maps;
        };
    }

    if (typeof define === 'function' && define.amd) {
        define([],factory);
    } else if (typeof module === 'object' && typeof module.exports === 'object'){
        module.exports = factory(); //Node for browserfy
    } else {
        window.imageMapResize = factory();
    }
})();


// Automatically generate and apply image maps to images
var generateImageMaps = function (selector) {
    var self = this;

    if (!self) { return new ImageMap(selector); }

    self.selector = selector instanceof Array ? selector : [].slice.call(document.querySelectorAll(selector));

    (self.addMaps = function () {
        self.selector.forEach(function (val) {
            var img = val;
			var img_src = img.src;
			labels = _automaticallyCreateLabels(img_src);

			if (!labels) { return; }

            var image_href = "";
            // If the image has a link, then set all the links in the image map to be that link
            if (img.parentElement.tagName === "A"){
            	image_href = img.parentElement.href;
            } else {
            	image_href = null;
            }

			var newMap = document.createElement("map");	
            // Add usemap attribute- set to #labeled_{img_src}
            _addAttribute(img, "usemap", "#labeled_"+img_src); 
        	_addAttribute(newMap, "name", "labeled_"+img_src);
		
            labels.forEach(function (label) {
            	var newArea = document.createElement("area");
				_addAttribute(newArea, "shape", "rect");
				
				// if the image is wrapped in a link set all the area to that link
				// otherwise set a dummy link
				// need to have link for voiceover to read!
				if (image_href) {
					_addAttribute(newArea, "href", image_href);
				} else {
					_addAttribute(newArea, "href", "#"+label['label']);
					_addAttribute(newArea, "onclick", "return false;");
				}

				var x1 = label['topleft']['x'],
					y1 = label['topleft']['y'],
					x2 = label['bottomright']['x'],
					y2 = label['bottomright']['y'] ;
				_addAttribute(newArea, "coords", [x1,y1,x2,y2].join());
				_addAttribute(newArea, "alt", label['label']);

				newMap.appendChild(newArea);
            });
            _insertAfter(newMap, img);
        });
    })();
	imageMapResize();
};

// When document is loaded make all image maps responsive
document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    generateImageMaps('img');
  }
};

