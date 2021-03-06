"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _epubcfi = require("./epubcfi");

var _epubcfi2 = _interopRequireDefault(_epubcfi);

var _hook = require("./utils/hook");

var _hook2 = _interopRequireDefault(_hook);

var _section = require("./section");

var _section2 = _interopRequireDefault(_section);

var _replacements = require("./utils/replacements");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A collection of Spine Items
 */
var Spine = function () {
	function Spine() {
		_classCallCheck(this, Spine);

		this.spineItems = [];
		this.spineByHref = {};
		this.spineById = {};

		this.hooks = {};
		this.hooks.serialize = new _hook2.default();
		this.hooks.content = new _hook2.default();

		// Register replacements
		this.hooks.content.register(_replacements.replaceBase);
		this.hooks.content.register(_replacements.replaceCanonical);

		this.epubcfi = new _epubcfi2.default();

		this.loaded = false;

		this.items = undefined;
		this.manifest = undefined;
		this.spineNodeIndex = undefined;
		this.baseUrl = undefined;
		this.length = undefined;
	}

	/**
  * Unpack items from a opf into spine items
  * @param  {Package} _package
  * @param  {method} resolver URL resolver
  */


	_createClass(Spine, [{
		key: "unpack",
		value: function unpack(_package, resolver) {
			var _this = this;

			this.items = _package.spine;
			this.manifest = _package.manifest;
			this.spineNodeIndex = _package.spineNodeIndex;
			this.baseUrl = _package.baseUrl || _package.basePath || "";
			this.length = this.items.length;

			this.items.forEach(function (item, index) {
				var manifestItem = _this.manifest[item.idref];
				var spineItem;

				item.cfiBase = _this.epubcfi.generateChapterComponent(_this.spineNodeIndex, item.index, item.idref);

				if (item.href) {
					item.url = resolver(item.href, true);
				}

				if (manifestItem) {
					item.href = manifestItem.href;
					item.url = resolver(item.href, true);
					if (manifestItem.properties.length) {
						item.properties.push.apply(item.properties, manifestItem.properties);
					}
				}

				item.prev = function () {
					return this.get(index - 1);
				}.bind(_this);
				item.next = function () {
					return this.get(index + 1);
				}.bind(_this);

				spineItem = new _section2.default(item, _this.hooks);

				_this.append(spineItem);
			});

			this.loaded = true;
		}

		/**
   * Get an item from the spine
   * @param  {[string|int]} target
   * @return {Section} section
   * @example spine.get();
   * @example spine.get(1);
   * @example spine.get("chap1.html");
   * @example spine.get("#id1234");
   */

	}, {
		key: "get",
		value: function get(target) {
			var index = 0;

			if (this.epubcfi.isCfiString(target)) {
				var cfi = new _epubcfi2.default(target);
				index = cfi.spinePos;
			} else if (target && (typeof target === "number" || isNaN(target) === false)) {
				index = target;
			} else if (target && target.indexOf("#") === 0) {
				index = this.spineById[target.substring(1)];
			} else if (target) {
				// Remove fragments
				target = target.split("#")[0];
				index = this.spineByHref[target];
			}

			return this.spineItems[index] || null;
		}

		/**
   * Append a Section to the Spine
   * @private
   * @param  {Section} section
   */

	}, {
		key: "append",
		value: function append(section) {
			var index = this.spineItems.length;
			section.index = index;

			this.spineItems.push(section);

			this.spineByHref[section.href] = index;
			this.spineById[section.idref] = index;

			return index;
		}

		/**
   * Prepend a Section to the Spine
   * @private
   * @param  {Section} section
   */

	}, {
		key: "prepend",
		value: function prepend(section) {
			// var index = this.spineItems.unshift(section);
			this.spineByHref[section.href] = 0;
			this.spineById[section.idref] = 0;

			// Re-index
			this.spineItems.forEach(function (item, index) {
				item.index = index;
			});

			return 0;
		}

		// insert(section, index) {
		//
		// };

		/**
   * Remove a Section from the Spine
   * @private
   * @param  {Section} section
   */

	}, {
		key: "remove",
		value: function remove(section) {
			var index = this.spineItems.indexOf(section);

			if (index > -1) {
				delete this.spineByHref[section.href];
				delete this.spineById[section.idref];

				return this.spineItems.splice(index, 1);
			}
		}

		/**
   * Loop over the Sections in the Spine
   * @return {method} forEach
   */

	}, {
		key: "each",
		value: function each() {
			return this.spineItems.forEach.apply(this.spineItems, arguments);
		}
	}, {
		key: "destroy",
		value: function destroy() {
			this.each(function (section) {
				return section.destroy();
			});

			this.spineItems = undefined;
			this.spineByHref = undefined;
			this.spineById = undefined;

			this.hooks.serialize.clear();
			this.hooks.content.clear();
			this.hooks = undefined;

			this.epubcfi = undefined;

			this.loaded = false;

			this.items = undefined;
			this.manifest = undefined;
			this.spineNodeIndex = undefined;
			this.baseUrl = undefined;
			this.length = undefined;
		}
	}]);

	return Spine;
}();

exports.default = Spine;
module.exports = exports["default"];