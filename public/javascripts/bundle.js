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

    const correctedUser = USERS.filter(user => user.type === localStorageUser.type && user.value === localStorageUser.value)[0];
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
  self._nodes.schedule.textContent = error;
  self._nodes.schedule.classList.add('error');
  self.emit('load');
};

self._getURLOfUsers = function (week, type, index) {
  const id = index + 1;
  return `//${ window.location.host }/meetingpointProxy/Roosters-AL%2Fdoc%2Fdagroosters%2F` + `${ week }%2F${ type }%2F${ type }${ leftPad(id, 5, '0') }.htm`;
};

self.viewItem = function (week, selectedUser) {
  const url = self._getURLOfUsers(week, selectedUser.type, selectedUser.index);

  while (self._nodes.schedule.firstChild) {
    self._nodes.schedule.removeChild(self._nodes.schedule.firstChild);
  }

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

self._handleDoneScrolling = function () {
  const scrollPosition = document.body.scrollTop;
  const weekSelectorHeight = self._nodes.weekSelector.clientHeight - self._nodes.search.clientHeight;
  if (scrollPosition < weekSelectorHeight && scrollPosition > 0) {
    window.scroll({ top: weekSelectorHeight, left: 0, behavior: 'smooth' });
  }
};

self._handleScroll = function () {
  if (self._timeoutID != null) window.clearTimeout(self._timeoutID);
  self._timeoutID = window.setTimeout(self._handleDoneScrolling, 500);

  const scrollPosition = document.body.scrollTop;
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
    document.body.style.marginBottom = `${ extraPixelsNeeded }px`;
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
    extract: item => item.value
  });
  const firstResults = allResults.slice(0, 7);

  const originalResults = firstResults.map(result => result.original);

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
    self._nodes.currentWeekText.textContent = `${ humanReadableWeek } • ${ selectedWeekNumber }`;
  } else {
    self._nodes.currentWeekText.textContent = `Week ${ selectedWeekNumber }`;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9mdXp6eS9saWIvZnV6enkuanMiLCJub2RlX21vZHVsZXMvbGVmdC1wYWQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc21vb3Roc2Nyb2xsLXBvbHlmaWxsL2Rpc3Qvc21vb3Roc2Nyb2xsLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2F1dG9jb21wbGV0ZS5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9icm93c2VyRml4VG9vbGtpdC5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9mYXZvcml0ZS5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9mcm9udHBhZ2UuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvbWFpbi5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9zY2hlZHVsZS5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9zY3JvbGxTbmFwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL3NlYXJjaC5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy93ZWVrU2VsZWN0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblNBLE1BQU0sZUFBZSxRQUFRLFFBQVIsQ0FBckI7O0FBRUEsTUFBTSxPQUFPLElBQUksWUFBSixFQUFiOztBQUVBLEtBQUssTUFBTCxHQUFjLEVBQWQ7QUFDQSxLQUFLLGtCQUFMLEdBQTBCLENBQUMsQ0FBM0I7O0FBRUEsS0FBSyxNQUFMLEdBQWM7QUFDWixVQUFRLFNBQVMsYUFBVCxDQUF1QixTQUF2QixDQURJO0FBRVosU0FBTyxTQUFTLGFBQVQsQ0FBdUIsc0JBQXZCLENBRks7QUFHWixnQkFBYyxTQUFTLGFBQVQsQ0FBdUIsZUFBdkI7QUFIRixDQUFkOztBQU1BLEtBQUssZUFBTCxHQUF1QixZQUFZO0FBQ2pDLE1BQUksS0FBSyxRQUFMLE9BQW9CLEVBQXhCLEVBQTRCOztBQUU1QixNQUFJLEtBQUssb0JBQUwsT0FBZ0MsQ0FBQyxDQUFyQyxFQUF3QztBQUN0QyxXQUFPLEtBQUssUUFBTCxHQUFnQixDQUFoQixDQUFQO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsV0FBTyxLQUFLLFFBQUwsR0FBZ0IsS0FBSyxvQkFBTCxFQUFoQixDQUFQO0FBQ0Q7QUFDRixDQVJEOztBQVVBLEtBQUssb0JBQUwsR0FBNEIsWUFBWTtBQUN0QyxTQUFPLEtBQUssa0JBQVo7QUFDRCxDQUZEOztBQUlBLEtBQUssUUFBTCxHQUFnQixZQUFZO0FBQzFCLFNBQU8sS0FBSyxNQUFaO0FBQ0QsQ0FGRDs7QUFJQSxLQUFLLGNBQUwsR0FBc0IsWUFBWTtBQUNoQyxTQUFPLEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsVUFBaEMsRUFBNEM7QUFDMUMsU0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixXQUF6QixDQUFxQyxLQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLFVBQTlEO0FBQ0Q7QUFDRCxPQUFLLE1BQUwsR0FBYyxFQUFkO0FBQ0EsT0FBSyxrQkFBTCxHQUEwQixDQUFDLENBQTNCO0FBQ0QsQ0FORDs7QUFRQSxLQUFLLE9BQUwsR0FBZSxVQUFVLElBQVYsRUFBZ0I7QUFDN0IsUUFBTSxXQUFXLFNBQVMsYUFBVCxDQUF1QixJQUF2QixDQUFqQjtBQUNBLFdBQVMsV0FBVCxHQUF1QixLQUFLLEtBQTVCO0FBQ0EsT0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixXQUF6QixDQUFxQyxRQUFyQztBQUNBLE9BQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsSUFBakI7QUFDRCxDQUxEOztBQU9BLEtBQUssYUFBTCxHQUFxQixVQUFVLEtBQVYsRUFBaUI7QUFDcEMsTUFBSSxLQUFLLGtCQUFMLEdBQTBCLEtBQTFCLElBQW1DLEtBQUssUUFBTCxHQUFnQixNQUF2RCxFQUErRDtBQUM3RCxTQUFLLGtCQUFMLEdBQTBCLENBQUMsQ0FBM0I7QUFDRCxHQUZELE1BRU8sSUFBSSxLQUFLLGtCQUFMLEdBQTBCLEtBQTFCLEdBQWtDLENBQUMsQ0FBdkMsRUFBMEM7QUFDL0MsU0FBSyxrQkFBTCxHQUEwQixLQUFLLFFBQUwsR0FBZ0IsTUFBaEIsR0FBeUIsQ0FBbkQ7QUFDRCxHQUZNLE1BRUE7QUFDTCxTQUFLLGtCQUFMLElBQTJCLEtBQTNCO0FBQ0Q7O0FBRUQsT0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLEtBQUssUUFBTCxHQUFnQixNQUFwQyxFQUE0QyxHQUE1QyxFQUFpRDtBQUMvQyxTQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLFFBQXpCLENBQWtDLENBQWxDLEVBQXFDLFNBQXJDLENBQStDLE1BQS9DLENBQXNELFVBQXREO0FBQ0Q7QUFDRCxNQUFJLEtBQUssa0JBQUwsSUFBMkIsQ0FBL0IsRUFBa0M7QUFDaEMsU0FBSyxNQUFMLENBQVksWUFBWixDQUNLLFFBREwsQ0FDYyxLQUFLLGtCQURuQixFQUN1QyxTQUR2QyxDQUNpRCxHQURqRCxDQUNxRCxVQURyRDtBQUVEO0FBQ0YsQ0FoQkQ7O0FBa0JBLEtBQUssZ0JBQUwsR0FBd0IsVUFBVSxLQUFWLEVBQWlCO0FBQ3ZDLE1BQUksQ0FBQyxLQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLFFBQXpCLENBQWtDLE1BQU0sTUFBeEMsQ0FBTCxFQUFzRDtBQUN0RCxRQUFNLFlBQVksTUFBTSxTQUFOLENBQWdCLE9BQWhCLENBQ2IsSUFEYSxDQUNSLEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsUUFEakIsRUFDMkIsTUFBTSxNQURqQyxDQUFsQjtBQUVBLE9BQUssa0JBQUwsR0FBMEIsU0FBMUI7QUFDQSxPQUFLLElBQUwsQ0FBVSxRQUFWLEVBQW9CLEtBQUssZUFBTCxFQUFwQjtBQUNELENBTkQ7O0FBUUEsS0FBSyxjQUFMLEdBQXNCLFVBQVUsS0FBVixFQUFpQjtBQUNyQyxNQUFJLE1BQU0sR0FBTixLQUFjLFdBQWQsSUFBNkIsTUFBTSxHQUFOLEtBQWMsU0FBL0MsRUFBMEQ7QUFDeEQsVUFBTSxjQUFOO0FBQ0EsUUFBSSxNQUFNLEdBQU4sS0FBYyxXQUFsQixFQUErQjtBQUM3QixXQUFLLGFBQUwsQ0FBbUIsQ0FBbkI7QUFDRCxLQUZELE1BRU8sSUFBSSxNQUFNLEdBQU4sS0FBYyxTQUFsQixFQUE2QjtBQUNsQyxXQUFLLGFBQUwsQ0FBbUIsQ0FBQyxDQUFwQjtBQUNEO0FBQ0Y7QUFDRixDQVREOztBQVdBLEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsZ0JBQXpCLENBQTBDLE9BQTFDLEVBQW1ELEtBQUssZ0JBQXhEO0FBQ0EsS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixnQkFBbEIsQ0FBbUMsU0FBbkMsRUFBOEMsS0FBSyxjQUFuRDs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsSUFBakI7OztBQ3RGQSxNQUFNLE9BQU8sRUFBYjs7QUFFQSxLQUFLLElBQUwsR0FBWSxVQUFVLFNBQVYsQ0FBb0IsT0FBcEIsQ0FBNEIsTUFBNUIsTUFBd0MsQ0FBQyxDQUF6QyxJQUNBLFVBQVUsVUFBVixDQUFxQixPQUFyQixDQUE2QixVQUE3QixJQUEyQyxDQUR2RDs7QUFHQSxJQUFJLEtBQUssSUFBVCxFQUFlO0FBQ2IsT0FBSyxVQUFMLEdBQWtCLFdBQWxCO0FBQ0QsQ0FGRCxNQUVPO0FBQ0wsT0FBSyxVQUFMLEdBQWtCLE9BQWxCO0FBQ0Q7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLElBQWpCOzs7QUNYQTs7QUFFQSxNQUFNLGVBQWUsUUFBUSxRQUFSLENBQXJCOztBQUVBLE1BQU0sT0FBTyxJQUFJLFlBQUosRUFBYjs7QUFFQSxLQUFLLE1BQUwsR0FBYztBQUNaLFVBQVEsU0FBUyxhQUFULENBQXVCLE1BQXZCO0FBREksQ0FBZDs7QUFJQSxLQUFLLEdBQUwsR0FBVyxZQUFZO0FBQ3JCLE1BQUk7QUFDRixVQUFNLG1CQUFtQixLQUFLLEtBQUwsQ0FBVyxPQUFPLFlBQVAsQ0FBb0IsT0FBcEIsQ0FBNEIsS0FBNUIsQ0FBWCxDQUF6QjtBQUNBLFFBQUksb0JBQW9CLElBQXhCLEVBQThCOztBQUU5QixVQUFNLGdCQUFnQixNQUFNLE1BQU4sQ0FBYSxRQUMvQixLQUFLLElBQUwsS0FBYyxpQkFBaUIsSUFBL0IsSUFDQSxLQUFLLEtBQUwsS0FBZSxpQkFBaUIsS0FGZCxFQUVxQixDQUZyQixDQUF0QjtBQUdBLFdBQU8sYUFBUDtBQUNELEdBUkQsQ0FRRSxPQUFPLENBQVAsRUFBVTtBQUNWLFNBQUssTUFBTDtBQUNBO0FBQ0Q7QUFDRixDQWJEOztBQWVBLEtBQUssR0FBTCxHQUFXLFVBQVUsSUFBVixFQUFnQjtBQUN6QixTQUFPLFlBQVAsQ0FBb0IsT0FBcEIsQ0FBNEIsS0FBNUIsRUFBbUMsS0FBSyxTQUFMLENBQWUsSUFBZixDQUFuQztBQUNBLE9BQUssTUFBTCxDQUFZLFNBQVosR0FBd0IsVUFBeEI7QUFDRCxDQUhEOztBQUtBLEtBQUssTUFBTCxHQUFjLFlBQVk7QUFDeEIsU0FBTyxZQUFQLENBQW9CLFVBQXBCLENBQStCLEtBQS9CO0FBQ0QsQ0FGRDs7QUFJQSxLQUFLLFNBQUwsR0FBaUIsVUFBVSxVQUFWLEVBQXNCO0FBQ3JDLE1BQUksVUFBSixFQUFnQjtBQUNkLFNBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsU0FBbkIsR0FBK0IsVUFBL0I7QUFDRCxHQUZELE1BRU87QUFDTCxTQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CLFNBQW5CLEdBQStCLFNBQS9CO0FBQ0Q7QUFDRixDQU5EOztBQVFBLEtBQUssTUFBTCxHQUFjLFVBQVUsWUFBVixFQUF3QjtBQUNwQyxRQUFNLGNBQWMsS0FBSyxHQUFMLEVBQXBCOztBQUVBLE1BQUksZUFBZSxJQUFuQixFQUF5QjtBQUN2QixTQUFLLFNBQUwsQ0FBZSxLQUFmO0FBQ0E7QUFDRDs7QUFFRCxRQUFNLFVBQVUsWUFBWSxJQUFaLEtBQXFCLGFBQWEsSUFBbEMsSUFDQSxZQUFZLEtBQVosS0FBc0IsYUFBYSxLQURuRDs7QUFHQSxPQUFLLFNBQUwsQ0FBZSxPQUFmO0FBQ0QsQ0FaRDs7QUFjQSxLQUFLLE1BQUwsR0FBYyxVQUFVLFlBQVYsRUFBd0I7QUFDcEMsUUFBTSxjQUFjLEtBQUssR0FBTCxFQUFwQjtBQUNBLFFBQU0sVUFBVSxlQUFlLElBQWYsSUFDQSxZQUFZLElBQVosS0FBcUIsYUFBYSxJQURsQyxJQUVBLFlBQVksS0FBWixLQUFzQixhQUFhLEtBRm5EOztBQUlBLE1BQUksT0FBSixFQUFhO0FBQ1gsU0FBSyxNQUFMO0FBQ0EsU0FBSyxTQUFMLENBQWUsS0FBZjtBQUNELEdBSEQsTUFHTztBQUNMLFNBQUssR0FBTCxDQUFTLFlBQVQ7QUFDQSxTQUFLLFNBQUwsQ0FBZSxJQUFmO0FBQ0Q7QUFDRixDQWJEOztBQWVBLEtBQUssWUFBTCxHQUFvQixZQUFZO0FBQzlCLE9BQUssSUFBTCxDQUFVLE9BQVY7QUFDRCxDQUZEOztBQUlBLEtBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsZ0JBQW5CLENBQW9DLE9BQXBDLEVBQTZDLEtBQUssWUFBbEQ7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLElBQWpCOzs7QUM3RUEsTUFBTSxvQkFBb0IsUUFBUSxxQkFBUixDQUExQjs7QUFFQSxNQUFNLE9BQU8sRUFBYjs7QUFFQSxLQUFLLE1BQUwsR0FBYztBQUNaLFNBQU8sU0FBUyxhQUFULENBQXVCLHNCQUF2QjtBQURLLENBQWQ7O0FBSUEsS0FBSyxPQUFMLEdBQWUsS0FBZjs7QUFFQSxLQUFLLElBQUwsR0FBWSxZQUFZO0FBQ3RCLFdBQVMsSUFBVCxDQUFjLFNBQWQsQ0FBd0IsR0FBeEIsQ0FBNEIsVUFBNUI7QUFDQSxPQUFLLE9BQUwsR0FBZSxJQUFmO0FBQ0QsQ0FIRDs7QUFLQSxLQUFLLElBQUwsR0FBWSxZQUFZO0FBQ3RCLFdBQVMsSUFBVCxDQUFjLFNBQWQsQ0FBd0IsTUFBeEIsQ0FBK0IsVUFBL0I7QUFDQSxPQUFLLE9BQUwsR0FBZSxLQUFmO0FBQ0QsQ0FIRDs7QUFLQSxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLGdCQUFsQixDQUFtQyxrQkFBa0IsVUFBckQsRUFBaUUsS0FBSyxJQUF0RTs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsSUFBakI7OztBQ3RCQSxNQUFNLFlBQVksUUFBUSxhQUFSLENBQWxCO0FBQ0EsTUFBTSxTQUFTLFFBQVEsVUFBUixDQUFmO0FBQ0EsTUFBTSxXQUFXLFFBQVEsWUFBUixDQUFqQjtBQUNBLE1BQU0sZUFBZSxRQUFRLGdCQUFSLENBQXJCO0FBQ0EsTUFBTSxXQUFXLFFBQVEsWUFBUixDQUFqQjtBQUNBLE1BQU0sYUFBYSxRQUFRLGNBQVIsQ0FBbkI7O0FBRUEsTUFBTSxRQUFRLEVBQWQ7O0FBRUEsT0FBTyxLQUFQLEdBQWUsS0FBZjtBQUNBLE9BQU8sT0FBUCxHQUFpQixPQUFqQjs7QUFFQSxVQUFVLElBQVY7QUFDQSxhQUFhLGlCQUFiO0FBQ0EsV0FBVyxjQUFYOztBQUVBLElBQUksU0FBUyxHQUFULE1BQWtCLElBQXRCLEVBQTRCO0FBQzFCLFFBQU0sWUFBTixHQUFxQixTQUFTLEdBQVQsRUFBckI7QUFDQSxXQUFTLE1BQVQsQ0FBZ0IsTUFBTSxZQUF0QjtBQUNBLFdBQVMsUUFBVCxDQUFrQixhQUFhLGVBQWIsRUFBbEIsRUFBa0QsTUFBTSxZQUF4RDtBQUNELENBSkQsTUFJTztBQUNMLFNBQU8sS0FBUDtBQUNEOztBQUVELE9BQU8sRUFBUCxDQUFVLFFBQVYsRUFBb0IsVUFBVSxZQUFWLEVBQXdCO0FBQzFDLFFBQU0sWUFBTixHQUFxQixZQUFyQjtBQUNBLFdBQVMsTUFBVCxDQUFnQixNQUFNLFlBQXRCO0FBQ0EsV0FBUyxRQUFULENBQWtCLGFBQWEsZUFBYixFQUFsQixFQUFrRCxNQUFNLFlBQXhEO0FBQ0QsQ0FKRDs7QUFNQSxhQUFhLEVBQWIsQ0FBZ0IsYUFBaEIsRUFBK0IsVUFBVSxPQUFWLEVBQW1CO0FBQ2hELFdBQVMsUUFBVCxDQUFrQixPQUFsQixFQUEyQixNQUFNLFlBQWpDO0FBQ0QsQ0FGRDs7QUFJQSxTQUFTLEVBQVQsQ0FBWSxPQUFaLEVBQXFCLFlBQVk7QUFDL0IsV0FBUyxNQUFULENBQWdCLE1BQU0sWUFBdEI7QUFDRCxDQUZEOztBQUlBLFNBQVMsSUFBVCxDQUFjLEtBQWQsQ0FBb0IsT0FBcEIsR0FBOEIsQ0FBOUI7OztBQ3RDQSxNQUFNLGVBQWUsUUFBUSxRQUFSLENBQXJCO0FBQ0EsTUFBTSxVQUFVLFFBQVEsVUFBUixDQUFoQjtBQUNBLE1BQU0sU0FBUyxRQUFRLFVBQVIsQ0FBZjs7QUFFQSxNQUFNLE9BQU8sSUFBSSxZQUFKLEVBQWI7O0FBRUEsS0FBSyxNQUFMLEdBQWM7QUFDWixZQUFVLFNBQVMsYUFBVCxDQUF1QixXQUF2QjtBQURFLENBQWQ7O0FBSUEsS0FBSyxzQkFBTCxHQUE4QixVQUFVLE9BQVYsRUFBbUI7QUFDL0MsUUFBTSxPQUFPLFNBQVMsYUFBVCxDQUF1QixNQUF2QixDQUFiO0FBQ0EsT0FBSyxTQUFMLEdBQWlCLE9BQWpCO0FBQ0EsUUFBTSxhQUFhLEtBQUssYUFBTCxDQUFtQixRQUFuQixDQUFuQjtBQUNBLFNBQU8sVUFBUDtBQUNELENBTEQ7O0FBT0EsS0FBSyxXQUFMLEdBQW1CLFVBQVUsS0FBVixFQUFpQjtBQUNsQyxRQUFNLFVBQVUsTUFBTSxNQUF0QjtBQUNBLE1BQUksUUFBUSxNQUFSLEdBQWlCLEdBQWpCLElBQXdCLFFBQVEsTUFBUixJQUFrQixHQUE5QyxFQUFtRDtBQUNqRCxTQUFLLFlBQUwsQ0FBa0IsS0FBbEI7QUFDQTtBQUNEO0FBQ0QsUUFBTSxXQUFXLEtBQUssc0JBQUwsQ0FBNEIsUUFBUSxRQUFwQyxDQUFqQjtBQUNBLE9BQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsV0FBckIsQ0FBaUMsUUFBakM7QUFDQSxPQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLFNBQXJCLENBQStCLE1BQS9CLENBQXNDLE9BQXRDO0FBQ0EsT0FBSyxJQUFMLENBQVUsTUFBVjtBQUNELENBVkQ7O0FBWUEsS0FBSyxZQUFMLEdBQW9CLFVBQVUsS0FBVixFQUFpQjtBQUNuQyxRQUFNLFVBQVUsTUFBTSxNQUF0QjtBQUNBLE1BQUksS0FBSjtBQUNBLE1BQUksUUFBUSxNQUFSLEtBQW1CLEdBQXZCLEVBQTRCO0FBQzFCLFlBQVEsaURBQVI7QUFDRCxHQUZELE1BRU87QUFDTCxZQUFRLCtEQUFSO0FBQ0Q7QUFDRCxPQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLFdBQXJCLEdBQW1DLEtBQW5DO0FBQ0EsT0FBSyxNQUFMLENBQVksUUFBWixDQUFxQixTQUFyQixDQUErQixHQUEvQixDQUFtQyxPQUFuQztBQUNBLE9BQUssSUFBTCxDQUFVLE1BQVY7QUFDRCxDQVhEOztBQWFBLEtBQUssY0FBTCxHQUFzQixVQUFVLElBQVYsRUFBZ0IsSUFBaEIsRUFBc0IsS0FBdEIsRUFBNkI7QUFDakQsUUFBTSxLQUFLLFFBQVEsQ0FBbkI7QUFDQSxTQUFRLE1BQUksT0FBTyxRQUFQLENBQWdCLElBQUssd0RBQTFCLEdBQ0YsSUFBRyxJQUFNLFFBQUssSUFBSyxRQUFLLElBQUssS0FBRSxRQUFRLEVBQVIsRUFBWSxDQUFaLEVBQWUsR0FBZixDQUFvQixPQUR4RDtBQUVELENBSkQ7O0FBTUEsS0FBSyxRQUFMLEdBQWdCLFVBQVUsSUFBVixFQUFnQixZQUFoQixFQUE4QjtBQUM1QyxRQUFNLE1BQU0sS0FBSyxjQUFMLENBQW9CLElBQXBCLEVBQTBCLGFBQWEsSUFBdkMsRUFBNkMsYUFBYSxLQUExRCxDQUFaOztBQUVBLFNBQU8sS0FBSyxNQUFMLENBQVksUUFBWixDQUFxQixVQUE1QixFQUF3QztBQUN0QyxTQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLFdBQXJCLENBQWlDLEtBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsVUFBdEQ7QUFDRDs7QUFFRCxRQUFNLFVBQVUsSUFBSSxPQUFPLGNBQVgsRUFBaEI7QUFDQSxVQUFRLGdCQUFSLENBQXlCLE1BQXpCLEVBQWlDLEtBQUssV0FBdEM7QUFDQSxVQUFRLGdCQUFSLENBQXlCLE9BQXpCLEVBQWtDLEtBQUssWUFBdkM7QUFDQSxVQUFRLElBQVIsQ0FBYSxLQUFiLEVBQW9CLEdBQXBCLEVBQXlCLElBQXpCO0FBQ0EsVUFBUSxJQUFSOztBQUVBLFNBQU8sU0FBUCxDQUFpQixZQUFqQjtBQUNELENBZEQ7O0FBZ0JBLE9BQU8sT0FBUCxHQUFpQixJQUFqQjs7O0FDaEVBLFFBQVEsdUJBQVIsRUFBaUMsUUFBakM7O0FBRUEsTUFBTSxPQUFPLEVBQWI7QUFDQSxNQUFNLFdBQVcsUUFBUSxZQUFSLENBQWpCOztBQUVBLEtBQUssTUFBTCxHQUFjO0FBQ1osVUFBUSxTQUFTLGFBQVQsQ0FBdUIsU0FBdkIsQ0FESTtBQUVaLGdCQUFjLFNBQVMsYUFBVCxDQUF1QixnQkFBdkI7QUFGRixDQUFkOztBQUtBLEtBQUssVUFBTCxHQUFrQixJQUFsQjs7QUFFQSxLQUFLLG9CQUFMLEdBQTRCLFlBQVk7QUFDdEMsUUFBTSxpQkFBaUIsU0FBUyxJQUFULENBQWMsU0FBckM7QUFDQSxRQUFNLHFCQUFxQixLQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLFlBQXpCLEdBQXdDLEtBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsWUFBdEY7QUFDQSxNQUFJLGlCQUFpQixrQkFBakIsSUFBdUMsaUJBQWlCLENBQTVELEVBQStEO0FBQzdELFdBQU8sTUFBUCxDQUFjLEVBQUUsS0FBSyxrQkFBUCxFQUEyQixNQUFNLENBQWpDLEVBQW9DLFVBQVUsUUFBOUMsRUFBZDtBQUNEO0FBQ0YsQ0FORDs7QUFRQSxLQUFLLGFBQUwsR0FBcUIsWUFBWTtBQUMvQixNQUFJLEtBQUssVUFBTCxJQUFtQixJQUF2QixFQUE2QixPQUFPLFlBQVAsQ0FBb0IsS0FBSyxVQUF6QjtBQUM3QixPQUFLLFVBQUwsR0FBa0IsT0FBTyxVQUFQLENBQWtCLEtBQUssb0JBQXZCLEVBQTZDLEdBQTdDLENBQWxCOztBQUVBLFFBQU0saUJBQWlCLFNBQVMsSUFBVCxDQUFjLFNBQXJDO0FBQ0EsUUFBTSxxQkFBcUIsS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixZQUF6QixHQUF3QyxLQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CLFlBQXRGO0FBQ0EsTUFBSSxrQkFBa0Isa0JBQXRCLEVBQTBDO0FBQ3hDLGFBQVMsSUFBVCxDQUFjLFNBQWQsQ0FBd0IsR0FBeEIsQ0FBNEIsMkJBQTVCO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsYUFBUyxJQUFULENBQWMsU0FBZCxDQUF3QixNQUF4QixDQUErQiwyQkFBL0I7QUFDRDtBQUNGLENBWEQ7O0FBYUEsS0FBSyxtQkFBTCxHQUEyQixZQUFZO0FBQ3JDLFFBQU0scUJBQXFCLEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsWUFBekIsR0FBd0MsS0FBSyxNQUFMLENBQVksTUFBWixDQUFtQixZQUF0RjtBQUNBLFFBQU0sb0JBQW9CLHNCQUFzQixTQUFTLElBQVQsQ0FBYyxZQUFkLEdBQTZCLE9BQU8sV0FBMUQsQ0FBMUI7QUFDQSxNQUFJLG9CQUFvQixDQUF4QixFQUEyQjtBQUN6QixhQUFTLElBQVQsQ0FBYyxLQUFkLENBQW9CLFlBQXBCLEdBQW9DLElBQUUsaUJBQWtCLEtBQXhEO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsYUFBUyxJQUFULENBQWMsS0FBZCxDQUFvQixZQUFwQixHQUFtQyxJQUFuQztBQUNEO0FBQ0YsQ0FSRDs7QUFVQSxLQUFLLGNBQUwsR0FBc0IsWUFBWTtBQUNoQyxTQUFPLGdCQUFQLENBQXdCLFFBQXhCLEVBQWtDLEtBQUssYUFBdkM7QUFDRCxDQUZEOztBQUlBLFNBQVMsRUFBVCxDQUFZLE1BQVosRUFBb0IsS0FBSyxtQkFBekI7QUFDQSxPQUFPLGdCQUFQLENBQXdCLFFBQXhCLEVBQWtDLEtBQUssbUJBQXZDO0FBQ0EsT0FBTyxPQUFQLEdBQWlCLElBQWpCOzs7QUNqREE7O0FBRUEsTUFBTSxlQUFlLFFBQVEsUUFBUixDQUFyQjtBQUNBLE1BQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDtBQUNBLE1BQU0sZUFBZSxRQUFRLGdCQUFSLENBQXJCO0FBQ0EsTUFBTSxvQkFBb0IsUUFBUSxxQkFBUixDQUExQjs7QUFFQSxNQUFNLE9BQU8sSUFBSSxZQUFKLEVBQWI7O0FBRUEsS0FBSyxNQUFMLEdBQWM7QUFDWixVQUFRLFNBQVMsYUFBVCxDQUF1QixTQUF2QixDQURJO0FBRVosU0FBTyxTQUFTLGFBQVQsQ0FBdUIsc0JBQXZCO0FBRkssQ0FBZDs7QUFLQSxLQUFLLE1BQUwsR0FBYyxZQUFZO0FBQ3hCLE9BQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsSUFBbEI7O0FBRUEsUUFBTSxlQUFlLGFBQWEsZUFBYixFQUFyQjs7QUFFQSxVQUFRLEdBQVIsQ0FBWSxZQUFaOztBQUVBLE9BQUssSUFBTCxDQUFVLFFBQVYsRUFBb0IsWUFBcEI7QUFDRCxDQVJEOztBQVVBLEtBQUssU0FBTCxHQUFpQixVQUFVLFlBQVYsRUFBd0I7QUFDdkMsT0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixLQUFsQixHQUEwQixhQUFhLEtBQXZDO0FBQ0EsZUFBYSxjQUFiO0FBQ0EsV0FBUyxJQUFULENBQWMsU0FBZCxDQUF3QixNQUF4QixDQUErQixVQUEvQjtBQUNBLFdBQVMsSUFBVCxDQUFjLFNBQWQsQ0FBd0IsR0FBeEIsQ0FBNEIsVUFBNUI7QUFDRCxDQUxEOztBQU9BLEtBQUssS0FBTCxHQUFhLFlBQVk7QUFDdkIsT0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixLQUFsQjtBQUNELENBRkQ7O0FBSUEsS0FBSyxhQUFMLEdBQXFCLFVBQVUsS0FBVixFQUFpQjtBQUNwQyxRQUFNLGNBQU47QUFDQSxPQUFLLE1BQUw7QUFDRCxDQUhEOztBQUtBLEtBQUssVUFBTCxHQUFrQixVQUFVLFVBQVYsRUFBc0I7QUFDdEMsUUFBTSxhQUFhLE1BQU0sTUFBTixDQUFhLFVBQWIsRUFBeUIsS0FBekIsRUFBZ0M7QUFDakQsYUFBUyxRQUFRLEtBQUs7QUFEMkIsR0FBaEMsQ0FBbkI7QUFHQSxRQUFNLGVBQWUsV0FBVyxLQUFYLENBQWlCLENBQWpCLEVBQW9CLENBQXBCLENBQXJCOztBQUVBLFFBQU0sa0JBQWtCLGFBQWEsR0FBYixDQUFpQixVQUFVLE9BQU8sUUFBbEMsQ0FBeEI7O0FBRUEsU0FBTyxlQUFQO0FBQ0QsQ0FURDs7QUFXQSxLQUFLLGlCQUFMLEdBQXlCLFlBQVk7QUFDbkMsUUFBTSxVQUFVLEtBQUssVUFBTCxDQUFnQixLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEtBQWxDLENBQWhCOztBQUVBLGVBQWEsY0FBYjtBQUNBLE9BQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxRQUFRLE1BQTVCLEVBQW9DLEdBQXBDLEVBQXlDO0FBQ3ZDLGlCQUFhLE9BQWIsQ0FBcUIsUUFBUSxDQUFSLENBQXJCO0FBQ0Q7QUFDRixDQVBEOztBQVNBLEtBQUssWUFBTCxHQUFvQixZQUFZO0FBQzlCLE9BQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsTUFBbEI7QUFDRCxDQUZEOztBQUlBLEtBQUssV0FBTCxHQUFtQixZQUFZO0FBQzdCO0FBQ0E7QUFDQSxRQUFNLFdBQVcsS0FBSyxNQUFMLENBQVksS0FBN0I7QUFDQSxPQUFLLE1BQUwsQ0FBWSxLQUFaLEdBQW9CLEVBQXBCO0FBQ0EsT0FBSyxNQUFMLENBQVksS0FBWixHQUFvQixRQUFwQjs7QUFFQTtBQUNBLFdBQVMsYUFBVCxDQUF1QixJQUF2QjtBQUNELENBVEQ7O0FBV0EsYUFBYSxFQUFiLENBQWdCLFFBQWhCLEVBQTBCLEtBQUssTUFBL0I7O0FBRUEsS0FBSyxNQUFMLENBQVksTUFBWixDQUFtQixnQkFBbkIsQ0FBb0MsUUFBcEMsRUFBOEMsS0FBSyxhQUFuRDtBQUNBLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsZ0JBQWxCLENBQW1DLE9BQW5DLEVBQTRDLEtBQUssWUFBakQ7QUFDQSxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLGdCQUFsQixDQUFtQyxNQUFuQyxFQUEyQyxLQUFLLFdBQWhEO0FBQ0EsS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixnQkFBbEIsQ0FBbUMsa0JBQWtCLFVBQXJELEVBQ21DLEtBQUssaUJBRHhDOztBQUdBLE9BQU8sT0FBUCxHQUFpQixJQUFqQjs7O0FDbkZBLE1BQU0sZUFBZSxRQUFRLFFBQVIsQ0FBckI7O0FBRUEsTUFBTSxPQUFPLElBQUksWUFBSixFQUFiOztBQUVBLEtBQUssTUFBTCxHQUFjO0FBQ1osY0FBWSxTQUFTLGdCQUFULENBQTBCLHVCQUExQixFQUFtRCxDQUFuRCxDQURBO0FBRVosY0FBWSxTQUFTLGdCQUFULENBQTBCLHVCQUExQixFQUFtRCxDQUFuRCxDQUZBO0FBR1osbUJBQWlCLFNBQVMsYUFBVCxDQUF1Qix5QkFBdkI7QUFITCxDQUFkOztBQU1BLEtBQUssV0FBTCxHQUFtQixDQUFuQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLLGNBQUwsR0FBc0IsVUFBVSxNQUFWLEVBQWtCO0FBQ3RDLFFBQU0sUUFBUSxDQUFDLE9BQU8sTUFBUCxLQUFrQixDQUFuQixJQUF3QixDQUF0QztBQUNBLFNBQU8sT0FBUCxDQUFlLE9BQU8sT0FBUCxLQUFtQixLQUFuQixHQUEyQixDQUExQztBQUNBLFFBQU0sZ0JBQWdCLE9BQU8sT0FBUCxFQUF0QjtBQUNBLFNBQU8sUUFBUCxDQUFnQixDQUFoQixFQUFtQixDQUFuQjtBQUNBLE1BQUksT0FBTyxNQUFQLE9BQW9CLENBQXhCLEVBQTJCO0FBQ3pCLFdBQU8sUUFBUCxDQUFnQixDQUFoQixFQUFtQixJQUFJLENBQUUsSUFBSSxPQUFPLE1BQVAsRUFBTCxHQUF3QixDQUF6QixJQUE4QixDQUFyRDtBQUNEOztBQUVELFNBQU8sSUFBSSxLQUFLLElBQUwsQ0FBVSxDQUFDLGdCQUFnQixNQUFqQixJQUEyQixTQUFyQyxDQUFYO0FBQ0QsQ0FWRDs7QUFZQSxLQUFLLGVBQUwsR0FBdUIsWUFBWTtBQUNqQyxRQUFNLE1BQU0sSUFBSSxJQUFKLEVBQVo7QUFDQSxRQUFNLGFBQWEsSUFBSSxJQUFKLENBQVMsSUFBSSxPQUFKLEtBQ3hCLEtBQUssV0FBTCxHQUFtQixNQUFuQixHQUE0QixJQURKLEdBQ1csUUFBUSxJQUQ1QixDQUFuQjtBQUVBLFNBQU8sS0FBSyxjQUFMLENBQW9CLFVBQXBCLENBQVA7QUFDRCxDQUxEOztBQU9BLEtBQUssaUJBQUwsR0FBeUIsWUFBWTtBQUNuQyxRQUFNLHFCQUFxQixLQUFLLGVBQUwsRUFBM0I7QUFDQSxNQUFJLEtBQUssY0FBTCxDQUFvQixJQUFJLElBQUosRUFBcEIsTUFBb0Msa0JBQXhDLEVBQTREO0FBQzFELFNBQUssTUFBTCxDQUFZLGVBQVosQ0FBNEIsU0FBNUIsQ0FBc0MsR0FBdEMsQ0FBMEMsU0FBMUM7QUFDRCxHQUZELE1BRU87QUFDTCxTQUFLLE1BQUwsQ0FBWSxlQUFaLENBQTRCLFNBQTVCLENBQXNDLE1BQXRDLENBQTZDLFNBQTdDO0FBQ0Q7QUFDRCxPQUFLLFNBQUw7QUFDQSxPQUFLLElBQUwsQ0FBVSxhQUFWLEVBQXlCLGtCQUF6QjtBQUNELENBVEQ7O0FBV0EsS0FBSyxTQUFMLEdBQWlCLFlBQVk7QUFDM0IsUUFBTSxxQkFBcUIsS0FBSyxlQUFMLEVBQTNCO0FBQ0EsUUFBTSxXQUFXLElBQUksSUFBSixHQUFXLE1BQVgsT0FBd0IsQ0FBekM7QUFDQSxNQUFJLG9CQUFvQixJQUF4QjtBQUNBLE1BQUksUUFBSixFQUFjO0FBQ1osWUFBUSxLQUFLLFdBQWI7QUFDRSxXQUFLLENBQUw7QUFDRSw0QkFBb0IsaUJBQXBCO0FBQ0E7QUFDRixXQUFLLENBQUw7QUFDRSw0QkFBb0IsZUFBcEI7QUFDQTtBQUNGLFdBQUssQ0FBQyxDQUFOO0FBQ0UsNEJBQW9CLGdCQUFwQjtBQUNBO0FBVEo7QUFXRCxHQVpELE1BWU87QUFDTCxZQUFRLEtBQUssV0FBYjtBQUNFLFdBQUssQ0FBTDtBQUNFLDRCQUFvQixjQUFwQjtBQUNBO0FBQ0YsV0FBSyxDQUFMO0FBQ0UsNEJBQW9CLGVBQXBCO0FBQ0E7QUFDRixXQUFLLENBQUMsQ0FBTjtBQUNFLDRCQUFvQixhQUFwQjtBQUNBO0FBVEo7QUFXRDtBQUNELE1BQUkscUJBQXFCLElBQXpCLEVBQStCO0FBQzdCLFNBQUssTUFBTCxDQUFZLGVBQVosQ0FBNEIsV0FBNUIsR0FBMkMsSUFBRSxpQkFBa0IsUUFBSyxrQkFBbUIsR0FBdkY7QUFDRCxHQUZELE1BRU87QUFDTCxTQUFLLE1BQUwsQ0FBWSxlQUFaLENBQTRCLFdBQTVCLEdBQTJDLFNBQU8sa0JBQW1CLEdBQXJFO0FBQ0Q7QUFDRixDQWxDRDs7QUFvQ0EsS0FBSyxzQkFBTCxHQUE4QixZQUFZO0FBQ3hDLE9BQUssV0FBTCxJQUFvQixDQUFwQjtBQUNBLE9BQUssaUJBQUw7QUFDRCxDQUhEOztBQUtBLEtBQUssc0JBQUwsR0FBOEIsWUFBWTtBQUN4QyxPQUFLLFdBQUwsSUFBb0IsQ0FBcEI7QUFDQSxPQUFLLGlCQUFMO0FBQ0QsQ0FIRDs7QUFLQSxLQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLGdCQUF2QixDQUF3QyxPQUF4QyxFQUFpRCxLQUFLLHNCQUF0RDtBQUNBLEtBQUssTUFBTCxDQUFZLFVBQVosQ0FBdUIsZ0JBQXZCLENBQXdDLE9BQXhDLEVBQWlELEtBQUssc0JBQXREOztBQUVBLE9BQU8sT0FBUCxHQUFpQixJQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXZsaXN0ZW5lcikpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChldmxpc3RlbmVyKVxuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCIvKlxuICogRnV6enlcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9teW9yay9mdXp6eVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMiBNYXR0IFlvcmtcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG5cbnZhciByb290ID0gdGhpcztcblxudmFyIGZ1enp5ID0ge307XG5cbi8vIFVzZSBpbiBub2RlIG9yIGluIGJyb3dzZXJcbmlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdXp6eTtcbn0gZWxzZSB7XG4gIHJvb3QuZnV6enkgPSBmdXp6eTtcbn1cblxuLy8gUmV0dXJuIGFsbCBlbGVtZW50cyBvZiBgYXJyYXlgIHRoYXQgaGF2ZSBhIGZ1enp5XG4vLyBtYXRjaCBhZ2FpbnN0IGBwYXR0ZXJuYC5cbmZ1enp5LnNpbXBsZUZpbHRlciA9IGZ1bmN0aW9uKHBhdHRlcm4sIGFycmF5KSB7XG4gIHJldHVybiBhcnJheS5maWx0ZXIoZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgcmV0dXJuIGZ1enp5LnRlc3QocGF0dGVybiwgc3RyaW5nKTtcbiAgfSk7XG59O1xuXG4vLyBEb2VzIGBwYXR0ZXJuYCBmdXp6eSBtYXRjaCBgc3RyaW5nYD9cbmZ1enp5LnRlc3QgPSBmdW5jdGlvbihwYXR0ZXJuLCBzdHJpbmcpIHtcbiAgcmV0dXJuIGZ1enp5Lm1hdGNoKHBhdHRlcm4sIHN0cmluZykgIT09IG51bGw7XG59O1xuXG4vLyBJZiBgcGF0dGVybmAgbWF0Y2hlcyBgc3RyaW5nYCwgd3JhcCBlYWNoIG1hdGNoaW5nIGNoYXJhY3RlclxuLy8gaW4gYG9wdHMucHJlYCBhbmQgYG9wdHMucG9zdGAuIElmIG5vIG1hdGNoLCByZXR1cm4gbnVsbFxuZnV6enkubWF0Y2ggPSBmdW5jdGlvbihwYXR0ZXJuLCBzdHJpbmcsIG9wdHMpIHtcbiAgb3B0cyA9IG9wdHMgfHwge307XG4gIHZhciBwYXR0ZXJuSWR4ID0gMFxuICAgICwgcmVzdWx0ID0gW11cbiAgICAsIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgICAsIHRvdGFsU2NvcmUgPSAwXG4gICAgLCBjdXJyU2NvcmUgPSAwXG4gICAgLy8gcHJlZml4XG4gICAgLCBwcmUgPSBvcHRzLnByZSB8fCAnJ1xuICAgIC8vIHN1ZmZpeFxuICAgICwgcG9zdCA9IG9wdHMucG9zdCB8fCAnJ1xuICAgIC8vIFN0cmluZyB0byBjb21wYXJlIGFnYWluc3QuIFRoaXMgbWlnaHQgYmUgYSBsb3dlcmNhc2UgdmVyc2lvbiBvZiB0aGVcbiAgICAvLyByYXcgc3RyaW5nXG4gICAgLCBjb21wYXJlU3RyaW5nID0gIG9wdHMuY2FzZVNlbnNpdGl2ZSAmJiBzdHJpbmcgfHwgc3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAsIGNoLCBjb21wYXJlQ2hhcjtcblxuICBwYXR0ZXJuID0gb3B0cy5jYXNlU2Vuc2l0aXZlICYmIHBhdHRlcm4gfHwgcGF0dGVybi50b0xvd2VyQ2FzZSgpO1xuXG4gIC8vIEZvciBlYWNoIGNoYXJhY3RlciBpbiB0aGUgc3RyaW5nLCBlaXRoZXIgYWRkIGl0IHRvIHRoZSByZXN1bHRcbiAgLy8gb3Igd3JhcCBpbiB0ZW1wbGF0ZSBpZiBpdCdzIHRoZSBuZXh0IHN0cmluZyBpbiB0aGUgcGF0dGVyblxuICBmb3IodmFyIGlkeCA9IDA7IGlkeCA8IGxlbjsgaWR4KyspIHtcbiAgICBjaCA9IHN0cmluZ1tpZHhdO1xuICAgIGlmKGNvbXBhcmVTdHJpbmdbaWR4XSA9PT0gcGF0dGVybltwYXR0ZXJuSWR4XSkge1xuICAgICAgY2ggPSBwcmUgKyBjaCArIHBvc3Q7XG4gICAgICBwYXR0ZXJuSWR4ICs9IDE7XG5cbiAgICAgIC8vIGNvbnNlY3V0aXZlIGNoYXJhY3RlcnMgc2hvdWxkIGluY3JlYXNlIHRoZSBzY29yZSBtb3JlIHRoYW4gbGluZWFybHlcbiAgICAgIGN1cnJTY29yZSArPSAxICsgY3VyclNjb3JlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyU2NvcmUgPSAwO1xuICAgIH1cbiAgICB0b3RhbFNjb3JlICs9IGN1cnJTY29yZTtcbiAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aF0gPSBjaDtcbiAgfVxuXG4gIC8vIHJldHVybiByZW5kZXJlZCBzdHJpbmcgaWYgd2UgaGF2ZSBhIG1hdGNoIGZvciBldmVyeSBjaGFyXG4gIGlmKHBhdHRlcm5JZHggPT09IHBhdHRlcm4ubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHtyZW5kZXJlZDogcmVzdWx0LmpvaW4oJycpLCBzY29yZTogdG90YWxTY29yZX07XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8vIFRoZSBub3JtYWwgZW50cnkgcG9pbnQuIEZpbHRlcnMgYGFycmAgZm9yIG1hdGNoZXMgYWdhaW5zdCBgcGF0dGVybmAuXG4vLyBJdCByZXR1cm5zIGFuIGFycmF5IHdpdGggbWF0Y2hpbmcgdmFsdWVzIG9mIHRoZSB0eXBlOlxuLy9cbi8vICAgICBbe1xuLy8gICAgICAgICBzdHJpbmc6ICAgJzxiPmxhaCcgLy8gVGhlIHJlbmRlcmVkIHN0cmluZ1xuLy8gICAgICAgLCBpbmRleDogICAgMiAgICAgICAgLy8gVGhlIGluZGV4IG9mIHRoZSBlbGVtZW50IGluIGBhcnJgXG4vLyAgICAgICAsIG9yaWdpbmFsOiAnYmxhaCcgICAvLyBUaGUgb3JpZ2luYWwgZWxlbWVudCBpbiBgYXJyYFxuLy8gICAgIH1dXG4vL1xuLy8gYG9wdHNgIGlzIGFuIG9wdGlvbmFsIGFyZ3VtZW50IGJhZy4gRGV0YWlsczpcbi8vXG4vLyAgICBvcHRzID0ge1xuLy8gICAgICAgIC8vIHN0cmluZyB0byBwdXQgYmVmb3JlIGEgbWF0Y2hpbmcgY2hhcmFjdGVyXG4vLyAgICAgICAgcHJlOiAgICAgJzxiPidcbi8vXG4vLyAgICAgICAgLy8gc3RyaW5nIHRvIHB1dCBhZnRlciBtYXRjaGluZyBjaGFyYWN0ZXJcbi8vICAgICAgLCBwb3N0OiAgICAnPC9iPidcbi8vXG4vLyAgICAgICAgLy8gT3B0aW9uYWwgZnVuY3Rpb24uIElucHV0IGlzIGFuIGVudHJ5IGluIHRoZSBnaXZlbiBhcnJgLFxuLy8gICAgICAgIC8vIG91dHB1dCBzaG91bGQgYmUgdGhlIHN0cmluZyB0byB0ZXN0IGBwYXR0ZXJuYCBhZ2FpbnN0LlxuLy8gICAgICAgIC8vIEluIHRoaXMgZXhhbXBsZSwgaWYgYGFyciA9IFt7Y3J5aW5nOiAna29hbGEnfV1gIHdlIHdvdWxkIHJldHVyblxuLy8gICAgICAgIC8vICdrb2FsYScuXG4vLyAgICAgICwgZXh0cmFjdDogZnVuY3Rpb24oYXJnKSB7IHJldHVybiBhcmcuY3J5aW5nOyB9XG4vLyAgICB9XG5mdXp6eS5maWx0ZXIgPSBmdW5jdGlvbihwYXR0ZXJuLCBhcnIsIG9wdHMpIHtcbiAgb3B0cyA9IG9wdHMgfHwge307XG4gIHJldHVybiBhcnJcbiAgICAucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGVsZW1lbnQsIGlkeCwgYXJyKSB7XG4gICAgICB2YXIgc3RyID0gZWxlbWVudDtcbiAgICAgIGlmKG9wdHMuZXh0cmFjdCkge1xuICAgICAgICBzdHIgPSBvcHRzLmV4dHJhY3QoZWxlbWVudCk7XG4gICAgICB9XG4gICAgICB2YXIgcmVuZGVyZWQgPSBmdXp6eS5tYXRjaChwYXR0ZXJuLCBzdHIsIG9wdHMpO1xuICAgICAgaWYocmVuZGVyZWQgIT0gbnVsbCkge1xuICAgICAgICBwcmV2W3ByZXYubGVuZ3RoXSA9IHtcbiAgICAgICAgICAgIHN0cmluZzogcmVuZGVyZWQucmVuZGVyZWRcbiAgICAgICAgICAsIHNjb3JlOiByZW5kZXJlZC5zY29yZVxuICAgICAgICAgICwgaW5kZXg6IGlkeFxuICAgICAgICAgICwgb3JpZ2luYWw6IGVsZW1lbnRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcmV2O1xuICAgIH0sIFtdKVxuXG4gICAgLy8gU29ydCBieSBzY29yZS4gQnJvd3NlcnMgYXJlIGluY29uc2lzdGVudCB3cnQgc3RhYmxlL3Vuc3RhYmxlXG4gICAgLy8gc29ydGluZywgc28gZm9yY2Ugc3RhYmxlIGJ5IHVzaW5nIHRoZSBpbmRleCBpbiB0aGUgY2FzZSBvZiB0aWUuXG4gICAgLy8gU2VlIGh0dHA6Ly9vZmIubmV0L35zZXRobWwvaXMtc29ydC1zdGFibGUuaHRtbFxuICAgIC5zb3J0KGZ1bmN0aW9uKGEsYikge1xuICAgICAgdmFyIGNvbXBhcmUgPSBiLnNjb3JlIC0gYS5zY29yZTtcbiAgICAgIGlmKGNvbXBhcmUpIHJldHVybiBjb21wYXJlO1xuICAgICAgcmV0dXJuIGEuaW5kZXggLSBiLmluZGV4O1xuICAgIH0pO1xufTtcblxuXG59KCkpO1xuXG4iLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGxlZnRQYWQ7XG5cbnZhciBjYWNoZSA9IFtcbiAgJycsXG4gICcgJyxcbiAgJyAgJyxcbiAgJyAgICcsXG4gICcgICAgJyxcbiAgJyAgICAgJyxcbiAgJyAgICAgICcsXG4gICcgICAgICAgJyxcbiAgJyAgICAgICAgJyxcbiAgJyAgICAgICAgICdcbl07XG5cbmZ1bmN0aW9uIGxlZnRQYWQgKHN0ciwgbGVuLCBjaCkge1xuICAvLyBjb252ZXJ0IGBzdHJgIHRvIGBzdHJpbmdgXG4gIHN0ciA9IHN0ciArICcnO1xuICAvLyBgbGVuYCBpcyB0aGUgYHBhZGAncyBsZW5ndGggbm93XG4gIGxlbiA9IGxlbiAtIHN0ci5sZW5ndGg7XG4gIC8vIGRvZXNuJ3QgbmVlZCB0byBwYWRcbiAgaWYgKGxlbiA8PSAwKSByZXR1cm4gc3RyO1xuICAvLyBgY2hgIGRlZmF1bHRzIHRvIGAnICdgXG4gIGlmICghY2ggJiYgY2ggIT09IDApIGNoID0gJyAnO1xuICAvLyBjb252ZXJ0IGBjaGAgdG8gYHN0cmluZ2BcbiAgY2ggPSBjaCArICcnO1xuICAvLyBjYWNoZSBjb21tb24gdXNlIGNhc2VzXG4gIGlmIChjaCA9PT0gJyAnICYmIGxlbiA8IDEwKSByZXR1cm4gY2FjaGVbbGVuXSArIHN0cjtcbiAgLy8gYHBhZGAgc3RhcnRzIHdpdGggYW4gZW1wdHkgc3RyaW5nXG4gIHZhciBwYWQgPSAnJztcbiAgLy8gbG9vcFxuICB3aGlsZSAodHJ1ZSkge1xuICAgIC8vIGFkZCBgY2hgIHRvIGBwYWRgIGlmIGBsZW5gIGlzIG9kZFxuICAgIGlmIChsZW4gJiAxKSBwYWQgKz0gY2g7XG4gICAgLy8gZGV2aWRlIGBsZW5gIGJ5IDIsIGRpdGNoIHRoZSBmcmFjdGlvblxuICAgIGxlbiA+Pj0gMTtcbiAgICAvLyBcImRvdWJsZVwiIHRoZSBgY2hgIHNvIHRoaXMgb3BlcmF0aW9uIGNvdW50IGdyb3dzIGxvZ2FyaXRobWljYWxseSBvbiBgbGVuYFxuICAgIC8vIGVhY2ggdGltZSBgY2hgIGlzIFwiZG91YmxlZFwiLCB0aGUgYGxlbmAgd291bGQgbmVlZCB0byBiZSBcImRvdWJsZWRcIiB0b29cbiAgICAvLyBzaW1pbGFyIHRvIGZpbmRpbmcgYSB2YWx1ZSBpbiBiaW5hcnkgc2VhcmNoIHRyZWUsIGhlbmNlIE8obG9nKG4pKVxuICAgIGlmIChsZW4pIGNoICs9IGNoO1xuICAgIC8vIGBsZW5gIGlzIDAsIGV4aXQgdGhlIGxvb3BcbiAgICBlbHNlIGJyZWFrO1xuICB9XG4gIC8vIHBhZCBgc3RyYCFcbiAgcmV0dXJuIHBhZCArIHN0cjtcbn1cbiIsIi8qXG4gKiBzbW9vdGhzY3JvbGwgcG9seWZpbGwgLSB2MC4zLjRcbiAqIGh0dHBzOi8vaWFtZHVzdGFuLmdpdGh1Yi5pby9zbW9vdGhzY3JvbGxcbiAqIDIwMTYgKGMpIER1c3RhbiBLYXN0ZW4sIEplcmVtaWFzIE1lbmljaGVsbGkgLSBNSVQgTGljZW5zZVxuICovXG5cbihmdW5jdGlvbih3LCBkLCB1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qXG4gICAqIGFsaWFzZXNcbiAgICogdzogd2luZG93IGdsb2JhbCBvYmplY3RcbiAgICogZDogZG9jdW1lbnRcbiAgICogdW5kZWZpbmVkOiB1bmRlZmluZWRcbiAgICovXG5cbiAgLy8gcG9seWZpbGxcbiAgZnVuY3Rpb24gcG9seWZpbGwoKSB7XG4gICAgLy8gcmV0dXJuIHdoZW4gc2Nyb2xsQmVoYXZpb3IgaW50ZXJmYWNlIGlzIHN1cHBvcnRlZFxuICAgIGlmICgnc2Nyb2xsQmVoYXZpb3InIGluIGQuZG9jdW1lbnRFbGVtZW50LnN0eWxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBnbG9iYWxzXG4gICAgICovXG4gICAgdmFyIEVsZW1lbnQgPSB3LkhUTUxFbGVtZW50IHx8IHcuRWxlbWVudDtcbiAgICB2YXIgU0NST0xMX1RJTUUgPSA0Njg7XG5cbiAgICAvKlxuICAgICAqIG9iamVjdCBnYXRoZXJpbmcgb3JpZ2luYWwgc2Nyb2xsIG1ldGhvZHNcbiAgICAgKi9cbiAgICB2YXIgb3JpZ2luYWwgPSB7XG4gICAgICBzY3JvbGw6IHcuc2Nyb2xsIHx8IHcuc2Nyb2xsVG8sXG4gICAgICBzY3JvbGxCeTogdy5zY3JvbGxCeSxcbiAgICAgIHNjcm9sbEludG9WaWV3OiBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxJbnRvVmlld1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIGRlZmluZSB0aW1pbmcgbWV0aG9kXG4gICAgICovXG4gICAgdmFyIG5vdyA9IHcucGVyZm9ybWFuY2UgJiYgdy5wZXJmb3JtYW5jZS5ub3dcbiAgICAgID8gdy5wZXJmb3JtYW5jZS5ub3cuYmluZCh3LnBlcmZvcm1hbmNlKSA6IERhdGUubm93O1xuXG4gICAgLyoqXG4gICAgICogY2hhbmdlcyBzY3JvbGwgcG9zaXRpb24gaW5zaWRlIGFuIGVsZW1lbnRcbiAgICAgKiBAbWV0aG9kIHNjcm9sbEVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gICAgICovXG4gICAgZnVuY3Rpb24gc2Nyb2xsRWxlbWVudCh4LCB5KSB7XG4gICAgICB0aGlzLnNjcm9sbExlZnQgPSB4O1xuICAgICAgdGhpcy5zY3JvbGxUb3AgPSB5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgcmVzdWx0IG9mIGFwcGx5aW5nIGVhc2UgbWF0aCBmdW5jdGlvbiB0byBhIG51bWJlclxuICAgICAqIEBtZXRob2QgZWFzZVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBrXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBlYXNlKGspIHtcbiAgICAgIHJldHVybiAwLjUgKiAoMSAtIE1hdGguY29zKE1hdGguUEkgKiBrKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaW5kaWNhdGVzIGlmIGEgc21vb3RoIGJlaGF2aW9yIHNob3VsZCBiZSBhcHBsaWVkXG4gICAgICogQG1ldGhvZCBzaG91bGRCYWlsT3V0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ8T2JqZWN0fSB4XG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAgICovXG4gICAgZnVuY3Rpb24gc2hvdWxkQmFpbE91dCh4KSB7XG4gICAgICBpZiAodHlwZW9mIHggIT09ICdvYmplY3QnXG4gICAgICAgICAgICB8fCB4ID09PSBudWxsXG4gICAgICAgICAgICB8fCB4LmJlaGF2aW9yID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgIHx8IHguYmVoYXZpb3IgPT09ICdhdXRvJ1xuICAgICAgICAgICAgfHwgeC5iZWhhdmlvciA9PT0gJ2luc3RhbnQnKSB7XG4gICAgICAgIC8vIGZpcnN0IGFyZyBub3QgYW4gb2JqZWN0L251bGxcbiAgICAgICAgLy8gb3IgYmVoYXZpb3IgaXMgYXV0bywgaW5zdGFudCBvciB1bmRlZmluZWRcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgeCA9PT0gJ29iamVjdCdcbiAgICAgICAgICAgICYmIHguYmVoYXZpb3IgPT09ICdzbW9vdGgnKSB7XG4gICAgICAgIC8vIGZpcnN0IGFyZ3VtZW50IGlzIGFuIG9iamVjdCBhbmQgYmVoYXZpb3IgaXMgc21vb3RoXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gdGhyb3cgZXJyb3Igd2hlbiBiZWhhdmlvciBpcyBub3Qgc3VwcG9ydGVkXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdiZWhhdmlvciBub3QgdmFsaWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBmaW5kcyBzY3JvbGxhYmxlIHBhcmVudCBvZiBhbiBlbGVtZW50XG4gICAgICogQG1ldGhvZCBmaW5kU2Nyb2xsYWJsZVBhcmVudFxuICAgICAqIEBwYXJhbSB7Tm9kZX0gZWxcbiAgICAgKiBAcmV0dXJucyB7Tm9kZX0gZWxcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmaW5kU2Nyb2xsYWJsZVBhcmVudChlbCkge1xuICAgICAgdmFyIGlzQm9keTtcbiAgICAgIHZhciBoYXNTY3JvbGxhYmxlU3BhY2U7XG4gICAgICB2YXIgaGFzVmlzaWJsZU92ZXJmbG93O1xuXG4gICAgICBkbyB7XG4gICAgICAgIGVsID0gZWwucGFyZW50Tm9kZTtcblxuICAgICAgICAvLyBzZXQgY29uZGl0aW9uIHZhcmlhYmxlc1xuICAgICAgICBpc0JvZHkgPSBlbCA9PT0gZC5ib2R5O1xuICAgICAgICBoYXNTY3JvbGxhYmxlU3BhY2UgPVxuICAgICAgICAgIGVsLmNsaWVudEhlaWdodCA8IGVsLnNjcm9sbEhlaWdodCB8fFxuICAgICAgICAgIGVsLmNsaWVudFdpZHRoIDwgZWwuc2Nyb2xsV2lkdGg7XG4gICAgICAgIGhhc1Zpc2libGVPdmVyZmxvdyA9XG4gICAgICAgICAgdy5nZXRDb21wdXRlZFN0eWxlKGVsLCBudWxsKS5vdmVyZmxvdyA9PT0gJ3Zpc2libGUnO1xuICAgICAgfSB3aGlsZSAoIWlzQm9keSAmJiAhKGhhc1Njcm9sbGFibGVTcGFjZSAmJiAhaGFzVmlzaWJsZU92ZXJmbG93KSk7XG5cbiAgICAgIGlzQm9keSA9IGhhc1Njcm9sbGFibGVTcGFjZSA9IGhhc1Zpc2libGVPdmVyZmxvdyA9IG51bGw7XG5cbiAgICAgIHJldHVybiBlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzZWxmIGludm9rZWQgZnVuY3Rpb24gdGhhdCwgZ2l2ZW4gYSBjb250ZXh0LCBzdGVwcyB0aHJvdWdoIHNjcm9sbGluZ1xuICAgICAqIEBtZXRob2Qgc3RlcFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gICAgICovXG4gICAgZnVuY3Rpb24gc3RlcChjb250ZXh0KSB7XG4gICAgICAvLyBjYWxsIG1ldGhvZCBhZ2FpbiBvbiBuZXh0IGF2YWlsYWJsZSBmcmFtZVxuICAgICAgY29udGV4dC5mcmFtZSA9IHcucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0ZXAuYmluZCh3LCBjb250ZXh0KSk7XG5cbiAgICAgIHZhciB0aW1lID0gbm93KCk7XG4gICAgICB2YXIgdmFsdWU7XG4gICAgICB2YXIgY3VycmVudFg7XG4gICAgICB2YXIgY3VycmVudFk7XG4gICAgICB2YXIgZWxhcHNlZCA9ICh0aW1lIC0gY29udGV4dC5zdGFydFRpbWUpIC8gU0NST0xMX1RJTUU7XG5cbiAgICAgIC8vIGF2b2lkIGVsYXBzZWQgdGltZXMgaGlnaGVyIHRoYW4gb25lXG4gICAgICBlbGFwc2VkID0gZWxhcHNlZCA+IDEgPyAxIDogZWxhcHNlZDtcblxuICAgICAgLy8gYXBwbHkgZWFzaW5nIHRvIGVsYXBzZWQgdGltZVxuICAgICAgdmFsdWUgPSBlYXNlKGVsYXBzZWQpO1xuXG4gICAgICBjdXJyZW50WCA9IGNvbnRleHQuc3RhcnRYICsgKGNvbnRleHQueCAtIGNvbnRleHQuc3RhcnRYKSAqIHZhbHVlO1xuICAgICAgY3VycmVudFkgPSBjb250ZXh0LnN0YXJ0WSArIChjb250ZXh0LnkgLSBjb250ZXh0LnN0YXJ0WSkgKiB2YWx1ZTtcblxuICAgICAgY29udGV4dC5tZXRob2QuY2FsbChjb250ZXh0LnNjcm9sbGFibGUsIGN1cnJlbnRYLCBjdXJyZW50WSk7XG5cbiAgICAgIC8vIHJldHVybiB3aGVuIGVuZCBwb2ludHMgaGF2ZSBiZWVuIHJlYWNoZWRcbiAgICAgIGlmIChjdXJyZW50WCA9PT0gY29udGV4dC54ICYmIGN1cnJlbnRZID09PSBjb250ZXh0LnkpIHtcbiAgICAgICAgdy5jYW5jZWxBbmltYXRpb25GcmFtZShjb250ZXh0LmZyYW1lKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNjcm9sbHMgd2luZG93IHdpdGggYSBzbW9vdGggYmVoYXZpb3JcbiAgICAgKiBAbWV0aG9kIHNtb290aFNjcm9sbFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fE5vZGV9IGVsXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNtb290aFNjcm9sbChlbCwgeCwgeSkge1xuICAgICAgdmFyIHNjcm9sbGFibGU7XG4gICAgICB2YXIgc3RhcnRYO1xuICAgICAgdmFyIHN0YXJ0WTtcbiAgICAgIHZhciBtZXRob2Q7XG4gICAgICB2YXIgc3RhcnRUaW1lID0gbm93KCk7XG4gICAgICB2YXIgZnJhbWU7XG5cbiAgICAgIC8vIGRlZmluZSBzY3JvbGwgY29udGV4dFxuICAgICAgaWYgKGVsID09PSBkLmJvZHkpIHtcbiAgICAgICAgc2Nyb2xsYWJsZSA9IHc7XG4gICAgICAgIHN0YXJ0WCA9IHcuc2Nyb2xsWCB8fCB3LnBhZ2VYT2Zmc2V0O1xuICAgICAgICBzdGFydFkgPSB3LnNjcm9sbFkgfHwgdy5wYWdlWU9mZnNldDtcbiAgICAgICAgbWV0aG9kID0gb3JpZ2luYWwuc2Nyb2xsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2Nyb2xsYWJsZSA9IGVsO1xuICAgICAgICBzdGFydFggPSBlbC5zY3JvbGxMZWZ0O1xuICAgICAgICBzdGFydFkgPSBlbC5zY3JvbGxUb3A7XG4gICAgICAgIG1ldGhvZCA9IHNjcm9sbEVsZW1lbnQ7XG4gICAgICB9XG5cbiAgICAgIC8vIGNhbmNlbCBmcmFtZSB3aGVuIGEgc2Nyb2xsIGV2ZW50J3MgaGFwcGVuaW5nXG4gICAgICBpZiAoZnJhbWUpIHtcbiAgICAgICAgdy5jYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHNjcm9sbCBsb29waW5nIG92ZXIgYSBmcmFtZVxuICAgICAgc3RlcCh7XG4gICAgICAgIHNjcm9sbGFibGU6IHNjcm9sbGFibGUsXG4gICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICBzdGFydFRpbWU6IHN0YXJ0VGltZSxcbiAgICAgICAgc3RhcnRYOiBzdGFydFgsXG4gICAgICAgIHN0YXJ0WTogc3RhcnRZLFxuICAgICAgICB4OiB4LFxuICAgICAgICB5OiB5LFxuICAgICAgICBmcmFtZTogZnJhbWVcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogT1JJR0lOQUwgTUVUSE9EUyBPVkVSUklERVNcbiAgICAgKi9cblxuICAgIC8vIHcuc2Nyb2xsIGFuZCB3LnNjcm9sbFRvXG4gICAgdy5zY3JvbGwgPSB3LnNjcm9sbFRvID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCBzbW9vdGggYmVoYXZpb3IgaWYgbm90IHJlcXVpcmVkXG4gICAgICBpZiAoc2hvdWxkQmFpbE91dChhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIG9yaWdpbmFsLnNjcm9sbC5jYWxsKFxuICAgICAgICAgIHcsXG4gICAgICAgICAgYXJndW1lbnRzWzBdLmxlZnQgfHwgYXJndW1lbnRzWzBdLFxuICAgICAgICAgIGFyZ3VtZW50c1swXS50b3AgfHwgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgIHcsXG4gICAgICAgIGQuYm9keSxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0ubGVmdCxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0udG9wXG4gICAgICApO1xuICAgIH07XG5cbiAgICAvLyB3LnNjcm9sbEJ5XG4gICAgdy5zY3JvbGxCeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYXZvaWQgc21vb3RoIGJlaGF2aW9yIGlmIG5vdCByZXF1aXJlZFxuICAgICAgaWYgKHNob3VsZEJhaWxPdXQoYXJndW1lbnRzWzBdKSkge1xuICAgICAgICBvcmlnaW5hbC5zY3JvbGxCeS5jYWxsKFxuICAgICAgICAgIHcsXG4gICAgICAgICAgYXJndW1lbnRzWzBdLmxlZnQgfHwgYXJndW1lbnRzWzBdLFxuICAgICAgICAgIGFyZ3VtZW50c1swXS50b3AgfHwgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgIHcsXG4gICAgICAgIGQuYm9keSxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0ubGVmdCArICh3LnNjcm9sbFggfHwgdy5wYWdlWE9mZnNldCksXG4gICAgICAgIH5+YXJndW1lbnRzWzBdLnRvcCArICh3LnNjcm9sbFkgfHwgdy5wYWdlWU9mZnNldClcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8vIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3XG4gICAgRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXcgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGF2b2lkIHNtb290aCBiZWhhdmlvciBpZiBub3QgcmVxdWlyZWRcbiAgICAgIGlmIChzaG91bGRCYWlsT3V0KGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgb3JpZ2luYWwuc2Nyb2xsSW50b1ZpZXcuY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0gfHwgdHJ1ZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgdmFyIHNjcm9sbGFibGVQYXJlbnQgPSBmaW5kU2Nyb2xsYWJsZVBhcmVudCh0aGlzKTtcbiAgICAgIHZhciBwYXJlbnRSZWN0cyA9IHNjcm9sbGFibGVQYXJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB2YXIgY2xpZW50UmVjdHMgPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICBpZiAoc2Nyb2xsYWJsZVBhcmVudCAhPT0gZC5ib2R5KSB7XG4gICAgICAgIC8vIHJldmVhbCBlbGVtZW50IGluc2lkZSBwYXJlbnRcbiAgICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgICAgdGhpcyxcbiAgICAgICAgICBzY3JvbGxhYmxlUGFyZW50LFxuICAgICAgICAgIHNjcm9sbGFibGVQYXJlbnQuc2Nyb2xsTGVmdCArIGNsaWVudFJlY3RzLmxlZnQgLSBwYXJlbnRSZWN0cy5sZWZ0LFxuICAgICAgICAgIHNjcm9sbGFibGVQYXJlbnQuc2Nyb2xsVG9wICsgY2xpZW50UmVjdHMudG9wIC0gcGFyZW50UmVjdHMudG9wXG4gICAgICAgICk7XG4gICAgICAgIC8vIHJldmVhbCBwYXJlbnQgaW4gdmlld3BvcnRcbiAgICAgICAgdy5zY3JvbGxCeSh7XG4gICAgICAgICAgbGVmdDogcGFyZW50UmVjdHMubGVmdCxcbiAgICAgICAgICB0b3A6IHBhcmVudFJlY3RzLnRvcCxcbiAgICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCdcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZXZlYWwgZWxlbWVudCBpbiB2aWV3cG9ydFxuICAgICAgICB3LnNjcm9sbEJ5KHtcbiAgICAgICAgICBsZWZ0OiBjbGllbnRSZWN0cy5sZWZ0LFxuICAgICAgICAgIHRvcDogY2xpZW50UmVjdHMudG9wLFxuICAgICAgICAgIGJlaGF2aW9yOiAnc21vb3RoJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIGNvbW1vbmpzXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7IHBvbHlmaWxsOiBwb2x5ZmlsbCB9O1xuICB9IGVsc2Uge1xuICAgIC8vIGdsb2JhbFxuICAgIHBvbHlmaWxsKCk7XG4gIH1cbn0pKHdpbmRvdywgZG9jdW1lbnQpO1xuIiwiY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJylcblxuY29uc3Qgc2VsZiA9IG5ldyBFdmVudEVtaXR0ZXIoKVxuXG5zZWxmLl9pdGVtcyA9IFtdXG5zZWxmLl9zZWxlY3RlZEl0ZW1JbmRleCA9IC0xXG5cbnNlbGYuX25vZGVzID0ge1xuICBzZWFyY2g6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzZWFyY2gnKSxcbiAgaW5wdXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJzZWFyY2hcIl0nKSxcbiAgYXV0b2NvbXBsZXRlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlJylcbn1cblxuc2VsZi5nZXRTZWxlY3RlZEl0ZW0gPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChzZWxmLmdldEl0ZW1zKCkgPT09IFtdKSByZXR1cm5cblxuICBpZiAoc2VsZi5nZXRTZWxlY3RlZEl0ZW1JbmRleCgpID09PSAtMSkge1xuICAgIHJldHVybiBzZWxmLmdldEl0ZW1zKClbMF1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc2VsZi5nZXRJdGVtcygpW3NlbGYuZ2V0U2VsZWN0ZWRJdGVtSW5kZXgoKV1cbiAgfVxufVxuXG5zZWxmLmdldFNlbGVjdGVkSXRlbUluZGV4ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXhcbn1cblxuc2VsZi5nZXRJdGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHNlbGYuX2l0ZW1zXG59XG5cbnNlbGYucmVtb3ZlQWxsSXRlbXMgPSBmdW5jdGlvbiAoKSB7XG4gIHdoaWxlIChzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuZmlyc3RDaGlsZCkge1xuICAgIHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5yZW1vdmVDaGlsZChzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuZmlyc3RDaGlsZClcbiAgfVxuICBzZWxmLl9pdGVtcyA9IFtdXG4gIHNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ID0gLTFcbn1cblxuc2VsZi5hZGRJdGVtID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgY29uc3QgbGlzdEl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpXG4gIGxpc3RJdGVtLnRleHRDb250ZW50ID0gaXRlbS52YWx1ZVxuICBzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuYXBwZW5kQ2hpbGQobGlzdEl0ZW0pXG4gIHNlbGYuX2l0ZW1zLnB1c2goaXRlbSlcbn1cblxuc2VsZi5fbW92ZVNlbGVjdGVkID0gZnVuY3Rpb24gKHNoaWZ0KSB7XG4gIGlmIChzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleCArIHNoaWZ0ID49IHNlbGYuZ2V0SXRlbXMoKS5sZW5ndGgpIHtcbiAgICBzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleCA9IC0xXG4gIH0gZWxzZSBpZiAoc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggKyBzaGlmdCA8IC0xKSB7XG4gICAgc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggPSBzZWxmLmdldEl0ZW1zKCkubGVuZ3RoIC0gMVxuICB9IGVsc2Uge1xuICAgIHNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ICs9IHNoaWZ0XG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGYuZ2V0SXRlbXMoKS5sZW5ndGg7IGkrKykge1xuICAgIHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5jaGlsZHJlbltpXS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpXG4gIH1cbiAgaWYgKHNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ID49IDApIHtcbiAgICBzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGVcbiAgICAgICAgLmNoaWxkcmVuW3NlbGYuX3NlbGVjdGVkSXRlbUluZGV4XS5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpXG4gIH1cbn1cblxuc2VsZi5faGFuZGxlSXRlbUNsaWNrID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGlmICghc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVyblxuICBjb25zdCBpdGVtSW5kZXggPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZlxuICAgICAgLmNhbGwoc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmNoaWxkcmVuLCBldmVudC50YXJnZXQpXG4gIHNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ID0gaXRlbUluZGV4XG4gIHNlbGYuZW1pdCgnc2VsZWN0Jywgc2VsZi5nZXRTZWxlY3RlZEl0ZW0oKSlcbn1cblxuc2VsZi5faGFuZGxlS2V5ZG93biA9IGZ1bmN0aW9uIChldmVudCkge1xuICBpZiAoZXZlbnQua2V5ID09PSAnQXJyb3dEb3duJyB8fCBldmVudC5rZXkgPT09ICdBcnJvd1VwJykge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBpZiAoZXZlbnQua2V5ID09PSAnQXJyb3dEb3duJykge1xuICAgICAgc2VsZi5fbW92ZVNlbGVjdGVkKDEpXG4gICAgfSBlbHNlIGlmIChldmVudC5rZXkgPT09ICdBcnJvd1VwJykge1xuICAgICAgc2VsZi5fbW92ZVNlbGVjdGVkKC0xKVxuICAgIH1cbiAgfVxufVxuXG5zZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxmLl9oYW5kbGVJdGVtQ2xpY2spXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgc2VsZi5faGFuZGxlS2V5ZG93bilcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJjb25zdCBzZWxmID0ge31cblxuc2VsZi5pc0lFID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdNU0lFJykgIT09IC0xIHx8XG4gICAgICAgICAgICBuYXZpZ2F0b3IuYXBwVmVyc2lvbi5pbmRleE9mKCdUcmlkZW50LycpID4gMFxuXG5pZiAoc2VsZi5pc0lFKSB7XG4gIHNlbGYuaW5wdXRFdmVudCA9ICd0ZXh0aW5wdXQnXG59IGVsc2Uge1xuICBzZWxmLmlucHV0RXZlbnQgPSAnaW5wdXQnXG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwiLyogZ2xvYmFsIFVTRVJTICovXG5cbmNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5cbmNvbnN0IHNlbGYgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fbm9kZXMgPSB7XG4gIHRvZ2dsZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZhdicpXG59XG5cbnNlbGYuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICB0cnkge1xuICAgIGNvbnN0IGxvY2FsU3RvcmFnZVVzZXIgPSBKU09OLnBhcnNlKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZmF2JykpXG4gICAgaWYgKGxvY2FsU3RvcmFnZVVzZXIgPT0gbnVsbCkgcmV0dXJuXG5cbiAgICBjb25zdCBjb3JyZWN0ZWRVc2VyID0gVVNFUlMuZmlsdGVyKHVzZXIgPT5cbiAgICAgICAgdXNlci50eXBlID09PSBsb2NhbFN0b3JhZ2VVc2VyLnR5cGUgJiZcbiAgICAgICAgdXNlci52YWx1ZSA9PT0gbG9jYWxTdG9yYWdlVXNlci52YWx1ZSlbMF1cbiAgICByZXR1cm4gY29ycmVjdGVkVXNlclxuICB9IGNhdGNoIChlKSB7XG4gICAgc2VsZi5kZWxldGUoKVxuICAgIHJldHVyblxuICB9XG59XG5cbnNlbGYuc2V0ID0gZnVuY3Rpb24gKHVzZXIpIHtcbiAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdmYXYnLCBKU09OLnN0cmluZ2lmeSh1c2VyKSlcbiAgc2VsZi5fbm9kZXMuaW5uZXJIVE1MID0gJyYjeEU4Mzg7J1xufVxuXG5zZWxmLmRlbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdmYXYnKVxufVxuXG5zZWxmLnVwZGF0ZURvbSA9IGZ1bmN0aW9uIChpc0Zhdm9yaXRlKSB7XG4gIGlmIChpc0Zhdm9yaXRlKSB7XG4gICAgc2VsZi5fbm9kZXMudG9nZ2xlLmlubmVySFRNTCA9ICcmI3hFODM4OydcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9ub2Rlcy50b2dnbGUuaW5uZXJIVE1MID0gJyYjeEU4M0EnXG4gIH1cbn1cblxuc2VsZi51cGRhdGUgPSBmdW5jdGlvbiAoc2VsZWN0ZWRVc2VyKSB7XG4gIGNvbnN0IGN1cnJlbnRVc2VyID0gc2VsZi5nZXQoKVxuXG4gIGlmIChjdXJyZW50VXNlciA9PSBudWxsKSB7XG4gICAgc2VsZi51cGRhdGVEb20oZmFsc2UpXG4gICAgcmV0dXJuXG4gIH1cblxuICBjb25zdCBpc0VxdWFsID0gY3VycmVudFVzZXIudHlwZSA9PT0gc2VsZWN0ZWRVc2VyLnR5cGUgJiZcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRVc2VyLmluZGV4ID09PSBzZWxlY3RlZFVzZXIuaW5kZXhcblxuICBzZWxmLnVwZGF0ZURvbShpc0VxdWFsKVxufVxuXG5zZWxmLnRvZ2dsZSA9IGZ1bmN0aW9uIChzZWxlY3RlZFVzZXIpIHtcbiAgY29uc3QgY3VycmVudFVzZXIgPSBzZWxmLmdldCgpXG4gIGNvbnN0IGlzRXF1YWwgPSBjdXJyZW50VXNlciAhPSBudWxsICYmXG4gICAgICAgICAgICAgICAgICBjdXJyZW50VXNlci50eXBlID09PSBzZWxlY3RlZFVzZXIudHlwZSAmJlxuICAgICAgICAgICAgICAgICAgY3VycmVudFVzZXIuaW5kZXggPT09IHNlbGVjdGVkVXNlci5pbmRleFxuXG4gIGlmIChpc0VxdWFsKSB7XG4gICAgc2VsZi5kZWxldGUoKVxuICAgIHNlbGYudXBkYXRlRG9tKGZhbHNlKVxuICB9IGVsc2Uge1xuICAgIHNlbGYuc2V0KHNlbGVjdGVkVXNlcilcbiAgICBzZWxmLnVwZGF0ZURvbSh0cnVlKVxuICB9XG59XG5cbnNlbGYuX2hhbmRsZUNsaWNrID0gZnVuY3Rpb24gKCkge1xuICBzZWxmLmVtaXQoJ2NsaWNrJylcbn1cblxuc2VsZi5fbm9kZXMudG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2VsZi5faGFuZGxlQ2xpY2spXG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwiY29uc3QgYnJvd3NlckZpeFRvb2xraXQgPSByZXF1aXJlKCcuL2Jyb3dzZXJGaXhUb29sa2l0JylcblxuY29uc3Qgc2VsZiA9IHt9XG5cbnNlbGYuX25vZGVzID0ge1xuICBpbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpXG59XG5cbnNlbGYuaXNTaG93biA9IGZhbHNlXG5cbnNlbGYuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCduby1pbnB1dCcpXG4gIHNlbGYuaXNTaG93biA9IHRydWVcbn1cblxuc2VsZi5oaWRlID0gZnVuY3Rpb24gKCkge1xuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ25vLWlucHV0JylcbiAgc2VsZi5pc1Nob3duID0gZmFsc2Vcbn1cblxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihicm93c2VyRml4VG9vbGtpdC5pbnB1dEV2ZW50LCBzZWxmLmhpZGUpXG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwiY29uc3QgZnJvbnRwYWdlID0gcmVxdWlyZSgnLi9mcm9udHBhZ2UnKVxuY29uc3Qgc2VhcmNoID0gcmVxdWlyZSgnLi9zZWFyY2gnKVxuY29uc3Qgc2NoZWR1bGUgPSByZXF1aXJlKCcuL3NjaGVkdWxlJylcbmNvbnN0IHdlZWtTZWxlY3RvciA9IHJlcXVpcmUoJy4vd2Vla1NlbGVjdG9yJylcbmNvbnN0IGZhdm9yaXRlID0gcmVxdWlyZSgnLi9mYXZvcml0ZScpXG5jb25zdCBzY3JvbGxTbmFwID0gcmVxdWlyZSgnLi9zY3JvbGxTbmFwJylcblxuY29uc3Qgc3RhdGUgPSB7fVxuXG53aW5kb3cuc3RhdGUgPSBzdGF0ZVxud2luZG93LnJlcXVpcmUgPSByZXF1aXJlXG5cbmZyb250cGFnZS5zaG93KClcbndlZWtTZWxlY3Rvci51cGRhdGVDdXJyZW50V2VlaygpXG5zY3JvbGxTbmFwLnN0YXJ0TGlzdGVuaW5nKClcblxuaWYgKGZhdm9yaXRlLmdldCgpICE9IG51bGwpIHtcbiAgc3RhdGUuc2VsZWN0ZWRJdGVtID0gZmF2b3JpdGUuZ2V0KClcbiAgZmF2b3JpdGUudXBkYXRlKHN0YXRlLnNlbGVjdGVkSXRlbSlcbiAgc2NoZWR1bGUudmlld0l0ZW0od2Vla1NlbGVjdG9yLmdldFNlbGVjdGVkV2VlaygpLCBzdGF0ZS5zZWxlY3RlZEl0ZW0pXG59IGVsc2Uge1xuICBzZWFyY2guZm9jdXMoKVxufVxuXG5zZWFyY2gub24oJ3NlYXJjaCcsIGZ1bmN0aW9uIChzZWxlY3RlZEl0ZW0pIHtcbiAgc3RhdGUuc2VsZWN0ZWRJdGVtID0gc2VsZWN0ZWRJdGVtXG4gIGZhdm9yaXRlLnVwZGF0ZShzdGF0ZS5zZWxlY3RlZEl0ZW0pXG4gIHNjaGVkdWxlLnZpZXdJdGVtKHdlZWtTZWxlY3Rvci5nZXRTZWxlY3RlZFdlZWsoKSwgc3RhdGUuc2VsZWN0ZWRJdGVtKVxufSlcblxud2Vla1NlbGVjdG9yLm9uKCd3ZWVrQ2hhbmdlZCcsIGZ1bmN0aW9uIChuZXdXZWVrKSB7XG4gIHNjaGVkdWxlLnZpZXdJdGVtKG5ld1dlZWssIHN0YXRlLnNlbGVjdGVkSXRlbSlcbn0pXG5cbmZhdm9yaXRlLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgZmF2b3JpdGUudG9nZ2xlKHN0YXRlLnNlbGVjdGVkSXRlbSlcbn0pXG5cbmRvY3VtZW50LmJvZHkuc3R5bGUub3BhY2l0eSA9IDFcbiIsImNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5jb25zdCBsZWZ0UGFkID0gcmVxdWlyZSgnbGVmdC1wYWQnKVxuY29uc3Qgc2VhcmNoID0gcmVxdWlyZSgnLi9zZWFyY2gnKVxuXG5jb25zdCBzZWxmID0gbmV3IEV2ZW50RW1pdHRlcigpXG5cbnNlbGYuX25vZGVzID0ge1xuICBzY2hlZHVsZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NjaGVkdWxlJylcbn1cblxuc2VsZi5fcGFyc2VNZWV0aW5ncG9pbnRIVE1MID0gZnVuY3Rpb24gKGh0bWxTdHIpIHtcbiAgY29uc3QgaHRtbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2h0bWwnKVxuICBodG1sLmlubmVySFRNTCA9IGh0bWxTdHJcbiAgY29uc3QgY2VudGVyTm9kZSA9IGh0bWwucXVlcnlTZWxlY3RvcignY2VudGVyJylcbiAgcmV0dXJuIGNlbnRlck5vZGVcbn1cblxuc2VsZi5faGFuZGxlTG9hZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICBjb25zdCByZXF1ZXN0ID0gZXZlbnQudGFyZ2V0XG4gIGlmIChyZXF1ZXN0LnN0YXR1cyA8IDIwMCB8fCByZXF1ZXN0LnN0YXR1cyA+PSA0MDApIHtcbiAgICBzZWxmLl9oYW5kbGVFcnJvcihldmVudClcbiAgICByZXR1cm5cbiAgfVxuICBjb25zdCBkb2N1bWVudCA9IHNlbGYuX3BhcnNlTWVldGluZ3BvaW50SFRNTChyZXF1ZXN0LnJlc3BvbnNlKVxuICBzZWxmLl9ub2Rlcy5zY2hlZHVsZS5hcHBlbmRDaGlsZChkb2N1bWVudClcbiAgc2VsZi5fbm9kZXMuc2NoZWR1bGUuY2xhc3NMaXN0LnJlbW92ZSgnZXJyb3InKVxuICBzZWxmLmVtaXQoJ2xvYWQnKVxufVxuXG5zZWxmLl9oYW5kbGVFcnJvciA9IGZ1bmN0aW9uIChldmVudCkge1xuICBjb25zdCByZXF1ZXN0ID0gZXZlbnQudGFyZ2V0XG4gIGxldCBlcnJvclxuICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDQwNCkge1xuICAgIGVycm9yID0gJ1NvcnJ5LCBlciBpcyAobm9nKSBnZWVuIHJvb3N0ZXIgdm9vciBkZXplIHdlZWsuJ1xuICB9IGVsc2Uge1xuICAgIGVycm9yID0gJ1NvcnJ5LCBlciBpcyBpZXRzIG1pcyBnZWdhYW4gdGlqZGVucyBoZXQgbGFkZW4gdmFuIGRlemUgd2Vlay4nXG4gIH1cbiAgc2VsZi5fbm9kZXMuc2NoZWR1bGUudGV4dENvbnRlbnQgPSBlcnJvclxuICBzZWxmLl9ub2Rlcy5zY2hlZHVsZS5jbGFzc0xpc3QuYWRkKCdlcnJvcicpXG4gIHNlbGYuZW1pdCgnbG9hZCcpXG59XG5cbnNlbGYuX2dldFVSTE9mVXNlcnMgPSBmdW5jdGlvbiAod2VlaywgdHlwZSwgaW5kZXgpIHtcbiAgY29uc3QgaWQgPSBpbmRleCArIDFcbiAgcmV0dXJuIGAvLyR7d2luZG93LmxvY2F0aW9uLmhvc3R9L21lZXRpbmdwb2ludFByb3h5L1Jvb3N0ZXJzLUFMJTJGZG9jJTJGZGFncm9vc3RlcnMlMkZgICtcbiAgICAgIGAkeyh3ZWVrKX0lMkYke3R5cGV9JTJGJHt0eXBlfSR7bGVmdFBhZChpZCwgNSwgJzAnKX0uaHRtYFxufVxuXG5zZWxmLnZpZXdJdGVtID0gZnVuY3Rpb24gKHdlZWssIHNlbGVjdGVkVXNlcikge1xuICBjb25zdCB1cmwgPSBzZWxmLl9nZXRVUkxPZlVzZXJzKHdlZWssIHNlbGVjdGVkVXNlci50eXBlLCBzZWxlY3RlZFVzZXIuaW5kZXgpXG5cbiAgd2hpbGUgKHNlbGYuX25vZGVzLnNjaGVkdWxlLmZpcnN0Q2hpbGQpIHtcbiAgICBzZWxmLl9ub2Rlcy5zY2hlZHVsZS5yZW1vdmVDaGlsZChzZWxmLl9ub2Rlcy5zY2hlZHVsZS5maXJzdENoaWxkKVxuICB9XG5cbiAgY29uc3QgcmVxdWVzdCA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKVxuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBzZWxmLl9oYW5kbGVMb2FkKVxuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgc2VsZi5faGFuZGxlRXJyb3IpXG4gIHJlcXVlc3Qub3BlbignR0VUJywgdXJsLCB0cnVlKVxuICByZXF1ZXN0LnNlbmQoKVxuXG4gIHNlYXJjaC51cGRhdGVEb20oc2VsZWN0ZWRVc2VyKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsInJlcXVpcmUoJ3Ntb290aHNjcm9sbC1wb2x5ZmlsbCcpLnBvbHlmaWxsKClcblxuY29uc3Qgc2VsZiA9IHt9XG5jb25zdCBzY2hlZHVsZSA9IHJlcXVpcmUoJy4vc2NoZWR1bGUnKVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgc2VhcmNoOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2VhcmNoJyksXG4gIHdlZWtTZWxlY3RvcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3dlZWstc2VsZWN0b3InKVxufVxuXG5zZWxmLl90aW1lb3V0SUQgPSBudWxsXG5cbnNlbGYuX2hhbmRsZURvbmVTY3JvbGxpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHNjcm9sbFBvc2l0aW9uID0gZG9jdW1lbnQuYm9keS5zY3JvbGxUb3BcbiAgY29uc3Qgd2Vla1NlbGVjdG9ySGVpZ2h0ID0gc2VsZi5fbm9kZXMud2Vla1NlbGVjdG9yLmNsaWVudEhlaWdodCAtIHNlbGYuX25vZGVzLnNlYXJjaC5jbGllbnRIZWlnaHRcbiAgaWYgKHNjcm9sbFBvc2l0aW9uIDwgd2Vla1NlbGVjdG9ySGVpZ2h0ICYmIHNjcm9sbFBvc2l0aW9uID4gMCkge1xuICAgIHdpbmRvdy5zY3JvbGwoeyB0b3A6IHdlZWtTZWxlY3RvckhlaWdodCwgbGVmdDogMCwgYmVoYXZpb3I6ICdzbW9vdGgnIH0pXG4gIH1cbn1cblxuc2VsZi5faGFuZGxlU2Nyb2xsID0gZnVuY3Rpb24gKCkge1xuICBpZiAoc2VsZi5fdGltZW91dElEICE9IG51bGwpIHdpbmRvdy5jbGVhclRpbWVvdXQoc2VsZi5fdGltZW91dElEKVxuICBzZWxmLl90aW1lb3V0SUQgPSB3aW5kb3cuc2V0VGltZW91dChzZWxmLl9oYW5kbGVEb25lU2Nyb2xsaW5nLCA1MDApXG5cbiAgY29uc3Qgc2Nyb2xsUG9zaXRpb24gPSBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxuICBjb25zdCB3ZWVrU2VsZWN0b3JIZWlnaHQgPSBzZWxmLl9ub2Rlcy53ZWVrU2VsZWN0b3IuY2xpZW50SGVpZ2h0IC0gc2VsZi5fbm9kZXMuc2VhcmNoLmNsaWVudEhlaWdodFxuICBpZiAoc2Nyb2xsUG9zaXRpb24gPj0gd2Vla1NlbGVjdG9ySGVpZ2h0KSB7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCd3ZWVrLXNlbGVjdG9yLW5vdC12aXNpYmxlJylcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3dlZWstc2VsZWN0b3Itbm90LXZpc2libGUnKVxuICB9XG59XG5cbnNlbGYuX2hhbmRsZVdpbmRvd1Jlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgd2Vla1NlbGVjdG9ySGVpZ2h0ID0gc2VsZi5fbm9kZXMud2Vla1NlbGVjdG9yLmNsaWVudEhlaWdodCAtIHNlbGYuX25vZGVzLnNlYXJjaC5jbGllbnRIZWlnaHRcbiAgY29uc3QgZXh0cmFQaXhlbHNOZWVkZWQgPSB3ZWVrU2VsZWN0b3JIZWlnaHQgLSAoZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQgLSB3aW5kb3cuaW5uZXJIZWlnaHQpXG4gIGlmIChleHRyYVBpeGVsc05lZWRlZCA+IDApIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm1hcmdpbkJvdHRvbSA9IGAke2V4dHJhUGl4ZWxzTmVlZGVkfXB4YFxuICB9IGVsc2Uge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUubWFyZ2luQm90dG9tID0gbnVsbFxuICB9XG59XG5cbnNlbGYuc3RhcnRMaXN0ZW5pbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzZWxmLl9oYW5kbGVTY3JvbGwpXG59XG5cbnNjaGVkdWxlLm9uKCdsb2FkJywgc2VsZi5faGFuZGxlV2luZG93UmVzaXplKVxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNlbGYuX2hhbmRsZVdpbmRvd1Jlc2l6ZSlcbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwiLyogZ2xvYmFsIFVTRVJTICovXG5cbmNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5jb25zdCBmdXp6eSA9IHJlcXVpcmUoJ2Z1enp5JylcbmNvbnN0IGF1dG9jb21wbGV0ZSA9IHJlcXVpcmUoJy4vYXV0b2NvbXBsZXRlJylcbmNvbnN0IGJyb3dzZXJGaXhUb29sa2l0ID0gcmVxdWlyZSgnLi9icm93c2VyRml4VG9vbGtpdCcpXG5cbmNvbnN0IHNlbGYgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fbm9kZXMgPSB7XG4gIHNlYXJjaDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NlYXJjaCcpLFxuICBpbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpXG59XG5cbnNlbGYuc3VibWl0ID0gZnVuY3Rpb24gKCkge1xuICBzZWxmLl9ub2Rlcy5pbnB1dC5ibHVyKClcblxuICBjb25zdCBzZWxlY3RlZEl0ZW0gPSBhdXRvY29tcGxldGUuZ2V0U2VsZWN0ZWRJdGVtKClcblxuICBjb25zb2xlLmxvZyhzZWxlY3RlZEl0ZW0pXG5cbiAgc2VsZi5lbWl0KCdzZWFyY2gnLCBzZWxlY3RlZEl0ZW0pXG59XG5cbnNlbGYudXBkYXRlRG9tID0gZnVuY3Rpb24gKHNlbGVjdGVkSXRlbSkge1xuICBzZWxmLl9ub2Rlcy5pbnB1dC52YWx1ZSA9IHNlbGVjdGVkSXRlbS52YWx1ZVxuICBhdXRvY29tcGxldGUucmVtb3ZlQWxsSXRlbXMoKVxuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ25vLWlucHV0JylcbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdzZWFyY2hlZCcpXG59XG5cbnNlbGYuZm9jdXMgPSBmdW5jdGlvbiAoKSB7XG4gIHNlbGYuX25vZGVzLmlucHV0LmZvY3VzKClcbn1cblxuc2VsZi5faGFuZGxlU3VibWl0ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgc2VsZi5zdWJtaXQoKVxufVxuXG5zZWxmLl9jYWxjdWxhdGUgPSBmdW5jdGlvbiAoc2VhcmNoVGVybSkge1xuICBjb25zdCBhbGxSZXN1bHRzID0gZnV6enkuZmlsdGVyKHNlYXJjaFRlcm0sIFVTRVJTLCB7XG4gICAgZXh0cmFjdDogaXRlbSA9PiBpdGVtLnZhbHVlXG4gIH0pXG4gIGNvbnN0IGZpcnN0UmVzdWx0cyA9IGFsbFJlc3VsdHMuc2xpY2UoMCwgNylcblxuICBjb25zdCBvcmlnaW5hbFJlc3VsdHMgPSBmaXJzdFJlc3VsdHMubWFwKHJlc3VsdCA9PiByZXN1bHQub3JpZ2luYWwpXG5cbiAgcmV0dXJuIG9yaWdpbmFsUmVzdWx0c1xufVxuXG5zZWxmLl9oYW5kbGVUZXh0VXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCByZXN1bHRzID0gc2VsZi5fY2FsY3VsYXRlKHNlbGYuX25vZGVzLmlucHV0LnZhbHVlKVxuXG4gIGF1dG9jb21wbGV0ZS5yZW1vdmVBbGxJdGVtcygpXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgIGF1dG9jb21wbGV0ZS5hZGRJdGVtKHJlc3VsdHNbaV0pXG4gIH1cbn1cblxuc2VsZi5faGFuZGxlRm9jdXMgPSBmdW5jdGlvbiAoKSB7XG4gIHNlbGYuX25vZGVzLmlucHV0LnNlbGVjdCgpXG59XG5cbnNlbGYuX2hhbmRsZUJsdXIgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIHRoaXMgd2lsbCByZW1vdmVkIHRoZSBzZWxlY3Rpb24gd2l0aG91dCBkcmF3aW5nIGZvY3VzIG9uIGl0IChzYWZhcmkpXG4gIC8vIHRoaXMgd2lsbCByZW1vdmVkIHNlbGVjdGlvbiBldmVuIHdoZW4gZm9jdXNpbmcgYW4gaWZyYW1lIChjaHJvbWUpXG4gIGNvbnN0IG9sZFZhbHVlID0gc2VsZi5fbm9kZXMudmFsdWVcbiAgc2VsZi5fbm9kZXMudmFsdWUgPSAnJ1xuICBzZWxmLl9ub2Rlcy52YWx1ZSA9IG9sZFZhbHVlXG5cbiAgLy8gdGhpcyB3aWxsIGhpZGUgdGhlIGtleWJvYXJkIChpT1Mgc2FmYXJpKVxuICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKVxufVxuXG5hdXRvY29tcGxldGUub24oJ3NlbGVjdCcsIHNlbGYuc3VibWl0KVxuXG5zZWxmLl9ub2Rlcy5zZWFyY2guYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0Jywgc2VsZi5faGFuZGxlU3VibWl0KVxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBzZWxmLl9oYW5kbGVGb2N1cylcbnNlbGYuX25vZGVzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCBzZWxmLl9oYW5kbGVCbHVyKVxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihicm93c2VyRml4VG9vbGtpdC5pbnB1dEV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9oYW5kbGVUZXh0VXBkYXRlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsImNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5cbmNvbnN0IHNlbGYgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fbm9kZXMgPSB7XG4gIHByZXZCdXR0b246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN3ZWVrLXNlbGVjdG9yIGJ1dHRvbicpWzBdLFxuICBuZXh0QnV0dG9uOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjd2Vlay1zZWxlY3RvciBidXR0b24nKVsxXSxcbiAgY3VycmVudFdlZWtUZXh0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd2Vlay1zZWxlY3RvciAuY3VycmVudCcpXG59XG5cbnNlbGYuX3dlZWtPZmZzZXQgPSAwXG5cbi8vIGNvcGllZCBmcm9tIGh0dHA6Ly93d3cubWVldGluZ3BvaW50bWNvLm5sL1Jvb3N0ZXJzLUFML2RvYy9kYWdyb29zdGVycy91bnRpc3NjcmlwdHMuanMsXG4vLyB3ZXJlIHVzaW5nIHRoZSBzYW1lIGNvZGUgYXMgdGhleSBkbyB0byBiZSBzdXJlIHRoYXQgd2UgYWx3YXlzIGdldCB0aGUgc2FtZVxuLy8gd2VlayBudW1iZXIuXG5zZWxmLmdldEN1cnJlbnRXZWVrID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICBjb25zdCBkYXlOciA9ICh0YXJnZXQuZ2V0RGF5KCkgKyA2KSAlIDdcbiAgdGFyZ2V0LnNldERhdGUodGFyZ2V0LmdldERhdGUoKSAtIGRheU5yICsgMylcbiAgY29uc3QgZmlyc3RUaHVyc2RheSA9IHRhcmdldC52YWx1ZU9mKClcbiAgdGFyZ2V0LnNldE1vbnRoKDAsIDEpXG4gIGlmICh0YXJnZXQuZ2V0RGF5KCkgIT09IDQpIHtcbiAgICB0YXJnZXQuc2V0TW9udGgoMCwgMSArICgoNCAtIHRhcmdldC5nZXREYXkoKSkgKyA3KSAlIDcpXG4gIH1cblxuICByZXR1cm4gMSArIE1hdGguY2VpbCgoZmlyc3RUaHVyc2RheSAtIHRhcmdldCkgLyA2MDQ4MDAwMDApXG59XG5cbnNlbGYuZ2V0U2VsZWN0ZWRXZWVrID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpXG4gIGNvbnN0IHRhcmdldERhdGUgPSBuZXcgRGF0ZShub3cuZ2V0VGltZSgpICtcbiAgICAgIHNlbGYuX3dlZWtPZmZzZXQgKiA2MDQ4MDAgKiAxMDAwICsgODY0MDAgKiAxMDAwKVxuICByZXR1cm4gc2VsZi5nZXRDdXJyZW50V2Vlayh0YXJnZXREYXRlKVxufVxuXG5zZWxmLnVwZGF0ZUN1cnJlbnRXZWVrID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBzZWxlY3RlZFdlZWtOdW1iZXIgPSBzZWxmLmdldFNlbGVjdGVkV2VlaygpXG4gIGlmIChzZWxmLmdldEN1cnJlbnRXZWVrKG5ldyBEYXRlKCkpICE9PSBzZWxlY3RlZFdlZWtOdW1iZXIpIHtcbiAgICBzZWxmLl9ub2Rlcy5jdXJyZW50V2Vla1RleHQuY2xhc3NMaXN0LmFkZCgnY2hhbmdlZCcpXG4gIH0gZWxzZSB7XG4gICAgc2VsZi5fbm9kZXMuY3VycmVudFdlZWtUZXh0LmNsYXNzTGlzdC5yZW1vdmUoJ2NoYW5nZWQnKVxuICB9XG4gIHNlbGYudXBkYXRlRG9tKClcbiAgc2VsZi5lbWl0KCd3ZWVrQ2hhbmdlZCcsIHNlbGVjdGVkV2Vla051bWJlcilcbn1cblxuc2VsZi51cGRhdGVEb20gPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHNlbGVjdGVkV2Vla051bWJlciA9IHNlbGYuZ2V0U2VsZWN0ZWRXZWVrKClcbiAgY29uc3QgaXNTdW5kYXkgPSBuZXcgRGF0ZSgpLmdldERheSgpID09PSAwXG4gIGxldCBodW1hblJlYWRhYmxlV2VlayA9IG51bGxcbiAgaWYgKGlzU3VuZGF5KSB7XG4gICAgc3dpdGNoIChzZWxmLl93ZWVrT2Zmc2V0KSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIGh1bWFuUmVhZGFibGVXZWVrID0gJ0FhbnN0YWFuZGUgd2VlaydcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaHVtYW5SZWFkYWJsZVdlZWsgPSAnVm9sZ2VuZGUgd2VlaydcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgLTE6XG4gICAgICAgIGh1bWFuUmVhZGFibGVXZWVrID0gJ0FmZ2Vsb3BlbiB3ZWVrJ1xuICAgICAgICBicmVha1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBzd2l0Y2ggKHNlbGYuX3dlZWtPZmZzZXQpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgaHVtYW5SZWFkYWJsZVdlZWsgPSAnSHVpZGlnZSB3ZWVrJ1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAxOlxuICAgICAgICBodW1hblJlYWRhYmxlV2VlayA9ICdWb2xnZW5kZSB3ZWVrJ1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAtMTpcbiAgICAgICAgaHVtYW5SZWFkYWJsZVdlZWsgPSAnVm9yaWdlIHdlZWsnXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIGlmIChodW1hblJlYWRhYmxlV2VlayAhPSBudWxsKSB7XG4gICAgc2VsZi5fbm9kZXMuY3VycmVudFdlZWtUZXh0LnRleHRDb250ZW50ID0gYCR7aHVtYW5SZWFkYWJsZVdlZWt9IOKAoiAke3NlbGVjdGVkV2Vla051bWJlcn1gXG4gIH0gZWxzZSB7XG4gICAgc2VsZi5fbm9kZXMuY3VycmVudFdlZWtUZXh0LnRleHRDb250ZW50ID0gYFdlZWsgJHtzZWxlY3RlZFdlZWtOdW1iZXJ9YFxuICB9XG59XG5cbnNlbGYuX2hhbmRsZVByZXZCdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgc2VsZi5fd2Vla09mZnNldCAtPSAxXG4gIHNlbGYudXBkYXRlQ3VycmVudFdlZWsoKVxufVxuXG5zZWxmLl9oYW5kbGVOZXh0QnV0dG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHNlbGYuX3dlZWtPZmZzZXQgKz0gMVxuICBzZWxmLnVwZGF0ZUN1cnJlbnRXZWVrKClcbn1cblxuc2VsZi5fbm9kZXMucHJldkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlbGYuX2hhbmRsZVByZXZCdXR0b25DbGljaylcbnNlbGYuX25vZGVzLm5leHRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxmLl9oYW5kbGVOZXh0QnV0dG9uQ2xpY2spXG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIl19
