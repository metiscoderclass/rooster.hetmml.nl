(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
/*
 * Fuzzy
 * https://github.com/myork/fuzzy
 *
 * Copyright (c) 2012 Matt York
 * Licensed under the MIT license.
 */

(function() {

var root = this;

var fuzzy = {};

// Use in node or in browser
if (typeof exports !== 'undefined') {
  module.exports = fuzzy;
} else {
  root.fuzzy = fuzzy;
}

// Return all elements of `array` that have a fuzzy
// match against `pattern`.
fuzzy.simpleFilter = function(pattern, array) {
  return array.filter(function(string) {
    return fuzzy.test(pattern, string);
  });
};

// Does `pattern` fuzzy match `string`?
fuzzy.test = function(pattern, string) {
  return fuzzy.match(pattern, string) !== null;
};

// If `pattern` matches `string`, wrap each matching character
// in `opts.pre` and `opts.post`. If no match, return null
fuzzy.match = function(pattern, string, opts) {
  opts = opts || {};
  var patternIdx = 0
    , result = []
    , len = string.length
    , totalScore = 0
    , currScore = 0
    // prefix
    , pre = opts.pre || ''
    // suffix
    , post = opts.post || ''
    // String to compare against. This might be a lowercase version of the
    // raw string
    , compareString =  opts.caseSensitive && string || string.toLowerCase()
    , ch, compareChar;

  pattern = opts.caseSensitive && pattern || pattern.toLowerCase();

  // For each character in the string, either add it to the result
  // or wrap in template if it's the next string in the pattern
  for(var idx = 0; idx < len; idx++) {
    ch = string[idx];
    if(compareString[idx] === pattern[patternIdx]) {
      ch = pre + ch + post;
      patternIdx += 1;

      // consecutive characters should increase the score more than linearly
      currScore += 1 + currScore;
    } else {
      currScore = 0;
    }
    totalScore += currScore;
    result[result.length] = ch;
  }

  // return rendered string if we have a match for every char
  if(patternIdx === pattern.length) {
    return {rendered: result.join(''), score: totalScore};
  }

  return null;
};

// The normal entry point. Filters `arr` for matches against `pattern`.
// It returns an array with matching values of the type:
//
//     [{
//         string:   '<b>lah' // The rendered string
//       , index:    2        // The index of the element in `arr`
//       , original: 'blah'   // The original element in `arr`
//     }]
//
// `opts` is an optional argument bag. Details:
//
//    opts = {
//        // string to put before a matching character
//        pre:     '<b>'
//
//        // string to put after matching character
//      , post:    '</b>'
//
//        // Optional function. Input is an entry in the given arr`,
//        // output should be the string to test `pattern` against.
//        // In this example, if `arr = [{crying: 'koala'}]` we would return
//        // 'koala'.
//      , extract: function(arg) { return arg.crying; }
//    }
fuzzy.filter = function(pattern, arr, opts) {
  opts = opts || {};
  return arr
    .reduce(function(prev, element, idx, arr) {
      var str = element;
      if(opts.extract) {
        str = opts.extract(element);
      }
      var rendered = fuzzy.match(pattern, str, opts);
      if(rendered != null) {
        prev[prev.length] = {
            string: rendered.rendered
          , score: rendered.score
          , index: idx
          , original: element
        };
      }
      return prev;
    }, [])

    // Sort by score. Browsers are inconsistent wrt stable/unstable
    // sorting, so force stable by using the index in the case of tie.
    // See http://ofb.net/~sethml/is-sort-stable.html
    .sort(function(a,b) {
      var compare = b.score - a.score;
      if(compare) return compare;
      return a.index - b.index;
    });
};


}());


},{}],3:[function(require,module,exports){
'use strict';
module.exports = leftPad;

var cache = [
  '',
  ' ',
  '  ',
  '   ',
  '    ',
  '     ',
  '      ',
  '       ',
  '        ',
  '         '
];

function leftPad (str, len, ch) {
  // convert `str` to `string`
  str = str + '';
  // `len` is the `pad`'s length now
  len = len - str.length;
  // doesn't need to pad
  if (len <= 0) return str;
  // `ch` defaults to `' '`
  if (!ch && ch !== 0) ch = ' ';
  // convert `ch` to `string`
  ch = ch + '';
  // cache common use cases
  if (ch === ' ' && len < 10) return cache[len] + str;
  // `pad` starts with an empty string
  var pad = '';
  // loop
  while (true) {
    // add `ch` to `pad` if `len` is odd
    if (len & 1) pad += ch;
    // devide `len` by 2, ditch the fraction
    len >>= 1;
    // "double" the `ch` so this operation count grows logarithmically on `len`
    // each time `ch` is "doubled", the `len` would need to be "doubled" too
    // similar to finding a value in binary search tree, hence O(log(n))
    if (len) ch += ch;
    // `len` is 0, exit the loop
    else break;
  }
  // pad `str`!
  return pad + str;
}

},{}],4:[function(require,module,exports){
/*
 * smoothscroll polyfill - v0.3.4
 * https://iamdustan.github.io/smoothscroll
 * 2016 (c) Dustan Kasten, Jeremias Menichelli - MIT License
 */

(function(w, d, undefined) {
  'use strict';

  /*
   * aliases
   * w: window global object
   * d: document
   * undefined: undefined
   */

  // polyfill
  function polyfill() {
    // return when scrollBehavior interface is supported
    if ('scrollBehavior' in d.documentElement.style) {
      return;
    }

    /*
     * globals
     */
    var Element = w.HTMLElement || w.Element;
    var SCROLL_TIME = 468;

    /*
     * object gathering original scroll methods
     */
    var original = {
      scroll: w.scroll || w.scrollTo,
      scrollBy: w.scrollBy,
      scrollIntoView: Element.prototype.scrollIntoView
    };

    /*
     * define timing method
     */
    var now = w.performance && w.performance.now
      ? w.performance.now.bind(w.performance) : Date.now;

    /**
     * changes scroll position inside an element
     * @method scrollElement
     * @param {Number} x
     * @param {Number} y
     */
    function scrollElement(x, y) {
      this.scrollLeft = x;
      this.scrollTop = y;
    }

    /**
     * returns result of applying ease math function to a number
     * @method ease
     * @param {Number} k
     * @returns {Number}
     */
    function ease(k) {
      return 0.5 * (1 - Math.cos(Math.PI * k));
    }

    /**
     * indicates if a smooth behavior should be applied
     * @method shouldBailOut
     * @param {Number|Object} x
     * @returns {Boolean}
     */
    function shouldBailOut(x) {
      if (typeof x !== 'object'
            || x === null
            || x.behavior === undefined
            || x.behavior === 'auto'
            || x.behavior === 'instant') {
        // first arg not an object/null
        // or behavior is auto, instant or undefined
        return true;
      }

      if (typeof x === 'object'
            && x.behavior === 'smooth') {
        // first argument is an object and behavior is smooth
        return false;
      }

      // throw error when behavior is not supported
      throw new TypeError('behavior not valid');
    }

    /**
     * finds scrollable parent of an element
     * @method findScrollableParent
     * @param {Node} el
     * @returns {Node} el
     */
    function findScrollableParent(el) {
      var isBody;
      var hasScrollableSpace;
      var hasVisibleOverflow;

      do {
        el = el.parentNode;

        // set condition variables
        isBody = el === d.body;
        hasScrollableSpace =
          el.clientHeight < el.scrollHeight ||
          el.clientWidth < el.scrollWidth;
        hasVisibleOverflow =
          w.getComputedStyle(el, null).overflow === 'visible';
      } while (!isBody && !(hasScrollableSpace && !hasVisibleOverflow));

      isBody = hasScrollableSpace = hasVisibleOverflow = null;

      return el;
    }

    /**
     * self invoked function that, given a context, steps through scrolling
     * @method step
     * @param {Object} context
     */
    function step(context) {
      // call method again on next available frame
      context.frame = w.requestAnimationFrame(step.bind(w, context));

      var time = now();
      var value;
      var currentX;
      var currentY;
      var elapsed = (time - context.startTime) / SCROLL_TIME;

      // avoid elapsed times higher than one
      elapsed = elapsed > 1 ? 1 : elapsed;

      // apply easing to elapsed time
      value = ease(elapsed);

      currentX = context.startX + (context.x - context.startX) * value;
      currentY = context.startY + (context.y - context.startY) * value;

      context.method.call(context.scrollable, currentX, currentY);

      // return when end points have been reached
      if (currentX === context.x && currentY === context.y) {
        w.cancelAnimationFrame(context.frame);
        return;
      }
    }

    /**
     * scrolls window with a smooth behavior
     * @method smoothScroll
     * @param {Object|Node} el
     * @param {Number} x
     * @param {Number} y
     */
    function smoothScroll(el, x, y) {
      var scrollable;
      var startX;
      var startY;
      var method;
      var startTime = now();
      var frame;

      // define scroll context
      if (el === d.body) {
        scrollable = w;
        startX = w.scrollX || w.pageXOffset;
        startY = w.scrollY || w.pageYOffset;
        method = original.scroll;
      } else {
        scrollable = el;
        startX = el.scrollLeft;
        startY = el.scrollTop;
        method = scrollElement;
      }

      // cancel frame when a scroll event's happening
      if (frame) {
        w.cancelAnimationFrame(frame);
      }

      // scroll looping over a frame
      step({
        scrollable: scrollable,
        method: method,
        startTime: startTime,
        startX: startX,
        startY: startY,
        x: x,
        y: y,
        frame: frame
      });
    }

    /*
     * ORIGINAL METHODS OVERRIDES
     */

    // w.scroll and w.scrollTo
    w.scroll = w.scrollTo = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.scroll.call(
          w,
          arguments[0].left || arguments[0],
          arguments[0].top || arguments[1]
        );
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        w,
        d.body,
        ~~arguments[0].left,
        ~~arguments[0].top
      );
    };

    // w.scrollBy
    w.scrollBy = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.scrollBy.call(
          w,
          arguments[0].left || arguments[0],
          arguments[0].top || arguments[1]
        );
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        w,
        d.body,
        ~~arguments[0].left + (w.scrollX || w.pageXOffset),
        ~~arguments[0].top + (w.scrollY || w.pageYOffset)
      );
    };

    // Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.scrollIntoView.call(this, arguments[0] || true);
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      var scrollableParent = findScrollableParent(this);
      var parentRects = scrollableParent.getBoundingClientRect();
      var clientRects = this.getBoundingClientRect();

      if (scrollableParent !== d.body) {
        // reveal element inside parent
        smoothScroll.call(
          this,
          scrollableParent,
          scrollableParent.scrollLeft + clientRects.left - parentRects.left,
          scrollableParent.scrollTop + clientRects.top - parentRects.top
        );
        // reveal parent in viewport
        w.scrollBy({
          left: parentRects.left,
          top: parentRects.top,
          behavior: 'smooth'
        });
      } else {
        // reveal element in viewport
        w.scrollBy({
          left: clientRects.left,
          top: clientRects.top,
          behavior: 'smooth'
        });
      }
    };
  }

  if (typeof exports === 'object') {
    // commonjs
    module.exports = { polyfill: polyfill };
  } else {
    // global
    polyfill();
  }
})(window, document);

},{}],5:[function(require,module,exports){
const EventEmitter = require('events');

const self = new EventEmitter();

self._items = [];
self._selectedItemIndex = -1;

self._nodes = {
  search: document.querySelector('#search'),
  input: document.querySelector('input[type="search"]'),
  autocomplete: document.querySelector('.autocomplete')
};

self.getSelectedItem = function () {
  if (self.getItems() === []) return;

  if (self.getSelectedItemIndex() === -1) {
    return self.getItems()[0];
  } else {
    return self.getItems()[self.getSelectedItemIndex()];
  }
};

self.getSelectedItemIndex = function () {
  return self._selectedItemIndex;
};

self.getItems = function () {
  return self._items;
};

self.removeAllItems = function () {
  while (self._nodes.autocomplete.firstChild) {
    self._nodes.autocomplete.removeChild(self._nodes.autocomplete.firstChild);
  }
  self._items = [];
  self._selectedItemIndex = -1;
};

self.addItem = function (item) {
  const listItem = document.createElement('li');
  listItem.textContent = item.value;
  self._nodes.autocomplete.appendChild(listItem);
  self._items.push(item);
};

self._moveSelected = function (shift) {
  if (self._selectedItemIndex + shift >= self.getItems().length) {
    self._selectedItemIndex = -1;
  } else if (self._selectedItemIndex + shift < -1) {
    self._selectedItemIndex = self.getItems().length - 1;
  } else {
    self._selectedItemIndex += shift;
  }

  for (let i = 0; i < self.getItems().length; i++) {
    self._nodes.autocomplete.children[i].classList.remove('selected');
  }
  if (self._selectedItemIndex >= 0) {
    self._nodes.autocomplete.children[self._selectedItemIndex].classList.add('selected');
  }
};

self._handleItemClick = function (event) {
  if (!self._nodes.autocomplete.contains(event.target)) return;
  const itemIndex = Array.prototype.indexOf.call(self._nodes.autocomplete.children, event.target);
  self._selectedItemIndex = itemIndex;
  self.emit('select', self.getSelectedItem());
};

self._handleKeydown = function (event) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    if (event.key === 'ArrowDown') {
      self._moveSelected(1);
    } else if (event.key === 'ArrowUp') {
      self._moveSelected(-1);
    }
  }
};

