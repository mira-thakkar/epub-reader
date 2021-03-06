"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

require("url-polyfill");

var _book = require("./book");

var _book2 = _interopRequireDefault(_book);

var _epubcfi = require("./epubcfi");

var _epubcfi2 = _interopRequireDefault(_epubcfi);

var _rendition = require("./rendition");

var _rendition2 = _interopRequireDefault(_rendition);

var _contents = require("./contents");

var _contents2 = _interopRequireDefault(_contents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a new Book
 * @param {string|ArrayBuffer} url URL, Path or ArrayBuffer
 * @param {object} options to pass to the book
 * @returns {Book} a new Book object
 * @example ePub("/path/to/book.epub", {})
 */
function ePub(url, options) {
	return new _book2.default(url, options);
}

ePub.VERSION = "0.3";

if (typeof global !== "undefined") {
	global.EPUBJS_VERSION = ePub.VERSION;
}

ePub.CFI = _epubcfi2.default;
ePub.Rendition = _rendition2.default;
ePub.Contents = _contents2.default;

ePub.ViewManagers = {};
ePub.Views = {};
/**
 * register plugins
 */
ePub.register = {
	/**
  * register a new view manager
  */
	manager: function manager(name, _manager) {
		return ePub.ViewManagers[name] = _manager;
	},
	/**
  * register a new view
  */
	view: function view(name, _view) {
		return ePub.Views[name] = _view;
	}
};

// Default Views
ePub.register.view("iframe", require("./managers/views/iframe"));

// Default View Managers
ePub.register.manager("default", require("./managers/default"));
ePub.register.manager("continuous", require("./managers/continuous"));

exports.default = ePub;
module.exports = exports["default"];