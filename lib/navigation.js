"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require("./utils/core");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Navigation Parser
 * @param {document} xml navigation html / xhtml / ncx
 */
var Navigation = function () {
	function Navigation(xml) {
		_classCallCheck(this, Navigation);

		this.toc = [];
		this.tocByHref = {};
		this.tocById = {};

		if (xml) {
			this.parse(xml);
		}
	}

	/**
  * Parse out the navigation items
  * @param {document} xml navigation html / xhtml / ncx
  */


	_createClass(Navigation, [{
		key: "parse",
		value: function parse(xml) {
			var isXml = xml.nodeType;
			var html = void 0;
			var ncx = void 0;

			if (isXml) {
				html = (0, _core.qs)(xml, "html");
				ncx = (0, _core.qs)(xml, "ncx");
			}

			if (!isXml) {
				this.toc = this.load(xml);
			} else if (html) {
				this.toc = this.parseNav(xml);
			} else if (ncx) {
				this.toc = this.parseNcx(xml);
			}

			this.unpack(this.toc);
		}

		/**
   * Unpack navigation items
   * @private
   * @param  {array} toc
   */

	}, {
		key: "unpack",
		value: function unpack(toc) {
			var item;

			for (var i = 0; i < toc.length; i++) {
				item = toc[i];
				this.tocByHref[item.href] = i;
				this.tocById[item.id] = i;
			}
		}

		/**
   * Get an item from the navigation
   * @param  {string} target
   * @return {object} navItems
   */

	}, {
		key: "get",
		value: function get(target) {
			var index;

			if (!target) {
				return this.toc;
			}

			if (target.indexOf("#") === 0) {
				index = this.tocById[target.substring(1)];
			} else if (target in this.tocByHref) {
				index = this.tocByHref[target];
			}

			return this.toc[index];
		}
	}, {
		key: "createTocItem",
		value: function createTocItem(linkElement, id) {
			var _this = this;

			var list = [],
			    tocLinkElms = linkElement.childNodes,
			    tocLinkArray = Array.prototype.slice.call(tocLinkElms);

			var index = id ? id : 0;
			tocLinkArray.forEach(function (linkElm) {
				if (linkElm.nodeName === 'li') {
					var tocLink = (0, _core.qs)(linkElm, 'a'),
					    tocLinkData = {
						id: -1,
						href: tocLink.getAttribute('href'),
						label: tocLink.textContent,
						parent: null
					},
					    subItemElm = (0, _core.qs)(linkElm, 'ol');
					index++;
					tocLinkData.id = index;
					if (id) {
						tocLinkData.parent = id;
					}
					list.push(tocLinkData);
					if (subItemElm) {
						var subitems = _this.createTocItem(subItemElm, index);
						if (subitems && subitems.length > 0) {
							index = index + subitems.length;
							list = list.concat(subitems);
						}
					}
				}
			});
			return list;
		}

		/**
   * Parse from a Epub > 3.0 Nav
   * @private
   * @param  {document} navHtml
   * @return {array} navigation list
   */

	}, {
		key: "parseNav",
		value: function parseNav(navHtml) {
			var navElement = (0, _core.querySelectorByType)(navHtml, "nav", "toc");
			var tocItems = (0, _core.qs)(navElement, "ol");
			return this.createTocItem(tocItems);
		}

		/**
   * Create a navItem
   * @private
   * @param  {element} item
   * @return {object} navItem
   */

	}, {
		key: "navItem",
		value: function navItem(item) {
			var id = item.getAttribute("id") || false,
			    content = (0, _core.qs)(item, "a"),
			    src = content.getAttribute("href") || "",
			    text = content.textContent || "",
			    subitems = [],
			    parentNode = item.parentNode,
			    parent;

			if (parentNode && parentNode.nodeName === "navPoint") {
				parent = parentNode.getAttribute("id");
			}

			return {
				"id": id,
				"href": src,
				"label": text,
				"subitems": subitems,
				"parent": parent
			};
		}

		/**
   * Parse from a Epub > 3.0 NC
   * @private
   * @param  {document} navHtml
   * @return {array} navigation list
   */

	}, {
		key: "parseNcx",
		value: function parseNcx(tocXml) {
			var navPoints = (0, _core.qsa)(tocXml, "navPoint");
			var length = navPoints.length;
			var i;
			var toc = {};
			var list = [];
			var item, parent;

			if (!navPoints || length === 0) return list;

			for (i = 0; i < length; ++i) {
				item = this.ncxItem(navPoints[i]);
				toc[item.id] = item;
				if (!item.parent) {
					list.push(item);
				} else {
					parent = toc[item.parent];
					parent.subitems.push(item);
				}
			}

			return list;
		}

		/**
   * Create a ncxItem
   * @private
   * @param  {element} item
   * @return {object} ncxItem
   */

	}, {
		key: "ncxItem",
		value: function ncxItem(item) {
			var id = item.getAttribute("id") || false,
			    content = (0, _core.qs)(item, "content"),
			    src = content.getAttribute("src"),
			    navLabel = (0, _core.qs)(item, "navLabel"),
			    text = navLabel.textContent ? navLabel.textContent : "",
			    subitems = [],
			    parentNode = item.parentNode,
			    parent;

			if (parentNode && parentNode.nodeName === "navPoint") {
				parent = parentNode.getAttribute("id");
			}

			return {
				"id": id,
				"href": src,
				"label": text,
				"subitems": subitems,
				"parent": parent
			};
		}

		/**
   * Load Spine Items
   * @param  {object} json the items to be loaded
   */

	}, {
		key: "load",
		value: function load(json) {
			var _this2 = this;

			return json.map(function (item) {
				item.label = item.title;
				if (item.children) {
					item.subitems = _this2.load(item.children);
				}
				return item;
			});
		}

		/**
   * forEach pass through
   * @param  {Function} fn function to run on each item
   * @return {method} forEach loop
   */

	}, {
		key: "forEach",
		value: function forEach(fn) {
			return this.toc.forEach(fn);
		}
	}]);

	return Navigation;
}();

exports.default = Navigation;
module.exports = exports["default"];