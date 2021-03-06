"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _epubcfi = require("./epubcfi");

var _epubcfi2 = _interopRequireDefault(_epubcfi);

var _core = require("./utils/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Page List Parser
 * @param {[document]} xml
 */
var PageList = function () {
	function PageList(xml) {
		_classCallCheck(this, PageList);

		this.pages = [];
		this.locations = [];
		this.epubcfi = new _epubcfi2.default();

		this.firstPage = 0;
		this.lastPage = 0;
		this.totalPages = 0;

		this.toc = undefined;
		this.ncx = undefined;

		this.lastPage;
		if (xml) {
			this.pageList = this.parse(xml);
		}

		if (this.pageList && this.pageList.length) {
			this.process(this.pageList);
		}
	}

	/**
  * Parse PageList Xml
  * @param  {document} xml
  */


	_createClass(PageList, [{
		key: "parse",
		value: function parse(xml) {
			var html = (0, _core.qs)(xml, "html");
			var ncx = (0, _core.qs)(xml, "ncx");

			if (html) {
				this.toc = this.parseNav(xml);
			} else if (ncx) {
				// Not supported
				// this.toc = this.parseNcx(xml);
				return;
			}
		}

		/**
   * Parse a Nav PageList
   * @private
   * @param  {document} navHtml
   * @return {PageList.item[]} list
   */

	}, {
		key: "parseNav",
		value: function parseNav(navHtml) {
			var navElement = (0, _core.querySelectorByType)(navHtml, "nav", "page-list");
			var navItems = navElement ? (0, _core.qsa)(navElement, "li") : [];
			var length = navItems.length;
			var i;
			var list = [];
			var item;

			if (!navItems || length === 0) return list;

			for (i = 0; i < length; ++i) {
				item = this.item(navItems[i]);
				list.push(item);
			}

			return list;
		}

		/**
   * Page List Item
   * @private
   * @param  {object} item
   * @return {object} pageListItem
   */

	}, {
		key: "item",
		value: function item(_item) {
			var content = (0, _core.qs)(_item, "a"),
			    href = content.getAttribute("href") || "",
			    text = content.textContent || "",
			    page = parseInt(text),
			    isCfi = href.indexOf("epubcfi"),
			    split,
			    packageUrl,
			    cfi;

			if (isCfi != -1) {
				split = href.split("#");
				packageUrl = split[0];
				cfi = split.length > 1 ? split[1] : false;
				return {
					"cfi": cfi,
					"href": href,
					"packageUrl": packageUrl,
					"page": page
				};
			} else {
				return {
					"href": href,
					"page": page
				};
			}
		}

		/**
   * Process pageList items
   * @private
   * @param  {array} pageList
   */

	}, {
		key: "process",
		value: function process(pageList) {
			pageList.forEach(function (item) {
				this.pages.push(item.page);
				if (item.cfi) {
					this.locations.push(item.cfi);
				}
			}, this);
			this.firstPage = parseInt(this.pages[0]);
			this.lastPage = parseInt(this.pages[this.pages.length - 1]);
			this.totalPages = this.lastPage - this.firstPage;
		}

		/**
   * Replace HREFs with CFI
   * TODO: implement getting CFI from Href
   */

	}, {
		key: "addCFIs",
		value: function addCFIs() {
			this.pageList.forEach(function (pg) {
				if (!pg.cfi) {
					// epubcfi.generateCfiFromHref(pg.href, book).then(function(cfi){
					// 	pg.cfi = cfi;
					// 	pg.packageUrl = book.settings.packageUrl;
					// });
				}
			});
		}

		/*
  EPUBJS.generateCfiFromHref(href, book) {
    var uri = EPUBJS.core.uri(href);
    var path = uri.path;
    var fragment = uri.fragment;
    var spinePos = book.spineIndexByURL[path];
    var loaded;
    var deferred = new RSVP.defer();
    var epubcfi = new EPUBJS.EpubCFI();
    var spineItem;
  	  if(typeof spinePos !== "undefined"){
      spineItem = book.spine[spinePos];
      loaded = book.loadXml(spineItem.url);
      loaded.then(function(doc){
        var element = doc.getElementById(fragment);
        var cfi;
        cfi = epubcfi.generateCfiFromElement(element, spineItem.cfiBase);
        deferred.resolve(cfi);
      });
    }
  	  return deferred.promise;
  }
  */

		/**
   * Get a PageList result from a EpubCFI
   * @param  {string} cfi EpubCFI String
   * @return {string} page
   */

	}, {
		key: "pageFromCfi",
		value: function pageFromCfi(cfi) {
			var pg = -1;

			// Check if the pageList has not been set yet
			if (this.locations.length === 0) {
				return -1;
			}

			// TODO: check if CFI is valid?

			// check if the cfi is in the location list
			// var index = this.locations.indexOf(cfi);
			var index = (0, _core.indexOfSorted)(cfi, this.locations, this.epubcfi.compare);
			if (index != -1) {
				pg = this.pages[index];
			} else {
				// Otherwise add it to the list of locations
				// Insert it in the correct position in the locations page
				//index = EPUBJS.core.insert(cfi, this.locations, this.epubcfi.compare);
				index = (0, _core.locationOf)(cfi, this.locations, this.epubcfi.compare);
				// Get the page at the location just before the new one, or return the first
				pg = index - 1 >= 0 ? this.pages[index - 1] : this.pages[0];
				if (pg !== undefined) {
					// Add the new page in so that the locations and page array match up
					//this.pages.splice(index, 0, pg);
				} else {
					pg = -1;
				}
			}
			return pg;
		}

		/**
   * Get an EpubCFI from a Page List Item
   * @param  {string} pg
   * @return {string} cfi
   */

	}, {
		key: "cfiFromPage",
		value: function cfiFromPage(pg) {
			var cfi = -1;
			// check that pg is an int
			if (typeof pg != "number") {
				pg = parseInt(pg);
			}

			// check if the cfi is in the page list
			// Pages could be unsorted.
			var index = this.pages.indexOf(pg);
			if (index != -1) {
				cfi = this.locations[index];
			}
			// TODO: handle pages not in the list
			return cfi;
		}

		/**
   * Get a Page from Book percentage
   * @param  {number} percent
   * @return {string} page
   */

	}, {
		key: "pageFromPercentage",
		value: function pageFromPercentage(percent) {
			var pg = Math.round(this.totalPages * percent);
			return pg;
		}

		/**
   * Returns a value between 0 - 1 corresponding to the location of a page
   * @param  {int} pg the page
   * @return {number} percentage
   */

	}, {
		key: "percentageFromPage",
		value: function percentageFromPage(pg) {
			var percentage = (pg - this.firstPage) / this.totalPages;
			return Math.round(percentage * 1000) / 1000;
		}

		/**
   * Returns a value between 0 - 1 corresponding to the location of a cfi
   * @param  {string} cfi EpubCFI String
   * @return {number} percentage
   */

	}, {
		key: "percentageFromCfi",
		value: function percentageFromCfi(cfi) {
			var pg = this.pageFromCfi(cfi);
			var percentage = this.percentageFromPage(pg);
			return percentage;
		}
	}, {
		key: "destroy",
		value: function destroy() {
			this.pages = undefined;
			this.locations = undefined;
			this.epubcfi = undefined;

			this.pageList = undefined;

			this.toc = undefined;
			this.ncx = undefined;
		}
	}]);

	return PageList;
}();

exports.default = PageList;
module.exports = exports["default"];