self._nodes.autocomplete.addEventListener('click', self._handleItemClick);
self._nodes.input.addEventListener('keydown', self._handleKeydown);

module.exports = self;

},{"events":1}],6:[function(require,module,exports){
const self = {};

self.isIE = navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0;

if (self.isIE) {
  self.inputEvent = 'textinput';
} else {
  self.inputEvent = 'input';
}

module.exports = self;

},{}],7:[function(require,module,exports){
/* global USERS */

const EventEmitter = require('events');

const self = new EventEmitter();

self._nodes = {
  toggle: document.querySelector('.fav')
};

self.get = function () {
  try {
    const localStorageUser = JSON.parse(window.localStorage.getItem('fav'));
    if (localStorageUser == null) return;

    const correctedUser = USERS.filter(function (user) {
      return user.type === localStorageUser.type && user.value === localStorageUser.value;
    })[0];
    return correctedUser;
  } catch (e) {
    self.delete();
    return;
  }
};

self.set = function (user) {
  window.localStorage.setItem('fav', JSON.stringify(user));
  self._nodes.innerHTML = '&#xE838;';
};

self.delete = function () {
  window.localStorage.removeItem('fav');
};

self.updateDom = function (isFavorite) {
  if (isFavorite) {
    self._nodes.toggle.innerHTML = '&#xE838;';
  } else {
    self._nodes.toggle.innerHTML = '&#xE83A';
  }
};

self.update = function (selectedUser) {
  const currentUser = self.get();

  if (currentUser == null) {
    self.updateDom(false);
    return;
  }

  const isEqual = currentUser.type === selectedUser.type && currentUser.index === selectedUser.index;

  self.updateDom(isEqual);
};

self.toggle = function (selectedUser) {
  const currentUser = self.get();
  const isEqual = currentUser != null && currentUser.type === selectedUser.type && currentUser.index === selectedUser.index;

  if (isEqual) {
    self.delete();
    self.updateDom(false);
  } else {
    self.set(selectedUser);
    self.updateDom(true);
  }
};

self._handleClick = function () {
  self.emit('click');
};

self._nodes.toggle.addEventListener('click', self._handleClick);

module.exports = self;

},{"events":1}],8:[function(require,module,exports){
const browserFixToolkit = require('./browserFixToolkit');

const self = {};

self._nodes = {
  input: document.querySelector('input[type="search"]')
};

self.isShown = false;

self.show = function () {
  document.body.classList.add('no-input');
  self.isShown = true;
};

self.hide = function () {
  document.body.classList.remove('no-input');
  self.isShown = false;
};

self._nodes.input.addEventListener(browserFixToolkit.inputEvent, self.hide);

module.exports = self;

},{"./browserFixToolkit":6}],9:[function(require,module,exports){
const frontpage = require('./frontpage');
const search = require('./search');
const schedule = require('./schedule');
const weekSelector = require('./weekSelector');
const favorite = require('./favorite');
const scrollSnap = require('./scrollSnap');

const state = {};

window.state = state;
window.require = require;

frontpage.show();
weekSelector.updateCurrentWeek();
scrollSnap.startListening();

if (favorite.get() != null) {
  state.selectedItem = favorite.get();
  favorite.update(state.selectedItem);
  schedule.viewItem(weekSelector.getSelectedWeek(), state.selectedItem);
} else {
  search.focus();
}

search.on('search', function (selectedItem) {
  state.selectedItem = selectedItem;
  favorite.update(state.selectedItem);
  schedule.viewItem(weekSelector.getSelectedWeek(), state.selectedItem);
});

weekSelector.on('weekChanged', function (newWeek) {
  schedule.viewItem(newWeek, state.selectedItem);
});

favorite.on('click', function () {
  favorite.toggle(state.selectedItem);
});

document.body.style.opacity = 1;

},{"./favorite":7,"./frontpage":8,"./schedule":10,"./scrollSnap":11,"./search":12,"./weekSelector":13}],10:[function(require,module,exports){
const EventEmitter = require('events');
const leftPad = require('left-pad');
const search = require('./search');

const self = new EventEmitter();

self._nodes = {
  schedule: document.querySelector('#schedule')
};

self._parseMeetingpointHTML = function (htmlStr) {
  const html = document.createElement('html');
  html.innerHTML = htmlStr;
  const centerNode = html.querySelector('center');
  return centerNode;
};

self._handleLoad = function (event) {
  const request = event.target;
  if (request.status < 200 || request.status >= 400) {
    self._handleError(event);
    return;
  }
  const document = self._parseMeetingpointHTML(request.response);
  self._removeChilds();
  self._nodes.schedule.appendChild(document);
  self._nodes.schedule.classList.remove('error');
  self.emit('load');
};

self._handleError = function (event) {
  const request = event.target;
  let error;
  if (request.status === 404) {
    error = 'Sorry, er is (nog) geen rooster voor deze week.';
  } else {
    error = 'Sorry, er is iets mis gegaan tijdens het laden van deze week.';
  }
  self._removeChilds();
  self._nodes.schedule.textContent = error;
  self._nodes.schedule.classList.add('error');
  self.emit('load');
};

self._getURLOfUsers = function (week, type, index) {
  const id = index + 1;
  return '//' + window.location.host + '/meetingpointProxy/Roosters-AL%2Fdoc%2Fdagroosters%2F' + week + '%2F' + type + '%2F' + type + leftPad(id, 5, '0') + '.htm';
};

self._removeChilds = function () {
  while (self._nodes.schedule.firstChild) {
    self._nodes.schedule.removeChild(self._nodes.schedule.firstChild);
  }
};

self.viewItem = function (week, selectedUser) {
  const url = self._getURLOfUsers(week, selectedUser.type, selectedUser.index);

  self._removeChilds();

  const request = new window.XMLHttpRequest();
  request.addEventListener('load', self._handleLoad);
  request.addEventListener('error', self._handleError);
  request.open('GET', url, true);
  request.send();

  search.updateDom(selectedUser);
};

module.exports = self;

},{"./search":12,"events":1,"left-pad":3}],11:[function(require,module,exports){
require('smoothscroll-polyfill').polyfill();

const self = {};
const schedule = require('./schedule');

self._nodes = {
  search: document.querySelector('#search'),
  weekSelector: document.querySelector('#week-selector')
};

self._timeoutID = null;

self._getScrollPosition = function () {
  return document.documentElement && document.documentElement.scrollTop || document.body.scrollTop;
};

self._handleDoneScrolling = function () {
  const scrollPosition = self._getScrollPosition();
  const weekSelectorHeight = self._nodes.weekSelector.clientHeight - self._nodes.search.clientHeight;
  if (scrollPosition < weekSelectorHeight && scrollPosition > 0) {
    window.scroll({ top: weekSelectorHeight, left: 0, behavior: 'smooth' });
  }
};

self._handleScroll = function () {
  if (self._timeoutID != null) window.clearTimeout(self._timeoutID);
  self._timeoutID = window.setTimeout(self._handleDoneScrolling, 500);

  const scrollPosition = self._getScrollPosition();
  const weekSelectorHeight = self._nodes.weekSelector.clientHeight - self._nodes.search.clientHeight;
  if (scrollPosition >= weekSelectorHeight) {
    document.body.classList.add('week-selector-not-visible');
  } else {
    document.body.classList.remove('week-selector-not-visible');
  }
};

self._handleWindowResize = function () {
  const weekSelectorHeight = self._nodes.weekSelector.clientHeight - self._nodes.search.clientHeight;
  const extraPixelsNeeded = weekSelectorHeight - (document.body.clientHeight - window.innerHeight);
  if (extraPixelsNeeded > 0) {
    document.body.style.marginBottom = extraPixelsNeeded + 'px';
  } else {
    document.body.style.marginBottom = null;
  }
};

self.startListening = function () {
  window.addEventListener('scroll', self._handleScroll);
};

schedule.on('load', self._handleWindowResize);
window.addEventListener('resize', self._handleWindowResize);
module.exports = self;

},{"./schedule":10,"smoothscroll-polyfill":4}],12:[function(require,module,exports){
/* global USERS */

const EventEmitter = require('events');
const fuzzy = require('fuzzy');
const autocomplete = require('./autocomplete');
const browserFixToolkit = require('./browserFixToolkit');

const self = new EventEmitter();

self._nodes = {
  search: document.querySelector('#search'),
  input: document.querySelector('input[type="search"]')
};

self.submit = function () {
  self._nodes.input.blur();
  document.body.classList.remove('week-selector-not-visible'); // Safari bug

  const selectedItem = autocomplete.getSelectedItem();

  console.log(selectedItem);

  self.emit('search', selectedItem);
};

self.updateDom = function (selectedItem) {
  self._nodes.input.value = selectedItem.value;
  autocomplete.removeAllItems();
  document.body.classList.remove('no-input');
  document.body.classList.add('searched');
};

self.focus = function () {
  self._nodes.input.focus();
};

self._handleSubmit = function (event) {
  event.preventDefault();
  self.submit();
};

self._calculate = function (searchTerm) {
  const allResults = fuzzy.filter(searchTerm, USERS, {
    extract: function (item) {
      return item.value;
    }
  });
  const firstResults = allResults.slice(0, 7);

  const originalResults = firstResults.map(function (result) {
    return result.original;
  });

  return originalResults;
};

self._handleTextUpdate = function () {
  const results = self._calculate(self._nodes.input.value);

  autocomplete.removeAllItems();
  for (let i = 0; i < results.length; i++) {
    autocomplete.addItem(results[i]);
  }
};

self._handleFocus = function () {
  self._nodes.input.select();
};

self._handleBlur = function () {
  // this will removed the selection without drawing focus on it (safari)
  // this will removed selection even when focusing an iframe (chrome)
  const oldValue = self._nodes.value;
  self._nodes.value = '';
  self._nodes.value = oldValue;

  // this will hide the keyboard (iOS safari)
  document.activeElement.blur();
};

autocomplete.on('select', self.submit);

self._nodes.search.addEventListener('submit', self._handleSubmit);
self._nodes.input.addEventListener('focus', self._handleFocus);
self._nodes.input.addEventListener('blur', self._handleBlur);
self._nodes.input.addEventListener(browserFixToolkit.inputEvent, self._handleTextUpdate);

module.exports = self;

},{"./autocomplete":5,"./browserFixToolkit":6,"events":1,"fuzzy":2}],13:[function(require,module,exports){
const EventEmitter = require('events');

const self = new EventEmitter();

self._nodes = {
  prevButton: document.querySelectorAll('#week-selector button')[0],
  nextButton: document.querySelectorAll('#week-selector button')[1],
  currentWeekText: document.querySelector('#week-selector .current')
};

self._weekOffset = 0;

// copied from http://www.meetingpointmco.nl/Roosters-AL/doc/dagroosters/untisscripts.js,
// were using the same code as they do to be sure that we always get the same
// week number.
self.getCurrentWeek = function (target) {
  const dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + (4 - target.getDay() + 7) % 7);
  }

  return 1 + Math.ceil((firstThursday - target) / 604800000);
};

