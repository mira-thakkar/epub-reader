"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require("../../utils/core");

var _default = require("../default");

var _default2 = _interopRequireDefault(_default);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ContinuousViewManager = function (_DefaultViewManager) {
	_inherits(ContinuousViewManager, _DefaultViewManager);

	function ContinuousViewManager(options) {
		_classCallCheck(this, ContinuousViewManager);

		// DefaultViewManager.apply(this, arguments); // call super constructor.

		var _this = _possibleConstructorReturn(this, (ContinuousViewManager.__proto__ || Object.getPrototypeOf(ContinuousViewManager)).call(this, options));

		_this.name = "continuous";

		_this.settings = (0, _core.extend)(_this.settings || {}, {
			infinite: true,
			overflow: "auto",
			axis: "vertical",
			offset: 500,
			offsetDelta: 250,
			width: undefined,
			height: undefined
		});

		(0, _core.extend)(_this.settings, options.settings || {});

		// Gap can be 0, byt defaults doesn't handle that
		if (options.settings.gap != "undefined" && options.settings.gap === 0) {
			_this.settings.gap = options.settings.gap;
		}

		// this.viewSettings.axis = this.settings.axis;
		_this.viewSettings = {
			ignoreClass: _this.settings.ignoreClass,
			axis: _this.settings.axis,
			layout: _this.layout,
			width: 0,
			height: 0
		};

		_this.scrollTop = 0;
		_this.scrollLeft = 0;
		return _this;
	}

	_createClass(ContinuousViewManager, [{
		key: "display",
		value: function display(section, target) {
			return _default2.default.prototype.display.call(this, section, target).then(function () {
				return this.fill();
			}.bind(this));
		}
	}, {
		key: "fill",
		value: function fill(_full) {
			var full = _full || new _core.defer();

			this.check().then(function (result) {
				if (result) {
					this.fill(full);
				} else {
					full.resolve();
				}
			}.bind(this));

			return full.promise;
		}
	}, {
		key: "moveTo",
		value: function moveTo(offset) {
			// var bounds = this.stage.bounds();
			// var dist = Math.floor(offset.top / bounds.height) * bounds.height;
			var distX = 0,
			    distY = 0;

			var offsetX = 0,
			    offsetY = 0;

			if (this.settings.axis === "vertical") {
				distY = offset.top;
				offsetY = offset.top + this.settings.offset;
			} else {
				distX = Math.floor(offset.left / this.layout.delta) * this.layout.delta;
				offsetX = distX + this.settings.offset;
			}

			return this.check(offsetX, offsetY).then(function () {
				this.scrollBy(distX, distY, true);
			}.bind(this));
		}

		/*
  afterDisplayed(currView){
  	var next = currView.section.next();
  	var prev = currView.section.prev();
  	var index = this.views.indexOf(currView);
  	var prevView, nextView;
  		if(index + 1 === this.views.length && next) {
  		nextView = this.createView(next);
  		this.q.enqueue(this.append.bind(this), nextView);
  	}
  		if(index === 0 && prev) {
  		prevView = this.createView(prev, this.viewSettings);
  		this.q.enqueue(this.prepend.bind(this), prevView);
  	}
  		// this.removeShownListeners(currView);
  	// currView.onShown = this.afterDisplayed.bind(this);
  	this.emit("added", currView.section);
  	}
  */

	}, {
		key: "resize",
		value: function resize(width, height) {

			// Clear the queue
			this.q.clear();

			this._stageSize = this.stage.size(width, height);
			this._bounds = this.bounds();
			console.log("set bounds", this._bounds);

			// Update for new views
			this.viewSettings.width = this._stageSize.width;
			this.viewSettings.height = this._stageSize.height;

			// Update for existing views
			this.views.each(function (view) {
				view.size(this._stageSize.width, this._stageSize.height);
			}.bind(this));

			this.updateLayout();

			// if(this.location) {
			//   this.rendition.display(this.location.start);
			// }

			this.emit("resized", {
				width: this.stage.width,
				height: this.stage.height
			});
		}
	}, {
		key: "onResized",
		value: function onResized(e) {

			// this.views.clear();

			clearTimeout(this.resizeTimeout);
			this.resizeTimeout = setTimeout(function () {
				this.resize();
			}.bind(this), 150);
		}
	}, {
		key: "afterResized",
		value: function afterResized(view) {
			this.emit("resize", view.section);
		}

		// Remove Previous Listeners if present

	}, {
		key: "removeShownListeners",
		value: function removeShownListeners(view) {

			// view.off("shown", this.afterDisplayed);
			// view.off("shown", this.afterDisplayedAbove);
			view.onDisplayed = function () {};
		}

		// append(section){
		// 	return this.q.enqueue(function() {
		//
		// 		this._append(section);
		//
		//
		// 	}.bind(this));
		// };
		//
		// prepend(section){
		// 	return this.q.enqueue(function() {
		//
		// 		this._prepend(section);
		//
		// 	}.bind(this));
		//
		// };

	}, {
		key: "append",
		value: function append(section) {
			var view = this.createView(section);
			this.views.append(view);

			view.onDisplayed = this.afterDisplayed.bind(this);

			return view;
		}
	}, {
		key: "prepend",
		value: function prepend(section) {
			var view = this.createView(section);

			view.on("resized", this.counter.bind(this));

			this.views.prepend(view);

			view.onDisplayed = this.afterDisplayed.bind(this);

			return view;
		}
	}, {
		key: "counter",
		value: function counter(bounds) {

			if (this.settings.axis === "vertical") {
				this.scrollBy(0, bounds.heightDelta, true);
			} else {
				this.scrollBy(bounds.widthDelta, 0, true);
			}
		}
	}, {
		key: "update",
		value: function update(_offset) {
			var container = this.bounds();
			var views = this.views.all();
			var viewsLength = views.length;
			var visible = [];
			var offset = typeof _offset != "undefined" ? _offset : this.settings.offset || 0;
			var isVisible;
			var view;

			var updating = new _core.defer();
			var promises = [];

			for (var i = 0; i < viewsLength; i++) {
				view = views[i];

				isVisible = this.isVisible(view, offset, offset, container);

				if (isVisible === true) {
					if (!view.displayed) {
						promises.push(view.display(this.request).then(function (view) {
							view.show();
						}));
					}
					visible.push(view);
				} else {
					this.q.enqueue(view.destroy.bind(view));

					clearTimeout(this.trimTimeout);
					this.trimTimeout = setTimeout(function () {
						this.q.enqueue(this.trim.bind(this));
					}.bind(this), 250);
				}
			}

			if (promises.length) {
				return Promise.all(promises);
			} else {
				updating.resolve();
				return updating.promise;
			}
		}
	}, {
		key: "check",
		value: function check(_offsetLeft, _offsetTop) {
			var last, first, next, prev;

			var checking = new _core.defer();
			var newViews = [];

			var horizontal = this.settings.axis === "horizontal";
			var delta = this.settings.offset || 0;

			if (_offsetLeft && horizontal) {
				delta = _offsetLeft;
			}

			if (_offsetTop && !horizontal) {
				delta = _offsetTop;
			}

			var bounds = this._bounds; // bounds saved this until resize

			var offset = horizontal ? this.scrollLeft : this.scrollTop;
			var visibleLength = horizontal ? bounds.width : bounds.height;
			var contentLength = horizontal ? this.container.scrollWidth : this.container.scrollHeight;
			console.log(bounds);
			if (offset + visibleLength + delta >= contentLength) {
				last = this.views.last();
				next = last && last.section.next();
				if (next) {
					newViews.push(this.append(next));
				}
			}

			if (offset - delta < 0) {
				first = this.views.first();
				prev = first && first.section.prev();
				if (prev) {
					newViews.push(this.prepend(prev));
				}
			}

			if (newViews.length) {
				// Promise.all(promises)
				// .then(function() {
				// Check to see if anything new is on screen after rendering
				return this.q.enqueue(function () {
					return this.update(delta);
				}.bind(this));

				// }.bind(this));
			} else {
				checking.resolve(false);
				return checking.promise;
			}
		}
	}, {
		key: "trim",
		value: function trim() {
			var task = new _core.defer();
			var displayed = this.views.displayed();
			var first = displayed[0];
			var last = displayed[displayed.length - 1];
			var firstIndex = this.views.indexOf(first);
			var lastIndex = this.views.indexOf(last);
			var above = this.views.slice(0, firstIndex);
			var below = this.views.slice(lastIndex + 1);

			// Erase all but last above
			for (var i = 0; i < above.length - 1; i++) {
				this.erase(above[i], above);
			}

			// Erase all except first below
			for (var j = 1; j < below.length; j++) {
				this.erase(below[j]);
			}

			task.resolve();
			return task.promise;
		}
	}, {
		key: "erase",
		value: function erase(view, above) {
			//Trim

			var prevTop;
			var prevLeft;

			if (this.settings.height) {
				prevTop = this.container.scrollTop;
				prevLeft = this.container.scrollLeft;
			} else {
				prevTop = window.scrollY;
				prevLeft = window.scrollX;
			}

			var bounds = view.bounds();

			this.views.remove(view);

			if (above) {

				if (this.settings.axis === "vertical") {
					this.scrollTo(0, prevTop - bounds.height, true);
				} else {
					this.scrollTo(prevLeft - bounds.width, 0, true);
				}
			}
		}
	}, {
		key: "addEventListeners",
		value: function addEventListeners(stage) {

			window.addEventListener("unload", function (e) {
				this.ignore = true;
				// this.scrollTo(0,0);
				this.destroy();
			}.bind(this));

			this.addScrollListeners();
		}
	}, {
		key: "addScrollListeners",
		value: function addScrollListeners() {
			var scroller;

			this.tick = _core.requestAnimationFrame;

			if (this.settings.height) {
				this.prevScrollTop = this.container.scrollTop;
				this.prevScrollLeft = this.container.scrollLeft;
			} else {
				this.prevScrollTop = window.scrollY;
				this.prevScrollLeft = window.scrollX;
			}

			this.scrollDeltaVert = 0;
			this.scrollDeltaHorz = 0;

			if (this.settings.height) {
				scroller = this.container;
				this.scrollTop = this.container.scrollTop;
				this.scrollLeft = this.container.scrollLeft;
			} else {
				scroller = window;
				this.scrollTop = window.scrollY;
				this.scrollLeft = window.scrollX;
			}

			scroller.addEventListener("scroll", this.onScroll.bind(this));

			// this.tick.call(window, this.onScroll.bind(this));

			this.scrolled = false;
		}
	}, {
		key: "removeEventListeners",
		value: function removeEventListeners() {
			var scroller;

			if (this.settings.height) {
				scroller = this.container;
			} else {
				scroller = window;
			}

			scroller.removeEventListener("scroll", this.onScroll.bind(this));
		}
	}, {
		key: "onScroll",
		value: function onScroll() {
			var scrollTop = void 0;
			var scrollLeft = void 0;

			// if(!this.ignore) {

			if (this.settings.height) {
				scrollTop = this.container.scrollTop;
				scrollLeft = this.container.scrollLeft;
			} else {
				scrollTop = window.scrollY;
				scrollLeft = window.scrollX;
			}

			this.scrollTop = scrollTop;
			this.scrollLeft = scrollLeft;

			if (!this.ignore) {

				if (this.scrollDeltaVert === 0 && this.scrollDeltaHorz === 0 || this.scrollDeltaVert > this.settings.offsetDelta || this.scrollDeltaHorz > this.settings.offsetDelta) {

					this.q.enqueue(function () {
						this.check();
					}.bind(this));
					// this.check();

					this.scrollDeltaVert = 0;
					this.scrollDeltaHorz = 0;

					this.emit("scroll", {
						top: scrollTop,
						left: scrollLeft
					});

					clearTimeout(this.afterScrolled);
					this.afterScrolled = setTimeout(function () {
						this.emit("scrolled", {
							top: this.scrollTop,
							left: this.scrollLeft
						});
					}.bind(this));
				}
			} else {
				this.ignore = false;
			}

			this.scrollDeltaVert += Math.abs(scrollTop - this.prevScrollTop);
			this.scrollDeltaHorz += Math.abs(scrollLeft - this.prevScrollLeft);

			this.prevScrollTop = scrollTop;
			this.prevScrollLeft = scrollLeft;

			clearTimeout(this.scrollTimeout);
			this.scrollTimeout = setTimeout(function () {
				this.scrollDeltaVert = 0;
				this.scrollDeltaHorz = 0;
			}.bind(this), 150);

			this.scrolled = false;
			// }

			// this.tick.call(window, this.onScroll.bind(this));
		}
	}, {
		key: "updateLayout",
		value: function updateLayout() {

			if (!this.stage) {
				return;
			}

			if (this.settings.axis === "vertical") {
				this.layout.calculate(this._stageSize.width, this._stageSize.height);
			} else {
				this.layout.calculate(this._stageSize.width, this._stageSize.height, this.settings.gap);

				// Set the look ahead offset for what is visible
				this.settings.offset = this.layout.delta;

				this.stage.addStyleRules("iframe", [{ "margin-right": this.layout.gap + "px" }]);
			}

			// Set the dimensions for views
			this.viewSettings.width = this.layout.width;
			this.viewSettings.height = this.layout.height;

			this.setLayout(this.layout);
		}
	}, {
		key: "next",
		value: function next() {

			if (this.settings.axis === "horizontal") {

				this.scrollLeft = this.container.scrollLeft;

				if (this.container.scrollLeft + this.container.offsetWidth + this.layout.delta < this.container.scrollWidth) {
					this.scrollBy(this.layout.delta, 0, true);
				} else {
					this.scrollTo(this.container.scrollWidth - this.layout.delta, 0, true);
				}
			} else {
				this.scrollBy(0, this.layout.height, true);
			}

			this.q.enqueue(function () {
				this.check();
			}.bind(this));
		}
	}, {
		key: "prev",
		value: function prev() {
			if (this.settings.axis === "horizontal") {
				this.scrollBy(-this.layout.delta, 0, true);
			} else {
				this.scrollBy(0, -this.layout.height, true);
			}

			this.q.enqueue(function () {
				this.check();
			}.bind(this));
		}
	}, {
		key: "updateFlow",
		value: function updateFlow(flow) {
			var axis = flow === "paginated" ? "horizontal" : "vertical";

			this.settings.axis = axis;

			this.viewSettings.axis = axis;

			this.settings.overflow = flow === "paginated" ? "hidden" : "auto";

			// this.views.each(function(view){
			// 	view.setAxis(axis);
			// });

			if (this.settings.axis === "vertical") {
				this.settings.infinite = true;
			} else {
				this.settings.infinite = false;
			}
		}
	}]);

	return ContinuousViewManager;
}(_default2.default);

exports.default = ContinuousViewManager;
module.exports = exports["default"];