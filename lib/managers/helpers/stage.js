"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require("../../utils/core");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Stage = function () {
	function Stage(_options) {
		_classCallCheck(this, Stage);

		this.settings = _options || {};
		this.id = "epubjs-container-" + (0, _core.uuid)();

		this.container = this.create(this.settings);

		if (this.settings.hidden) {
			this.wrapper = this.wrap(this.container);
		}
	}

	/*
 * Creates an element to render to.
 * Resizes to passed width and height or to the elements size
 */


	_createClass(Stage, [{
		key: "create",
		value: function create(options) {
			var height = options.height; // !== false ? options.height : "100%";
			var width = options.width; // !== false ? options.width : "100%";
			var overflow = options.overflow || false;
			var axis = options.axis || "vertical";

			if (options.height && (0, _core.isNumber)(options.height)) {
				height = options.height + "px";
			}

			if (options.width && (0, _core.isNumber)(options.width)) {
				width = options.width + "px";
			}

			// Create new container element
			var container = document.createElement("div");

			container.id = this.id;
			container.classList.add("epub-container");

			// Style Element
			// container.style.fontSize = "0";
			container.style.wordSpacing = "0";
			container.style.lineHeight = "0";
			container.style.verticalAlign = "top";

			if (axis === "horizontal") {
				container.style.whiteSpace = "nowrap";
			}

			if (width) {
				container.style.width = width;
			}

			if (height) {
				container.style.height = height;
			}

			if (overflow) {
				container.style.overflow = overflow;
			}

			return container;
		}
	}, {
		key: "wrap",
		value: function wrap(container) {
			var wrapper = document.createElement("div");

			wrapper.style.visibility = "hidden";
			wrapper.style.overflow = "hidden";
			wrapper.style.width = "0";
			wrapper.style.height = "0";

			wrapper.appendChild(container);
			return wrapper;
		}
	}, {
		key: "getElement",
		value: function getElement(_element) {
			var element;

			if ((0, _core.isElement)(_element)) {
				element = _element;
			} else if (typeof _element === "string") {
				element = document.getElementById(_element);
			}

			if (!element) {
				throw new Error("Not an Element");
			}

			return element;
		}
	}, {
		key: "attachTo",
		value: function attachTo(what) {

			var element = this.getElement(what);
			var base;

			if (!element) {
				return;
			}

			if (this.settings.hidden) {
				base = this.wrapper;
			} else {
				base = this.container;
			}

			element.appendChild(base);

			this.element = element;

			return element;
		}
	}, {
		key: "getContainer",
		value: function getContainer() {
			return this.container;
		}
	}, {
		key: "onResize",
		value: function onResize(func) {
			// Only listen to window for resize event if width and height are not fixed.
			// This applies if it is set to a percent or auto.
			if (!(0, _core.isNumber)(this.settings.width) || !(0, _core.isNumber)(this.settings.height)) {
				window.addEventListener("resize", func, false);
			}
		}
	}, {
		key: "size",
		value: function size(width, height) {
			var bounds;
			// var width = _width || this.settings.width;
			// var height = _height || this.settings.height;

			// If width or height are set to false, inherit them from containing element
			if (width === null) {
				bounds = this.element.getBoundingClientRect();

				if (bounds.width) {
					width = bounds.width;
					this.container.style.width = bounds.width + "px";
				}
			}

			if (height === null) {
				bounds = bounds || this.element.getBoundingClientRect();

				if (bounds.height) {
					height = bounds.height;
					this.container.style.height = bounds.height + "px";
				}
			}

			if (!(0, _core.isNumber)(width)) {
				bounds = this.container.getBoundingClientRect();
				width = bounds.width;
				//height = bounds.height;
			}

			if (!(0, _core.isNumber)(height)) {
				bounds = bounds || this.container.getBoundingClientRect();
				//width = bounds.width;
				height = bounds.height;
			}

			this.containerStyles = window.getComputedStyle(this.container);

			this.containerPadding = {
				left: parseFloat(this.containerStyles["padding-left"]) || 0,
				right: parseFloat(this.containerStyles["padding-right"]) || 0,
				top: parseFloat(this.containerStyles["padding-top"]) || 0,
				bottom: parseFloat(this.containerStyles["padding-bottom"]) || 0
			};

			return {
				width: width - this.containerPadding.left - this.containerPadding.right,
				height: height - this.containerPadding.top - this.containerPadding.bottom
			};
		}
	}, {
		key: "bounds",
		value: function bounds() {
			var box = this.container && this.container.getBoundingClientRect();
			if (!box || !box.width || !box.height) {
				return (0, _core.windowBounds)();
			} else {
				return box;
			}
		}
	}, {
		key: "getSheet",
		value: function getSheet() {
			var style = document.createElement("style");

			// WebKit hack --> https://davidwalsh.name/add-rules-stylesheets
			style.appendChild(document.createTextNode(""));

			document.head.appendChild(style);

			return style.sheet;
		}
	}, {
		key: "addStyleRules",
		value: function addStyleRules(selector, rulesArray) {
			var scope = "#" + this.id + " ";
			var rules = "";

			if (!this.sheet) {
				this.sheet = this.getSheet();
			}

			rulesArray.forEach(function (set) {
				for (var prop in set) {
					if (set.hasOwnProperty(prop)) {
						rules += prop + ":" + set[prop] + ";";
					}
				}
			});

			this.sheet.insertRule(scope + selector + " {" + rules + "}", 0);
		}
	}, {
		key: "destroy",
		value: function destroy() {
			var base;

			if (this.element) {

				if (this.settings.hidden) {
					base = this.wrapper;
				} else {
					base = this.container;
				}

				if (this.element.contains(this.container)) {
					this.element.removeChild(this.container);
				}
			}
		}
	}]);

	return Stage;
}();

exports.default = Stage;
module.exports = exports["default"];