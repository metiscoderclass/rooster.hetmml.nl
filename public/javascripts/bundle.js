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
  return array.filter(function(str) {
    return fuzzy.test(pattern, str);
  });
};

// Does `pattern` fuzzy match `str`?
fuzzy.test = function(pattern, str) {
  return fuzzy.match(pattern, str) !== null;
};

// If `pattern` matches `str`, wrap each matching character
// in `opts.pre` and `opts.post`. If no match, return null
fuzzy.match = function(pattern, str, opts) {
  opts = opts || {};
  var patternIdx = 0
    , result = []
    , len = str.length
    , totalScore = 0
    , currScore = 0
    // prefix
    , pre = opts.pre || ''
    // suffix
    , post = opts.post || ''
    // String to compare against. This might be a lowercase version of the
    // raw string
    , compareString =  opts.caseSensitive && str || str.toLowerCase()
    , ch;

  pattern = opts.caseSensitive && pattern || pattern.toLowerCase();

  // For each character in the string, either add it to the result
  // or wrap in template if it's the next string in the pattern
  for(var idx = 0; idx < len; idx++) {
    ch = str[idx];
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
    // if the string is an exact match with pattern, totalScore should be maxed
    totalScore = (compareString === pattern) ? Infinity : totalScore;
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
  if(!arr || arr.length === 0) {
    return [];
  }
  if (typeof pattern !== 'string') {
    return arr;
  }
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
/* This program is free software. It comes without any warranty, to
     * the extent permitted by applicable law. You can redistribute it
     * and/or modify it under the terms of the Do What The Fuck You Want
     * To Public License, Version 2, as published by Sam Hocevar. See
     * http://www.wtfpl.net/ for more details. */
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
    // divide `len` by 2, ditch the remainder
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
'use strict';

/* global ga */

var self = {};

self.send = {};

self.send.search = function (selectedUser, favorite) {
  var hitType = 'event';

  var eventCategory = favorite ? 'search fav' : 'search';

  var eventAction = void 0;
  switch (selectedUser.type) {
    case 'c':
      eventAction = 'Class';
      break;
    case 't':
      eventAction = 'Teacher';
      break;
    case 'r':
      eventAction = 'Room';
      break;
    case 's':
      eventAction = 'Student';
      break;
  }

  var eventLabel = selectedUser.value;

  ga(function () {
    ga('send', { hitType: hitType, eventCategory: eventCategory, eventAction: eventAction, eventLabel: eventLabel });
  });
};

module.exports = self;

},{}],6:[function(require,module,exports){
'use strict';

var EventEmitter = require('events');

var self = new EventEmitter();

self._users = [];
self._selectedUserIndex = -1;

self._nodes = {
  search: document.querySelector('#search'),
  input: document.querySelector('input[type="search"]'),
  autocomplete: document.querySelector('.autocomplete')
};

self.getSelectedUser = function () {
  if (self.getItems() === []) return;

  if (self.getSelectedUserIndex() === -1) {
    return self.getItems()[0];
  } else {
    return self.getItems()[self.getSelectedUserIndex()];
  }
};

self.getSelectedUserIndex = function () {
  return self._selectedUserIndex;
};

self.getItems = function () {
  return self._users;
};

self.removeAllItems = function () {
  while (self._nodes.autocomplete.firstChild) {
    self._nodes.autocomplete.removeChild(self._nodes.autocomplete.firstChild);
  }
  self._users = [];
  self._selectedUserIndex = -1;
};

self.addItem = function (user) {
  var listItem = document.createElement('li');
  listItem.textContent = user.value;
  self._nodes.autocomplete.appendChild(listItem);
  self._users.push(user);
};

self._moveSelected = function (shift) {
  if (self._selectedUserIndex + shift >= self.getItems().length) {
    self._selectedUserIndex = -1;
  } else if (self._selectedUserIndex + shift < -1) {
    self._selectedUserIndex = self.getItems().length - 1;
  } else {
    self._selectedUserIndex += shift;
  }

  for (var i = 0; i < self.getItems().length; i++) {
    self._nodes.autocomplete.children[i].classList.remove('selected');
  }
  if (self._selectedUserIndex >= 0) {
    self._nodes.autocomplete.children[self._selectedUserIndex].classList.add('selected');
  }
};

self._handleItemClick = function (event) {
  if (!self._nodes.autocomplete.contains(event.target)) return;
  var userIndex = Array.prototype.indexOf.call(self._nodes.autocomplete.children, event.target);
  self._selectedUserIndex = userIndex;
  self.emit('select', self.getSelectedUser());
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

},{"events":1}],7:[function(require,module,exports){
'use strict';

var self = {};

self.isIE = navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0;

if (self.isIE) {
  self.inputEvent = 'textinput';
} else {
  self.inputEvent = 'input';
}

module.exports = self;

},{}],8:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* global USERS */

var EventEmitter = require('events');

var self = new EventEmitter();

self._nodes = {
  toggle: document.querySelector('.fav')
};

self.get = function () {
  try {
    var _ret = function () {
      var localStorageUser = JSON.parse(window.localStorage.getItem('fav'));
      if (localStorageUser == null) return {
          v: void 0
        };

      var correctedUser = USERS.filter(function (user) {
        return user.type === localStorageUser.type && user.value === localStorageUser.value;
      })[0];
      return {
        v: correctedUser
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
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
  var currentUser = self.get();

  if (currentUser == null || selectedUser == null) {
    self.updateDom(false);
    return;
  }

  var isEqual = currentUser.type === selectedUser.type && currentUser.index === selectedUser.index;

  self.updateDom(isEqual);
};

self.toggle = function (selectedUser) {
  var currentUser = self.get();
  var isEqual = currentUser != null && currentUser.type === selectedUser.type && currentUser.index === selectedUser.index;

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

},{"events":1}],9:[function(require,module,exports){
'use strict';

/* global FLAGS */

var self = {};

self._nodes = {
  input: document.querySelector('input[type="search"]'),
  overflowButton: document.querySelector('#overflow-button')
};

self._shouldCheck = function () {
  return FLAGS.indexOf('NO_FEATURE_DETECT') === -1;
};

self._redirect = function () {
  window.location.href = 'http://www.meetingpointmco.nl/Roosters-AL/doc/';
};

self.check = function () {
  if (!self._shouldCheck()) return;

  window.onerror = self._redirect;

  if (self._nodes.input.getClientRects()[0].top !== self._nodes.overflowButton.getClientRects()[0].top) {
    self._redirect();
  }
};

module.exports = self;

},{}],10:[function(require,module,exports){
'use strict';

var browserFixToolkit = require('./browserFixToolkit');

var self = {};

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

},{"./browserFixToolkit":7}],11:[function(require,module,exports){
'use strict';

require('./featureDetect').check();
require('./zoom');

var frontpage = require('./frontpage');
var search = require('./search');
var schedule = require('./schedule');
var weekSelector = require('./weekSelector');
var favorite = require('./favorite');
var scrollSnap = require('./scrollSnap');
var analytics = require('./analytics');
var url = require('./url');

var state = {};

window.state = state;
window.require = require;

frontpage.show();
weekSelector.updateCurrentWeek();
scrollSnap.startListening();

if (url.hasSelectedUser()) {
  state.selectedUser = url.getSelectedUser();

  favorite.update(state.selectedUser);
  url.update(state.selectedUser);
  analytics.send.search(state.selectedUser);

  schedule.viewItem(weekSelector.getSelectedWeek(), state.selectedUser);
} else if (favorite.get() != null) {
  state.selectedUser = favorite.get();

  favorite.update(state.selectedUser);
  url.push(state.selectedUser, false);
  url.update(state.selectedUser);
  analytics.send.search(state.selectedUser, true);

  schedule.viewItem(weekSelector.getSelectedWeek(), state.selectedUser);
} else {
  search.focus();
}

search.on('search', function (selectedUser) {
  state.selectedUser = selectedUser;

  favorite.update(state.selectedUser);
  url.push(state.selectedUser);
  url.update(state.selectedUser);
  analytics.send.search(state.selectedUser);

  schedule.viewItem(weekSelector.getSelectedWeek(), state.selectedUser);
});

url.on('update', function (selectedUser) {
  state.selectedUser = selectedUser;

  favorite.update(state.selectedUser);
  url.update(state.selectedUser);

  schedule.viewItem(weekSelector.getSelectedWeek(), state.selectedUser);
});

weekSelector.on('weekChanged', function (newWeek) {
  analytics.send.search(state.selectedUser);
  schedule.viewItem(newWeek, state.selectedUser);
});

favorite.on('click', function () {
  favorite.toggle(state.selectedUser);
});

document.body.style.opacity = 1;

},{"./analytics":5,"./favorite":8,"./featureDetect":9,"./frontpage":10,"./schedule":12,"./scrollSnap":13,"./search":14,"./url":15,"./weekSelector":16,"./zoom":17}],12:[function(require,module,exports){
'use strict';

var EventEmitter = require('events');
var leftPad = require('left-pad');
var search = require('./search');

var self = new EventEmitter();

self._nodes = {
  schedule: document.querySelector('#schedule')
};

self._parseMeetingpointHTML = function (htmlStr) {
  var html = document.createElement('html');
  html.innerHTML = htmlStr;
  var centerNode = html.querySelector('center');
  return centerNode;
};

self._handleLoad = function (event) {
  var request = event.target;
  if (request.status < 200 || request.status >= 400) {
    self._handleError(event);
    return;
  }
  var document = self._parseMeetingpointHTML(request.response);
  self._removeChilds();
  self._nodes.schedule.appendChild(document);
  self._nodes.schedule.classList.remove('error');
  self.emit('load');
};

self._handleError = function (event) {
  var request = event.target;
  var error = void 0;
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
  var id = index + 1;
  var meetingpointURL = 'Roosters-AL/doc/dagroosters/' + leftPad(week, 2, '0') + '/' + type + '/' + ('' + type + leftPad(id, 5, '0') + '.htm');
  return '/meetingpointProxy/' + window.encodeURIComponent(meetingpointURL);
};

self._removeChilds = function () {
  while (self._nodes.schedule.firstChild) {
    self._nodes.schedule.removeChild(self._nodes.schedule.firstChild);
  }
};

self.viewItem = function (week, selectedUser) {
  if (selectedUser == null) {
    self._removeChilds();
    search.updateDom(selectedUser);
  } else {
    var url = self._getURLOfUsers(week, selectedUser.type, selectedUser.index);

    self._removeChilds();

    var request = new window.XMLHttpRequest();
    request.addEventListener('load', self._handleLoad);
    request.addEventListener('error', self._handleError);
    request.open('GET', url, true);
    request.send();

    search.updateDom(selectedUser);
  }
};

module.exports = self;

},{"./search":14,"events":1,"left-pad":3}],13:[function(require,module,exports){
'use strict';

require('smoothscroll-polyfill').polyfill();

var self = {};
var schedule = require('./schedule');

self._nodes = {
  search: document.querySelector('#search'),
  weekSelector: document.querySelector('#week-selector')
};

self._timeoutID = null;

self._getScrollPosition = function () {
  return document.documentElement && document.documentElement.scrollTop || document.body.scrollTop;
};

self._handleDoneScrolling = function () {
  var scrollPosition = self._getScrollPosition();
  var weekSelectorHeight = self._nodes.weekSelector.clientHeight - self._nodes.search.clientHeight;
  if (scrollPosition < weekSelectorHeight && scrollPosition > 0) {
    window.scroll({ top: weekSelectorHeight, left: 0, behavior: 'smooth' });
  }
};

self._handleScroll = function () {
  if (self._timeoutID != null) window.clearTimeout(self._timeoutID);
  self._timeoutID = window.setTimeout(self._handleDoneScrolling, 500);

  var scrollPosition = self._getScrollPosition();
  var weekSelectorHeight = self._nodes.weekSelector.clientHeight - self._nodes.search.clientHeight;
  if (scrollPosition >= weekSelectorHeight) {
    document.body.classList.add('week-selector-not-visible');
  } else {
    document.body.classList.remove('week-selector-not-visible');
  }
};

self._handleWindowResize = function () {
  var weekSelectorHeight = self._nodes.weekSelector.clientHeight - self._nodes.search.clientHeight;
  var extraPixelsNeeded = weekSelectorHeight - (document.body.clientHeight - window.innerHeight);
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

},{"./schedule":12,"smoothscroll-polyfill":4}],14:[function(require,module,exports){
'use strict';

/* global USERS */

var EventEmitter = require('events');
var fuzzy = require('fuzzy');
var autocomplete = require('./autocomplete');
var browserFixToolkit = require('./browserFixToolkit');

var self = new EventEmitter();

self._nodes = {
  search: document.querySelector('#search'),
  input: document.querySelector('input[type="search"]')
};

self.submit = function () {
  var selectedUser = autocomplete.getSelectedUser();
  if (selectedUser == null) return;

  console.log(selectedUser);

  self._nodes.input.blur();
  document.body.classList.remove('week-selector-not-visible'); // Safari bug

  self.emit('search', selectedUser);
};

self.updateDom = function (selectedUser) {
  if (selectedUser == null) {
    self._nodes.input.value = '';
    autocomplete.removeAllItems();
    document.body.classList.add('no-input');
    document.body.classList.remove('searched');
  } else {
    self._nodes.input.value = selectedUser.value;
    autocomplete.removeAllItems();
    document.body.classList.remove('no-input');
    document.body.classList.add('searched');
  }
};

self.focus = function () {
  self._nodes.input.focus();
};

self._handleSubmit = function (event) {
  event.preventDefault();
  self.submit();
};

self._calculate = function (searchTerm) {
  var allResults = fuzzy.filter(searchTerm, USERS, {
    extract: function extract(user) {
      return user.value;
    }
  });
  var firstResults = allResults.slice(0, 7);

  var originalResults = firstResults.map(function (result) {
    return result.original;
  });

  return originalResults;
};

self._handleTextUpdate = function () {
  var results = self._calculate(self._nodes.input.value);

  autocomplete.removeAllItems();
  for (var i = 0; i < results.length; i++) {
    autocomplete.addItem(results[i]);
  }
};

self._handleFocus = function () {
  self._nodes.input.select();
};

self._handleBlur = function () {
  // this will removed the selection without drawing focus on it (safari)
  // this will removed selection even when focusing an iframe (chrome)
  var oldValue = self._nodes.value;
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

},{"./autocomplete":6,"./browserFixToolkit":7,"events":1,"fuzzy":2}],15:[function(require,module,exports){
'use strict';

/* global USERS FLAGS */

var EventEmitter = require('events');

var self = new EventEmitter();

self._getPageTitle = function (selectedUser) {
  var ret = void 0;

  if (selectedUser == null) {
    ret = 'Metis Rooster';
  } else {
    ret = 'Metis Rooster - ' + selectedUser.value;
  }

  if (FLAGS.indexOf('BETA') !== -1) {
    ret = 'BETA ' + ret;
  }

  return ret;
};

self._getPageURL = function (selectedUser) {
  return '/' + selectedUser.type + '/' + selectedUser.value;
};

self.push = function (selectedUser, push) {
  if (push == null) push = true;
  var pageTitle = self._getPageTitle(selectedUser);
  var pageURL = self._getPageURL(selectedUser);
  if (push) {
    window.history.pushState(selectedUser, pageTitle, pageURL);
  } else {
    window.history.replaceState(selectedUser, pageTitle, pageURL);
  }
};

self.update = function (selectedUser) {
  document.title = self._getPageTitle(selectedUser);
};

self.hasSelectedUser = function () {
  var pageUrl = window.location.pathname;
  return (/^\/s\/|^\/t\/|^\/r\/|^\/c\//.test(pageUrl)
  );
};

self.getSelectedUser = function () {
  var pageUrl = window.location.pathname;
  var pageUrlData = pageUrl.split('/');
  var type = pageUrlData[1];
  var value = pageUrlData[2];

  var user = USERS.filter(function (user) {
    return user.type === type && user.value === value;
  })[0];

  return user;
};

self._handleUpdate = function (event) {
  self.emit('update', event.state);
};

window.addEventListener('popstate', self._handleUpdate);

module.exports = self;

},{"events":1}],16:[function(require,module,exports){
'use strict';

var EventEmitter = require('events');

var self = new EventEmitter();

self._nodes = {
  prevButton: document.querySelectorAll('#week-selector button')[0],
  nextButton: document.querySelectorAll('#week-selector button')[1],
  currentWeekNode: document.querySelector('#week-selector .current'),
  currentWeekNormalText: document.querySelector('#week-selector .current .no-print'),
  currentWeekPrintText: document.querySelector('#week-selector .current .print')
};

self._weekOffset = 0;

// copied from http://www.meetingpointmco.nl/Roosters-AL/doc/dagroosters/untisscripts.js,
// were using the same code as they do to be sure that we always get the same
// week number.
self.getCurrentWeek = function (target) {
  var dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  var firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + (4 - target.getDay() + 7) % 7);
  }

  return 1 + Math.ceil((firstThursday - target) / 604800000);
};

self.getSelectedWeek = function () {
  var now = new Date();
  var targetDate = new Date(now.getTime() + self._weekOffset * 604800 * 1000 + 86400 * 1000);
  return self.getCurrentWeek(targetDate);
};

self.updateCurrentWeek = function () {
  var selectedWeekNumber = self.getSelectedWeek();
  if (self.getCurrentWeek(new Date()) !== selectedWeekNumber) {
    self._nodes.currentWeekNode.classList.add('changed');
  } else {
    self._nodes.currentWeekNode.classList.remove('changed');
  }
  self.updateDom();
  self.emit('weekChanged', selectedWeekNumber);
};

self.updateDom = function () {
  var selectedWeekNumber = self.getSelectedWeek();
  var isSunday = new Date().getDay() === 0;
  var humanReadableWeek = null;
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
    self._nodes.currentWeekNormalText.textContent = humanReadableWeek + ' • ' + selectedWeekNumber;
    self._nodes.currentWeekPrintText.textContent = 'Week ' + selectedWeekNumber;
  } else {
    self._nodes.currentWeekNormalText.textContent = 'Week ' + selectedWeekNumber;
    self._nodes.currentWeekPrintText.textContent = 'Week ' + selectedWeekNumber;
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

},{"events":1}],17:[function(require,module,exports){
'use strict';

var schedule = require('./schedule');

var self = {};

self._nodes = {
  body: document.body
};

self._handleResize = function () {
  // the table node may not exist before this function is called
  var tableNode = document.querySelector('center > table');

  // infact, it may not even exist when this function is called.
  if (!tableNode) return;

  var tableWidth = tableNode.getBoundingClientRect().width;
  var tableGoalWidth = self._nodes.body.getBoundingClientRect().width * 0.9;
  var zoomFactor = tableGoalWidth / tableWidth;

  if (zoomFactor < 1) {
    tableNode.style.zoom = '' + zoomFactor;
  } else {
    tableNode.style.zoom = '1';
  }
};

schedule.on('load', self._handleResize);
window.addEventListener('resize', self._handleResize);

module.exports = self;

},{"./schedule":12}]},{},[11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9mdXp6eS9saWIvZnV6enkuanMiLCJub2RlX21vZHVsZXMvbGVmdC1wYWQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc21vb3Roc2Nyb2xsLXBvbHlmaWxsL2Rpc3Qvc21vb3Roc2Nyb2xsLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2FuYWx5dGljcy5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9hdXRvY29tcGxldGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYnJvd3NlckZpeFRvb2xraXQuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvZmF2b3JpdGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvZmVhdHVyZURldGVjdC5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9mcm9udHBhZ2UuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvbWFpbi5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9zY2hlZHVsZS5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9zY3JvbGxTbmFwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL3NlYXJjaC5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy91cmwuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvd2Vla1NlbGVjdG9yLmpzIiwicHVibGljL2phdmFzY3JpcHRzL3pvb20uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUksYUFBYSxDQUFqQixFQUFvQjtBQUNsQixjQUFVLEtBQVYsQ0FBZ0IsSUFBaEIsUUFBMEIsVUFBMUI7QUFDRCxHQUZELE1BRU87QUFDTCxjQUFVLEtBQVYsQ0FBZ0IsSUFBaEI7QUFDRDtBQUNGLENBaEJEOztBQWtCQSxTQUFTLEVBQVQsQ0FBWSxNQUFaLEVBQW9CLEtBQUssYUFBekI7QUFDQSxPQUFPLGdCQUFQLENBQXdCLFFBQXhCLEVBQWtDLEtBQUssYUFBdkM7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLElBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBdCBsZWFzdCBnaXZlIHNvbWUga2luZCBvZiBjb250ZXh0IHRvIHRoZSB1c2VyXG4gICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuICgnICsgZXIgKyAnKScpO1xuICAgICAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSBpZiAobGlzdGVuZXJzKSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24odHlwZSkge1xuICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgICBpZiAoaXNGdW5jdGlvbihldmxpc3RlbmVyKSlcbiAgICAgIHJldHVybiAxO1xuICAgIGVsc2UgaWYgKGV2bGlzdGVuZXIpXG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIDA7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsIi8qXG4gKiBGdXp6eVxuICogaHR0cHM6Ly9naXRodWIuY29tL215b3JrL2Z1enp5XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEyIE1hdHQgWW9ya1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICovXG5cbihmdW5jdGlvbigpIHtcblxudmFyIHJvb3QgPSB0aGlzO1xuXG52YXIgZnV6enkgPSB7fTtcblxuLy8gVXNlIGluIG5vZGUgb3IgaW4gYnJvd3NlclxuaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1enp5O1xufSBlbHNlIHtcbiAgcm9vdC5mdXp6eSA9IGZ1enp5O1xufVxuXG4vLyBSZXR1cm4gYWxsIGVsZW1lbnRzIG9mIGBhcnJheWAgdGhhdCBoYXZlIGEgZnV6enlcbi8vIG1hdGNoIGFnYWluc3QgYHBhdHRlcm5gLlxuZnV6enkuc2ltcGxlRmlsdGVyID0gZnVuY3Rpb24ocGF0dGVybiwgYXJyYXkpIHtcbiAgcmV0dXJuIGFycmF5LmZpbHRlcihmdW5jdGlvbihzdHIpIHtcbiAgICByZXR1cm4gZnV6enkudGVzdChwYXR0ZXJuLCBzdHIpO1xuICB9KTtcbn07XG5cbi8vIERvZXMgYHBhdHRlcm5gIGZ1enp5IG1hdGNoIGBzdHJgP1xuZnV6enkudGVzdCA9IGZ1bmN0aW9uKHBhdHRlcm4sIHN0cikge1xuICByZXR1cm4gZnV6enkubWF0Y2gocGF0dGVybiwgc3RyKSAhPT0gbnVsbDtcbn07XG5cbi8vIElmIGBwYXR0ZXJuYCBtYXRjaGVzIGBzdHJgLCB3cmFwIGVhY2ggbWF0Y2hpbmcgY2hhcmFjdGVyXG4vLyBpbiBgb3B0cy5wcmVgIGFuZCBgb3B0cy5wb3N0YC4gSWYgbm8gbWF0Y2gsIHJldHVybiBudWxsXG5mdXp6eS5tYXRjaCA9IGZ1bmN0aW9uKHBhdHRlcm4sIHN0ciwgb3B0cykge1xuICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgdmFyIHBhdHRlcm5JZHggPSAwXG4gICAgLCByZXN1bHQgPSBbXVxuICAgICwgbGVuID0gc3RyLmxlbmd0aFxuICAgICwgdG90YWxTY29yZSA9IDBcbiAgICAsIGN1cnJTY29yZSA9IDBcbiAgICAvLyBwcmVmaXhcbiAgICAsIHByZSA9IG9wdHMucHJlIHx8ICcnXG4gICAgLy8gc3VmZml4XG4gICAgLCBwb3N0ID0gb3B0cy5wb3N0IHx8ICcnXG4gICAgLy8gU3RyaW5nIHRvIGNvbXBhcmUgYWdhaW5zdC4gVGhpcyBtaWdodCBiZSBhIGxvd2VyY2FzZSB2ZXJzaW9uIG9mIHRoZVxuICAgIC8vIHJhdyBzdHJpbmdcbiAgICAsIGNvbXBhcmVTdHJpbmcgPSAgb3B0cy5jYXNlU2Vuc2l0aXZlICYmIHN0ciB8fCBzdHIudG9Mb3dlckNhc2UoKVxuICAgICwgY2g7XG5cbiAgcGF0dGVybiA9IG9wdHMuY2FzZVNlbnNpdGl2ZSAmJiBwYXR0ZXJuIHx8IHBhdHRlcm4udG9Mb3dlckNhc2UoKTtcblxuICAvLyBGb3IgZWFjaCBjaGFyYWN0ZXIgaW4gdGhlIHN0cmluZywgZWl0aGVyIGFkZCBpdCB0byB0aGUgcmVzdWx0XG4gIC8vIG9yIHdyYXAgaW4gdGVtcGxhdGUgaWYgaXQncyB0aGUgbmV4dCBzdHJpbmcgaW4gdGhlIHBhdHRlcm5cbiAgZm9yKHZhciBpZHggPSAwOyBpZHggPCBsZW47IGlkeCsrKSB7XG4gICAgY2ggPSBzdHJbaWR4XTtcbiAgICBpZihjb21wYXJlU3RyaW5nW2lkeF0gPT09IHBhdHRlcm5bcGF0dGVybklkeF0pIHtcbiAgICAgIGNoID0gcHJlICsgY2ggKyBwb3N0O1xuICAgICAgcGF0dGVybklkeCArPSAxO1xuXG4gICAgICAvLyBjb25zZWN1dGl2ZSBjaGFyYWN0ZXJzIHNob3VsZCBpbmNyZWFzZSB0aGUgc2NvcmUgbW9yZSB0aGFuIGxpbmVhcmx5XG4gICAgICBjdXJyU2NvcmUgKz0gMSArIGN1cnJTY29yZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VyclNjb3JlID0gMDtcbiAgICB9XG4gICAgdG90YWxTY29yZSArPSBjdXJyU2NvcmU7XG4gICAgcmVzdWx0W3Jlc3VsdC5sZW5ndGhdID0gY2g7XG4gIH1cblxuICAvLyByZXR1cm4gcmVuZGVyZWQgc3RyaW5nIGlmIHdlIGhhdmUgYSBtYXRjaCBmb3IgZXZlcnkgY2hhclxuICBpZihwYXR0ZXJuSWR4ID09PSBwYXR0ZXJuLmxlbmd0aCkge1xuICAgIC8vIGlmIHRoZSBzdHJpbmcgaXMgYW4gZXhhY3QgbWF0Y2ggd2l0aCBwYXR0ZXJuLCB0b3RhbFNjb3JlIHNob3VsZCBiZSBtYXhlZFxuICAgIHRvdGFsU2NvcmUgPSAoY29tcGFyZVN0cmluZyA9PT0gcGF0dGVybikgPyBJbmZpbml0eSA6IHRvdGFsU2NvcmU7XG4gICAgcmV0dXJuIHtyZW5kZXJlZDogcmVzdWx0LmpvaW4oJycpLCBzY29yZTogdG90YWxTY29yZX07XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8vIFRoZSBub3JtYWwgZW50cnkgcG9pbnQuIEZpbHRlcnMgYGFycmAgZm9yIG1hdGNoZXMgYWdhaW5zdCBgcGF0dGVybmAuXG4vLyBJdCByZXR1cm5zIGFuIGFycmF5IHdpdGggbWF0Y2hpbmcgdmFsdWVzIG9mIHRoZSB0eXBlOlxuLy9cbi8vICAgICBbe1xuLy8gICAgICAgICBzdHJpbmc6ICAgJzxiPmxhaCcgLy8gVGhlIHJlbmRlcmVkIHN0cmluZ1xuLy8gICAgICAgLCBpbmRleDogICAgMiAgICAgICAgLy8gVGhlIGluZGV4IG9mIHRoZSBlbGVtZW50IGluIGBhcnJgXG4vLyAgICAgICAsIG9yaWdpbmFsOiAnYmxhaCcgICAvLyBUaGUgb3JpZ2luYWwgZWxlbWVudCBpbiBgYXJyYFxuLy8gICAgIH1dXG4vL1xuLy8gYG9wdHNgIGlzIGFuIG9wdGlvbmFsIGFyZ3VtZW50IGJhZy4gRGV0YWlsczpcbi8vXG4vLyAgICBvcHRzID0ge1xuLy8gICAgICAgIC8vIHN0cmluZyB0byBwdXQgYmVmb3JlIGEgbWF0Y2hpbmcgY2hhcmFjdGVyXG4vLyAgICAgICAgcHJlOiAgICAgJzxiPidcbi8vXG4vLyAgICAgICAgLy8gc3RyaW5nIHRvIHB1dCBhZnRlciBtYXRjaGluZyBjaGFyYWN0ZXJcbi8vICAgICAgLCBwb3N0OiAgICAnPC9iPidcbi8vXG4vLyAgICAgICAgLy8gT3B0aW9uYWwgZnVuY3Rpb24uIElucHV0IGlzIGFuIGVudHJ5IGluIHRoZSBnaXZlbiBhcnJgLFxuLy8gICAgICAgIC8vIG91dHB1dCBzaG91bGQgYmUgdGhlIHN0cmluZyB0byB0ZXN0IGBwYXR0ZXJuYCBhZ2FpbnN0LlxuLy8gICAgICAgIC8vIEluIHRoaXMgZXhhbXBsZSwgaWYgYGFyciA9IFt7Y3J5aW5nOiAna29hbGEnfV1gIHdlIHdvdWxkIHJldHVyblxuLy8gICAgICAgIC8vICdrb2FsYScuXG4vLyAgICAgICwgZXh0cmFjdDogZnVuY3Rpb24oYXJnKSB7IHJldHVybiBhcmcuY3J5aW5nOyB9XG4vLyAgICB9XG5mdXp6eS5maWx0ZXIgPSBmdW5jdGlvbihwYXR0ZXJuLCBhcnIsIG9wdHMpIHtcbiAgaWYoIWFyciB8fCBhcnIubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGlmICh0eXBlb2YgcGF0dGVybiAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gYXJyO1xuICB9XG4gIG9wdHMgPSBvcHRzIHx8IHt9O1xuICByZXR1cm4gYXJyXG4gICAgLnJlZHVjZShmdW5jdGlvbihwcmV2LCBlbGVtZW50LCBpZHgsIGFycikge1xuICAgICAgdmFyIHN0ciA9IGVsZW1lbnQ7XG4gICAgICBpZihvcHRzLmV4dHJhY3QpIHtcbiAgICAgICAgc3RyID0gb3B0cy5leHRyYWN0KGVsZW1lbnQpO1xuICAgICAgfVxuICAgICAgdmFyIHJlbmRlcmVkID0gZnV6enkubWF0Y2gocGF0dGVybiwgc3RyLCBvcHRzKTtcbiAgICAgIGlmKHJlbmRlcmVkICE9IG51bGwpIHtcbiAgICAgICAgcHJldltwcmV2Lmxlbmd0aF0gPSB7XG4gICAgICAgICAgICBzdHJpbmc6IHJlbmRlcmVkLnJlbmRlcmVkXG4gICAgICAgICAgLCBzY29yZTogcmVuZGVyZWQuc2NvcmVcbiAgICAgICAgICAsIGluZGV4OiBpZHhcbiAgICAgICAgICAsIG9yaWdpbmFsOiBlbGVtZW50XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJldjtcbiAgICB9LCBbXSlcblxuICAgIC8vIFNvcnQgYnkgc2NvcmUuIEJyb3dzZXJzIGFyZSBpbmNvbnNpc3RlbnQgd3J0IHN0YWJsZS91bnN0YWJsZVxuICAgIC8vIHNvcnRpbmcsIHNvIGZvcmNlIHN0YWJsZSBieSB1c2luZyB0aGUgaW5kZXggaW4gdGhlIGNhc2Ugb2YgdGllLlxuICAgIC8vIFNlZSBodHRwOi8vb2ZiLm5ldC9+c2V0aG1sL2lzLXNvcnQtc3RhYmxlLmh0bWxcbiAgICAuc29ydChmdW5jdGlvbihhLGIpIHtcbiAgICAgIHZhciBjb21wYXJlID0gYi5zY29yZSAtIGEuc2NvcmU7XG4gICAgICBpZihjb21wYXJlKSByZXR1cm4gY29tcGFyZTtcbiAgICAgIHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcbiAgICB9KTtcbn07XG5cblxufSgpKTtcblxuIiwiLyogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmUuIEl0IGNvbWVzIHdpdGhvdXQgYW55IHdhcnJhbnR5LCB0b1xuICAgICAqIHRoZSBleHRlbnQgcGVybWl0dGVkIGJ5IGFwcGxpY2FibGUgbGF3LiBZb3UgY2FuIHJlZGlzdHJpYnV0ZSBpdFxuICAgICAqIGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBEbyBXaGF0IFRoZSBGdWNrIFlvdSBXYW50XG4gICAgICogVG8gUHVibGljIExpY2Vuc2UsIFZlcnNpb24gMiwgYXMgcHVibGlzaGVkIGJ5IFNhbSBIb2NldmFyLiBTZWVcbiAgICAgKiBodHRwOi8vd3d3Lnd0ZnBsLm5ldC8gZm9yIG1vcmUgZGV0YWlscy4gKi9cbid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gbGVmdFBhZDtcblxudmFyIGNhY2hlID0gW1xuICAnJyxcbiAgJyAnLFxuICAnICAnLFxuICAnICAgJyxcbiAgJyAgICAnLFxuICAnICAgICAnLFxuICAnICAgICAgJyxcbiAgJyAgICAgICAnLFxuICAnICAgICAgICAnLFxuICAnICAgICAgICAgJ1xuXTtcblxuZnVuY3Rpb24gbGVmdFBhZCAoc3RyLCBsZW4sIGNoKSB7XG4gIC8vIGNvbnZlcnQgYHN0cmAgdG8gYHN0cmluZ2BcbiAgc3RyID0gc3RyICsgJyc7XG4gIC8vIGBsZW5gIGlzIHRoZSBgcGFkYCdzIGxlbmd0aCBub3dcbiAgbGVuID0gbGVuIC0gc3RyLmxlbmd0aDtcbiAgLy8gZG9lc24ndCBuZWVkIHRvIHBhZFxuICBpZiAobGVuIDw9IDApIHJldHVybiBzdHI7XG4gIC8vIGBjaGAgZGVmYXVsdHMgdG8gYCcgJ2BcbiAgaWYgKCFjaCAmJiBjaCAhPT0gMCkgY2ggPSAnICc7XG4gIC8vIGNvbnZlcnQgYGNoYCB0byBgc3RyaW5nYFxuICBjaCA9IGNoICsgJyc7XG4gIC8vIGNhY2hlIGNvbW1vbiB1c2UgY2FzZXNcbiAgaWYgKGNoID09PSAnICcgJiYgbGVuIDwgMTApIHJldHVybiBjYWNoZVtsZW5dICsgc3RyO1xuICAvLyBgcGFkYCBzdGFydHMgd2l0aCBhbiBlbXB0eSBzdHJpbmdcbiAgdmFyIHBhZCA9ICcnO1xuICAvLyBsb29wXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgLy8gYWRkIGBjaGAgdG8gYHBhZGAgaWYgYGxlbmAgaXMgb2RkXG4gICAgaWYgKGxlbiAmIDEpIHBhZCArPSBjaDtcbiAgICAvLyBkaXZpZGUgYGxlbmAgYnkgMiwgZGl0Y2ggdGhlIHJlbWFpbmRlclxuICAgIGxlbiA+Pj0gMTtcbiAgICAvLyBcImRvdWJsZVwiIHRoZSBgY2hgIHNvIHRoaXMgb3BlcmF0aW9uIGNvdW50IGdyb3dzIGxvZ2FyaXRobWljYWxseSBvbiBgbGVuYFxuICAgIC8vIGVhY2ggdGltZSBgY2hgIGlzIFwiZG91YmxlZFwiLCB0aGUgYGxlbmAgd291bGQgbmVlZCB0byBiZSBcImRvdWJsZWRcIiB0b29cbiAgICAvLyBzaW1pbGFyIHRvIGZpbmRpbmcgYSB2YWx1ZSBpbiBiaW5hcnkgc2VhcmNoIHRyZWUsIGhlbmNlIE8obG9nKG4pKVxuICAgIGlmIChsZW4pIGNoICs9IGNoO1xuICAgIC8vIGBsZW5gIGlzIDAsIGV4aXQgdGhlIGxvb3BcbiAgICBlbHNlIGJyZWFrO1xuICB9XG4gIC8vIHBhZCBgc3RyYCFcbiAgcmV0dXJuIHBhZCArIHN0cjtcbn1cbiIsIi8qXG4gKiBzbW9vdGhzY3JvbGwgcG9seWZpbGwgLSB2MC4zLjRcbiAqIGh0dHBzOi8vaWFtZHVzdGFuLmdpdGh1Yi5pby9zbW9vdGhzY3JvbGxcbiAqIDIwMTYgKGMpIER1c3RhbiBLYXN0ZW4sIEplcmVtaWFzIE1lbmljaGVsbGkgLSBNSVQgTGljZW5zZVxuICovXG5cbihmdW5jdGlvbih3LCBkLCB1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qXG4gICAqIGFsaWFzZXNcbiAgICogdzogd2luZG93IGdsb2JhbCBvYmplY3RcbiAgICogZDogZG9jdW1lbnRcbiAgICogdW5kZWZpbmVkOiB1bmRlZmluZWRcbiAgICovXG5cbiAgLy8gcG9seWZpbGxcbiAgZnVuY3Rpb24gcG9seWZpbGwoKSB7XG4gICAgLy8gcmV0dXJuIHdoZW4gc2Nyb2xsQmVoYXZpb3IgaW50ZXJmYWNlIGlzIHN1cHBvcnRlZFxuICAgIGlmICgnc2Nyb2xsQmVoYXZpb3InIGluIGQuZG9jdW1lbnRFbGVtZW50LnN0eWxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBnbG9iYWxzXG4gICAgICovXG4gICAgdmFyIEVsZW1lbnQgPSB3LkhUTUxFbGVtZW50IHx8IHcuRWxlbWVudDtcbiAgICB2YXIgU0NST0xMX1RJTUUgPSA0Njg7XG5cbiAgICAvKlxuICAgICAqIG9iamVjdCBnYXRoZXJpbmcgb3JpZ2luYWwgc2Nyb2xsIG1ldGhvZHNcbiAgICAgKi9cbiAgICB2YXIgb3JpZ2luYWwgPSB7XG4gICAgICBzY3JvbGw6IHcuc2Nyb2xsIHx8IHcuc2Nyb2xsVG8sXG4gICAgICBzY3JvbGxCeTogdy5zY3JvbGxCeSxcbiAgICAgIHNjcm9sbEludG9WaWV3OiBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxJbnRvVmlld1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIGRlZmluZSB0aW1pbmcgbWV0aG9kXG4gICAgICovXG4gICAgdmFyIG5vdyA9IHcucGVyZm9ybWFuY2UgJiYgdy5wZXJmb3JtYW5jZS5ub3dcbiAgICAgID8gdy5wZXJmb3JtYW5jZS5ub3cuYmluZCh3LnBlcmZvcm1hbmNlKSA6IERhdGUubm93O1xuXG4gICAgLyoqXG4gICAgICogY2hhbmdlcyBzY3JvbGwgcG9zaXRpb24gaW5zaWRlIGFuIGVsZW1lbnRcbiAgICAgKiBAbWV0aG9kIHNjcm9sbEVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gICAgICovXG4gICAgZnVuY3Rpb24gc2Nyb2xsRWxlbWVudCh4LCB5KSB7XG4gICAgICB0aGlzLnNjcm9sbExlZnQgPSB4O1xuICAgICAgdGhpcy5zY3JvbGxUb3AgPSB5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgcmVzdWx0IG9mIGFwcGx5aW5nIGVhc2UgbWF0aCBmdW5jdGlvbiB0byBhIG51bWJlclxuICAgICAqIEBtZXRob2QgZWFzZVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBrXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBlYXNlKGspIHtcbiAgICAgIHJldHVybiAwLjUgKiAoMSAtIE1hdGguY29zKE1hdGguUEkgKiBrKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaW5kaWNhdGVzIGlmIGEgc21vb3RoIGJlaGF2aW9yIHNob3VsZCBiZSBhcHBsaWVkXG4gICAgICogQG1ldGhvZCBzaG91bGRCYWlsT3V0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ8T2JqZWN0fSB4XG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAgICovXG4gICAgZnVuY3Rpb24gc2hvdWxkQmFpbE91dCh4KSB7XG4gICAgICBpZiAodHlwZW9mIHggIT09ICdvYmplY3QnXG4gICAgICAgICAgICB8fCB4ID09PSBudWxsXG4gICAgICAgICAgICB8fCB4LmJlaGF2aW9yID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgIHx8IHguYmVoYXZpb3IgPT09ICdhdXRvJ1xuICAgICAgICAgICAgfHwgeC5iZWhhdmlvciA9PT0gJ2luc3RhbnQnKSB7XG4gICAgICAgIC8vIGZpcnN0IGFyZyBub3QgYW4gb2JqZWN0L251bGxcbiAgICAgICAgLy8gb3IgYmVoYXZpb3IgaXMgYXV0bywgaW5zdGFudCBvciB1bmRlZmluZWRcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgeCA9PT0gJ29iamVjdCdcbiAgICAgICAgICAgICYmIHguYmVoYXZpb3IgPT09ICdzbW9vdGgnKSB7XG4gICAgICAgIC8vIGZpcnN0IGFyZ3VtZW50IGlzIGFuIG9iamVjdCBhbmQgYmVoYXZpb3IgaXMgc21vb3RoXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gdGhyb3cgZXJyb3Igd2hlbiBiZWhhdmlvciBpcyBub3Qgc3VwcG9ydGVkXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdiZWhhdmlvciBub3QgdmFsaWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBmaW5kcyBzY3JvbGxhYmxlIHBhcmVudCBvZiBhbiBlbGVtZW50XG4gICAgICogQG1ldGhvZCBmaW5kU2Nyb2xsYWJsZVBhcmVudFxuICAgICAqIEBwYXJhbSB7Tm9kZX0gZWxcbiAgICAgKiBAcmV0dXJucyB7Tm9kZX0gZWxcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmaW5kU2Nyb2xsYWJsZVBhcmVudChlbCkge1xuICAgICAgdmFyIGlzQm9keTtcbiAgICAgIHZhciBoYXNTY3JvbGxhYmxlU3BhY2U7XG4gICAgICB2YXIgaGFzVmlzaWJsZU92ZXJmbG93O1xuXG4gICAgICBkbyB7XG4gICAgICAgIGVsID0gZWwucGFyZW50Tm9kZTtcblxuICAgICAgICAvLyBzZXQgY29uZGl0aW9uIHZhcmlhYmxlc1xuICAgICAgICBpc0JvZHkgPSBlbCA9PT0gZC5ib2R5O1xuICAgICAgICBoYXNTY3JvbGxhYmxlU3BhY2UgPVxuICAgICAgICAgIGVsLmNsaWVudEhlaWdodCA8IGVsLnNjcm9sbEhlaWdodCB8fFxuICAgICAgICAgIGVsLmNsaWVudFdpZHRoIDwgZWwuc2Nyb2xsV2lkdGg7XG4gICAgICAgIGhhc1Zpc2libGVPdmVyZmxvdyA9XG4gICAgICAgICAgdy5nZXRDb21wdXRlZFN0eWxlKGVsLCBudWxsKS5vdmVyZmxvdyA9PT0gJ3Zpc2libGUnO1xuICAgICAgfSB3aGlsZSAoIWlzQm9keSAmJiAhKGhhc1Njcm9sbGFibGVTcGFjZSAmJiAhaGFzVmlzaWJsZU92ZXJmbG93KSk7XG5cbiAgICAgIGlzQm9keSA9IGhhc1Njcm9sbGFibGVTcGFjZSA9IGhhc1Zpc2libGVPdmVyZmxvdyA9IG51bGw7XG5cbiAgICAgIHJldHVybiBlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzZWxmIGludm9rZWQgZnVuY3Rpb24gdGhhdCwgZ2l2ZW4gYSBjb250ZXh0LCBzdGVwcyB0aHJvdWdoIHNjcm9sbGluZ1xuICAgICAqIEBtZXRob2Qgc3RlcFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gICAgICovXG4gICAgZnVuY3Rpb24gc3RlcChjb250ZXh0KSB7XG4gICAgICAvLyBjYWxsIG1ldGhvZCBhZ2FpbiBvbiBuZXh0IGF2YWlsYWJsZSBmcmFtZVxuICAgICAgY29udGV4dC5mcmFtZSA9IHcucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0ZXAuYmluZCh3LCBjb250ZXh0KSk7XG5cbiAgICAgIHZhciB0aW1lID0gbm93KCk7XG4gICAgICB2YXIgdmFsdWU7XG4gICAgICB2YXIgY3VycmVudFg7XG4gICAgICB2YXIgY3VycmVudFk7XG4gICAgICB2YXIgZWxhcHNlZCA9ICh0aW1lIC0gY29udGV4dC5zdGFydFRpbWUpIC8gU0NST0xMX1RJTUU7XG5cbiAgICAgIC8vIGF2b2lkIGVsYXBzZWQgdGltZXMgaGlnaGVyIHRoYW4gb25lXG4gICAgICBlbGFwc2VkID0gZWxhcHNlZCA+IDEgPyAxIDogZWxhcHNlZDtcblxuICAgICAgLy8gYXBwbHkgZWFzaW5nIHRvIGVsYXBzZWQgdGltZVxuICAgICAgdmFsdWUgPSBlYXNlKGVsYXBzZWQpO1xuXG4gICAgICBjdXJyZW50WCA9IGNvbnRleHQuc3RhcnRYICsgKGNvbnRleHQueCAtIGNvbnRleHQuc3RhcnRYKSAqIHZhbHVlO1xuICAgICAgY3VycmVudFkgPSBjb250ZXh0LnN0YXJ0WSArIChjb250ZXh0LnkgLSBjb250ZXh0LnN0YXJ0WSkgKiB2YWx1ZTtcblxuICAgICAgY29udGV4dC5tZXRob2QuY2FsbChjb250ZXh0LnNjcm9sbGFibGUsIGN1cnJlbnRYLCBjdXJyZW50WSk7XG5cbiAgICAgIC8vIHJldHVybiB3aGVuIGVuZCBwb2ludHMgaGF2ZSBiZWVuIHJlYWNoZWRcbiAgICAgIGlmIChjdXJyZW50WCA9PT0gY29udGV4dC54ICYmIGN1cnJlbnRZID09PSBjb250ZXh0LnkpIHtcbiAgICAgICAgdy5jYW5jZWxBbmltYXRpb25GcmFtZShjb250ZXh0LmZyYW1lKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNjcm9sbHMgd2luZG93IHdpdGggYSBzbW9vdGggYmVoYXZpb3JcbiAgICAgKiBAbWV0aG9kIHNtb290aFNjcm9sbFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fE5vZGV9IGVsXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNtb290aFNjcm9sbChlbCwgeCwgeSkge1xuICAgICAgdmFyIHNjcm9sbGFibGU7XG4gICAgICB2YXIgc3RhcnRYO1xuICAgICAgdmFyIHN0YXJ0WTtcbiAgICAgIHZhciBtZXRob2Q7XG4gICAgICB2YXIgc3RhcnRUaW1lID0gbm93KCk7XG4gICAgICB2YXIgZnJhbWU7XG5cbiAgICAgIC8vIGRlZmluZSBzY3JvbGwgY29udGV4dFxuICAgICAgaWYgKGVsID09PSBkLmJvZHkpIHtcbiAgICAgICAgc2Nyb2xsYWJsZSA9IHc7XG4gICAgICAgIHN0YXJ0WCA9IHcuc2Nyb2xsWCB8fCB3LnBhZ2VYT2Zmc2V0O1xuICAgICAgICBzdGFydFkgPSB3LnNjcm9sbFkgfHwgdy5wYWdlWU9mZnNldDtcbiAgICAgICAgbWV0aG9kID0gb3JpZ2luYWwuc2Nyb2xsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2Nyb2xsYWJsZSA9IGVsO1xuICAgICAgICBzdGFydFggPSBlbC5zY3JvbGxMZWZ0O1xuICAgICAgICBzdGFydFkgPSBlbC5zY3JvbGxUb3A7XG4gICAgICAgIG1ldGhvZCA9IHNjcm9sbEVsZW1lbnQ7XG4gICAgICB9XG5cbiAgICAgIC8vIGNhbmNlbCBmcmFtZSB3aGVuIGEgc2Nyb2xsIGV2ZW50J3MgaGFwcGVuaW5nXG4gICAgICBpZiAoZnJhbWUpIHtcbiAgICAgICAgdy5jYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHNjcm9sbCBsb29waW5nIG92ZXIgYSBmcmFtZVxuICAgICAgc3RlcCh7XG4gICAgICAgIHNjcm9sbGFibGU6IHNjcm9sbGFibGUsXG4gICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICBzdGFydFRpbWU6IHN0YXJ0VGltZSxcbiAgICAgICAgc3RhcnRYOiBzdGFydFgsXG4gICAgICAgIHN0YXJ0WTogc3RhcnRZLFxuICAgICAgICB4OiB4LFxuICAgICAgICB5OiB5LFxuICAgICAgICBmcmFtZTogZnJhbWVcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogT1JJR0lOQUwgTUVUSE9EUyBPVkVSUklERVNcbiAgICAgKi9cblxuICAgIC8vIHcuc2Nyb2xsIGFuZCB3LnNjcm9sbFRvXG4gICAgdy5zY3JvbGwgPSB3LnNjcm9sbFRvID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCBzbW9vdGggYmVoYXZpb3IgaWYgbm90IHJlcXVpcmVkXG4gICAgICBpZiAoc2hvdWxkQmFpbE91dChhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIG9yaWdpbmFsLnNjcm9sbC5jYWxsKFxuICAgICAgICAgIHcsXG4gICAgICAgICAgYXJndW1lbnRzWzBdLmxlZnQgfHwgYXJndW1lbnRzWzBdLFxuICAgICAgICAgIGFyZ3VtZW50c1swXS50b3AgfHwgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgIHcsXG4gICAgICAgIGQuYm9keSxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0ubGVmdCxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0udG9wXG4gICAgICApO1xuICAgIH07XG5cbiAgICAvLyB3LnNjcm9sbEJ5XG4gICAgdy5zY3JvbGxCeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYXZvaWQgc21vb3RoIGJlaGF2aW9yIGlmIG5vdCByZXF1aXJlZFxuICAgICAgaWYgKHNob3VsZEJhaWxPdXQoYXJndW1lbnRzWzBdKSkge1xuICAgICAgICBvcmlnaW5hbC5zY3JvbGxCeS5jYWxsKFxuICAgICAgICAgIHcsXG4gICAgICAgICAgYXJndW1lbnRzWzBdLmxlZnQgfHwgYXJndW1lbnRzWzBdLFxuICAgICAgICAgIGFyZ3VtZW50c1swXS50b3AgfHwgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgIHcsXG4gICAgICAgIGQuYm9keSxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0ubGVmdCArICh3LnNjcm9sbFggfHwgdy5wYWdlWE9mZnNldCksXG4gICAgICAgIH5+YXJndW1lbnRzWzBdLnRvcCArICh3LnNjcm9sbFkgfHwgdy5wYWdlWU9mZnNldClcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8vIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3XG4gICAgRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXcgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGF2b2lkIHNtb290aCBiZWhhdmlvciBpZiBub3QgcmVxdWlyZWRcbiAgICAgIGlmIChzaG91bGRCYWlsT3V0KGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgb3JpZ2luYWwuc2Nyb2xsSW50b1ZpZXcuY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0gfHwgdHJ1ZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgdmFyIHNjcm9sbGFibGVQYXJlbnQgPSBmaW5kU2Nyb2xsYWJsZVBhcmVudCh0aGlzKTtcbiAgICAgIHZhciBwYXJlbnRSZWN0cyA9IHNjcm9sbGFibGVQYXJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB2YXIgY2xpZW50UmVjdHMgPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICBpZiAoc2Nyb2xsYWJsZVBhcmVudCAhPT0gZC5ib2R5KSB7XG4gICAgICAgIC8vIHJldmVhbCBlbGVtZW50IGluc2lkZSBwYXJlbnRcbiAgICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgICAgdGhpcyxcbiAgICAgICAgICBzY3JvbGxhYmxlUGFyZW50LFxuICAgICAgICAgIHNjcm9sbGFibGVQYXJlbnQuc2Nyb2xsTGVmdCArIGNsaWVudFJlY3RzLmxlZnQgLSBwYXJlbnRSZWN0cy5sZWZ0LFxuICAgICAgICAgIHNjcm9sbGFibGVQYXJlbnQuc2Nyb2xsVG9wICsgY2xpZW50UmVjdHMudG9wIC0gcGFyZW50UmVjdHMudG9wXG4gICAgICAgICk7XG4gICAgICAgIC8vIHJldmVhbCBwYXJlbnQgaW4gdmlld3BvcnRcbiAgICAgICAgdy5zY3JvbGxCeSh7XG4gICAgICAgICAgbGVmdDogcGFyZW50UmVjdHMubGVmdCxcbiAgICAgICAgICB0b3A6IHBhcmVudFJlY3RzLnRvcCxcbiAgICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCdcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZXZlYWwgZWxlbWVudCBpbiB2aWV3cG9ydFxuICAgICAgICB3LnNjcm9sbEJ5KHtcbiAgICAgICAgICBsZWZ0OiBjbGllbnRSZWN0cy5sZWZ0LFxuICAgICAgICAgIHRvcDogY2xpZW50UmVjdHMudG9wLFxuICAgICAgICAgIGJlaGF2aW9yOiAnc21vb3RoJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIGNvbW1vbmpzXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7IHBvbHlmaWxsOiBwb2x5ZmlsbCB9O1xuICB9IGVsc2Uge1xuICAgIC8vIGdsb2JhbFxuICAgIHBvbHlmaWxsKCk7XG4gIH1cbn0pKHdpbmRvdywgZG9jdW1lbnQpO1xuIiwiLyogZ2xvYmFsIGdhICovXG5cbmNvbnN0IHNlbGYgPSB7fVxuXG5zZWxmLnNlbmQgPSB7fVxuXG5zZWxmLnNlbmQuc2VhcmNoID0gZnVuY3Rpb24gKHNlbGVjdGVkVXNlciwgZmF2b3JpdGUpIHtcbiAgY29uc3QgaGl0VHlwZSA9ICdldmVudCdcblxuICBjb25zdCBldmVudENhdGVnb3J5ID0gZmF2b3JpdGUgPyAnc2VhcmNoIGZhdicgOiAnc2VhcmNoJ1xuXG4gIGxldCBldmVudEFjdGlvblxuICBzd2l0Y2ggKHNlbGVjdGVkVXNlci50eXBlKSB7XG4gICAgY2FzZSAnYyc6XG4gICAgICBldmVudEFjdGlvbiA9ICdDbGFzcydcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndCc6XG4gICAgICBldmVudEFjdGlvbiA9ICdUZWFjaGVyJ1xuICAgICAgYnJlYWtcbiAgICBjYXNlICdyJzpcbiAgICAgIGV2ZW50QWN0aW9uID0gJ1Jvb20nXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3MnOlxuICAgICAgZXZlbnRBY3Rpb24gPSAnU3R1ZGVudCdcbiAgICAgIGJyZWFrXG4gIH1cblxuICBjb25zdCBldmVudExhYmVsID0gc2VsZWN0ZWRVc2VyLnZhbHVlXG5cbiAgZ2EoZnVuY3Rpb24gKCkge1xuICAgIGdhKCdzZW5kJywgeyBoaXRUeXBlLCBldmVudENhdGVnb3J5LCBldmVudEFjdGlvbiwgZXZlbnRMYWJlbCB9KVxuICB9KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsImNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5cbmNvbnN0IHNlbGYgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fdXNlcnMgPSBbXVxuc2VsZi5fc2VsZWN0ZWRVc2VySW5kZXggPSAtMVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgc2VhcmNoOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2VhcmNoJyksXG4gIGlucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJyksXG4gIGF1dG9jb21wbGV0ZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZScpXG59XG5cbnNlbGYuZ2V0U2VsZWN0ZWRVc2VyID0gZnVuY3Rpb24gKCkge1xuICBpZiAoc2VsZi5nZXRJdGVtcygpID09PSBbXSkgcmV0dXJuXG5cbiAgaWYgKHNlbGYuZ2V0U2VsZWN0ZWRVc2VySW5kZXgoKSA9PT0gLTEpIHtcbiAgICByZXR1cm4gc2VsZi5nZXRJdGVtcygpWzBdXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHNlbGYuZ2V0SXRlbXMoKVtzZWxmLmdldFNlbGVjdGVkVXNlckluZGV4KCldXG4gIH1cbn1cblxuc2VsZi5nZXRTZWxlY3RlZFVzZXJJbmRleCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHNlbGYuX3NlbGVjdGVkVXNlckluZGV4XG59XG5cbnNlbGYuZ2V0SXRlbXMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBzZWxmLl91c2Vyc1xufVxuXG5zZWxmLnJlbW92ZUFsbEl0ZW1zID0gZnVuY3Rpb24gKCkge1xuICB3aGlsZSAoc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmZpcnN0Q2hpbGQpIHtcbiAgICBzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUucmVtb3ZlQ2hpbGQoc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmZpcnN0Q2hpbGQpXG4gIH1cbiAgc2VsZi5fdXNlcnMgPSBbXVxuICBzZWxmLl9zZWxlY3RlZFVzZXJJbmRleCA9IC0xXG59XG5cbnNlbGYuYWRkSXRlbSA9IGZ1bmN0aW9uICh1c2VyKSB7XG4gIGNvbnN0IGxpc3RJdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKVxuICBsaXN0SXRlbS50ZXh0Q29udGVudCA9IHVzZXIudmFsdWVcbiAgc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmFwcGVuZENoaWxkKGxpc3RJdGVtKVxuICBzZWxmLl91c2Vycy5wdXNoKHVzZXIpXG59XG5cbnNlbGYuX21vdmVTZWxlY3RlZCA9IGZ1bmN0aW9uIChzaGlmdCkge1xuICBpZiAoc2VsZi5fc2VsZWN0ZWRVc2VySW5kZXggKyBzaGlmdCA+PSBzZWxmLmdldEl0ZW1zKCkubGVuZ3RoKSB7XG4gICAgc2VsZi5fc2VsZWN0ZWRVc2VySW5kZXggPSAtMVxuICB9IGVsc2UgaWYgKHNlbGYuX3NlbGVjdGVkVXNlckluZGV4ICsgc2hpZnQgPCAtMSkge1xuICAgIHNlbGYuX3NlbGVjdGVkVXNlckluZGV4ID0gc2VsZi5nZXRJdGVtcygpLmxlbmd0aCAtIDFcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9zZWxlY3RlZFVzZXJJbmRleCArPSBzaGlmdFxuICB9XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxmLmdldEl0ZW1zKCkubGVuZ3RoOyBpKyspIHtcbiAgICBzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuY2hpbGRyZW5baV0uY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKVxuICB9XG4gIGlmIChzZWxmLl9zZWxlY3RlZFVzZXJJbmRleCA+PSAwKSB7XG4gICAgc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlXG4gICAgICAgIC5jaGlsZHJlbltzZWxmLl9zZWxlY3RlZFVzZXJJbmRleF0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKVxuICB9XG59XG5cbnNlbGYuX2hhbmRsZUl0ZW1DbGljayA9IGZ1bmN0aW9uIChldmVudCkge1xuICBpZiAoIXNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5jb250YWlucyhldmVudC50YXJnZXQpKSByZXR1cm5cbiAgY29uc3QgdXNlckluZGV4ID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2ZcbiAgICAgIC5jYWxsKHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5jaGlsZHJlbiwgZXZlbnQudGFyZ2V0KVxuICBzZWxmLl9zZWxlY3RlZFVzZXJJbmRleCA9IHVzZXJJbmRleFxuICBzZWxmLmVtaXQoJ3NlbGVjdCcsIHNlbGYuZ2V0U2VsZWN0ZWRVc2VyKCkpXG59XG5cbnNlbGYuX2hhbmRsZUtleWRvd24gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgaWYgKGV2ZW50LmtleSA9PT0gJ0Fycm93RG93bicgfHwgZXZlbnQua2V5ID09PSAnQXJyb3dVcCcpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaWYgKGV2ZW50LmtleSA9PT0gJ0Fycm93RG93bicpIHtcbiAgICAgIHNlbGYuX21vdmVTZWxlY3RlZCgxKVxuICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09PSAnQXJyb3dVcCcpIHtcbiAgICAgIHNlbGYuX21vdmVTZWxlY3RlZCgtMSlcbiAgICB9XG4gIH1cbn1cblxuc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2VsZi5faGFuZGxlSXRlbUNsaWNrKVxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHNlbGYuX2hhbmRsZUtleWRvd24pXG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwiY29uc3Qgc2VsZiA9IHt9XG5cbnNlbGYuaXNJRSA9IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignTVNJRScpICE9PSAtMSB8fFxuICAgICAgICAgICAgbmF2aWdhdG9yLmFwcFZlcnNpb24uaW5kZXhPZignVHJpZGVudC8nKSA+IDBcblxuaWYgKHNlbGYuaXNJRSkge1xuICBzZWxmLmlucHV0RXZlbnQgPSAndGV4dGlucHV0J1xufSBlbHNlIHtcbiAgc2VsZi5pbnB1dEV2ZW50ID0gJ2lucHV0J1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsIi8qIGdsb2JhbCBVU0VSUyAqL1xuXG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuXG5jb25zdCBzZWxmID0gbmV3IEV2ZW50RW1pdHRlcigpXG5cbnNlbGYuX25vZGVzID0ge1xuICB0b2dnbGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mYXYnKVxufVxuXG5zZWxmLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBsb2NhbFN0b3JhZ2VVc2VyID0gSlNPTi5wYXJzZSh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2ZhdicpKVxuICAgIGlmIChsb2NhbFN0b3JhZ2VVc2VyID09IG51bGwpIHJldHVyblxuXG4gICAgY29uc3QgY29ycmVjdGVkVXNlciA9IFVTRVJTLmZpbHRlcihmdW5jdGlvbiAodXNlcikge1xuICAgICAgcmV0dXJuIHVzZXIudHlwZSA9PT0gbG9jYWxTdG9yYWdlVXNlci50eXBlICYmXG4gICAgICAgICAgICAgdXNlci52YWx1ZSA9PT0gbG9jYWxTdG9yYWdlVXNlci52YWx1ZVxuICAgIH0pWzBdXG4gICAgcmV0dXJuIGNvcnJlY3RlZFVzZXJcbiAgfSBjYXRjaCAoZSkge1xuICAgIHNlbGYuZGVsZXRlKClcbiAgICByZXR1cm5cbiAgfVxufVxuXG5zZWxmLnNldCA9IGZ1bmN0aW9uICh1c2VyKSB7XG4gIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZmF2JywgSlNPTi5zdHJpbmdpZnkodXNlcikpXG4gIHNlbGYuX25vZGVzLmlubmVySFRNTCA9ICcmI3hFODM4Oydcbn1cblxuc2VsZi5kZWxldGUgPSBmdW5jdGlvbiAoKSB7XG4gIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnZmF2Jylcbn1cblxuc2VsZi51cGRhdGVEb20gPSBmdW5jdGlvbiAoaXNGYXZvcml0ZSkge1xuICBpZiAoaXNGYXZvcml0ZSkge1xuICAgIHNlbGYuX25vZGVzLnRvZ2dsZS5pbm5lckhUTUwgPSAnJiN4RTgzODsnXG4gIH0gZWxzZSB7XG4gICAgc2VsZi5fbm9kZXMudG9nZ2xlLmlubmVySFRNTCA9ICcmI3hFODNBJ1xuICB9XG59XG5cbnNlbGYudXBkYXRlID0gZnVuY3Rpb24gKHNlbGVjdGVkVXNlcikge1xuICBjb25zdCBjdXJyZW50VXNlciA9IHNlbGYuZ2V0KClcblxuICBpZiAoY3VycmVudFVzZXIgPT0gbnVsbCB8fCBzZWxlY3RlZFVzZXIgPT0gbnVsbCkge1xuICAgIHNlbGYudXBkYXRlRG9tKGZhbHNlKVxuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3QgaXNFcXVhbCA9IGN1cnJlbnRVc2VyLnR5cGUgPT09IHNlbGVjdGVkVXNlci50eXBlICYmXG4gICAgICAgICAgICAgICAgICBjdXJyZW50VXNlci5pbmRleCA9PT0gc2VsZWN0ZWRVc2VyLmluZGV4XG5cbiAgc2VsZi51cGRhdGVEb20oaXNFcXVhbClcbn1cblxuc2VsZi50b2dnbGUgPSBmdW5jdGlvbiAoc2VsZWN0ZWRVc2VyKSB7XG4gIGNvbnN0IGN1cnJlbnRVc2VyID0gc2VsZi5nZXQoKVxuICBjb25zdCBpc0VxdWFsID0gY3VycmVudFVzZXIgIT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgY3VycmVudFVzZXIudHlwZSA9PT0gc2VsZWN0ZWRVc2VyLnR5cGUgJiZcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRVc2VyLmluZGV4ID09PSBzZWxlY3RlZFVzZXIuaW5kZXhcblxuICBpZiAoaXNFcXVhbCkge1xuICAgIHNlbGYuZGVsZXRlKClcbiAgICBzZWxmLnVwZGF0ZURvbShmYWxzZSlcbiAgfSBlbHNlIHtcbiAgICBzZWxmLnNldChzZWxlY3RlZFVzZXIpXG4gICAgc2VsZi51cGRhdGVEb20odHJ1ZSlcbiAgfVxufVxuXG5zZWxmLl9oYW5kbGVDbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgc2VsZi5lbWl0KCdjbGljaycpXG59XG5cbnNlbGYuX25vZGVzLnRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlbGYuX2hhbmRsZUNsaWNrKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsIi8qIGdsb2JhbCBGTEFHUyAqL1xuXG5jb25zdCBzZWxmID0ge31cblxuc2VsZi5fbm9kZXMgPSB7XG4gIGlucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJyksXG4gIG92ZXJmbG93QnV0dG9uOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjb3ZlcmZsb3ctYnV0dG9uJylcbn1cblxuc2VsZi5fc2hvdWxkQ2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBGTEFHUy5pbmRleE9mKCdOT19GRUFUVVJFX0RFVEVDVCcpID09PSAtMVxufVxuXG5zZWxmLl9yZWRpcmVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnaHR0cDovL3d3dy5tZWV0aW5ncG9pbnRtY28ubmwvUm9vc3RlcnMtQUwvZG9jLydcbn1cblxuc2VsZi5jaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCFzZWxmLl9zaG91bGRDaGVjaygpKSByZXR1cm5cblxuICB3aW5kb3cub25lcnJvciA9IHNlbGYuX3JlZGlyZWN0XG5cbiAgaWYgKHNlbGYuX25vZGVzLmlucHV0LmdldENsaWVudFJlY3RzKClbMF0udG9wICE9PVxuICAgICAgc2VsZi5fbm9kZXMub3ZlcmZsb3dCdXR0b24uZ2V0Q2xpZW50UmVjdHMoKVswXS50b3ApIHtcbiAgICBzZWxmLl9yZWRpcmVjdCgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJjb25zdCBicm93c2VyRml4VG9vbGtpdCA9IHJlcXVpcmUoJy4vYnJvd3NlckZpeFRvb2xraXQnKVxuXG5jb25zdCBzZWxmID0ge31cblxuc2VsZi5fbm9kZXMgPSB7XG4gIGlucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJylcbn1cblxuc2VsZi5pc1Nob3duID0gZmFsc2Vcblxuc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ25vLWlucHV0JylcbiAgc2VsZi5pc1Nob3duID0gdHJ1ZVxufVxuXG5zZWxmLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbm8taW5wdXQnKVxuICBzZWxmLmlzU2hvd24gPSBmYWxzZVxufVxuXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKGJyb3dzZXJGaXhUb29sa2l0LmlucHV0RXZlbnQsIHNlbGYuaGlkZSlcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJyZXF1aXJlKCcuL2ZlYXR1cmVEZXRlY3QnKS5jaGVjaygpXG5yZXF1aXJlKCcuL3pvb20nKVxuXG5jb25zdCBmcm9udHBhZ2UgPSByZXF1aXJlKCcuL2Zyb250cGFnZScpXG5jb25zdCBzZWFyY2ggPSByZXF1aXJlKCcuL3NlYXJjaCcpXG5jb25zdCBzY2hlZHVsZSA9IHJlcXVpcmUoJy4vc2NoZWR1bGUnKVxuY29uc3Qgd2Vla1NlbGVjdG9yID0gcmVxdWlyZSgnLi93ZWVrU2VsZWN0b3InKVxuY29uc3QgZmF2b3JpdGUgPSByZXF1aXJlKCcuL2Zhdm9yaXRlJylcbmNvbnN0IHNjcm9sbFNuYXAgPSByZXF1aXJlKCcuL3Njcm9sbFNuYXAnKVxuY29uc3QgYW5hbHl0aWNzID0gcmVxdWlyZSgnLi9hbmFseXRpY3MnKVxuY29uc3QgdXJsID0gcmVxdWlyZSgnLi91cmwnKVxuXG5jb25zdCBzdGF0ZSA9IHt9XG5cbndpbmRvdy5zdGF0ZSA9IHN0YXRlXG53aW5kb3cucmVxdWlyZSA9IHJlcXVpcmVcblxuZnJvbnRwYWdlLnNob3coKVxud2Vla1NlbGVjdG9yLnVwZGF0ZUN1cnJlbnRXZWVrKClcbnNjcm9sbFNuYXAuc3RhcnRMaXN0ZW5pbmcoKVxuXG5pZiAodXJsLmhhc1NlbGVjdGVkVXNlcigpKSB7XG4gIHN0YXRlLnNlbGVjdGVkVXNlciA9IHVybC5nZXRTZWxlY3RlZFVzZXIoKVxuXG4gIGZhdm9yaXRlLnVwZGF0ZShzdGF0ZS5zZWxlY3RlZFVzZXIpXG4gIHVybC51cGRhdGUoc3RhdGUuc2VsZWN0ZWRVc2VyKVxuICBhbmFseXRpY3Muc2VuZC5zZWFyY2goc3RhdGUuc2VsZWN0ZWRVc2VyKVxuXG4gIHNjaGVkdWxlLnZpZXdJdGVtKHdlZWtTZWxlY3Rvci5nZXRTZWxlY3RlZFdlZWsoKSwgc3RhdGUuc2VsZWN0ZWRVc2VyKVxufSBlbHNlIGlmIChmYXZvcml0ZS5nZXQoKSAhPSBudWxsKSB7XG4gIHN0YXRlLnNlbGVjdGVkVXNlciA9IGZhdm9yaXRlLmdldCgpXG5cbiAgZmF2b3JpdGUudXBkYXRlKHN0YXRlLnNlbGVjdGVkVXNlcilcbiAgdXJsLnB1c2goc3RhdGUuc2VsZWN0ZWRVc2VyLCBmYWxzZSlcbiAgdXJsLnVwZGF0ZShzdGF0ZS5zZWxlY3RlZFVzZXIpXG4gIGFuYWx5dGljcy5zZW5kLnNlYXJjaChzdGF0ZS5zZWxlY3RlZFVzZXIsIHRydWUpXG5cbiAgc2NoZWR1bGUudmlld0l0ZW0od2Vla1NlbGVjdG9yLmdldFNlbGVjdGVkV2VlaygpLCBzdGF0ZS5zZWxlY3RlZFVzZXIpXG59IGVsc2Uge1xuICBzZWFyY2guZm9jdXMoKVxufVxuXG5zZWFyY2gub24oJ3NlYXJjaCcsIGZ1bmN0aW9uIChzZWxlY3RlZFVzZXIpIHtcbiAgc3RhdGUuc2VsZWN0ZWRVc2VyID0gc2VsZWN0ZWRVc2VyXG5cbiAgZmF2b3JpdGUudXBkYXRlKHN0YXRlLnNlbGVjdGVkVXNlcilcbiAgdXJsLnB1c2goc3RhdGUuc2VsZWN0ZWRVc2VyKVxuICB1cmwudXBkYXRlKHN0YXRlLnNlbGVjdGVkVXNlcilcbiAgYW5hbHl0aWNzLnNlbmQuc2VhcmNoKHN0YXRlLnNlbGVjdGVkVXNlcilcblxuICBzY2hlZHVsZS52aWV3SXRlbSh3ZWVrU2VsZWN0b3IuZ2V0U2VsZWN0ZWRXZWVrKCksIHN0YXRlLnNlbGVjdGVkVXNlcilcbn0pXG5cbnVybC5vbigndXBkYXRlJywgZnVuY3Rpb24gKHNlbGVjdGVkVXNlcikge1xuICBzdGF0ZS5zZWxlY3RlZFVzZXIgPSBzZWxlY3RlZFVzZXJcblxuICBmYXZvcml0ZS51cGRhdGUoc3RhdGUuc2VsZWN0ZWRVc2VyKVxuICB1cmwudXBkYXRlKHN0YXRlLnNlbGVjdGVkVXNlcilcblxuICBzY2hlZHVsZS52aWV3SXRlbSh3ZWVrU2VsZWN0b3IuZ2V0U2VsZWN0ZWRXZWVrKCksIHN0YXRlLnNlbGVjdGVkVXNlcilcbn0pXG5cbndlZWtTZWxlY3Rvci5vbignd2Vla0NoYW5nZWQnLCBmdW5jdGlvbiAobmV3V2Vlaykge1xuICBhbmFseXRpY3Muc2VuZC5zZWFyY2goc3RhdGUuc2VsZWN0ZWRVc2VyKVxuICBzY2hlZHVsZS52aWV3SXRlbShuZXdXZWVrLCBzdGF0ZS5zZWxlY3RlZFVzZXIpXG59KVxuXG5mYXZvcml0ZS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gIGZhdm9yaXRlLnRvZ2dsZShzdGF0ZS5zZWxlY3RlZFVzZXIpXG59KVxuXG5kb2N1bWVudC5ib2R5LnN0eWxlLm9wYWNpdHkgPSAxXG4iLCJjb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuY29uc3QgbGVmdFBhZCA9IHJlcXVpcmUoJ2xlZnQtcGFkJylcbmNvbnN0IHNlYXJjaCA9IHJlcXVpcmUoJy4vc2VhcmNoJylcblxuY29uc3Qgc2VsZiA9IG5ldyBFdmVudEVtaXR0ZXIoKVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgc2NoZWR1bGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzY2hlZHVsZScpXG59XG5cbnNlbGYuX3BhcnNlTWVldGluZ3BvaW50SFRNTCA9IGZ1bmN0aW9uIChodG1sU3RyKSB7XG4gIGNvbnN0IGh0bWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdodG1sJylcbiAgaHRtbC5pbm5lckhUTUwgPSBodG1sU3RyXG4gIGNvbnN0IGNlbnRlck5vZGUgPSBodG1sLnF1ZXJ5U2VsZWN0b3IoJ2NlbnRlcicpXG4gIHJldHVybiBjZW50ZXJOb2RlXG59XG5cbnNlbGYuX2hhbmRsZUxvYWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgY29uc3QgcmVxdWVzdCA9IGV2ZW50LnRhcmdldFxuICBpZiAocmVxdWVzdC5zdGF0dXMgPCAyMDAgfHwgcmVxdWVzdC5zdGF0dXMgPj0gNDAwKSB7XG4gICAgc2VsZi5faGFuZGxlRXJyb3IoZXZlbnQpXG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgZG9jdW1lbnQgPSBzZWxmLl9wYXJzZU1lZXRpbmdwb2ludEhUTUwocmVxdWVzdC5yZXNwb25zZSlcbiAgc2VsZi5fcmVtb3ZlQ2hpbGRzKClcbiAgc2VsZi5fbm9kZXMuc2NoZWR1bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQpXG4gIHNlbGYuX25vZGVzLnNjaGVkdWxlLmNsYXNzTGlzdC5yZW1vdmUoJ2Vycm9yJylcbiAgc2VsZi5lbWl0KCdsb2FkJylcbn1cblxuc2VsZi5faGFuZGxlRXJyb3IgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgY29uc3QgcmVxdWVzdCA9IGV2ZW50LnRhcmdldFxuICBsZXQgZXJyb3JcbiAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSA0MDQpIHtcbiAgICBlcnJvciA9ICdTb3JyeSwgZXIgaXMgKG5vZykgZ2VlbiByb29zdGVyIHZvb3IgZGV6ZSB3ZWVrLidcbiAgfSBlbHNlIHtcbiAgICBlcnJvciA9ICdTb3JyeSwgZXIgaXMgaWV0cyBtaXMgZ2VnYWFuIHRpamRlbnMgaGV0IGxhZGVuIHZhbiBkZXplIHdlZWsuJ1xuICB9XG4gIHNlbGYuX3JlbW92ZUNoaWxkcygpXG4gIHNlbGYuX25vZGVzLnNjaGVkdWxlLnRleHRDb250ZW50ID0gZXJyb3JcbiAgc2VsZi5fbm9kZXMuc2NoZWR1bGUuY2xhc3NMaXN0LmFkZCgnZXJyb3InKVxuICBzZWxmLmVtaXQoJ2xvYWQnKVxufVxuXG5zZWxmLl9nZXRVUkxPZlVzZXJzID0gZnVuY3Rpb24gKHdlZWssIHR5cGUsIGluZGV4KSB7XG4gIGNvbnN0IGlkID0gaW5kZXggKyAxXG4gIGNvbnN0IG1lZXRpbmdwb2ludFVSTCA9XG4gICAgICBgUm9vc3RlcnMtQUwvZG9jL2RhZ3Jvb3N0ZXJzLyR7bGVmdFBhZCh3ZWVrLCAyLCAnMCcpfS8ke3R5cGV9L2AgK1xuICAgICAgYCR7dHlwZX0ke2xlZnRQYWQoaWQsIDUsICcwJyl9Lmh0bWBcbiAgcmV0dXJuIGAvbWVldGluZ3BvaW50UHJveHkvJHt3aW5kb3cuZW5jb2RlVVJJQ29tcG9uZW50KG1lZXRpbmdwb2ludFVSTCl9YFxufVxuXG5zZWxmLl9yZW1vdmVDaGlsZHMgPSBmdW5jdGlvbiAoKSB7XG4gIHdoaWxlIChzZWxmLl9ub2Rlcy5zY2hlZHVsZS5maXJzdENoaWxkKSB7XG4gICAgc2VsZi5fbm9kZXMuc2NoZWR1bGUucmVtb3ZlQ2hpbGQoc2VsZi5fbm9kZXMuc2NoZWR1bGUuZmlyc3RDaGlsZClcbiAgfVxufVxuXG5zZWxmLnZpZXdJdGVtID0gZnVuY3Rpb24gKHdlZWssIHNlbGVjdGVkVXNlcikge1xuICBpZiAoc2VsZWN0ZWRVc2VyID09IG51bGwpIHtcbiAgICBzZWxmLl9yZW1vdmVDaGlsZHMoKVxuICAgIHNlYXJjaC51cGRhdGVEb20oc2VsZWN0ZWRVc2VyKVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IHVybCA9IHNlbGYuX2dldFVSTE9mVXNlcnMod2Vlaywgc2VsZWN0ZWRVc2VyLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFVzZXIuaW5kZXgpXG5cbiAgICBzZWxmLl9yZW1vdmVDaGlsZHMoKVxuXG4gICAgY29uc3QgcmVxdWVzdCA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKVxuICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHNlbGYuX2hhbmRsZUxvYWQpXG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHNlbGYuX2hhbmRsZUVycm9yKVxuICAgIHJlcXVlc3Qub3BlbignR0VUJywgdXJsLCB0cnVlKVxuICAgIHJlcXVlc3Quc2VuZCgpXG5cbiAgICBzZWFyY2gudXBkYXRlRG9tKHNlbGVjdGVkVXNlcilcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsInJlcXVpcmUoJ3Ntb290aHNjcm9sbC1wb2x5ZmlsbCcpLnBvbHlmaWxsKClcblxuY29uc3Qgc2VsZiA9IHt9XG5jb25zdCBzY2hlZHVsZSA9IHJlcXVpcmUoJy4vc2NoZWR1bGUnKVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgc2VhcmNoOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2VhcmNoJyksXG4gIHdlZWtTZWxlY3RvcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3dlZWstc2VsZWN0b3InKVxufVxuXG5zZWxmLl90aW1lb3V0SUQgPSBudWxsXG5cbnNlbGYuX2dldFNjcm9sbFBvc2l0aW9uID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wKSB8fFxuICAgICAgICAgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3Bcbn1cblxuc2VsZi5faGFuZGxlRG9uZVNjcm9sbGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgc2Nyb2xsUG9zaXRpb24gPSBzZWxmLl9nZXRTY3JvbGxQb3NpdGlvbigpXG4gIGNvbnN0IHdlZWtTZWxlY3RvckhlaWdodCA9XG4gICAgICBzZWxmLl9ub2Rlcy53ZWVrU2VsZWN0b3IuY2xpZW50SGVpZ2h0IC0gc2VsZi5fbm9kZXMuc2VhcmNoLmNsaWVudEhlaWdodFxuICBpZiAoc2Nyb2xsUG9zaXRpb24gPCB3ZWVrU2VsZWN0b3JIZWlnaHQgJiYgc2Nyb2xsUG9zaXRpb24gPiAwKSB7XG4gICAgd2luZG93LnNjcm9sbCh7IHRvcDogd2Vla1NlbGVjdG9ySGVpZ2h0LCBsZWZ0OiAwLCBiZWhhdmlvcjogJ3Ntb290aCcgfSlcbiAgfVxufVxuXG5zZWxmLl9oYW5kbGVTY3JvbGwgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChzZWxmLl90aW1lb3V0SUQgIT0gbnVsbCkgd2luZG93LmNsZWFyVGltZW91dChzZWxmLl90aW1lb3V0SUQpXG4gIHNlbGYuX3RpbWVvdXRJRCA9IHdpbmRvdy5zZXRUaW1lb3V0KHNlbGYuX2hhbmRsZURvbmVTY3JvbGxpbmcsIDUwMClcblxuICBjb25zdCBzY3JvbGxQb3NpdGlvbiA9IHNlbGYuX2dldFNjcm9sbFBvc2l0aW9uKClcbiAgY29uc3Qgd2Vla1NlbGVjdG9ySGVpZ2h0ID1cbiAgICAgIHNlbGYuX25vZGVzLndlZWtTZWxlY3Rvci5jbGllbnRIZWlnaHQgLSBzZWxmLl9ub2Rlcy5zZWFyY2guY2xpZW50SGVpZ2h0XG4gIGlmIChzY3JvbGxQb3NpdGlvbiA+PSB3ZWVrU2VsZWN0b3JIZWlnaHQpIHtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3dlZWstc2VsZWN0b3Itbm90LXZpc2libGUnKVxuICB9IGVsc2Uge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnd2Vlay1zZWxlY3Rvci1ub3QtdmlzaWJsZScpXG4gIH1cbn1cblxuc2VsZi5faGFuZGxlV2luZG93UmVzaXplID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCB3ZWVrU2VsZWN0b3JIZWlnaHQgPVxuICAgICAgc2VsZi5fbm9kZXMud2Vla1NlbGVjdG9yLmNsaWVudEhlaWdodCAtIHNlbGYuX25vZGVzLnNlYXJjaC5jbGllbnRIZWlnaHRcbiAgY29uc3QgZXh0cmFQaXhlbHNOZWVkZWQgPVxuICAgICAgd2Vla1NlbGVjdG9ySGVpZ2h0IC0gKGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0IC0gd2luZG93LmlubmVySGVpZ2h0KVxuICBpZiAoZXh0cmFQaXhlbHNOZWVkZWQgPiAwKSB7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5tYXJnaW5Cb3R0b20gPSBleHRyYVBpeGVsc05lZWRlZCArICdweCdcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm1hcmdpbkJvdHRvbSA9IG51bGxcbiAgfVxufVxuXG5zZWxmLnN0YXJ0TGlzdGVuaW5nID0gZnVuY3Rpb24gKCkge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgc2VsZi5faGFuZGxlU2Nyb2xsKVxufVxuXG5zY2hlZHVsZS5vbignbG9hZCcsIHNlbGYuX2hhbmRsZVdpbmRvd1Jlc2l6ZSlcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzZWxmLl9oYW5kbGVXaW5kb3dSZXNpemUpXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsIi8qIGdsb2JhbCBVU0VSUyAqL1xuXG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuY29uc3QgZnV6enkgPSByZXF1aXJlKCdmdXp6eScpXG5jb25zdCBhdXRvY29tcGxldGUgPSByZXF1aXJlKCcuL2F1dG9jb21wbGV0ZScpXG5jb25zdCBicm93c2VyRml4VG9vbGtpdCA9IHJlcXVpcmUoJy4vYnJvd3NlckZpeFRvb2xraXQnKVxuXG5jb25zdCBzZWxmID0gbmV3IEV2ZW50RW1pdHRlcigpXG5cbnNlbGYuX25vZGVzID0ge1xuICBzZWFyY2g6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzZWFyY2gnKSxcbiAgaW5wdXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJzZWFyY2hcIl0nKVxufVxuXG5zZWxmLnN1Ym1pdCA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgc2VsZWN0ZWRVc2VyID0gYXV0b2NvbXBsZXRlLmdldFNlbGVjdGVkVXNlcigpXG4gIGlmIChzZWxlY3RlZFVzZXIgPT0gbnVsbCkgcmV0dXJuXG5cbiAgY29uc29sZS5sb2coc2VsZWN0ZWRVc2VyKVxuXG4gIHNlbGYuX25vZGVzLmlucHV0LmJsdXIoKVxuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3dlZWstc2VsZWN0b3Itbm90LXZpc2libGUnKSAvLyBTYWZhcmkgYnVnXG5cbiAgc2VsZi5lbWl0KCdzZWFyY2gnLCBzZWxlY3RlZFVzZXIpXG59XG5cbnNlbGYudXBkYXRlRG9tID0gZnVuY3Rpb24gKHNlbGVjdGVkVXNlcikge1xuICBpZiAoc2VsZWN0ZWRVc2VyID09IG51bGwpIHtcbiAgICBzZWxmLl9ub2Rlcy5pbnB1dC52YWx1ZSA9ICcnXG4gICAgYXV0b2NvbXBsZXRlLnJlbW92ZUFsbEl0ZW1zKClcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ25vLWlucHV0JylcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3NlYXJjaGVkJylcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9ub2Rlcy5pbnB1dC52YWx1ZSA9IHNlbGVjdGVkVXNlci52YWx1ZVxuICAgIGF1dG9jb21wbGV0ZS5yZW1vdmVBbGxJdGVtcygpXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCduby1pbnB1dCcpXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdzZWFyY2hlZCcpXG4gIH1cbn1cblxuc2VsZi5mb2N1cyA9IGZ1bmN0aW9uICgpIHtcbiAgc2VsZi5fbm9kZXMuaW5wdXQuZm9jdXMoKVxufVxuXG5zZWxmLl9oYW5kbGVTdWJtaXQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICBzZWxmLnN1Ym1pdCgpXG59XG5cbnNlbGYuX2NhbGN1bGF0ZSA9IGZ1bmN0aW9uIChzZWFyY2hUZXJtKSB7XG4gIGNvbnN0IGFsbFJlc3VsdHMgPSBmdXp6eS5maWx0ZXIoc2VhcmNoVGVybSwgVVNFUlMsIHtcbiAgICBleHRyYWN0OiBmdW5jdGlvbiAodXNlcikgeyByZXR1cm4gdXNlci52YWx1ZSB9XG4gIH0pXG4gIGNvbnN0IGZpcnN0UmVzdWx0cyA9IGFsbFJlc3VsdHMuc2xpY2UoMCwgNylcblxuICBjb25zdCBvcmlnaW5hbFJlc3VsdHMgPSBmaXJzdFJlc3VsdHMubWFwKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICByZXR1cm4gcmVzdWx0Lm9yaWdpbmFsXG4gIH0pXG5cbiAgcmV0dXJuIG9yaWdpbmFsUmVzdWx0c1xufVxuXG5zZWxmLl9oYW5kbGVUZXh0VXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCByZXN1bHRzID0gc2VsZi5fY2FsY3VsYXRlKHNlbGYuX25vZGVzLmlucHV0LnZhbHVlKVxuXG4gIGF1dG9jb21wbGV0ZS5yZW1vdmVBbGxJdGVtcygpXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgIGF1dG9jb21wbGV0ZS5hZGRJdGVtKHJlc3VsdHNbaV0pXG4gIH1cbn1cblxuc2VsZi5faGFuZGxlRm9jdXMgPSBmdW5jdGlvbiAoKSB7XG4gIHNlbGYuX25vZGVzLmlucHV0LnNlbGVjdCgpXG59XG5cbnNlbGYuX2hhbmRsZUJsdXIgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIHRoaXMgd2lsbCByZW1vdmVkIHRoZSBzZWxlY3Rpb24gd2l0aG91dCBkcmF3aW5nIGZvY3VzIG9uIGl0IChzYWZhcmkpXG4gIC8vIHRoaXMgd2lsbCByZW1vdmVkIHNlbGVjdGlvbiBldmVuIHdoZW4gZm9jdXNpbmcgYW4gaWZyYW1lIChjaHJvbWUpXG4gIGNvbnN0IG9sZFZhbHVlID0gc2VsZi5fbm9kZXMudmFsdWVcbiAgc2VsZi5fbm9kZXMudmFsdWUgPSAnJ1xuICBzZWxmLl9ub2Rlcy52YWx1ZSA9IG9sZFZhbHVlXG5cbiAgLy8gdGhpcyB3aWxsIGhpZGUgdGhlIGtleWJvYXJkIChpT1Mgc2FmYXJpKVxuICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKVxufVxuXG5hdXRvY29tcGxldGUub24oJ3NlbGVjdCcsIHNlbGYuc3VibWl0KVxuXG5zZWxmLl9ub2Rlcy5zZWFyY2guYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0Jywgc2VsZi5faGFuZGxlU3VibWl0KVxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBzZWxmLl9oYW5kbGVGb2N1cylcbnNlbGYuX25vZGVzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCBzZWxmLl9oYW5kbGVCbHVyKVxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihicm93c2VyRml4VG9vbGtpdC5pbnB1dEV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9oYW5kbGVUZXh0VXBkYXRlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsIi8qIGdsb2JhbCBVU0VSUyBGTEFHUyAqL1xuXG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuXG5jb25zdCBzZWxmID0gbmV3IEV2ZW50RW1pdHRlcigpXG5cbnNlbGYuX2dldFBhZ2VUaXRsZSA9IGZ1bmN0aW9uIChzZWxlY3RlZFVzZXIpIHtcbiAgbGV0IHJldFxuXG4gIGlmIChzZWxlY3RlZFVzZXIgPT0gbnVsbCkge1xuICAgIHJldCA9IGBNZXRpcyBSb29zdGVyYFxuICB9IGVsc2Uge1xuICAgIHJldCA9IGBNZXRpcyBSb29zdGVyIC0gJHtzZWxlY3RlZFVzZXIudmFsdWV9YFxuICB9XG5cbiAgaWYgKEZMQUdTLmluZGV4T2YoJ0JFVEEnKSAhPT0gLTEpIHtcbiAgICByZXQgPSBgQkVUQSAke3JldH1gXG4gIH1cblxuICByZXR1cm4gcmV0XG59XG5cbnNlbGYuX2dldFBhZ2VVUkwgPSBmdW5jdGlvbiAoc2VsZWN0ZWRVc2VyKSB7XG4gIHJldHVybiBgLyR7c2VsZWN0ZWRVc2VyLnR5cGV9LyR7c2VsZWN0ZWRVc2VyLnZhbHVlfWBcbn1cblxuc2VsZi5wdXNoID0gZnVuY3Rpb24gKHNlbGVjdGVkVXNlciwgcHVzaCkge1xuICBpZiAocHVzaCA9PSBudWxsKSBwdXNoID0gdHJ1ZVxuICBjb25zdCBwYWdlVGl0bGUgPSBzZWxmLl9nZXRQYWdlVGl0bGUoc2VsZWN0ZWRVc2VyKVxuICBjb25zdCBwYWdlVVJMID0gc2VsZi5fZ2V0UGFnZVVSTChzZWxlY3RlZFVzZXIpXG4gIGlmIChwdXNoKSB7XG4gICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHNlbGVjdGVkVXNlciwgcGFnZVRpdGxlLCBwYWdlVVJMKVxuICB9IGVsc2Uge1xuICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZShzZWxlY3RlZFVzZXIsIHBhZ2VUaXRsZSwgcGFnZVVSTClcbiAgfVxufVxuXG5zZWxmLnVwZGF0ZSA9IGZ1bmN0aW9uIChzZWxlY3RlZFVzZXIpIHtcbiAgZG9jdW1lbnQudGl0bGUgPSBzZWxmLl9nZXRQYWdlVGl0bGUoc2VsZWN0ZWRVc2VyKVxufVxuXG5zZWxmLmhhc1NlbGVjdGVkVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgcGFnZVVybCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZVxuICByZXR1cm4gL15cXC9zXFwvfF5cXC90XFwvfF5cXC9yXFwvfF5cXC9jXFwvLy50ZXN0KHBhZ2VVcmwpXG59XG5cbnNlbGYuZ2V0U2VsZWN0ZWRVc2VyID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBwYWdlVXJsID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lXG4gIGNvbnN0IHBhZ2VVcmxEYXRhID0gcGFnZVVybC5zcGxpdCgnLycpXG4gIGNvbnN0IHR5cGUgPSBwYWdlVXJsRGF0YVsxXVxuICBjb25zdCB2YWx1ZSA9IHBhZ2VVcmxEYXRhWzJdXG5cbiAgY29uc3QgdXNlciA9IFVTRVJTLmZpbHRlcihmdW5jdGlvbiAodXNlcikge1xuICAgIHJldHVybiB1c2VyLnR5cGUgPT09IHR5cGUgJiZcbiAgICAgICAgICAgdXNlci52YWx1ZSA9PT0gdmFsdWVcbiAgfSlbMF1cblxuICByZXR1cm4gdXNlclxufVxuXG5zZWxmLl9oYW5kbGVVcGRhdGUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgc2VsZi5lbWl0KCd1cGRhdGUnLCBldmVudC5zdGF0ZSlcbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgc2VsZi5faGFuZGxlVXBkYXRlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsImNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5cbmNvbnN0IHNlbGYgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fbm9kZXMgPSB7XG4gIHByZXZCdXR0b246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN3ZWVrLXNlbGVjdG9yIGJ1dHRvbicpWzBdLFxuICBuZXh0QnV0dG9uOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjd2Vlay1zZWxlY3RvciBidXR0b24nKVsxXSxcbiAgY3VycmVudFdlZWtOb2RlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd2Vlay1zZWxlY3RvciAuY3VycmVudCcpLFxuICBjdXJyZW50V2Vla05vcm1hbFRleHQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3ZWVrLXNlbGVjdG9yIC5jdXJyZW50IC5uby1wcmludCcpLFxuICBjdXJyZW50V2Vla1ByaW50VGV4dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3dlZWstc2VsZWN0b3IgLmN1cnJlbnQgLnByaW50Jylcbn1cblxuc2VsZi5fd2Vla09mZnNldCA9IDBcblxuLy8gY29waWVkIGZyb20gaHR0cDovL3d3dy5tZWV0aW5ncG9pbnRtY28ubmwvUm9vc3RlcnMtQUwvZG9jL2RhZ3Jvb3N0ZXJzL3VudGlzc2NyaXB0cy5qcyxcbi8vIHdlcmUgdXNpbmcgdGhlIHNhbWUgY29kZSBhcyB0aGV5IGRvIHRvIGJlIHN1cmUgdGhhdCB3ZSBhbHdheXMgZ2V0IHRoZSBzYW1lXG4vLyB3ZWVrIG51bWJlci5cbnNlbGYuZ2V0Q3VycmVudFdlZWsgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gIGNvbnN0IGRheU5yID0gKHRhcmdldC5nZXREYXkoKSArIDYpICUgN1xuICB0YXJnZXQuc2V0RGF0ZSh0YXJnZXQuZ2V0RGF0ZSgpIC0gZGF5TnIgKyAzKVxuICBjb25zdCBmaXJzdFRodXJzZGF5ID0gdGFyZ2V0LnZhbHVlT2YoKVxuICB0YXJnZXQuc2V0TW9udGgoMCwgMSlcbiAgaWYgKHRhcmdldC5nZXREYXkoKSAhPT0gNCkge1xuICAgIHRhcmdldC5zZXRNb250aCgwLCAxICsgKCg0IC0gdGFyZ2V0LmdldERheSgpKSArIDcpICUgNylcbiAgfVxuXG4gIHJldHVybiAxICsgTWF0aC5jZWlsKChmaXJzdFRodXJzZGF5IC0gdGFyZ2V0KSAvIDYwNDgwMDAwMClcbn1cblxuc2VsZi5nZXRTZWxlY3RlZFdlZWsgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IG5vdyA9IG5ldyBEYXRlKClcbiAgY29uc3QgdGFyZ2V0RGF0ZSA9IG5ldyBEYXRlKG5vdy5nZXRUaW1lKCkgK1xuICAgICAgc2VsZi5fd2Vla09mZnNldCAqIDYwNDgwMCAqIDEwMDAgKyA4NjQwMCAqIDEwMDApXG4gIHJldHVybiBzZWxmLmdldEN1cnJlbnRXZWVrKHRhcmdldERhdGUpXG59XG5cbnNlbGYudXBkYXRlQ3VycmVudFdlZWsgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHNlbGVjdGVkV2Vla051bWJlciA9IHNlbGYuZ2V0U2VsZWN0ZWRXZWVrKClcbiAgaWYgKHNlbGYuZ2V0Q3VycmVudFdlZWsobmV3IERhdGUoKSkgIT09IHNlbGVjdGVkV2Vla051bWJlcikge1xuICAgIHNlbGYuX25vZGVzLmN1cnJlbnRXZWVrTm9kZS5jbGFzc0xpc3QuYWRkKCdjaGFuZ2VkJylcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9ub2Rlcy5jdXJyZW50V2Vla05vZGUuY2xhc3NMaXN0LnJlbW92ZSgnY2hhbmdlZCcpXG4gIH1cbiAgc2VsZi51cGRhdGVEb20oKVxuICBzZWxmLmVtaXQoJ3dlZWtDaGFuZ2VkJywgc2VsZWN0ZWRXZWVrTnVtYmVyKVxufVxuXG5zZWxmLnVwZGF0ZURvbSA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgc2VsZWN0ZWRXZWVrTnVtYmVyID0gc2VsZi5nZXRTZWxlY3RlZFdlZWsoKVxuICBjb25zdCBpc1N1bmRheSA9IG5ldyBEYXRlKCkuZ2V0RGF5KCkgPT09IDBcbiAgbGV0IGh1bWFuUmVhZGFibGVXZWVrID0gbnVsbFxuICBpZiAoaXNTdW5kYXkpIHtcbiAgICBzd2l0Y2ggKHNlbGYuX3dlZWtPZmZzZXQpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgaHVtYW5SZWFkYWJsZVdlZWsgPSAnQWFuc3RhYW5kZSB3ZWVrJ1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAxOlxuICAgICAgICBodW1hblJlYWRhYmxlV2VlayA9ICdWb2xnZW5kZSB3ZWVrJ1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAtMTpcbiAgICAgICAgaHVtYW5SZWFkYWJsZVdlZWsgPSAnQWZnZWxvcGVuIHdlZWsnXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHN3aXRjaCAoc2VsZi5fd2Vla09mZnNldCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICBodW1hblJlYWRhYmxlV2VlayA9ICdIdWlkaWdlIHdlZWsnXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGh1bWFuUmVhZGFibGVXZWVrID0gJ1ZvbGdlbmRlIHdlZWsnXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIC0xOlxuICAgICAgICBodW1hblJlYWRhYmxlV2VlayA9ICdWb3JpZ2Ugd2VlaydcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgaWYgKGh1bWFuUmVhZGFibGVXZWVrICE9IG51bGwpIHtcbiAgICBzZWxmLl9ub2Rlcy5jdXJyZW50V2Vla05vcm1hbFRleHQudGV4dENvbnRlbnQgPSBodW1hblJlYWRhYmxlV2VlayArICcg4oCiICcgKyBzZWxlY3RlZFdlZWtOdW1iZXJcbiAgICBzZWxmLl9ub2Rlcy5jdXJyZW50V2Vla1ByaW50VGV4dC50ZXh0Q29udGVudCA9ICdXZWVrICcgKyBzZWxlY3RlZFdlZWtOdW1iZXJcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9ub2Rlcy5jdXJyZW50V2Vla05vcm1hbFRleHQudGV4dENvbnRlbnQgPSAnV2VlayAnICsgc2VsZWN0ZWRXZWVrTnVtYmVyXG4gICAgc2VsZi5fbm9kZXMuY3VycmVudFdlZWtQcmludFRleHQudGV4dENvbnRlbnQgPSAnV2VlayAnICsgc2VsZWN0ZWRXZWVrTnVtYmVyXG4gIH1cbn1cblxuc2VsZi5faGFuZGxlUHJldkJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICBzZWxmLl93ZWVrT2Zmc2V0IC09IDFcbiAgc2VsZi51cGRhdGVDdXJyZW50V2VlaygpXG59XG5cbnNlbGYuX2hhbmRsZU5leHRCdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgc2VsZi5fd2Vla09mZnNldCArPSAxXG4gIHNlbGYudXBkYXRlQ3VycmVudFdlZWsoKVxufVxuXG5zZWxmLl9ub2Rlcy5wcmV2QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2VsZi5faGFuZGxlUHJldkJ1dHRvbkNsaWNrKVxuc2VsZi5fbm9kZXMubmV4dEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlbGYuX2hhbmRsZU5leHRCdXR0b25DbGljaylcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJjb25zdCBzY2hlZHVsZSA9IHJlcXVpcmUoJy4vc2NoZWR1bGUnKVxuXG5jb25zdCBzZWxmID0ge31cblxuc2VsZi5fbm9kZXMgPSB7XG4gIGJvZHk6IGRvY3VtZW50LmJvZHlcbn1cblxuc2VsZi5faGFuZGxlUmVzaXplID0gZnVuY3Rpb24gKCkge1xuICAvLyB0aGUgdGFibGUgbm9kZSBtYXkgbm90IGV4aXN0IGJlZm9yZSB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZFxuICBjb25zdCB0YWJsZU5vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdjZW50ZXIgPiB0YWJsZScpXG5cbiAgLy8gaW5mYWN0LCBpdCBtYXkgbm90IGV2ZW4gZXhpc3Qgd2hlbiB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZC5cbiAgaWYgKCF0YWJsZU5vZGUpIHJldHVyblxuXG4gIGNvbnN0IHRhYmxlV2lkdGggPSB0YWJsZU5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGhcbiAgY29uc3QgdGFibGVHb2FsV2lkdGggPSBzZWxmLl9ub2Rlcy5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoICogMC45XG4gIGNvbnN0IHpvb21GYWN0b3IgPSB0YWJsZUdvYWxXaWR0aCAvIHRhYmxlV2lkdGhcblxuICBpZiAoem9vbUZhY3RvciA8IDEpIHtcbiAgICB0YWJsZU5vZGUuc3R5bGUuem9vbSA9IGAke3pvb21GYWN0b3J9YFxuICB9IGVsc2Uge1xuICAgIHRhYmxlTm9kZS5zdHlsZS56b29tID0gYDFgXG4gIH1cbn1cblxuc2NoZWR1bGUub24oJ2xvYWQnLCBzZWxmLl9oYW5kbGVSZXNpemUpXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc2VsZi5faGFuZGxlUmVzaXplKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiJdfQ==