self.getSelectedWeek = function () {
  const now = new Date();
  const targetDate = new Date(now.getTime() + self._weekOffset * 604800 * 1000 + 86400 * 1000);
  return self.getCurrentWeek(targetDate);
};

self.updateCurrentWeek = function () {
  const selectedWeekNumber = self.getSelectedWeek();
  if (self.getCurrentWeek(new Date()) !== selectedWeekNumber) {
    self._nodes.currentWeekText.classList.add('changed');
  } else {
    self._nodes.currentWeekText.classList.remove('changed');
  }
  self.updateDom();
  self.emit('weekChanged', selectedWeekNumber);
};

self.updateDom = function () {
  const selectedWeekNumber = self.getSelectedWeek();
  const isSunday = new Date().getDay() === 0;
  let humanReadableWeek = null;
  if (isSunday) {
    switch (self._weekOffset) {
      case 0:
        humanReadableWeek = 'Aanstaande week';
        break;
      case 1:
        humanReadableWeek = 'Volgende week';
        break;
      case -1:
        humanReadableWeek = 'Afgelopen week';
        break;
    }
  } else {
    switch (self._weekOffset) {
      case 0:
        humanReadableWeek = 'Huidige week';
        break;
      case 1:
        humanReadableWeek = 'Volgende week';
        break;
      case -1:
        humanReadableWeek = 'Vorige week';
        break;
    }
  }
  if (humanReadableWeek != null) {
    self._nodes.currentWeekText.textContent = humanReadableWeek + ' • ' + selectedWeekNumber;
  } else {
    self._nodes.currentWeekText.textContent = 'Week ' + selectedWeekNumber;
  }
};

self._handlePrevButtonClick = function () {
  self._weekOffset -= 1;
  self.updateCurrentWeek();
};

self._handleNextButtonClick = function () {
  self._weekOffset += 1;
  self.updateCurrentWeek();
};

self._nodes.prevButton.addEventListener('click', self._handlePrevButtonClick);
self._nodes.nextButton.addEventListener('click', self._handleNextButtonClick);

module.exports = self;

},{"events":1}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9mdXp6eS9saWIvZnV6enkuanMiLCJub2RlX21vZHVsZXMvbGVmdC1wYWQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc21vb3Roc2Nyb2xsLXBvbHlmaWxsL2Rpc3Qvc21vb3Roc2Nyb2xsLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2F1dG9jb21wbGV0ZS5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9icm93c2VyRml4VG9vbGtpdC5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9mYXZvcml0ZS5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9mcm9udHBhZ2UuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvbWFpbi5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9zY2hlZHVsZS5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9zY3JvbGxTbmFwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL3NlYXJjaC5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy93ZWVrU2VsZWN0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblNBLE1BQU0sZUFBZSxRQUFRLFFBQVIsQ0FBckI7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dGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBdCBsZWFzdCBnaXZlIHNvbWUga2luZCBvZiBjb250ZXh0IHRvIHRoZSB1c2VyXG4gICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuICgnICsgZXIgKyAnKScpO1xuICAgICAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSBpZiAobGlzdGVuZXJzKSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24odHlwZSkge1xuICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgICBpZiAoaXNGdW5jdGlvbihldmxpc3RlbmVyKSlcbiAgICAgIHJldHVybiAxO1xuICAgIGVsc2UgaWYgKGV2bGlzdGVuZXIpXG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIDA7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsIi8qXG4gKiBGdXp6eVxuICogaHR0cHM6Ly9naXRodWIuY29tL215b3JrL2Z1enp5XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEyIE1hdHQgWW9ya1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICovXG5cbihmdW5jdGlvbigpIHtcblxudmFyIHJvb3QgPSB0aGlzO1xuXG52YXIgZnV6enkgPSB7fTtcblxuLy8gVXNlIGluIG5vZGUgb3IgaW4gYnJvd3NlclxuaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1enp5O1xufSBlbHNlIHtcbiAgcm9vdC5mdXp6eSA9IGZ1enp5O1xufVxuXG4vLyBSZXR1cm4gYWxsIGVsZW1lbnRzIG9mIGBhcnJheWAgdGhhdCBoYXZlIGEgZnV6enlcbi8vIG1hdGNoIGFnYWluc3QgYHBhdHRlcm5gLlxuZnV6enkuc2ltcGxlRmlsdGVyID0gZnVuY3Rpb24ocGF0dGVybiwgYXJyYXkpIHtcbiAgcmV0dXJuIGFycmF5LmZpbHRlcihmdW5jdGlvbihzdHJpbmcpIHtcbiAgICByZXR1cm4gZnV6enkudGVzdChwYXR0ZXJuLCBzdHJpbmcpO1xuICB9KTtcbn07XG5cbi8vIERvZXMgYHBhdHRlcm5gIGZ1enp5IG1hdGNoIGBzdHJpbmdgP1xuZnV6enkudGVzdCA9IGZ1bmN0aW9uKHBhdHRlcm4sIHN0cmluZykge1xuICByZXR1cm4gZnV6enkubWF0Y2gocGF0dGVybiwgc3RyaW5nKSAhPT0gbnVsbDtcbn07XG5cbi8vIElmIGBwYXR0ZXJuYCBtYXRjaGVzIGBzdHJpbmdgLCB3cmFwIGVhY2ggbWF0Y2hpbmcgY2hhcmFjdGVyXG4vLyBpbiBgb3B0cy5wcmVgIGFuZCBgb3B0cy5wb3N0YC4gSWYgbm8gbWF0Y2gsIHJldHVybiBudWxsXG5mdXp6eS5tYXRjaCA9IGZ1bmN0aW9uKHBhdHRlcm4sIHN0cmluZywgb3B0cykge1xuICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgdmFyIHBhdHRlcm5JZHggPSAwXG4gICAgLCByZXN1bHQgPSBbXVxuICAgICwgbGVuID0gc3RyaW5nLmxlbmd0aFxuICAgICwgdG90YWxTY29yZSA9IDBcbiAgICAsIGN1cnJTY29yZSA9IDBcbiAgICAvLyBwcmVmaXhcbiAgICAsIHByZSA9IG9wdHMucHJlIHx8ICcnXG4gICAgLy8gc3VmZml4XG4gICAgLCBwb3N0ID0gb3B0cy5wb3N0IHx8ICcnXG4gICAgLy8gU3RyaW5nIHRvIGNvbXBhcmUgYWdhaW5zdC4gVGhpcyBtaWdodCBiZSBhIGxvd2VyY2FzZSB2ZXJzaW9uIG9mIHRoZVxuICAgIC8vIHJhdyBzdHJpbmdcbiAgICAsIGNvbXBhcmVTdHJpbmcgPSAgb3B0cy5jYXNlU2Vuc2l0aXZlICYmIHN0cmluZyB8fCBzdHJpbmcudG9Mb3dlckNhc2UoKVxuICAgICwgY2gsIGNvbXBhcmVDaGFyO1xuXG4gIHBhdHRlcm4gPSBvcHRzLmNhc2VTZW5zaXRpdmUgJiYgcGF0dGVybiB8fCBwYXR0ZXJuLnRvTG93ZXJDYXNlKCk7XG5cbiAgLy8gRm9yIGVhY2ggY2hhcmFjdGVyIGluIHRoZSBzdHJpbmcsIGVpdGhlciBhZGQgaXQgdG8gdGhlIHJlc3VsdFxuICAvLyBvciB3cmFwIGluIHRlbXBsYXRlIGlmIGl0J3MgdGhlIG5leHQgc3RyaW5nIGluIHRoZSBwYXR0ZXJuXG4gIGZvcih2YXIgaWR4ID0gMDsgaWR4IDwgbGVuOyBpZHgrKykge1xuICAgIGNoID0gc3RyaW5nW2lkeF07XG4gICAgaWYoY29tcGFyZVN0cmluZ1tpZHhdID09PSBwYXR0ZXJuW3BhdHRlcm5JZHhdKSB7XG4gICAgICBjaCA9IHByZSArIGNoICsgcG9zdDtcbiAgICAgIHBhdHRlcm5JZHggKz0gMTtcblxuICAgICAgLy8gY29uc2VjdXRpdmUgY2hhcmFjdGVycyBzaG91bGQgaW5jcmVhc2UgdGhlIHNjb3JlIG1vcmUgdGhhbiBsaW5lYXJseVxuICAgICAgY3VyclNjb3JlICs9IDEgKyBjdXJyU2NvcmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJTY29yZSA9IDA7XG4gICAgfVxuICAgIHRvdGFsU2NvcmUgKz0gY3VyclNjb3JlO1xuICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoXSA9IGNoO1xuICB9XG5cbiAgLy8gcmV0dXJuIHJlbmRlcmVkIHN0cmluZyBpZiB3ZSBoYXZlIGEgbWF0Y2ggZm9yIGV2ZXJ5IGNoYXJcbiAgaWYocGF0dGVybklkeCA9PT0gcGF0dGVybi5sZW5ndGgpIHtcbiAgICByZXR1cm4ge3JlbmRlcmVkOiByZXN1bHQuam9pbignJyksIHNjb3JlOiB0b3RhbFNjb3JlfTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufTtcblxuLy8gVGhlIG5vcm1hbCBlbnRyeSBwb2ludC4gRmlsdGVycyBgYXJyYCBmb3IgbWF0Y2hlcyBhZ2FpbnN0IGBwYXR0ZXJuYC5cbi8vIEl0IHJldHVybnMgYW4gYXJyYXkgd2l0aCBtYXRjaGluZyB2YWx1ZXMgb2YgdGhlIHR5cGU6XG4vL1xuLy8gICAgIFt7XG4vLyAgICAgICAgIHN0cmluZzogICAnPGI+bGFoJyAvLyBUaGUgcmVuZGVyZWQgc3RyaW5nXG4vLyAgICAgICAsIGluZGV4OiAgICAyICAgICAgICAvLyBUaGUgaW5kZXggb2YgdGhlIGVsZW1lbnQgaW4gYGFycmBcbi8vICAgICAgICwgb3JpZ2luYWw6ICdibGFoJyAgIC8vIFRoZSBvcmlnaW5hbCBlbGVtZW50IGluIGBhcnJgXG4vLyAgICAgfV1cbi8vXG4vLyBgb3B0c2AgaXMgYW4gb3B0aW9uYWwgYXJndW1lbnQgYmFnLiBEZXRhaWxzOlxuLy9cbi8vICAgIG9wdHMgPSB7XG4vLyAgICAgICAgLy8gc3RyaW5nIHRvIHB1dCBiZWZvcmUgYSBtYXRjaGluZyBjaGFyYWN0ZXJcbi8vICAgICAgICBwcmU6ICAgICAnPGI+J1xuLy9cbi8vICAgICAgICAvLyBzdHJpbmcgdG8gcHV0IGFmdGVyIG1hdGNoaW5nIGNoYXJhY3RlclxuLy8gICAgICAsIHBvc3Q6ICAgICc8L2I+J1xuLy9cbi8vICAgICAgICAvLyBPcHRpb25hbCBmdW5jdGlvbi4gSW5wdXQgaXMgYW4gZW50cnkgaW4gdGhlIGdpdmVuIGFycmAsXG4vLyAgICAgICAgLy8gb3V0cHV0IHNob3VsZCBiZSB0aGUgc3RyaW5nIHRvIHRlc3QgYHBhdHRlcm5gIGFnYWluc3QuXG4vLyAgICAgICAgLy8gSW4gdGhpcyBleGFtcGxlLCBpZiBgYXJyID0gW3tjcnlpbmc6ICdrb2FsYSd9XWAgd2Ugd291bGQgcmV0dXJuXG4vLyAgICAgICAgLy8gJ2tvYWxhJy5cbi8vICAgICAgLCBleHRyYWN0OiBmdW5jdGlvbihhcmcpIHsgcmV0dXJuIGFyZy5jcnlpbmc7IH1cbi8vICAgIH1cbmZ1enp5LmZpbHRlciA9IGZ1bmN0aW9uKHBhdHRlcm4sIGFyciwgb3B0cykge1xuICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgcmV0dXJuIGFyclxuICAgIC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgZWxlbWVudCwgaWR4LCBhcnIpIHtcbiAgICAgIHZhciBzdHIgPSBlbGVtZW50O1xuICAgICAgaWYob3B0cy5leHRyYWN0KSB7XG4gICAgICAgIHN0ciA9IG9wdHMuZXh0cmFjdChlbGVtZW50KTtcbiAgICAgIH1cbiAgICAgIHZhciByZW5kZXJlZCA9IGZ1enp5Lm1hdGNoKHBhdHRlcm4sIHN0ciwgb3B0cyk7XG4gICAgICBpZihyZW5kZXJlZCAhPSBudWxsKSB7XG4gICAgICAgIHByZXZbcHJldi5sZW5ndGhdID0ge1xuICAgICAgICAgICAgc3RyaW5nOiByZW5kZXJlZC5yZW5kZXJlZFxuICAgICAgICAgICwgc2NvcmU6IHJlbmRlcmVkLnNjb3JlXG4gICAgICAgICAgLCBpbmRleDogaWR4XG4gICAgICAgICAgLCBvcmlnaW5hbDogZWxlbWVudFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByZXY7XG4gICAgfSwgW10pXG5cbiAgICAvLyBTb3J0IGJ5IHNjb3JlLiBCcm93c2VycyBhcmUgaW5jb25zaXN0ZW50IHdydCBzdGFibGUvdW5zdGFibGVcbiAgICAvLyBzb3J0aW5nLCBzbyBmb3JjZSBzdGFibGUgYnkgdXNpbmcgdGhlIGluZGV4IGluIHRoZSBjYXNlIG9mIHRpZS5cbiAgICAvLyBTZWUgaHR0cDovL29mYi5uZXQvfnNldGhtbC9pcy1zb3J0LXN0YWJsZS5odG1sXG4gICAgLnNvcnQoZnVuY3Rpb24oYSxiKSB7XG4gICAgICB2YXIgY29tcGFyZSA9IGIuc2NvcmUgLSBhLnNjb3JlO1xuICAgICAgaWYoY29tcGFyZSkgcmV0dXJuIGNvbXBhcmU7XG4gICAgICByZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XG4gICAgfSk7XG59O1xuXG5cbn0oKSk7XG5cbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gbGVmdFBhZDtcblxudmFyIGNhY2hlID0gW1xuICAnJyxcbiAgJyAnLFxuICAnICAnLFxuICAnICAgJyxcbiAgJyAgICAnLFxuICAnICAgICAnLFxuICAnICAgICAgJyxcbiAgJyAgICAgICAnLFxuICAnICAgICAgICAnLFxuICAnICAgICAgICAgJ1xuXTtcblxuZnVuY3Rpb24gbGVmdFBhZCAoc3RyLCBsZW4sIGNoKSB7XG4gIC8vIGNvbnZlcnQgYHN0cmAgdG8gYHN0cmluZ2BcbiAgc3RyID0gc3RyICsgJyc7XG4gIC8vIGBsZW5gIGlzIHRoZSBgcGFkYCdzIGxlbmd0aCBub3dcbiAgbGVuID0gbGVuIC0gc3RyLmxlbmd0aDtcbiAgLy8gZG9lc24ndCBuZWVkIHRvIHBhZFxuICBpZiAobGVuIDw9IDApIHJldHVybiBzdHI7XG4gIC8vIGBjaGAgZGVmYXVsdHMgdG8gYCcgJ2BcbiAgaWYgKCFjaCAmJiBjaCAhPT0gMCkgY2ggPSAnICc7XG4gIC8vIGNvbnZlcnQgYGNoYCB0byBgc3RyaW5nYFxuICBjaCA9IGNoICsgJyc7XG4gIC8vIGNhY2hlIGNvbW1vbiB1c2UgY2FzZXNcbiAgaWYgKGNoID09PSAnICcgJiYgbGVuIDwgMTApIHJldHVybiBjYWNoZVtsZW5dICsgc3RyO1xuICAvLyBgcGFkYCBzdGFydHMgd2l0aCBhbiBlbXB0eSBzdHJpbmdcbiAgdmFyIHBhZCA9ICcnO1xuICAvLyBsb29wXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgLy8gYWRkIGBjaGAgdG8gYHBhZGAgaWYgYGxlbmAgaXMgb2RkXG4gICAgaWYgKGxlbiAmIDEpIHBhZCArPSBjaDtcbiAgICAvLyBkZXZpZGUgYGxlbmAgYnkgMiwgZGl0Y2ggdGhlIGZyYWN0aW9uXG4gICAgbGVuID4+PSAxO1xuICAgIC8vIFwiZG91YmxlXCIgdGhlIGBjaGAgc28gdGhpcyBvcGVyYXRpb24gY291bnQgZ3Jvd3MgbG9nYXJpdGhtaWNhbGx5IG9uIGBsZW5gXG4gICAgLy8gZWFjaCB0aW1lIGBjaGAgaXMgXCJkb3VibGVkXCIsIHRoZSBgbGVuYCB3b3VsZCBuZWVkIHRvIGJlIFwiZG91YmxlZFwiIHRvb1xuICAgIC8vIHNpbWlsYXIgdG8gZmluZGluZyBhIHZhbHVlIGluIGJpbmFyeSBzZWFyY2ggdHJlZSwgaGVuY2UgTyhsb2cobikpXG4gICAgaWYgKGxlbikgY2ggKz0gY2g7XG4gICAgLy8gYGxlbmAgaXMgMCwgZXhpdCB0aGUgbG9vcFxuICAgIGVsc2UgYnJlYWs7XG4gIH1cbiAgLy8gcGFkIGBzdHJgIVxuICByZXR1cm4gcGFkICsgc3RyO1xufVxuIiwiLypcbiAqIHNtb290aHNjcm9sbCBwb2x5ZmlsbCAtIHYwLjMuNFxuICogaHR0cHM6Ly9pYW1kdXN0YW4uZ2l0aHViLmlvL3Ntb290aHNjcm9sbFxuICogMjAxNiAoYykgRHVzdGFuIEthc3RlbiwgSmVyZW1pYXMgTWVuaWNoZWxsaSAtIE1JVCBMaWNlbnNlXG4gKi9cblxuKGZ1bmN0aW9uKHcsIGQsIHVuZGVmaW5lZCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLypcbiAgICogYWxpYXNlc1xuICAgKiB3OiB3aW5kb3cgZ2xvYmFsIG9iamVjdFxuICAgKiBkOiBkb2N1bWVudFxuICAgKiB1bmRlZmluZWQ6IHVuZGVmaW5lZFxuICAgKi9cblxuICAvLyBwb2x5ZmlsbFxuICBmdW5jdGlvbiBwb2x5ZmlsbCgpIHtcbiAgICAvLyByZXR1cm4gd2hlbiBzY3JvbGxCZWhhdmlvciBpbnRlcmZhY2UgaXMgc3VwcG9ydGVkXG4gICAgaWYgKCdzY3JvbGxCZWhhdmlvcicgaW4gZC5kb2N1bWVudEVsZW1lbnQuc3R5bGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIGdsb2JhbHNcbiAgICAgKi9cbiAgICB2YXIgRWxlbWVudCA9IHcuSFRNTEVsZW1lbnQgfHwgdy5FbGVtZW50O1xuICAgIHZhciBTQ1JPTExfVElNRSA9IDQ2ODtcblxuICAgIC8qXG4gICAgICogb2JqZWN0IGdhdGhlcmluZyBvcmlnaW5hbCBzY3JvbGwgbWV0aG9kc1xuICAgICAqL1xuICAgIHZhciBvcmlnaW5hbCA9IHtcbiAgICAgIHNjcm9sbDogdy5zY3JvbGwgfHwgdy5zY3JvbGxUbyxcbiAgICAgIHNjcm9sbEJ5OiB3LnNjcm9sbEJ5LFxuICAgICAgc2Nyb2xsSW50b1ZpZXc6IEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogZGVmaW5lIHRpbWluZyBtZXRob2RcbiAgICAgKi9cbiAgICB2YXIgbm93ID0gdy5wZXJmb3JtYW5jZSAmJiB3LnBlcmZvcm1hbmNlLm5vd1xuICAgICAgPyB3LnBlcmZvcm1hbmNlLm5vdy5iaW5kKHcucGVyZm9ybWFuY2UpIDogRGF0ZS5ub3c7XG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2VzIHNjcm9sbCBwb3NpdGlvbiBpbnNpZGUgYW4gZWxlbWVudFxuICAgICAqIEBtZXRob2Qgc2Nyb2xsRWxlbWVudFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzY3JvbGxFbGVtZW50KHgsIHkpIHtcbiAgICAgIHRoaXMuc2Nyb2xsTGVmdCA9IHg7XG4gICAgICB0aGlzLnNjcm9sbFRvcCA9IHk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyByZXN1bHQgb2YgYXBwbHlpbmcgZWFzZSBtYXRoIGZ1bmN0aW9uIHRvIGEgbnVtYmVyXG4gICAgICogQG1ldGhvZCBlYXNlXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGtcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGVhc2Uoaykge1xuICAgICAgcmV0dXJuIDAuNSAqICgxIC0gTWF0aC5jb3MoTWF0aC5QSSAqIGspKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBpbmRpY2F0ZXMgaWYgYSBzbW9vdGggYmVoYXZpb3Igc2hvdWxkIGJlIGFwcGxpZWRcbiAgICAgKiBAbWV0aG9kIHNob3VsZEJhaWxPdXRcbiAgICAgKiBAcGFyYW0ge051bWJlcnxPYmplY3R9IHhcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzaG91bGRCYWlsT3V0KHgpIHtcbiAgICAgIGlmICh0eXBlb2YgeCAhPT0gJ29iamVjdCdcbiAgICAgICAgICAgIHx8IHggPT09IG51bGxcbiAgICAgICAgICAgIHx8IHguYmVoYXZpb3IgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgfHwgeC5iZWhhdmlvciA9PT0gJ2F1dG8nXG4gICAgICAgICAgICB8fCB4LmJlaGF2aW9yID09PSAnaW5zdGFudCcpIHtcbiAgICAgICAgLy8gZmlyc3QgYXJnIG5vdCBhbiBvYmplY3QvbnVsbFxuICAgICAgICAvLyBvciBiZWhhdmlvciBpcyBhdXRvLCBpbnN0YW50IG9yIHVuZGVmaW5lZFxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiB4ID09PSAnb2JqZWN0J1xuICAgICAgICAgICAgJiYgeC5iZWhhdmlvciA9PT0gJ3Ntb290aCcpIHtcbiAgICAgICAgLy8gZmlyc3QgYXJndW1lbnQgaXMgYW4gb2JqZWN0IGFuZCBiZWhhdmlvciBpcyBzbW9vdGhcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyB0aHJvdyBlcnJvciB3aGVuIGJlaGF2aW9yIGlzIG5vdCBzdXBwb3J0ZWRcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2JlaGF2aW9yIG5vdCB2YWxpZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGZpbmRzIHNjcm9sbGFibGUgcGFyZW50IG9mIGFuIGVsZW1lbnRcbiAgICAgKiBAbWV0aG9kIGZpbmRTY3JvbGxhYmxlUGFyZW50XG4gICAgICogQHBhcmFtIHtOb2RlfSBlbFxuICAgICAqIEByZXR1cm5zIHtOb2RlfSBlbFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZpbmRTY3JvbGxhYmxlUGFyZW50KGVsKSB7XG4gICAgICB2YXIgaXNCb2R5O1xuICAgICAgdmFyIGhhc1Njcm9sbGFibGVTcGFjZTtcbiAgICAgIHZhciBoYXNWaXNpYmxlT3ZlcmZsb3c7XG5cbiAgICAgIGRvIHtcbiAgICAgICAgZWwgPSBlbC5wYXJlbnROb2RlO1xuXG4gICAgICAgIC8vIHNldCBjb25kaXRpb24gdmFyaWFibGVzXG4gICAgICAgIGlzQm9keSA9IGVsID09PSBkLmJvZHk7XG4gICAgICAgIGhhc1Njcm9sbGFibGVTcGFjZSA9XG4gICAgICAgICAgZWwuY2xpZW50SGVpZ2h0IDwgZWwuc2Nyb2xsSGVpZ2h0IHx8XG4gICAgICAgICAgZWwuY2xpZW50V2lkdGggPCBlbC5zY3JvbGxXaWR0aDtcbiAgICAgICAgaGFzVmlzaWJsZU92ZXJmbG93ID1cbiAgICAgICAgICB3LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpLm92ZXJmbG93ID09PSAndmlzaWJsZSc7XG4gICAgICB9IHdoaWxlICghaXNCb2R5ICYmICEoaGFzU2Nyb2xsYWJsZVNwYWNlICYmICFoYXNWaXNpYmxlT3ZlcmZsb3cpKTtcblxuICAgICAgaXNCb2R5ID0gaGFzU2Nyb2xsYWJsZVNwYWNlID0gaGFzVmlzaWJsZU92ZXJmbG93ID0gbnVsbDtcblxuICAgICAgcmV0dXJuIGVsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNlbGYgaW52b2tlZCBmdW5jdGlvbiB0aGF0LCBnaXZlbiBhIGNvbnRleHQsIHN0ZXBzIHRocm91Z2ggc2Nyb2xsaW5nXG4gICAgICogQG1ldGhvZCBzdGVwXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzdGVwKGNvbnRleHQpIHtcbiAgICAgIC8vIGNhbGwgbWV0aG9kIGFnYWluIG9uIG5leHQgYXZhaWxhYmxlIGZyYW1lXG4gICAgICBjb250ZXh0LmZyYW1lID0gdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc3RlcC5iaW5kKHcsIGNvbnRleHQpKTtcblxuICAgICAgdmFyIHRpbWUgPSBub3coKTtcbiAgICAgIHZhciB2YWx1ZTtcbiAgICAgIHZhciBjdXJyZW50WDtcbiAgICAgIHZhciBjdXJyZW50WTtcbiAgICAgIHZhciBlbGFwc2VkID0gKHRpbWUgLSBjb250ZXh0LnN0YXJ0VGltZSkgLyBTQ1JPTExfVElNRTtcblxuICAgICAgLy8gYXZvaWQgZWxhcHNlZCB0aW1lcyBoaWdoZXIgdGhhbiBvbmVcbiAgICAgIGVsYXBzZWQgPSBlbGFwc2VkID4gMSA/IDEgOiBlbGFwc2VkO1xuXG4gICAgICAvLyBhcHBseSBlYXNpbmcgdG8gZWxhcHNlZCB0aW1lXG4gICAgICB2YWx1ZSA9IGVhc2UoZWxhcHNlZCk7XG5cbiAgICAgIGN1cnJlbnRYID0gY29udGV4dC5zdGFydFggKyAoY29udGV4dC54IC0gY29udGV4dC5zdGFydFgpICogdmFsdWU7XG4gICAgICBjdXJyZW50WSA9IGNvbnRleHQuc3RhcnRZICsgKGNvbnRleHQueSAtIGNvbnRleHQuc3RhcnRZKSAqIHZhbHVlO1xuXG4gICAgICBjb250ZXh0Lm1ldGhvZC5jYWxsKGNvbnRleHQuc2Nyb2xsYWJsZSwgY3VycmVudFgsIGN1cnJlbnRZKTtcblxuICAgICAgLy8gcmV0dXJuIHdoZW4gZW5kIHBvaW50cyBoYXZlIGJlZW4gcmVhY2hlZFxuICAgICAgaWYgKGN1cnJlbnRYID09PSBjb250ZXh0LnggJiYgY3VycmVudFkgPT09IGNvbnRleHQueSkge1xuICAgICAgICB3LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGNvbnRleHQuZnJhbWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc2Nyb2xscyB3aW5kb3cgd2l0aCBhIHNtb290aCBiZWhhdmlvclxuICAgICAqIEBtZXRob2Qgc21vb3RoU2Nyb2xsXG4gICAgICogQHBhcmFtIHtPYmplY3R8Tm9kZX0gZWxcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gICAgICovXG4gICAgZnVuY3Rpb24gc21vb3RoU2Nyb2xsKGVsLCB4LCB5KSB7XG4gICAgICB2YXIgc2Nyb2xsYWJsZTtcbiAgICAgIHZhciBzdGFydFg7XG4gICAgICB2YXIgc3RhcnRZO1xuICAgICAgdmFyIG1ldGhvZDtcbiAgICAgIHZhciBzdGFydFRpbWUgPSBub3coKTtcbiAgICAgIHZhciBmcmFtZTtcblxuICAgICAgLy8gZGVmaW5lIHNjcm9sbCBjb250ZXh0XG4gICAgICBpZiAoZWwgPT09IGQuYm9keSkge1xuICAgICAgICBzY3JvbGxhYmxlID0gdztcbiAgICAgICAgc3RhcnRYID0gdy5zY3JvbGxYIHx8IHcucGFnZVhPZmZzZXQ7XG4gICAgICAgIHN0YXJ0WSA9IHcuc2Nyb2xsWSB8fCB3LnBhZ2VZT2Zmc2V0O1xuICAgICAgICBtZXRob2QgPSBvcmlnaW5hbC5zY3JvbGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzY3JvbGxhYmxlID0gZWw7XG4gICAgICAgIHN0YXJ0WCA9IGVsLnNjcm9sbExlZnQ7XG4gICAgICAgIHN0YXJ0WSA9IGVsLnNjcm9sbFRvcDtcbiAgICAgICAgbWV0aG9kID0gc2Nyb2xsRWxlbWVudDtcbiAgICAgIH1cblxuICAgICAgLy8gY2FuY2VsIGZyYW1lIHdoZW4gYSBzY3JvbGwgZXZlbnQncyBoYXBwZW5pbmdcbiAgICAgIGlmIChmcmFtZSkge1xuICAgICAgICB3LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcbiAgICAgIH1cblxuICAgICAgLy8gc2Nyb2xsIGxvb3Bpbmcgb3ZlciBhIGZyYW1lXG4gICAgICBzdGVwKHtcbiAgICAgICAgc2Nyb2xsYWJsZTogc2Nyb2xsYWJsZSxcbiAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgIHN0YXJ0VGltZTogc3RhcnRUaW1lLFxuICAgICAgICBzdGFydFg6IHN0YXJ0WCxcbiAgICAgICAgc3RhcnRZOiBzdGFydFksXG4gICAgICAgIHg6IHgsXG4gICAgICAgIHk6IHksXG4gICAgICAgIGZyYW1lOiBmcmFtZVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBPUklHSU5BTCBNRVRIT0RTIE9WRVJSSURFU1xuICAgICAqL1xuXG4gICAgLy8gdy5zY3JvbGwgYW5kIHcuc2Nyb2xsVG9cbiAgICB3LnNjcm9sbCA9IHcuc2Nyb2xsVG8gPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGF2b2lkIHNtb290aCBiZWhhdmlvciBpZiBub3QgcmVxdWlyZWRcbiAgICAgIGlmIChzaG91bGRCYWlsT3V0KGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgb3JpZ2luYWwuc2Nyb2xsLmNhbGwoXG4gICAgICAgICAgdyxcbiAgICAgICAgICBhcmd1bWVudHNbMF0ubGVmdCB8fCBhcmd1bWVudHNbMF0sXG4gICAgICAgICAgYXJndW1lbnRzWzBdLnRvcCB8fCBhcmd1bWVudHNbMV1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBMRVQgVEhFIFNNT09USE5FU1MgQkVHSU4hXG4gICAgICBzbW9vdGhTY3JvbGwuY2FsbChcbiAgICAgICAgdyxcbiAgICAgICAgZC5ib2R5LFxuICAgICAgICB+fmFyZ3VtZW50c1swXS5sZWZ0LFxuICAgICAgICB+fmFyZ3VtZW50c1swXS50b3BcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8vIHcuc2Nyb2xsQnlcbiAgICB3LnNjcm9sbEJ5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCBzbW9vdGggYmVoYXZpb3IgaWYgbm90IHJlcXVpcmVkXG4gICAgICBpZiAoc2hvdWxkQmFpbE91dChhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIG9yaWdpbmFsLnNjcm9sbEJ5LmNhbGwoXG4gICAgICAgICAgdyxcbiAgICAgICAgICBhcmd1bWVudHNbMF0ubGVmdCB8fCBhcmd1bWVudHNbMF0sXG4gICAgICAgICAgYXJndW1lbnRzWzBdLnRvcCB8fCBhcmd1bWVudHNbMV1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBMRVQgVEhFIFNNT09USE5FU1MgQkVHSU4hXG4gICAgICBzbW9vdGhTY3JvbGwuY2FsbChcbiAgICAgICAgdyxcbiAgICAgICAgZC5ib2R5LFxuICAgICAgICB+fmFyZ3VtZW50c1swXS5sZWZ0ICsgKHcuc2Nyb2xsWCB8fCB3LnBhZ2VYT2Zmc2V0KSxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0udG9wICsgKHcuc2Nyb2xsWSB8fCB3LnBhZ2VZT2Zmc2V0KVxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgLy8gRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXdcbiAgICBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxJbnRvVmlldyA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYXZvaWQgc21vb3RoIGJlaGF2aW9yIGlmIG5vdCByZXF1aXJlZFxuICAgICAgaWYgKHNob3VsZEJhaWxPdXQoYXJndW1lbnRzWzBdKSkge1xuICAgICAgICBvcmlnaW5hbC5zY3JvbGxJbnRvVmlldy5jYWxsKHRoaXMsIGFyZ3VtZW50c1swXSB8fCB0cnVlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBMRVQgVEhFIFNNT09USE5FU1MgQkVHSU4hXG4gICAgICB2YXIgc2Nyb2xsYWJsZVBhcmVudCA9IGZpbmRTY3JvbGxhYmxlUGFyZW50KHRoaXMpO1xuICAgICAgdmFyIHBhcmVudFJlY3RzID0gc2Nyb2xsYWJsZVBhcmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHZhciBjbGllbnRSZWN0cyA9IHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgIGlmIChzY3JvbGxhYmxlUGFyZW50ICE9PSBkLmJvZHkpIHtcbiAgICAgICAgLy8gcmV2ZWFsIGVsZW1lbnQgaW5zaWRlIHBhcmVudFxuICAgICAgICBzbW9vdGhTY3JvbGwuY2FsbChcbiAgICAgICAgICB0aGlzLFxuICAgICAgICAgIHNjcm9sbGFibGVQYXJlbnQsXG4gICAgICAgICAgc2Nyb2xsYWJsZVBhcmVudC5zY3JvbGxMZWZ0ICsgY2xpZW50UmVjdHMubGVmdCAtIHBhcmVudFJlY3RzLmxlZnQsXG4gICAgICAgICAgc2Nyb2xsYWJsZVBhcmVudC5zY3JvbGxUb3AgKyBjbGllbnRSZWN0cy50b3AgLSBwYXJlbnRSZWN0cy50b3BcbiAgICAgICAgKTtcbiAgICAgICAgLy8gcmV2ZWFsIHBhcmVudCBpbiB2aWV3cG9ydFxuICAgICAgICB3LnNjcm9sbEJ5KHtcbiAgICAgICAgICBsZWZ0OiBwYXJlbnRSZWN0cy5sZWZ0LFxuICAgICAgICAgIHRvcDogcGFyZW50UmVjdHMudG9wLFxuICAgICAgICAgIGJlaGF2aW9yOiAnc21vb3RoJ1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHJldmVhbCBlbGVtZW50IGluIHZpZXdwb3J0XG4gICAgICAgIHcuc2Nyb2xsQnkoe1xuICAgICAgICAgIGxlZnQ6IGNsaWVudFJlY3RzLmxlZnQsXG4gICAgICAgICAgdG9wOiBjbGllbnRSZWN0cy50b3AsXG4gICAgICAgICAgYmVoYXZpb3I6ICdzbW9vdGgnXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgLy8gY29tbW9uanNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHsgcG9seWZpbGw6IHBvbHlmaWxsIH07XG4gIH0gZWxzZSB7XG4gICAgLy8gZ2xvYmFsXG4gICAgcG9seWZpbGwoKTtcbiAgfVxufSkod2luZG93LCBkb2N1bWVudCk7XG4iLCJjb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuXG5jb25zdCBzZWxmID0gbmV3IEV2ZW50RW1pdHRlcigpXG5cbnNlbGYuX2l0ZW1zID0gW11cbnNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ID0gLTFcblxuc2VsZi5fbm9kZXMgPSB7XG4gIHNlYXJjaDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NlYXJjaCcpLFxuICBpbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpLFxuICBhdXRvY29tcGxldGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUnKVxufVxuXG5zZWxmLmdldFNlbGVjdGVkSXRlbSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHNlbGYuZ2V0SXRlbXMoKSA9PT0gW10pIHJldHVyblxuXG4gIGlmIChzZWxmLmdldFNlbGVjdGVkSXRlbUluZGV4KCkgPT09IC0xKSB7XG4gICAgcmV0dXJuIHNlbGYuZ2V0SXRlbXMoKVswXVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBzZWxmLmdldEl0ZW1zKClbc2VsZi5nZXRTZWxlY3RlZEl0ZW1JbmRleCgpXVxuICB9XG59XG5cbnNlbGYuZ2V0U2VsZWN0ZWRJdGVtSW5kZXggPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleFxufVxuXG5zZWxmLmdldEl0ZW1zID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gc2VsZi5faXRlbXNcbn1cblxuc2VsZi5yZW1vdmVBbGxJdGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgd2hpbGUgKHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5maXJzdENoaWxkKSB7XG4gICAgc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLnJlbW92ZUNoaWxkKHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5maXJzdENoaWxkKVxuICB9XG4gIHNlbGYuX2l0ZW1zID0gW11cbiAgc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggPSAtMVxufVxuXG5zZWxmLmFkZEl0ZW0gPSBmdW5jdGlvbiAoaXRlbSkge1xuICBjb25zdCBsaXN0SXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgbGlzdEl0ZW0udGV4dENvbnRlbnQgPSBpdGVtLnZhbHVlXG4gIHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5hcHBlbmRDaGlsZChsaXN0SXRlbSlcbiAgc2VsZi5faXRlbXMucHVzaChpdGVtKVxufVxuXG5zZWxmLl9tb3ZlU2VsZWN0ZWQgPSBmdW5jdGlvbiAoc2hpZnQpIHtcbiAgaWYgKHNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ICsgc2hpZnQgPj0gc2VsZi5nZXRJdGVtcygpLmxlbmd0aCkge1xuICAgIHNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ID0gLTFcbiAgfSBlbHNlIGlmIChzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleCArIHNoaWZ0IDwgLTEpIHtcbiAgICBzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleCA9IHNlbGYuZ2V0SXRlbXMoKS5sZW5ndGggLSAxXG4gIH0gZWxzZSB7XG4gICAgc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggKz0gc2hpZnRcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZi5nZXRJdGVtcygpLmxlbmd0aDsgaSsrKSB7XG4gICAgc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmNoaWxkcmVuW2ldLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJylcbiAgfVxuICBpZiAoc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggPj0gMCkge1xuICAgIHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZVxuICAgICAgICAuY2hpbGRyZW5bc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXhdLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJylcbiAgfVxufVxuXG5zZWxmLl9oYW5kbGVJdGVtQ2xpY2sgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgaWYgKCFzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgcmV0dXJuXG4gIGNvbnN0IGl0ZW1JbmRleCA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mXG4gICAgICAuY2FsbChzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuY2hpbGRyZW4sIGV2ZW50LnRhcmdldClcbiAgc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggPSBpdGVtSW5kZXhcbiAgc2VsZi5lbWl0KCdzZWxlY3QnLCBzZWxmLmdldFNlbGVjdGVkSXRlbSgpKVxufVxuXG5zZWxmLl9oYW5kbGVLZXlkb3duID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGlmIChldmVudC5rZXkgPT09ICdBcnJvd0Rvd24nIHx8IGV2ZW50LmtleSA9PT0gJ0Fycm93VXAnKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGlmIChldmVudC5rZXkgPT09ICdBcnJvd0Rvd24nKSB7XG4gICAgICBzZWxmLl9tb3ZlU2VsZWN0ZWQoMSlcbiAgICB9IGVsc2UgaWYgKGV2ZW50LmtleSA9PT0gJ0Fycm93VXAnKSB7XG4gICAgICBzZWxmLl9tb3ZlU2VsZWN0ZWQoLTEpXG4gICAgfVxuICB9XG59XG5cbnNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlbGYuX2hhbmRsZUl0ZW1DbGljaylcbnNlbGYuX25vZGVzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBzZWxmLl9oYW5kbGVLZXlkb3duKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsImNvbnN0IHNlbGYgPSB7fVxuXG5zZWxmLmlzSUUgPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ01TSUUnKSAhPT0gLTEgfHxcbiAgICAgICAgICAgIG5hdmlnYXRvci5hcHBWZXJzaW9uLmluZGV4T2YoJ1RyaWRlbnQvJykgPiAwXG5cbmlmIChzZWxmLmlzSUUpIHtcbiAgc2VsZi5pbnB1dEV2ZW50ID0gJ3RleHRpbnB1dCdcbn0gZWxzZSB7XG4gIHNlbGYuaW5wdXRFdmVudCA9ICdpbnB1dCdcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCIvKiBnbG9iYWwgVVNFUlMgKi9cblxuY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJylcblxuY29uc3Qgc2VsZiA9IG5ldyBFdmVudEVtaXR0ZXIoKVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgdG9nZ2xlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZmF2Jylcbn1cblxuc2VsZi5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgbG9jYWxTdG9yYWdlVXNlciA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdmYXYnKSlcbiAgICBpZiAobG9jYWxTdG9yYWdlVXNlciA9PSBudWxsKSByZXR1cm5cblxuICAgIGNvbnN0IGNvcnJlY3RlZFVzZXIgPSBVU0VSUy5maWx0ZXIoZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgIHJldHVybiB1c2VyLnR5cGUgPT09IGxvY2FsU3RvcmFnZVVzZXIudHlwZSAmJlxuICAgICAgICAgICAgIHVzZXIudmFsdWUgPT09IGxvY2FsU3RvcmFnZVVzZXIudmFsdWVcbiAgICB9KVswXVxuICAgIHJldHVybiBjb3JyZWN0ZWRVc2VyXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzZWxmLmRlbGV0ZSgpXG4gICAgcmV0dXJuXG4gIH1cbn1cblxuc2VsZi5zZXQgPSBmdW5jdGlvbiAodXNlcikge1xuICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2ZhdicsIEpTT04uc3RyaW5naWZ5KHVzZXIpKVxuICBzZWxmLl9ub2Rlcy5pbm5lckhUTUwgPSAnJiN4RTgzODsnXG59XG5cbnNlbGYuZGVsZXRlID0gZnVuY3Rpb24gKCkge1xuICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2ZhdicpXG59XG5cbnNlbGYudXBkYXRlRG9tID0gZnVuY3Rpb24gKGlzRmF2b3JpdGUpIHtcbiAgaWYgKGlzRmF2b3JpdGUpIHtcbiAgICBzZWxmLl9ub2Rlcy50b2dnbGUuaW5uZXJIVE1MID0gJyYjeEU4Mzg7J1xuICB9IGVsc2Uge1xuICAgIHNlbGYuX25vZGVzLnRvZ2dsZS5pbm5lckhUTUwgPSAnJiN4RTgzQSdcbiAgfVxufVxuXG5zZWxmLnVwZGF0ZSA9IGZ1bmN0aW9uIChzZWxlY3RlZFVzZXIpIHtcbiAgY29uc3QgY3VycmVudFVzZXIgPSBzZWxmLmdldCgpXG5cbiAgaWYgKGN1cnJlbnRVc2VyID09IG51bGwpIHtcbiAgICBzZWxmLnVwZGF0ZURvbShmYWxzZSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbnN0IGlzRXF1YWwgPSBjdXJyZW50VXNlci50eXBlID09PSBzZWxlY3RlZFVzZXIudHlwZSAmJlxuICAgICAgICAgICAgICAgICAgY3VycmVudFVzZXIuaW5kZXggPT09IHNlbGVjdGVkVXNlci5pbmRleFxuXG4gIHNlbGYudXBkYXRlRG9tKGlzRXF1YWwpXG59XG5cbnNlbGYudG9nZ2xlID0gZnVuY3Rpb24gKHNlbGVjdGVkVXNlcikge1xuICBjb25zdCBjdXJyZW50VXNlciA9IHNlbGYuZ2V0KClcbiAgY29uc3QgaXNFcXVhbCA9IGN1cnJlbnRVc2VyICE9IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRVc2VyLnR5cGUgPT09IHNlbGVjdGVkVXNlci50eXBlICYmXG4gICAgICAgICAgICAgICAgICBjdXJyZW50VXNlci5pbmRleCA9PT0gc2VsZWN0ZWRVc2VyLmluZGV4XG5cbiAgaWYgKGlzRXF1YWwpIHtcbiAgICBzZWxmLmRlbGV0ZSgpXG4gICAgc2VsZi51cGRhdGVEb20oZmFsc2UpXG4gIH0gZWxzZSB7XG4gICAgc2VsZi5zZXQoc2VsZWN0ZWRVc2VyKVxuICAgIHNlbGYudXBkYXRlRG9tKHRydWUpXG4gIH1cbn1cblxuc2VsZi5faGFuZGxlQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHNlbGYuZW1pdCgnY2xpY2snKVxufVxuXG5zZWxmLl9ub2Rlcy50b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxmLl9oYW5kbGVDbGljaylcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJjb25zdCBicm93c2VyRml4VG9vbGtpdCA9IHJlcXVpcmUoJy4vYnJvd3NlckZpeFRvb2xraXQnKVxuXG5jb25zdCBzZWxmID0ge31cblxuc2VsZi5fbm9kZXMgPSB7XG4gIGlucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJylcbn1cblxuc2VsZi5pc1Nob3duID0gZmFsc2Vcblxuc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ25vLWlucHV0JylcbiAgc2VsZi5pc1Nob3duID0gdHJ1ZVxufVxuXG5zZWxmLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbm8taW5wdXQnKVxuICBzZWxmLmlzU2hvd24gPSBmYWxzZVxufVxuXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKGJyb3dzZXJGaXhUb29sa2l0LmlucHV0RXZlbnQsIHNlbGYuaGlkZSlcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJjb25zdCBmcm9udHBhZ2UgPSByZXF1aXJlKCcuL2Zyb250cGFnZScpXG5jb25zdCBzZWFyY2ggPSByZXF1aXJlKCcuL3NlYXJjaCcpXG5jb25zdCBzY2hlZHVsZSA9IHJlcXVpcmUoJy4vc2NoZWR1bGUnKVxuY29uc3Qgd2Vla1NlbGVjdG9yID0gcmVxdWlyZSgnLi93ZWVrU2VsZWN0b3InKVxuY29uc3QgZmF2b3JpdGUgPSByZXF1aXJlKCcuL2Zhdm9yaXRlJylcbmNvbnN0IHNjcm9sbFNuYXAgPSByZXF1aXJlKCcuL3Njcm9sbFNuYXAnKVxuXG5jb25zdCBzdGF0ZSA9IHt9XG5cbndpbmRvdy5zdGF0ZSA9IHN0YXRlXG53aW5kb3cucmVxdWlyZSA9IHJlcXVpcmVcblxuZnJvbnRwYWdlLnNob3coKVxud2Vla1NlbGVjdG9yLnVwZGF0ZUN1cnJlbnRXZWVrKClcbnNjcm9sbFNuYXAuc3RhcnRMaXN0ZW5pbmcoKVxuXG5pZiAoZmF2b3JpdGUuZ2V0KCkgIT0gbnVsbCkge1xuICBzdGF0ZS5zZWxlY3RlZEl0ZW0gPSBmYXZvcml0ZS5nZXQoKVxuICBmYXZvcml0ZS51cGRhdGUoc3RhdGUuc2VsZWN0ZWRJdGVtKVxuICBzY2hlZHVsZS52aWV3SXRlbSh3ZWVrU2VsZWN0b3IuZ2V0U2VsZWN0ZWRXZWVrKCksIHN0YXRlLnNlbGVjdGVkSXRlbSlcbn0gZWxzZSB7XG4gIHNlYXJjaC5mb2N1cygpXG59XG5cbnNlYXJjaC5vbignc2VhcmNoJywgZnVuY3Rpb24gKHNlbGVjdGVkSXRlbSkge1xuICBzdGF0ZS5zZWxlY3RlZEl0ZW0gPSBzZWxlY3RlZEl0ZW1cbiAgZmF2b3JpdGUudXBkYXRlKHN0YXRlLnNlbGVjdGVkSXRlbSlcbiAgc2NoZWR1bGUudmlld0l0ZW0od2Vla1NlbGVjdG9yLmdldFNlbGVjdGVkV2VlaygpLCBzdGF0ZS5zZWxlY3RlZEl0ZW0pXG59KVxuXG53ZWVrU2VsZWN0b3Iub24oJ3dlZWtDaGFuZ2VkJywgZnVuY3Rpb24gKG5ld1dlZWspIHtcbiAgc2NoZWR1bGUudmlld0l0ZW0obmV3V2Vlaywgc3RhdGUuc2VsZWN0ZWRJdGVtKVxufSlcblxuZmF2b3JpdGUub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICBmYXZvcml0ZS50b2dnbGUoc3RhdGUuc2VsZWN0ZWRJdGVtKVxufSlcblxuZG9jdW1lbnQuYm9keS5zdHlsZS5vcGFjaXR5ID0gMVxuIiwiY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJylcbmNvbnN0IGxlZnRQYWQgPSByZXF1aXJlKCdsZWZ0LXBhZCcpXG5jb25zdCBzZWFyY2ggPSByZXF1aXJlKCcuL3NlYXJjaCcpXG5cbmNvbnN0IHNlbGYgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fbm9kZXMgPSB7XG4gIHNjaGVkdWxlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2NoZWR1bGUnKVxufVxuXG5zZWxmLl9wYXJzZU1lZXRpbmdwb2ludEhUTUwgPSBmdW5jdGlvbiAoaHRtbFN0cikge1xuICBjb25zdCBodG1sID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaHRtbCcpXG4gIGh0bWwuaW5uZXJIVE1MID0gaHRtbFN0clxuICBjb25zdCBjZW50ZXJOb2RlID0gaHRtbC5xdWVyeVNlbGVjdG9yKCdjZW50ZXInKVxuICByZXR1cm4gY2VudGVyTm9kZVxufVxuXG5zZWxmLl9oYW5kbGVMb2FkID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGNvbnN0IHJlcXVlc3QgPSBldmVudC50YXJnZXRcbiAgaWYgKHJlcXVlc3Quc3RhdHVzIDwgMjAwIHx8IHJlcXVlc3Quc3RhdHVzID49IDQwMCkge1xuICAgIHNlbGYuX2hhbmRsZUVycm9yKGV2ZW50KVxuICAgIHJldHVyblxuICB9XG4gIGNvbnN0IGRvY3VtZW50ID0gc2VsZi5fcGFyc2VNZWV0aW5ncG9pbnRIVE1MKHJlcXVlc3QucmVzcG9uc2UpXG4gIHNlbGYuX3JlbW92ZUNoaWxkcygpXG4gIHNlbGYuX25vZGVzLnNjaGVkdWxlLmFwcGVuZENoaWxkKGRvY3VtZW50KVxuICBzZWxmLl9ub2Rlcy5zY2hlZHVsZS5jbGFzc0xpc3QucmVtb3ZlKCdlcnJvcicpXG4gIHNlbGYuZW1pdCgnbG9hZCcpXG59XG5cbnNlbGYuX2hhbmRsZUVycm9yID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGNvbnN0IHJlcXVlc3QgPSBldmVudC50YXJnZXRcbiAgbGV0IGVycm9yXG4gIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgZXJyb3IgPSAnU29ycnksIGVyIGlzIChub2cpIGdlZW4gcm9vc3RlciB2b29yIGRlemUgd2Vlay4nXG4gIH0gZWxzZSB7XG4gICAgZXJyb3IgPSAnU29ycnksIGVyIGlzIGlldHMgbWlzIGdlZ2FhbiB0aWpkZW5zIGhldCBsYWRlbiB2YW4gZGV6ZSB3ZWVrLidcbiAgfVxuICBzZWxmLl9yZW1vdmVDaGlsZHMoKVxuICBzZWxmLl9ub2Rlcy5zY2hlZHVsZS50ZXh0Q29udGVudCA9IGVycm9yXG4gIHNlbGYuX25vZGVzLnNjaGVkdWxlLmNsYXNzTGlzdC5hZGQoJ2Vycm9yJylcbiAgc2VsZi5lbWl0KCdsb2FkJylcbn1cblxuc2VsZi5fZ2V0VVJMT2ZVc2VycyA9IGZ1bmN0aW9uICh3ZWVrLCB0eXBlLCBpbmRleCkge1xuICBjb25zdCBpZCA9IGluZGV4ICsgMVxuICByZXR1cm4gJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgJy9tZWV0aW5ncG9pbnRQcm94eS9Sb29zdGVycy1BTCUyRmRvYyUyRmRhZ3Jvb3N0ZXJzJTJGJyArXG4gICAgICB3ZWVrICsgJyUyRicgKyB0eXBlICsgJyUyRicgKyB0eXBlICsgbGVmdFBhZChpZCwgNSwgJzAnKSArICcuaHRtJ1xufVxuXG5zZWxmLl9yZW1vdmVDaGlsZHMgPSBmdW5jdGlvbiAoKSB7XG4gIHdoaWxlIChzZWxmLl9ub2Rlcy5zY2hlZHVsZS5maXJzdENoaWxkKSB7XG4gICAgc2VsZi5fbm9kZXMuc2NoZWR1bGUucmVtb3ZlQ2hpbGQoc2VsZi5fbm9kZXMuc2NoZWR1bGUuZmlyc3RDaGlsZClcbiAgfVxufVxuXG5zZWxmLnZpZXdJdGVtID0gZnVuY3Rpb24gKHdlZWssIHNlbGVjdGVkVXNlcikge1xuICBjb25zdCB1cmwgPSBzZWxmLl9nZXRVUkxPZlVzZXJzKHdlZWssIHNlbGVjdGVkVXNlci50eXBlLCBzZWxlY3RlZFVzZXIuaW5kZXgpXG5cbiAgc2VsZi5fcmVtb3ZlQ2hpbGRzKClcblxuICBjb25zdCByZXF1ZXN0ID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpXG4gIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHNlbGYuX2hhbmRsZUxvYWQpXG4gIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBzZWxmLl9oYW5kbGVFcnJvcilcbiAgcmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpXG4gIHJlcXVlc3Quc2VuZCgpXG5cbiAgc2VhcmNoLnVwZGF0ZURvbShzZWxlY3RlZFVzZXIpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwicmVxdWlyZSgnc21vb3Roc2Nyb2xsLXBvbHlmaWxsJykucG9seWZpbGwoKVxuXG5jb25zdCBzZWxmID0ge31cbmNvbnN0IHNjaGVkdWxlID0gcmVxdWlyZSgnLi9zY2hlZHVsZScpXG5cbnNlbGYuX25vZGVzID0ge1xuICBzZWFyY2g6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzZWFyY2gnKSxcbiAgd2Vla1NlbGVjdG9yOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd2Vlay1zZWxlY3RvcicpXG59XG5cbnNlbGYuX3RpbWVvdXRJRCA9IG51bGxcblxuc2VsZi5fZ2V0U2Nyb2xsUG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3ApIHx8XG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3Bcbn1cblxuc2VsZi5faGFuZGxlRG9uZVNjcm9sbGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgc2Nyb2xsUG9zaXRpb24gPSBzZWxmLl9nZXRTY3JvbGxQb3NpdGlvbigpXG4gIGNvbnN0IHdlZWtTZWxlY3RvckhlaWdodCA9IHNlbGYuX25vZGVzLndlZWtTZWxlY3Rvci5jbGllbnRIZWlnaHQgLSBzZWxmLl9ub2Rlcy5zZWFyY2guY2xpZW50SGVpZ2h0XG4gIGlmIChzY3JvbGxQb3NpdGlvbiA8IHdlZWtTZWxlY3RvckhlaWdodCAmJiBzY3JvbGxQb3NpdGlvbiA+IDApIHtcbiAgICB3aW5kb3cuc2Nyb2xsKHsgdG9wOiB3ZWVrU2VsZWN0b3JIZWlnaHQsIGxlZnQ6IDAsIGJlaGF2aW9yOiAnc21vb3RoJyB9KVxuICB9XG59XG5cbnNlbGYuX2hhbmRsZVNjcm9sbCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHNlbGYuX3RpbWVvdXRJRCAhPSBudWxsKSB3aW5kb3cuY2xlYXJUaW1lb3V0KHNlbGYuX3RpbWVvdXRJRClcbiAgc2VsZi5fdGltZW91dElEID0gd2luZG93LnNldFRpbWVvdXQoc2VsZi5faGFuZGxlRG9uZVNjcm9sbGluZywgNTAwKVxuXG4gIGNvbnN0IHNjcm9sbFBvc2l0aW9uID0gc2VsZi5fZ2V0U2Nyb2xsUG9zaXRpb24oKVxuICBjb25zdCB3ZWVrU2VsZWN0b3JIZWlnaHQgPSBzZWxmLl9ub2Rlcy53ZWVrU2VsZWN0b3IuY2xpZW50SGVpZ2h0IC0gc2VsZi5fbm9kZXMuc2VhcmNoLmNsaWVudEhlaWdodFxuICBpZiAoc2Nyb2xsUG9zaXRpb24gPj0gd2Vla1NlbGVjdG9ySGVpZ2h0KSB7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCd3ZWVrLXNlbGVjdG9yLW5vdC12aXNpYmxlJylcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3dlZWstc2VsZWN0b3Itbm90LXZpc2libGUnKVxuICB9XG59XG5cbnNlbGYuX2hhbmRsZVdpbmRvd1Jlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgd2Vla1NlbGVjdG9ySGVpZ2h0ID0gc2VsZi5fbm9kZXMud2Vla1NlbGVjdG9yLmNsaWVudEhlaWdodCAtIHNlbGYuX25vZGVzLnNlYXJjaC5jbGllbnRIZWlnaHRcbiAgY29uc3QgZXh0cmFQaXhlbHNOZWVkZWQgPSB3ZWVrU2VsZWN0b3JIZWlnaHQgLSAoZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQgLSB3aW5kb3cuaW5uZXJIZWlnaHQpXG4gIGlmIChleHRyYVBpeGVsc05lZWRlZCA+IDApIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm1hcmdpbkJvdHRvbSA9IGV4dHJhUGl4ZWxzTmVlZGVkICsgJ3B4J1xuICB9IGVsc2Uge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUubWFyZ2luQm90dG9tID0gbnVsbFxuICB9XG59XG5cbnNlbGYuc3RhcnRMaXN0ZW5pbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzZWxmLl9oYW5kbGVTY3JvbGwpXG59XG5cbnNjaGVkdWxlLm9uKCdsb2FkJywgc2VsZi5faGFuZGxlV2luZG93UmVzaXplKVxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNlbGYuX2hhbmRsZVdpbmRvd1Jlc2l6ZSlcbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwiLyogZ2xvYmFsIFVTRVJTICovXG5cbmNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5jb25zdCBmdXp6eSA9IHJlcXVpcmUoJ2Z1enp5JylcbmNvbnN0IGF1dG9jb21wbGV0ZSA9IHJlcXVpcmUoJy4vYXV0b2NvbXBsZXRlJylcbmNvbnN0IGJyb3dzZXJGaXhUb29sa2l0ID0gcmVxdWlyZSgnLi9icm93c2VyRml4VG9vbGtpdCcpXG5cbmNvbnN0IHNlbGYgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fbm9kZXMgPSB7XG4gIHNlYXJjaDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NlYXJjaCcpLFxuICBpbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpXG59XG5cbnNlbGYuc3VibWl0ID0gZnVuY3Rpb24gKCkge1xuICBzZWxmLl9ub2Rlcy5pbnB1dC5ibHVyKClcbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCd3ZWVrLXNlbGVjdG9yLW5vdC12aXNpYmxlJykgLy8gU2FmYXJpIGJ1Z1xuXG4gIGNvbnN0IHNlbGVjdGVkSXRlbSA9IGF1dG9jb21wbGV0ZS5nZXRTZWxlY3RlZEl0ZW0oKVxuXG4gIGNvbnNvbGUubG9nKHNlbGVjdGVkSXRlbSlcblxuICBzZWxmLmVtaXQoJ3NlYXJjaCcsIHNlbGVjdGVkSXRlbSlcbn1cblxuc2VsZi51cGRhdGVEb20gPSBmdW5jdGlvbiAoc2VsZWN0ZWRJdGVtKSB7XG4gIHNlbGYuX25vZGVzLmlucHV0LnZhbHVlID0gc2VsZWN0ZWRJdGVtLnZhbHVlXG4gIGF1dG9jb21wbGV0ZS5yZW1vdmVBbGxJdGVtcygpXG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbm8taW5wdXQnKVxuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3NlYXJjaGVkJylcbn1cblxuc2VsZi5mb2N1cyA9IGZ1bmN0aW9uICgpIHtcbiAgc2VsZi5fbm9kZXMuaW5wdXQuZm9jdXMoKVxufVxuXG5zZWxmLl9oYW5kbGVTdWJtaXQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICBzZWxmLnN1Ym1pdCgpXG59XG5cbnNlbGYuX2NhbGN1bGF0ZSA9IGZ1bmN0aW9uIChzZWFyY2hUZXJtKSB7XG4gIGNvbnN0IGFsbFJlc3VsdHMgPSBmdXp6eS5maWx0ZXIoc2VhcmNoVGVybSwgVVNFUlMsIHtcbiAgICBleHRyYWN0OiBmdW5jdGlvbiAoaXRlbSkgeyByZXR1cm4gaXRlbS52YWx1ZSB9XG4gIH0pXG4gIGNvbnN0IGZpcnN0UmVzdWx0cyA9IGFsbFJlc3VsdHMuc2xpY2UoMCwgNylcblxuICBjb25zdCBvcmlnaW5hbFJlc3VsdHMgPSBmaXJzdFJlc3VsdHMubWFwKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICByZXR1cm4gcmVzdWx0Lm9yaWdpbmFsXG4gIH0pXG5cbiAgcmV0dXJuIG9yaWdpbmFsUmVzdWx0c1xufVxuXG5zZWxmLl9oYW5kbGVUZXh0VXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCByZXN1bHRzID0gc2VsZi5fY2FsY3VsYXRlKHNlbGYuX25vZGVzLmlucHV0LnZhbHVlKVxuXG4gIGF1dG9jb21wbGV0ZS5yZW1vdmVBbGxJdGVtcygpXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgIGF1dG9jb21wbGV0ZS5hZGRJdGVtKHJlc3VsdHNbaV0pXG4gIH1cbn1cblxuc2VsZi5faGFuZGxlRm9jdXMgPSBmdW5jdGlvbiAoKSB7XG4gIHNlbGYuX25vZGVzLmlucHV0LnNlbGVjdCgpXG59XG5cbnNlbGYuX2hhbmRsZUJsdXIgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIHRoaXMgd2lsbCByZW1vdmVkIHRoZSBzZWxlY3Rpb24gd2l0aG91dCBkcmF3aW5nIGZvY3VzIG9uIGl0IChzYWZhcmkpXG4gIC8vIHRoaXMgd2lsbCByZW1vdmVkIHNlbGVjdGlvbiBldmVuIHdoZW4gZm9jdXNpbmcgYW4gaWZyYW1lIChjaHJvbWUpXG4gIGNvbnN0IG9sZFZhbHVlID0gc2VsZi5fbm9kZXMudmFsdWVcbiAgc2VsZi5fbm9kZXMudmFsdWUgPSAnJ1xuICBzZWxmLl9ub2Rlcy52YWx1ZSA9IG9sZFZhbHVlXG5cbiAgLy8gdGhpcyB3aWxsIGhpZGUgdGhlIGtleWJvYXJkIChpT1Mgc2FmYXJpKVxuICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKVxufVxuXG5hdXRvY29tcGxldGUub24oJ3NlbGVjdCcsIHNlbGYuc3VibWl0KVxuXG5zZWxmLl9ub2Rlcy5zZWFyY2guYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0Jywgc2VsZi5faGFuZGxlU3VibWl0KVxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBzZWxmLl9oYW5kbGVGb2N1cylcbnNlbGYuX25vZGVzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCBzZWxmLl9oYW5kbGVCbHVyKVxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihicm93c2VyRml4VG9vbGtpdC5pbnB1dEV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9oYW5kbGVUZXh0VXBkYXRlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsImNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5cbmNvbnN0IHNlbGYgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fbm9kZXMgPSB7XG4gIHByZXZCdXR0b246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN3ZWVrLXNlbGVjdG9yIGJ1dHRvbicpWzBdLFxuICBuZXh0QnV0dG9uOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjd2Vlay1zZWxlY3RvciBidXR0b24nKVsxXSxcbiAgY3VycmVudFdlZWtUZXh0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd2Vlay1zZWxlY3RvciAuY3VycmVudCcpXG59XG5cbnNlbGYuX3dlZWtPZmZzZXQgPSAwXG5cbi8vIGNvcGllZCBmcm9tIGh0dHA6Ly93d3cubWVldGluZ3BvaW50bWNvLm5sL1Jvb3N0ZXJzLUFML2RvYy9kYWdyb29zdGVycy91bnRpc3NjcmlwdHMuanMsXG4vLyB3ZXJlIHVzaW5nIHRoZSBzYW1lIGNvZGUgYXMgdGhleSBkbyB0byBiZSBzdXJlIHRoYXQgd2UgYWx3YXlzIGdldCB0aGUgc2FtZVxuLy8gd2VlayBudW1iZXIuXG5zZWxmLmdldEN1cnJlbnRXZWVrID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICBjb25zdCBkYXlOciA9ICh0YXJnZXQuZ2V0RGF5KCkgKyA2KSAlIDdcbiAgdGFyZ2V0LnNldERhdGUodGFyZ2V0LmdldERhdGUoKSAtIGRheU5yICsgMylcbiAgY29uc3QgZmlyc3RUaHVyc2RheSA9IHRhcmdldC52YWx1ZU9mKClcbiAgdGFyZ2V0LnNldE1vbnRoKDAsIDEpXG4gIGlmICh0YXJnZXQuZ2V0RGF5KCkgIT09IDQpIHtcbiAgICB0YXJnZXQuc2V0TW9udGgoMCwgMSArICgoNCAtIHRhcmdldC5nZXREYXkoKSkgKyA3KSAlIDcpXG4gIH1cblxuICByZXR1cm4gMSArIE1hdGguY2VpbCgoZmlyc3RUaHVyc2RheSAtIHRhcmdldCkgLyA2MDQ4MDAwMDApXG59XG5cbnNlbGYuZ2V0U2VsZWN0ZWRXZWVrID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpXG4gIGNvbnN0IHRhcmdldERhdGUgPSBuZXcgRGF0ZShub3cuZ2V0VGltZSgpICtcbiAgICAgIHNlbGYuX3dlZWtPZmZzZXQgKiA2MDQ4MDAgKiAxMDAwICsgODY0MDAgKiAxMDAwKVxuICByZXR1cm4gc2VsZi5nZXRDdXJyZW50V2Vlayh0YXJnZXREYXRlKVxufVxuXG5zZWxmLnVwZGF0ZUN1cnJlbnRXZWVrID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBzZWxlY3RlZFdlZWtOdW1iZXIgPSBzZWxmLmdldFNlbGVjdGVkV2VlaygpXG4gIGlmIChzZWxmLmdldEN1cnJlbnRXZWVrKG5ldyBEYXRlKCkpICE9PSBzZWxlY3RlZFdlZWtOdW1iZXIpIHtcbiAgICBzZWxmLl9ub2Rlcy5jdXJyZW50V2Vla1RleHQuY2xhc3NMaXN0LmFkZCgnY2hhbmdlZCcpXG4gIH0gZWxzZSB7XG4gICAgc2VsZi5fbm9kZXMuY3VycmVudFdlZWtUZXh0LmNsYXNzTGlzdC5yZW1vdmUoJ2NoYW5nZWQnKVxuICB9XG4gIHNlbGYudXBkYXRlRG9tKClcbiAgc2VsZi5lbWl0KCd3ZWVrQ2hhbmdlZCcsIHNlbGVjdGVkV2Vla051bWJlcilcbn1cblxuc2VsZi51cGRhdGVEb20gPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHNlbGVjdGVkV2Vla051bWJlciA9IHNlbGYuZ2V0U2VsZWN0ZWRXZWVrKClcbiAgY29uc3QgaXNTdW5kYXkgPSBuZXcgRGF0ZSgpLmdldERheSgpID09PSAwXG4gIGxldCBodW1hblJlYWRhYmxlV2VlayA9IG51bGxcbiAgaWYgKGlzU3VuZGF5KSB7XG4gICAgc3dpdGNoIChzZWxmLl93ZWVrT2Zmc2V0KSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIGh1bWFuUmVhZGFibGVXZWVrID0gJ0FhbnN0YWFuZGUgd2VlaydcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaHVtYW5SZWFkYWJsZVdlZWsgPSAnVm9sZ2VuZGUgd2VlaydcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgLTE6XG4gICAgICAgIGh1bWFuUmVhZGFibGVXZWVrID0gJ0FmZ2Vsb3BlbiB3ZWVrJ1xuICAgICAgICBicmVha1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBzd2l0Y2ggKHNlbGYuX3dlZWtPZmZzZXQpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgaHVtYW5SZWFkYWJsZVdlZWsgPSAnSHVpZGlnZSB3ZWVrJ1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAxOlxuICAgICAgICBodW1hblJlYWRhYmxlV2VlayA9ICdWb2xnZW5kZSB3ZWVrJ1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAtMTpcbiAgICAgICAgaHVtYW5SZWFkYWJsZVdlZWsgPSAnVm9yaWdlIHdlZWsnXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIGlmIChodW1hblJlYWRhYmxlV2VlayAhPSBudWxsKSB7XG4gICAgc2VsZi5fbm9kZXMuY3VycmVudFdlZWtUZXh0LnRleHRDb250ZW50ID0gaHVtYW5SZWFkYWJsZVdlZWsgKyAnIOKAoiAnICsgc2VsZWN0ZWRXZWVrTnVtYmVyXG4gIH0gZWxzZSB7XG4gICAgc2VsZi5fbm9kZXMuY3VycmVudFdlZWtUZXh0LnRleHRDb250ZW50ID0gJ1dlZWsgJyArIHNlbGVjdGVkV2Vla051bWJlclxuICB9XG59XG5cbnNlbGYuX2hhbmRsZVByZXZCdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgc2VsZi5fd2Vla09mZnNldCAtPSAxXG4gIHNlbGYudXBkYXRlQ3VycmVudFdlZWsoKVxufVxuXG5zZWxmLl9oYW5kbGVOZXh0QnV0dG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHNlbGYuX3dlZWtPZmZzZXQgKz0gMVxuICBzZWxmLnVwZGF0ZUN1cnJlbnRXZWVrKClcbn1cblxuc2VsZi5fbm9kZXMucHJldkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlbGYuX2hhbmRsZVByZXZCdXR0b25DbGljaylcbnNlbGYuX25vZGVzLm5leHRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxmLl9oYW5kbGVOZXh0QnV0dG9uQ2xpY2spXG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIl19
