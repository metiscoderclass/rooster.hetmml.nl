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

},{"./analytics":5,"./favorite":8,"./featureDetect":9,"./frontpage":10,"./schedule":12,"./scrollSnap":13,"./search":14,"./url":15,"./weekSelector":16}],12:[function(require,module,exports){
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

},{"events":1}]},{},[11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9mdXp6eS9saWIvZnV6enkuanMiLCJub2RlX21vZHVsZXMvbGVmdC1wYWQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc21vb3Roc2Nyb2xsLXBvbHlmaWxsL2Rpc3Qvc21vb3Roc2Nyb2xsLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2FuYWx5dGljcy5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9hdXRvY29tcGxldGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYnJvd3NlckZpeFRvb2xraXQuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvZmF2b3JpdGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvZmVhdHVyZURldGVjdC5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9mcm9udHBhZ2UuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvbWFpbi5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9zY2hlZHVsZS5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9zY3JvbGxTbmFwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL3NlYXJjaC5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy91cmwuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvd2Vla1NlbGVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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akMsR0FBK0MsVUFBVSxrQkFBekQ7QUFDRCxHQUhELE1BR087QUFDTCxTQUFLLE1BQUwsQ0FBWSxxQkFBWixDQUFrQyxXQUFsQyxHQUFnRCxVQUFVLGtCQUExRDtBQUNBLFNBQUssTUFBTCxDQUFZLG9CQUFaLENBQWlDLFdBQWpDLEdBQStDLFVBQVUsa0JBQXpEO0FBQ0Q7QUFDRixDQXBDRDs7QUFzQ0EsS0FBSyxzQkFBTCxHQUE4QixZQUFZO0FBQ3hDLE9BQUssV0FBTCxJQUFvQixDQUFwQjtBQUNBLE9BQUssaUJBQUw7QUFDRCxDQUhEOztBQUtBLEtBQUssc0JBQUwsR0FBOEIsWUFBWTtBQUN4QyxPQUFLLFdBQUwsSUFBb0IsQ0FBcEI7QUFDQSxPQUFLLGlCQUFMO0FBQ0QsQ0FIRDs7QUFLQSxLQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLGdCQUF2QixDQUF3QyxPQUF4QyxFQUFpRCxLQUFLLHNCQUF0RDtBQUNBLEtBQUssTUFBTCxDQUFZLFVBQVosQ0FBdUIsZ0JBQXZCLENBQXdDLE9BQXhDLEVBQWlELEtBQUssc0JBQXREOztBQUVBLE9BQU8sT0FBUCxHQUFpQixJQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXZsaXN0ZW5lcikpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChldmxpc3RlbmVyKVxuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCIvKlxuICogRnV6enlcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9teW9yay9mdXp6eVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMiBNYXR0IFlvcmtcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG5cbnZhciByb290ID0gdGhpcztcblxudmFyIGZ1enp5ID0ge307XG5cbi8vIFVzZSBpbiBub2RlIG9yIGluIGJyb3dzZXJcbmlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdXp6eTtcbn0gZWxzZSB7XG4gIHJvb3QuZnV6enkgPSBmdXp6eTtcbn1cblxuLy8gUmV0dXJuIGFsbCBlbGVtZW50cyBvZiBgYXJyYXlgIHRoYXQgaGF2ZSBhIGZ1enp5XG4vLyBtYXRjaCBhZ2FpbnN0IGBwYXR0ZXJuYC5cbmZ1enp5LnNpbXBsZUZpbHRlciA9IGZ1bmN0aW9uKHBhdHRlcm4sIGFycmF5KSB7XG4gIHJldHVybiBhcnJheS5maWx0ZXIoZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIGZ1enp5LnRlc3QocGF0dGVybiwgc3RyKTtcbiAgfSk7XG59O1xuXG4vLyBEb2VzIGBwYXR0ZXJuYCBmdXp6eSBtYXRjaCBgc3RyYD9cbmZ1enp5LnRlc3QgPSBmdW5jdGlvbihwYXR0ZXJuLCBzdHIpIHtcbiAgcmV0dXJuIGZ1enp5Lm1hdGNoKHBhdHRlcm4sIHN0cikgIT09IG51bGw7XG59O1xuXG4vLyBJZiBgcGF0dGVybmAgbWF0Y2hlcyBgc3RyYCwgd3JhcCBlYWNoIG1hdGNoaW5nIGNoYXJhY3RlclxuLy8gaW4gYG9wdHMucHJlYCBhbmQgYG9wdHMucG9zdGAuIElmIG5vIG1hdGNoLCByZXR1cm4gbnVsbFxuZnV6enkubWF0Y2ggPSBmdW5jdGlvbihwYXR0ZXJuLCBzdHIsIG9wdHMpIHtcbiAgb3B0cyA9IG9wdHMgfHwge307XG4gIHZhciBwYXR0ZXJuSWR4ID0gMFxuICAgICwgcmVzdWx0ID0gW11cbiAgICAsIGxlbiA9IHN0ci5sZW5ndGhcbiAgICAsIHRvdGFsU2NvcmUgPSAwXG4gICAgLCBjdXJyU2NvcmUgPSAwXG4gICAgLy8gcHJlZml4XG4gICAgLCBwcmUgPSBvcHRzLnByZSB8fCAnJ1xuICAgIC8vIHN1ZmZpeFxuICAgICwgcG9zdCA9IG9wdHMucG9zdCB8fCAnJ1xuICAgIC8vIFN0cmluZyB0byBjb21wYXJlIGFnYWluc3QuIFRoaXMgbWlnaHQgYmUgYSBsb3dlcmNhc2UgdmVyc2lvbiBvZiB0aGVcbiAgICAvLyByYXcgc3RyaW5nXG4gICAgLCBjb21wYXJlU3RyaW5nID0gIG9wdHMuY2FzZVNlbnNpdGl2ZSAmJiBzdHIgfHwgc3RyLnRvTG93ZXJDYXNlKClcbiAgICAsIGNoO1xuXG4gIHBhdHRlcm4gPSBvcHRzLmNhc2VTZW5zaXRpdmUgJiYgcGF0dGVybiB8fCBwYXR0ZXJuLnRvTG93ZXJDYXNlKCk7XG5cbiAgLy8gRm9yIGVhY2ggY2hhcmFjdGVyIGluIHRoZSBzdHJpbmcsIGVpdGhlciBhZGQgaXQgdG8gdGhlIHJlc3VsdFxuICAvLyBvciB3cmFwIGluIHRlbXBsYXRlIGlmIGl0J3MgdGhlIG5leHQgc3RyaW5nIGluIHRoZSBwYXR0ZXJuXG4gIGZvcih2YXIgaWR4ID0gMDsgaWR4IDwgbGVuOyBpZHgrKykge1xuICAgIGNoID0gc3RyW2lkeF07XG4gICAgaWYoY29tcGFyZVN0cmluZ1tpZHhdID09PSBwYXR0ZXJuW3BhdHRlcm5JZHhdKSB7XG4gICAgICBjaCA9IHByZSArIGNoICsgcG9zdDtcbiAgICAgIHBhdHRlcm5JZHggKz0gMTtcblxuICAgICAgLy8gY29uc2VjdXRpdmUgY2hhcmFjdGVycyBzaG91bGQgaW5jcmVhc2UgdGhlIHNjb3JlIG1vcmUgdGhhbiBsaW5lYXJseVxuICAgICAgY3VyclNjb3JlICs9IDEgKyBjdXJyU2NvcmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJTY29yZSA9IDA7XG4gICAgfVxuICAgIHRvdGFsU2NvcmUgKz0gY3VyclNjb3JlO1xuICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoXSA9IGNoO1xuICB9XG5cbiAgLy8gcmV0dXJuIHJlbmRlcmVkIHN0cmluZyBpZiB3ZSBoYXZlIGEgbWF0Y2ggZm9yIGV2ZXJ5IGNoYXJcbiAgaWYocGF0dGVybklkeCA9PT0gcGF0dGVybi5sZW5ndGgpIHtcbiAgICAvLyBpZiB0aGUgc3RyaW5nIGlzIGFuIGV4YWN0IG1hdGNoIHdpdGggcGF0dGVybiwgdG90YWxTY29yZSBzaG91bGQgYmUgbWF4ZWRcbiAgICB0b3RhbFNjb3JlID0gKGNvbXBhcmVTdHJpbmcgPT09IHBhdHRlcm4pID8gSW5maW5pdHkgOiB0b3RhbFNjb3JlO1xuICAgIHJldHVybiB7cmVuZGVyZWQ6IHJlc3VsdC5qb2luKCcnKSwgc2NvcmU6IHRvdGFsU2NvcmV9O1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59O1xuXG4vLyBUaGUgbm9ybWFsIGVudHJ5IHBvaW50LiBGaWx0ZXJzIGBhcnJgIGZvciBtYXRjaGVzIGFnYWluc3QgYHBhdHRlcm5gLlxuLy8gSXQgcmV0dXJucyBhbiBhcnJheSB3aXRoIG1hdGNoaW5nIHZhbHVlcyBvZiB0aGUgdHlwZTpcbi8vXG4vLyAgICAgW3tcbi8vICAgICAgICAgc3RyaW5nOiAgICc8Yj5sYWgnIC8vIFRoZSByZW5kZXJlZCBzdHJpbmdcbi8vICAgICAgICwgaW5kZXg6ICAgIDIgICAgICAgIC8vIFRoZSBpbmRleCBvZiB0aGUgZWxlbWVudCBpbiBgYXJyYFxuLy8gICAgICAgLCBvcmlnaW5hbDogJ2JsYWgnICAgLy8gVGhlIG9yaWdpbmFsIGVsZW1lbnQgaW4gYGFycmBcbi8vICAgICB9XVxuLy9cbi8vIGBvcHRzYCBpcyBhbiBvcHRpb25hbCBhcmd1bWVudCBiYWcuIERldGFpbHM6XG4vL1xuLy8gICAgb3B0cyA9IHtcbi8vICAgICAgICAvLyBzdHJpbmcgdG8gcHV0IGJlZm9yZSBhIG1hdGNoaW5nIGNoYXJhY3RlclxuLy8gICAgICAgIHByZTogICAgICc8Yj4nXG4vL1xuLy8gICAgICAgIC8vIHN0cmluZyB0byBwdXQgYWZ0ZXIgbWF0Y2hpbmcgY2hhcmFjdGVyXG4vLyAgICAgICwgcG9zdDogICAgJzwvYj4nXG4vL1xuLy8gICAgICAgIC8vIE9wdGlvbmFsIGZ1bmN0aW9uLiBJbnB1dCBpcyBhbiBlbnRyeSBpbiB0aGUgZ2l2ZW4gYXJyYCxcbi8vICAgICAgICAvLyBvdXRwdXQgc2hvdWxkIGJlIHRoZSBzdHJpbmcgdG8gdGVzdCBgcGF0dGVybmAgYWdhaW5zdC5cbi8vICAgICAgICAvLyBJbiB0aGlzIGV4YW1wbGUsIGlmIGBhcnIgPSBbe2NyeWluZzogJ2tvYWxhJ31dYCB3ZSB3b3VsZCByZXR1cm5cbi8vICAgICAgICAvLyAna29hbGEnLlxuLy8gICAgICAsIGV4dHJhY3Q6IGZ1bmN0aW9uKGFyZykgeyByZXR1cm4gYXJnLmNyeWluZzsgfVxuLy8gICAgfVxuZnV6enkuZmlsdGVyID0gZnVuY3Rpb24ocGF0dGVybiwgYXJyLCBvcHRzKSB7XG4gIGlmKCFhcnIgfHwgYXJyLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBpZiAodHlwZW9mIHBhdHRlcm4gIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGFycjtcbiAgfVxuICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgcmV0dXJuIGFyclxuICAgIC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgZWxlbWVudCwgaWR4LCBhcnIpIHtcbiAgICAgIHZhciBzdHIgPSBlbGVtZW50O1xuICAgICAgaWYob3B0cy5leHRyYWN0KSB7XG4gICAgICAgIHN0ciA9IG9wdHMuZXh0cmFjdChlbGVtZW50KTtcbiAgICAgIH1cbiAgICAgIHZhciByZW5kZXJlZCA9IGZ1enp5Lm1hdGNoKHBhdHRlcm4sIHN0ciwgb3B0cyk7XG4gICAgICBpZihyZW5kZXJlZCAhPSBudWxsKSB7XG4gICAgICAgIHByZXZbcHJldi5sZW5ndGhdID0ge1xuICAgICAgICAgICAgc3RyaW5nOiByZW5kZXJlZC5yZW5kZXJlZFxuICAgICAgICAgICwgc2NvcmU6IHJlbmRlcmVkLnNjb3JlXG4gICAgICAgICAgLCBpbmRleDogaWR4XG4gICAgICAgICAgLCBvcmlnaW5hbDogZWxlbWVudFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByZXY7XG4gICAgfSwgW10pXG5cbiAgICAvLyBTb3J0IGJ5IHNjb3JlLiBCcm93c2VycyBhcmUgaW5jb25zaXN0ZW50IHdydCBzdGFibGUvdW5zdGFibGVcbiAgICAvLyBzb3J0aW5nLCBzbyBmb3JjZSBzdGFibGUgYnkgdXNpbmcgdGhlIGluZGV4IGluIHRoZSBjYXNlIG9mIHRpZS5cbiAgICAvLyBTZWUgaHR0cDovL29mYi5uZXQvfnNldGhtbC9pcy1zb3J0LXN0YWJsZS5odG1sXG4gICAgLnNvcnQoZnVuY3Rpb24oYSxiKSB7XG4gICAgICB2YXIgY29tcGFyZSA9IGIuc2NvcmUgLSBhLnNjb3JlO1xuICAgICAgaWYoY29tcGFyZSkgcmV0dXJuIGNvbXBhcmU7XG4gICAgICByZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XG4gICAgfSk7XG59O1xuXG5cbn0oKSk7XG5cbiIsIi8qIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlLiBJdCBjb21lcyB3aXRob3V0IGFueSB3YXJyYW50eSwgdG9cbiAgICAgKiB0aGUgZXh0ZW50IHBlcm1pdHRlZCBieSBhcHBsaWNhYmxlIGxhdy4gWW91IGNhbiByZWRpc3RyaWJ1dGUgaXRcbiAgICAgKiBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRG8gV2hhdCBUaGUgRnVjayBZb3UgV2FudFxuICAgICAqIFRvIFB1YmxpYyBMaWNlbnNlLCBWZXJzaW9uIDIsIGFzIHB1Ymxpc2hlZCBieSBTYW0gSG9jZXZhci4gU2VlXG4gICAgICogaHR0cDovL3d3dy53dGZwbC5uZXQvIGZvciBtb3JlIGRldGFpbHMuICovXG4ndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGxlZnRQYWQ7XG5cbnZhciBjYWNoZSA9IFtcbiAgJycsXG4gICcgJyxcbiAgJyAgJyxcbiAgJyAgICcsXG4gICcgICAgJyxcbiAgJyAgICAgJyxcbiAgJyAgICAgICcsXG4gICcgICAgICAgJyxcbiAgJyAgICAgICAgJyxcbiAgJyAgICAgICAgICdcbl07XG5cbmZ1bmN0aW9uIGxlZnRQYWQgKHN0ciwgbGVuLCBjaCkge1xuICAvLyBjb252ZXJ0IGBzdHJgIHRvIGBzdHJpbmdgXG4gIHN0ciA9IHN0ciArICcnO1xuICAvLyBgbGVuYCBpcyB0aGUgYHBhZGAncyBsZW5ndGggbm93XG4gIGxlbiA9IGxlbiAtIHN0ci5sZW5ndGg7XG4gIC8vIGRvZXNuJ3QgbmVlZCB0byBwYWRcbiAgaWYgKGxlbiA8PSAwKSByZXR1cm4gc3RyO1xuICAvLyBgY2hgIGRlZmF1bHRzIHRvIGAnICdgXG4gIGlmICghY2ggJiYgY2ggIT09IDApIGNoID0gJyAnO1xuICAvLyBjb252ZXJ0IGBjaGAgdG8gYHN0cmluZ2BcbiAgY2ggPSBjaCArICcnO1xuICAvLyBjYWNoZSBjb21tb24gdXNlIGNhc2VzXG4gIGlmIChjaCA9PT0gJyAnICYmIGxlbiA8IDEwKSByZXR1cm4gY2FjaGVbbGVuXSArIHN0cjtcbiAgLy8gYHBhZGAgc3RhcnRzIHdpdGggYW4gZW1wdHkgc3RyaW5nXG4gIHZhciBwYWQgPSAnJztcbiAgLy8gbG9vcFxuICB3aGlsZSAodHJ1ZSkge1xuICAgIC8vIGFkZCBgY2hgIHRvIGBwYWRgIGlmIGBsZW5gIGlzIG9kZFxuICAgIGlmIChsZW4gJiAxKSBwYWQgKz0gY2g7XG4gICAgLy8gZGl2aWRlIGBsZW5gIGJ5IDIsIGRpdGNoIHRoZSByZW1haW5kZXJcbiAgICBsZW4gPj49IDE7XG4gICAgLy8gXCJkb3VibGVcIiB0aGUgYGNoYCBzbyB0aGlzIG9wZXJhdGlvbiBjb3VudCBncm93cyBsb2dhcml0aG1pY2FsbHkgb24gYGxlbmBcbiAgICAvLyBlYWNoIHRpbWUgYGNoYCBpcyBcImRvdWJsZWRcIiwgdGhlIGBsZW5gIHdvdWxkIG5lZWQgdG8gYmUgXCJkb3VibGVkXCIgdG9vXG4gICAgLy8gc2ltaWxhciB0byBmaW5kaW5nIGEgdmFsdWUgaW4gYmluYXJ5IHNlYXJjaCB0cmVlLCBoZW5jZSBPKGxvZyhuKSlcbiAgICBpZiAobGVuKSBjaCArPSBjaDtcbiAgICAvLyBgbGVuYCBpcyAwLCBleGl0IHRoZSBsb29wXG4gICAgZWxzZSBicmVhaztcbiAgfVxuICAvLyBwYWQgYHN0cmAhXG4gIHJldHVybiBwYWQgKyBzdHI7XG59XG4iLCIvKlxuICogc21vb3Roc2Nyb2xsIHBvbHlmaWxsIC0gdjAuMy40XG4gKiBodHRwczovL2lhbWR1c3Rhbi5naXRodWIuaW8vc21vb3Roc2Nyb2xsXG4gKiAyMDE2IChjKSBEdXN0YW4gS2FzdGVuLCBKZXJlbWlhcyBNZW5pY2hlbGxpIC0gTUlUIExpY2Vuc2VcbiAqL1xuXG4oZnVuY3Rpb24odywgZCwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKlxuICAgKiBhbGlhc2VzXG4gICAqIHc6IHdpbmRvdyBnbG9iYWwgb2JqZWN0XG4gICAqIGQ6IGRvY3VtZW50XG4gICAqIHVuZGVmaW5lZDogdW5kZWZpbmVkXG4gICAqL1xuXG4gIC8vIHBvbHlmaWxsXG4gIGZ1bmN0aW9uIHBvbHlmaWxsKCkge1xuICAgIC8vIHJldHVybiB3aGVuIHNjcm9sbEJlaGF2aW9yIGludGVyZmFjZSBpcyBzdXBwb3J0ZWRcbiAgICBpZiAoJ3Njcm9sbEJlaGF2aW9yJyBpbiBkLmRvY3VtZW50RWxlbWVudC5zdHlsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogZ2xvYmFsc1xuICAgICAqL1xuICAgIHZhciBFbGVtZW50ID0gdy5IVE1MRWxlbWVudCB8fCB3LkVsZW1lbnQ7XG4gICAgdmFyIFNDUk9MTF9USU1FID0gNDY4O1xuXG4gICAgLypcbiAgICAgKiBvYmplY3QgZ2F0aGVyaW5nIG9yaWdpbmFsIHNjcm9sbCBtZXRob2RzXG4gICAgICovXG4gICAgdmFyIG9yaWdpbmFsID0ge1xuICAgICAgc2Nyb2xsOiB3LnNjcm9sbCB8fCB3LnNjcm9sbFRvLFxuICAgICAgc2Nyb2xsQnk6IHcuc2Nyb2xsQnksXG4gICAgICBzY3JvbGxJbnRvVmlldzogRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXdcbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBkZWZpbmUgdGltaW5nIG1ldGhvZFxuICAgICAqL1xuICAgIHZhciBub3cgPSB3LnBlcmZvcm1hbmNlICYmIHcucGVyZm9ybWFuY2Uubm93XG4gICAgICA/IHcucGVyZm9ybWFuY2Uubm93LmJpbmQody5wZXJmb3JtYW5jZSkgOiBEYXRlLm5vdztcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZXMgc2Nyb2xsIHBvc2l0aW9uIGluc2lkZSBhbiBlbGVtZW50XG4gICAgICogQG1ldGhvZCBzY3JvbGxFbGVtZW50XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNjcm9sbEVsZW1lbnQoeCwgeSkge1xuICAgICAgdGhpcy5zY3JvbGxMZWZ0ID0geDtcbiAgICAgIHRoaXMuc2Nyb2xsVG9wID0geTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIHJlc3VsdCBvZiBhcHBseWluZyBlYXNlIG1hdGggZnVuY3Rpb24gdG8gYSBudW1iZXJcbiAgICAgKiBAbWV0aG9kIGVhc2VcbiAgICAgKiBAcGFyYW0ge051bWJlcn0ga1xuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZnVuY3Rpb24gZWFzZShrKSB7XG4gICAgICByZXR1cm4gMC41ICogKDEgLSBNYXRoLmNvcyhNYXRoLlBJICogaykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGluZGljYXRlcyBpZiBhIHNtb290aCBiZWhhdmlvciBzaG91bGQgYmUgYXBwbGllZFxuICAgICAqIEBtZXRob2Qgc2hvdWxkQmFpbE91dFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfE9iamVjdH0geFxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNob3VsZEJhaWxPdXQoeCkge1xuICAgICAgaWYgKHR5cGVvZiB4ICE9PSAnb2JqZWN0J1xuICAgICAgICAgICAgfHwgeCA9PT0gbnVsbFxuICAgICAgICAgICAgfHwgeC5iZWhhdmlvciA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICB8fCB4LmJlaGF2aW9yID09PSAnYXV0bydcbiAgICAgICAgICAgIHx8IHguYmVoYXZpb3IgPT09ICdpbnN0YW50Jykge1xuICAgICAgICAvLyBmaXJzdCBhcmcgbm90IGFuIG9iamVjdC9udWxsXG4gICAgICAgIC8vIG9yIGJlaGF2aW9yIGlzIGF1dG8sIGluc3RhbnQgb3IgdW5kZWZpbmVkXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHggPT09ICdvYmplY3QnXG4gICAgICAgICAgICAmJiB4LmJlaGF2aW9yID09PSAnc21vb3RoJykge1xuICAgICAgICAvLyBmaXJzdCBhcmd1bWVudCBpcyBhbiBvYmplY3QgYW5kIGJlaGF2aW9yIGlzIHNtb290aFxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIHRocm93IGVycm9yIHdoZW4gYmVoYXZpb3IgaXMgbm90IHN1cHBvcnRlZFxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYmVoYXZpb3Igbm90IHZhbGlkJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogZmluZHMgc2Nyb2xsYWJsZSBwYXJlbnQgb2YgYW4gZWxlbWVudFxuICAgICAqIEBtZXRob2QgZmluZFNjcm9sbGFibGVQYXJlbnRcbiAgICAgKiBAcGFyYW0ge05vZGV9IGVsXG4gICAgICogQHJldHVybnMge05vZGV9IGVsXG4gICAgICovXG4gICAgZnVuY3Rpb24gZmluZFNjcm9sbGFibGVQYXJlbnQoZWwpIHtcbiAgICAgIHZhciBpc0JvZHk7XG4gICAgICB2YXIgaGFzU2Nyb2xsYWJsZVNwYWNlO1xuICAgICAgdmFyIGhhc1Zpc2libGVPdmVyZmxvdztcblxuICAgICAgZG8ge1xuICAgICAgICBlbCA9IGVsLnBhcmVudE5vZGU7XG5cbiAgICAgICAgLy8gc2V0IGNvbmRpdGlvbiB2YXJpYWJsZXNcbiAgICAgICAgaXNCb2R5ID0gZWwgPT09IGQuYm9keTtcbiAgICAgICAgaGFzU2Nyb2xsYWJsZVNwYWNlID1cbiAgICAgICAgICBlbC5jbGllbnRIZWlnaHQgPCBlbC5zY3JvbGxIZWlnaHQgfHxcbiAgICAgICAgICBlbC5jbGllbnRXaWR0aCA8IGVsLnNjcm9sbFdpZHRoO1xuICAgICAgICBoYXNWaXNpYmxlT3ZlcmZsb3cgPVxuICAgICAgICAgIHcuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbCkub3ZlcmZsb3cgPT09ICd2aXNpYmxlJztcbiAgICAgIH0gd2hpbGUgKCFpc0JvZHkgJiYgIShoYXNTY3JvbGxhYmxlU3BhY2UgJiYgIWhhc1Zpc2libGVPdmVyZmxvdykpO1xuXG4gICAgICBpc0JvZHkgPSBoYXNTY3JvbGxhYmxlU3BhY2UgPSBoYXNWaXNpYmxlT3ZlcmZsb3cgPSBudWxsO1xuXG4gICAgICByZXR1cm4gZWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc2VsZiBpbnZva2VkIGZ1bmN0aW9uIHRoYXQsIGdpdmVuIGEgY29udGV4dCwgc3RlcHMgdGhyb3VnaCBzY3JvbGxpbmdcbiAgICAgKiBAbWV0aG9kIHN0ZXBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHN0ZXAoY29udGV4dCkge1xuICAgICAgLy8gY2FsbCBtZXRob2QgYWdhaW4gb24gbmV4dCBhdmFpbGFibGUgZnJhbWVcbiAgICAgIGNvbnRleHQuZnJhbWUgPSB3LnJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwLmJpbmQodywgY29udGV4dCkpO1xuXG4gICAgICB2YXIgdGltZSA9IG5vdygpO1xuICAgICAgdmFyIHZhbHVlO1xuICAgICAgdmFyIGN1cnJlbnRYO1xuICAgICAgdmFyIGN1cnJlbnRZO1xuICAgICAgdmFyIGVsYXBzZWQgPSAodGltZSAtIGNvbnRleHQuc3RhcnRUaW1lKSAvIFNDUk9MTF9USU1FO1xuXG4gICAgICAvLyBhdm9pZCBlbGFwc2VkIHRpbWVzIGhpZ2hlciB0aGFuIG9uZVxuICAgICAgZWxhcHNlZCA9IGVsYXBzZWQgPiAxID8gMSA6IGVsYXBzZWQ7XG5cbiAgICAgIC8vIGFwcGx5IGVhc2luZyB0byBlbGFwc2VkIHRpbWVcbiAgICAgIHZhbHVlID0gZWFzZShlbGFwc2VkKTtcblxuICAgICAgY3VycmVudFggPSBjb250ZXh0LnN0YXJ0WCArIChjb250ZXh0LnggLSBjb250ZXh0LnN0YXJ0WCkgKiB2YWx1ZTtcbiAgICAgIGN1cnJlbnRZID0gY29udGV4dC5zdGFydFkgKyAoY29udGV4dC55IC0gY29udGV4dC5zdGFydFkpICogdmFsdWU7XG5cbiAgICAgIGNvbnRleHQubWV0aG9kLmNhbGwoY29udGV4dC5zY3JvbGxhYmxlLCBjdXJyZW50WCwgY3VycmVudFkpO1xuXG4gICAgICAvLyByZXR1cm4gd2hlbiBlbmQgcG9pbnRzIGhhdmUgYmVlbiByZWFjaGVkXG4gICAgICBpZiAoY3VycmVudFggPT09IGNvbnRleHQueCAmJiBjdXJyZW50WSA9PT0gY29udGV4dC55KSB7XG4gICAgICAgIHcuY2FuY2VsQW5pbWF0aW9uRnJhbWUoY29udGV4dC5mcmFtZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzY3JvbGxzIHdpbmRvdyB3aXRoIGEgc21vb3RoIGJlaGF2aW9yXG4gICAgICogQG1ldGhvZCBzbW9vdGhTY3JvbGxcbiAgICAgKiBAcGFyYW0ge09iamVjdHxOb2RlfSBlbFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzbW9vdGhTY3JvbGwoZWwsIHgsIHkpIHtcbiAgICAgIHZhciBzY3JvbGxhYmxlO1xuICAgICAgdmFyIHN0YXJ0WDtcbiAgICAgIHZhciBzdGFydFk7XG4gICAgICB2YXIgbWV0aG9kO1xuICAgICAgdmFyIHN0YXJ0VGltZSA9IG5vdygpO1xuICAgICAgdmFyIGZyYW1lO1xuXG4gICAgICAvLyBkZWZpbmUgc2Nyb2xsIGNvbnRleHRcbiAgICAgIGlmIChlbCA9PT0gZC5ib2R5KSB7XG4gICAgICAgIHNjcm9sbGFibGUgPSB3O1xuICAgICAgICBzdGFydFggPSB3LnNjcm9sbFggfHwgdy5wYWdlWE9mZnNldDtcbiAgICAgICAgc3RhcnRZID0gdy5zY3JvbGxZIHx8IHcucGFnZVlPZmZzZXQ7XG4gICAgICAgIG1ldGhvZCA9IG9yaWdpbmFsLnNjcm9sbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjcm9sbGFibGUgPSBlbDtcbiAgICAgICAgc3RhcnRYID0gZWwuc2Nyb2xsTGVmdDtcbiAgICAgICAgc3RhcnRZID0gZWwuc2Nyb2xsVG9wO1xuICAgICAgICBtZXRob2QgPSBzY3JvbGxFbGVtZW50O1xuICAgICAgfVxuXG4gICAgICAvLyBjYW5jZWwgZnJhbWUgd2hlbiBhIHNjcm9sbCBldmVudCdzIGhhcHBlbmluZ1xuICAgICAgaWYgKGZyYW1lKSB7XG4gICAgICAgIHcuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xuICAgICAgfVxuXG4gICAgICAvLyBzY3JvbGwgbG9vcGluZyBvdmVyIGEgZnJhbWVcbiAgICAgIHN0ZXAoe1xuICAgICAgICBzY3JvbGxhYmxlOiBzY3JvbGxhYmxlLFxuICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgc3RhcnRUaW1lOiBzdGFydFRpbWUsXG4gICAgICAgIHN0YXJ0WDogc3RhcnRYLFxuICAgICAgICBzdGFydFk6IHN0YXJ0WSxcbiAgICAgICAgeDogeCxcbiAgICAgICAgeTogeSxcbiAgICAgICAgZnJhbWU6IGZyYW1lXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIE9SSUdJTkFMIE1FVEhPRFMgT1ZFUlJJREVTXG4gICAgICovXG5cbiAgICAvLyB3LnNjcm9sbCBhbmQgdy5zY3JvbGxUb1xuICAgIHcuc2Nyb2xsID0gdy5zY3JvbGxUbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYXZvaWQgc21vb3RoIGJlaGF2aW9yIGlmIG5vdCByZXF1aXJlZFxuICAgICAgaWYgKHNob3VsZEJhaWxPdXQoYXJndW1lbnRzWzBdKSkge1xuICAgICAgICBvcmlnaW5hbC5zY3JvbGwuY2FsbChcbiAgICAgICAgICB3LFxuICAgICAgICAgIGFyZ3VtZW50c1swXS5sZWZ0IHx8IGFyZ3VtZW50c1swXSxcbiAgICAgICAgICBhcmd1bWVudHNbMF0udG9wIHx8IGFyZ3VtZW50c1sxXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIExFVCBUSEUgU01PT1RITkVTUyBCRUdJTiFcbiAgICAgIHNtb290aFNjcm9sbC5jYWxsKFxuICAgICAgICB3LFxuICAgICAgICBkLmJvZHksXG4gICAgICAgIH5+YXJndW1lbnRzWzBdLmxlZnQsXG4gICAgICAgIH5+YXJndW1lbnRzWzBdLnRvcFxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgLy8gdy5zY3JvbGxCeVxuICAgIHcuc2Nyb2xsQnkgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGF2b2lkIHNtb290aCBiZWhhdmlvciBpZiBub3QgcmVxdWlyZWRcbiAgICAgIGlmIChzaG91bGRCYWlsT3V0KGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgb3JpZ2luYWwuc2Nyb2xsQnkuY2FsbChcbiAgICAgICAgICB3LFxuICAgICAgICAgIGFyZ3VtZW50c1swXS5sZWZ0IHx8IGFyZ3VtZW50c1swXSxcbiAgICAgICAgICBhcmd1bWVudHNbMF0udG9wIHx8IGFyZ3VtZW50c1sxXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIExFVCBUSEUgU01PT1RITkVTUyBCRUdJTiFcbiAgICAgIHNtb290aFNjcm9sbC5jYWxsKFxuICAgICAgICB3LFxuICAgICAgICBkLmJvZHksXG4gICAgICAgIH5+YXJndW1lbnRzWzBdLmxlZnQgKyAody5zY3JvbGxYIHx8IHcucGFnZVhPZmZzZXQpLFxuICAgICAgICB+fmFyZ3VtZW50c1swXS50b3AgKyAody5zY3JvbGxZIHx8IHcucGFnZVlPZmZzZXQpXG4gICAgICApO1xuICAgIH07XG5cbiAgICAvLyBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxJbnRvVmlld1xuICAgIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3ID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCBzbW9vdGggYmVoYXZpb3IgaWYgbm90IHJlcXVpcmVkXG4gICAgICBpZiAoc2hvdWxkQmFpbE91dChhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIG9yaWdpbmFsLnNjcm9sbEludG9WaWV3LmNhbGwodGhpcywgYXJndW1lbnRzWzBdIHx8IHRydWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIExFVCBUSEUgU01PT1RITkVTUyBCRUdJTiFcbiAgICAgIHZhciBzY3JvbGxhYmxlUGFyZW50ID0gZmluZFNjcm9sbGFibGVQYXJlbnQodGhpcyk7XG4gICAgICB2YXIgcGFyZW50UmVjdHMgPSBzY3JvbGxhYmxlUGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgdmFyIGNsaWVudFJlY3RzID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgaWYgKHNjcm9sbGFibGVQYXJlbnQgIT09IGQuYm9keSkge1xuICAgICAgICAvLyByZXZlYWwgZWxlbWVudCBpbnNpZGUgcGFyZW50XG4gICAgICAgIHNtb290aFNjcm9sbC5jYWxsKFxuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgc2Nyb2xsYWJsZVBhcmVudCxcbiAgICAgICAgICBzY3JvbGxhYmxlUGFyZW50LnNjcm9sbExlZnQgKyBjbGllbnRSZWN0cy5sZWZ0IC0gcGFyZW50UmVjdHMubGVmdCxcbiAgICAgICAgICBzY3JvbGxhYmxlUGFyZW50LnNjcm9sbFRvcCArIGNsaWVudFJlY3RzLnRvcCAtIHBhcmVudFJlY3RzLnRvcFxuICAgICAgICApO1xuICAgICAgICAvLyByZXZlYWwgcGFyZW50IGluIHZpZXdwb3J0XG4gICAgICAgIHcuc2Nyb2xsQnkoe1xuICAgICAgICAgIGxlZnQ6IHBhcmVudFJlY3RzLmxlZnQsXG4gICAgICAgICAgdG9wOiBwYXJlbnRSZWN0cy50b3AsXG4gICAgICAgICAgYmVoYXZpb3I6ICdzbW9vdGgnXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmV2ZWFsIGVsZW1lbnQgaW4gdmlld3BvcnRcbiAgICAgICAgdy5zY3JvbGxCeSh7XG4gICAgICAgICAgbGVmdDogY2xpZW50UmVjdHMubGVmdCxcbiAgICAgICAgICB0b3A6IGNsaWVudFJlY3RzLnRvcCxcbiAgICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBjb21tb25qc1xuICAgIG1vZHVsZS5leHBvcnRzID0geyBwb2x5ZmlsbDogcG9seWZpbGwgfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBnbG9iYWxcbiAgICBwb2x5ZmlsbCgpO1xuICB9XG59KSh3aW5kb3csIGRvY3VtZW50KTtcbiIsIi8qIGdsb2JhbCBnYSAqL1xuXG5jb25zdCBzZWxmID0ge31cblxuc2VsZi5zZW5kID0ge31cblxuc2VsZi5zZW5kLnNlYXJjaCA9IGZ1bmN0aW9uIChzZWxlY3RlZFVzZXIsIGZhdm9yaXRlKSB7XG4gIGNvbnN0IGhpdFR5cGUgPSAnZXZlbnQnXG5cbiAgY29uc3QgZXZlbnRDYXRlZ29yeSA9IGZhdm9yaXRlID8gJ3NlYXJjaCBmYXYnIDogJ3NlYXJjaCdcblxuICBsZXQgZXZlbnRBY3Rpb25cbiAgc3dpdGNoIChzZWxlY3RlZFVzZXIudHlwZSkge1xuICAgIGNhc2UgJ2MnOlxuICAgICAgZXZlbnRBY3Rpb24gPSAnQ2xhc3MnXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3QnOlxuICAgICAgZXZlbnRBY3Rpb24gPSAnVGVhY2hlcidcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAncic6XG4gICAgICBldmVudEFjdGlvbiA9ICdSb29tJ1xuICAgICAgYnJlYWtcbiAgICBjYXNlICdzJzpcbiAgICAgIGV2ZW50QWN0aW9uID0gJ1N0dWRlbnQnXG4gICAgICBicmVha1xuICB9XG5cbiAgY29uc3QgZXZlbnRMYWJlbCA9IHNlbGVjdGVkVXNlci52YWx1ZVxuXG4gIGdhKGZ1bmN0aW9uICgpIHtcbiAgICBnYSgnc2VuZCcsIHsgaGl0VHlwZSwgZXZlbnRDYXRlZ29yeSwgZXZlbnRBY3Rpb24sIGV2ZW50TGFiZWwgfSlcbiAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJjb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuXG5jb25zdCBzZWxmID0gbmV3IEV2ZW50RW1pdHRlcigpXG5cbnNlbGYuX3VzZXJzID0gW11cbnNlbGYuX3NlbGVjdGVkVXNlckluZGV4ID0gLTFcblxuc2VsZi5fbm9kZXMgPSB7XG4gIHNlYXJjaDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NlYXJjaCcpLFxuICBpbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpLFxuICBhdXRvY29tcGxldGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUnKVxufVxuXG5zZWxmLmdldFNlbGVjdGVkVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHNlbGYuZ2V0SXRlbXMoKSA9PT0gW10pIHJldHVyblxuXG4gIGlmIChzZWxmLmdldFNlbGVjdGVkVXNlckluZGV4KCkgPT09IC0xKSB7XG4gICAgcmV0dXJuIHNlbGYuZ2V0SXRlbXMoKVswXVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBzZWxmLmdldEl0ZW1zKClbc2VsZi5nZXRTZWxlY3RlZFVzZXJJbmRleCgpXVxuICB9XG59XG5cbnNlbGYuZ2V0U2VsZWN0ZWRVc2VySW5kZXggPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBzZWxmLl9zZWxlY3RlZFVzZXJJbmRleFxufVxuXG5zZWxmLmdldEl0ZW1zID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gc2VsZi5fdXNlcnNcbn1cblxuc2VsZi5yZW1vdmVBbGxJdGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgd2hpbGUgKHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5maXJzdENoaWxkKSB7XG4gICAgc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLnJlbW92ZUNoaWxkKHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5maXJzdENoaWxkKVxuICB9XG4gIHNlbGYuX3VzZXJzID0gW11cbiAgc2VsZi5fc2VsZWN0ZWRVc2VySW5kZXggPSAtMVxufVxuXG5zZWxmLmFkZEl0ZW0gPSBmdW5jdGlvbiAodXNlcikge1xuICBjb25zdCBsaXN0SXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgbGlzdEl0ZW0udGV4dENvbnRlbnQgPSB1c2VyLnZhbHVlXG4gIHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5hcHBlbmRDaGlsZChsaXN0SXRlbSlcbiAgc2VsZi5fdXNlcnMucHVzaCh1c2VyKVxufVxuXG5zZWxmLl9tb3ZlU2VsZWN0ZWQgPSBmdW5jdGlvbiAoc2hpZnQpIHtcbiAgaWYgKHNlbGYuX3NlbGVjdGVkVXNlckluZGV4ICsgc2hpZnQgPj0gc2VsZi5nZXRJdGVtcygpLmxlbmd0aCkge1xuICAgIHNlbGYuX3NlbGVjdGVkVXNlckluZGV4ID0gLTFcbiAgfSBlbHNlIGlmIChzZWxmLl9zZWxlY3RlZFVzZXJJbmRleCArIHNoaWZ0IDwgLTEpIHtcbiAgICBzZWxmLl9zZWxlY3RlZFVzZXJJbmRleCA9IHNlbGYuZ2V0SXRlbXMoKS5sZW5ndGggLSAxXG4gIH0gZWxzZSB7XG4gICAgc2VsZi5fc2VsZWN0ZWRVc2VySW5kZXggKz0gc2hpZnRcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZi5nZXRJdGVtcygpLmxlbmd0aDsgaSsrKSB7XG4gICAgc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmNoaWxkcmVuW2ldLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJylcbiAgfVxuICBpZiAoc2VsZi5fc2VsZWN0ZWRVc2VySW5kZXggPj0gMCkge1xuICAgIHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZVxuICAgICAgICAuY2hpbGRyZW5bc2VsZi5fc2VsZWN0ZWRVc2VySW5kZXhdLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJylcbiAgfVxufVxuXG5zZWxmLl9oYW5kbGVJdGVtQ2xpY2sgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgaWYgKCFzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgcmV0dXJuXG4gIGNvbnN0IHVzZXJJbmRleCA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mXG4gICAgICAuY2FsbChzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuY2hpbGRyZW4sIGV2ZW50LnRhcmdldClcbiAgc2VsZi5fc2VsZWN0ZWRVc2VySW5kZXggPSB1c2VySW5kZXhcbiAgc2VsZi5lbWl0KCdzZWxlY3QnLCBzZWxmLmdldFNlbGVjdGVkVXNlcigpKVxufVxuXG5zZWxmLl9oYW5kbGVLZXlkb3duID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGlmIChldmVudC5rZXkgPT09ICdBcnJvd0Rvd24nIHx8IGV2ZW50LmtleSA9PT0gJ0Fycm93VXAnKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGlmIChldmVudC5rZXkgPT09ICdBcnJvd0Rvd24nKSB7XG4gICAgICBzZWxmLl9tb3ZlU2VsZWN0ZWQoMSlcbiAgICB9IGVsc2UgaWYgKGV2ZW50LmtleSA9PT0gJ0Fycm93VXAnKSB7XG4gICAgICBzZWxmLl9tb3ZlU2VsZWN0ZWQoLTEpXG4gICAgfVxuICB9XG59XG5cbnNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlbGYuX2hhbmRsZUl0ZW1DbGljaylcbnNlbGYuX25vZGVzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBzZWxmLl9oYW5kbGVLZXlkb3duKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsImNvbnN0IHNlbGYgPSB7fVxuXG5zZWxmLmlzSUUgPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ01TSUUnKSAhPT0gLTEgfHxcbiAgICAgICAgICAgIG5hdmlnYXRvci5hcHBWZXJzaW9uLmluZGV4T2YoJ1RyaWRlbnQvJykgPiAwXG5cbmlmIChzZWxmLmlzSUUpIHtcbiAgc2VsZi5pbnB1dEV2ZW50ID0gJ3RleHRpbnB1dCdcbn0gZWxzZSB7XG4gIHNlbGYuaW5wdXRFdmVudCA9ICdpbnB1dCdcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCIvKiBnbG9iYWwgVVNFUlMgKi9cblxuY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJylcblxuY29uc3Qgc2VsZiA9IG5ldyBFdmVudEVtaXR0ZXIoKVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgdG9nZ2xlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZmF2Jylcbn1cblxuc2VsZi5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgbG9jYWxTdG9yYWdlVXNlciA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdmYXYnKSlcbiAgICBpZiAobG9jYWxTdG9yYWdlVXNlciA9PSBudWxsKSByZXR1cm5cblxuICAgIGNvbnN0IGNvcnJlY3RlZFVzZXIgPSBVU0VSUy5maWx0ZXIoZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgIHJldHVybiB1c2VyLnR5cGUgPT09IGxvY2FsU3RvcmFnZVVzZXIudHlwZSAmJlxuICAgICAgICAgICAgIHVzZXIudmFsdWUgPT09IGxvY2FsU3RvcmFnZVVzZXIudmFsdWVcbiAgICB9KVswXVxuICAgIHJldHVybiBjb3JyZWN0ZWRVc2VyXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzZWxmLmRlbGV0ZSgpXG4gICAgcmV0dXJuXG4gIH1cbn1cblxuc2VsZi5zZXQgPSBmdW5jdGlvbiAodXNlcikge1xuICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2ZhdicsIEpTT04uc3RyaW5naWZ5KHVzZXIpKVxuICBzZWxmLl9ub2Rlcy5pbm5lckhUTUwgPSAnJiN4RTgzODsnXG59XG5cbnNlbGYuZGVsZXRlID0gZnVuY3Rpb24gKCkge1xuICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2ZhdicpXG59XG5cbnNlbGYudXBkYXRlRG9tID0gZnVuY3Rpb24gKGlzRmF2b3JpdGUpIHtcbiAgaWYgKGlzRmF2b3JpdGUpIHtcbiAgICBzZWxmLl9ub2Rlcy50b2dnbGUuaW5uZXJIVE1MID0gJyYjeEU4Mzg7J1xuICB9IGVsc2Uge1xuICAgIHNlbGYuX25vZGVzLnRvZ2dsZS5pbm5lckhUTUwgPSAnJiN4RTgzQSdcbiAgfVxufVxuXG5zZWxmLnVwZGF0ZSA9IGZ1bmN0aW9uIChzZWxlY3RlZFVzZXIpIHtcbiAgY29uc3QgY3VycmVudFVzZXIgPSBzZWxmLmdldCgpXG5cbiAgaWYgKGN1cnJlbnRVc2VyID09IG51bGwgfHwgc2VsZWN0ZWRVc2VyID09IG51bGwpIHtcbiAgICBzZWxmLnVwZGF0ZURvbShmYWxzZSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbnN0IGlzRXF1YWwgPSBjdXJyZW50VXNlci50eXBlID09PSBzZWxlY3RlZFVzZXIudHlwZSAmJlxuICAgICAgICAgICAgICAgICAgY3VycmVudFVzZXIuaW5kZXggPT09IHNlbGVjdGVkVXNlci5pbmRleFxuXG4gIHNlbGYudXBkYXRlRG9tKGlzRXF1YWwpXG59XG5cbnNlbGYudG9nZ2xlID0gZnVuY3Rpb24gKHNlbGVjdGVkVXNlcikge1xuICBjb25zdCBjdXJyZW50VXNlciA9IHNlbGYuZ2V0KClcbiAgY29uc3QgaXNFcXVhbCA9IGN1cnJlbnRVc2VyICE9IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRVc2VyLnR5cGUgPT09IHNlbGVjdGVkVXNlci50eXBlICYmXG4gICAgICAgICAgICAgICAgICBjdXJyZW50VXNlci5pbmRleCA9PT0gc2VsZWN0ZWRVc2VyLmluZGV4XG5cbiAgaWYgKGlzRXF1YWwpIHtcbiAgICBzZWxmLmRlbGV0ZSgpXG4gICAgc2VsZi51cGRhdGVEb20oZmFsc2UpXG4gIH0gZWxzZSB7XG4gICAgc2VsZi5zZXQoc2VsZWN0ZWRVc2VyKVxuICAgIHNlbGYudXBkYXRlRG9tKHRydWUpXG4gIH1cbn1cblxuc2VsZi5faGFuZGxlQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHNlbGYuZW1pdCgnY2xpY2snKVxufVxuXG5zZWxmLl9ub2Rlcy50b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxmLl9oYW5kbGVDbGljaylcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCIvKiBnbG9iYWwgRkxBR1MgKi9cblxuY29uc3Qgc2VsZiA9IHt9XG5cbnNlbGYuX25vZGVzID0ge1xuICBpbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpLFxuICBvdmVyZmxvd0J1dHRvbjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI292ZXJmbG93LWJ1dHRvbicpXG59XG5cbnNlbGYuX3Nob3VsZENoZWNrID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gRkxBR1MuaW5kZXhPZignTk9fRkVBVFVSRV9ERVRFQ1QnKSA9PT0gLTFcbn1cblxuc2VsZi5fcmVkaXJlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJ2h0dHA6Ly93d3cubWVldGluZ3BvaW50bWNvLm5sL1Jvb3N0ZXJzLUFML2RvYy8nXG59XG5cbnNlbGYuY2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghc2VsZi5fc2hvdWxkQ2hlY2soKSkgcmV0dXJuXG5cbiAgd2luZG93Lm9uZXJyb3IgPSBzZWxmLl9yZWRpcmVjdFxuXG4gIGlmIChzZWxmLl9ub2Rlcy5pbnB1dC5nZXRDbGllbnRSZWN0cygpWzBdLnRvcCAhPT1cbiAgICAgIHNlbGYuX25vZGVzLm92ZXJmbG93QnV0dG9uLmdldENsaWVudFJlY3RzKClbMF0udG9wKSB7XG4gICAgc2VsZi5fcmVkaXJlY3QoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwiY29uc3QgYnJvd3NlckZpeFRvb2xraXQgPSByZXF1aXJlKCcuL2Jyb3dzZXJGaXhUb29sa2l0JylcblxuY29uc3Qgc2VsZiA9IHt9XG5cbnNlbGYuX25vZGVzID0ge1xuICBpbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpXG59XG5cbnNlbGYuaXNTaG93biA9IGZhbHNlXG5cbnNlbGYuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCduby1pbnB1dCcpXG4gIHNlbGYuaXNTaG93biA9IHRydWVcbn1cblxuc2VsZi5oaWRlID0gZnVuY3Rpb24gKCkge1xuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ25vLWlucHV0JylcbiAgc2VsZi5pc1Nob3duID0gZmFsc2Vcbn1cblxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihicm93c2VyRml4VG9vbGtpdC5pbnB1dEV2ZW50LCBzZWxmLmhpZGUpXG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwicmVxdWlyZSgnLi9mZWF0dXJlRGV0ZWN0JykuY2hlY2soKVxuXG5jb25zdCBmcm9udHBhZ2UgPSByZXF1aXJlKCcuL2Zyb250cGFnZScpXG5jb25zdCBzZWFyY2ggPSByZXF1aXJlKCcuL3NlYXJjaCcpXG5jb25zdCBzY2hlZHVsZSA9IHJlcXVpcmUoJy4vc2NoZWR1bGUnKVxuY29uc3Qgd2Vla1NlbGVjdG9yID0gcmVxdWlyZSgnLi93ZWVrU2VsZWN0b3InKVxuY29uc3QgZmF2b3JpdGUgPSByZXF1aXJlKCcuL2Zhdm9yaXRlJylcbmNvbnN0IHNjcm9sbFNuYXAgPSByZXF1aXJlKCcuL3Njcm9sbFNuYXAnKVxuY29uc3QgYW5hbHl0aWNzID0gcmVxdWlyZSgnLi9hbmFseXRpY3MnKVxuY29uc3QgdXJsID0gcmVxdWlyZSgnLi91cmwnKVxuXG5jb25zdCBzdGF0ZSA9IHt9XG5cbndpbmRvdy5zdGF0ZSA9IHN0YXRlXG53aW5kb3cucmVxdWlyZSA9IHJlcXVpcmVcblxuZnJvbnRwYWdlLnNob3coKVxud2Vla1NlbGVjdG9yLnVwZGF0ZUN1cnJlbnRXZWVrKClcbnNjcm9sbFNuYXAuc3RhcnRMaXN0ZW5pbmcoKVxuXG5pZiAodXJsLmhhc1NlbGVjdGVkVXNlcigpKSB7XG4gIHN0YXRlLnNlbGVjdGVkVXNlciA9IHVybC5nZXRTZWxlY3RlZFVzZXIoKVxuXG4gIGZhdm9yaXRlLnVwZGF0ZShzdGF0ZS5zZWxlY3RlZFVzZXIpXG4gIHVybC51cGRhdGUoc3RhdGUuc2VsZWN0ZWRVc2VyKVxuICBhbmFseXRpY3Muc2VuZC5zZWFyY2goc3RhdGUuc2VsZWN0ZWRVc2VyKVxuXG4gIHNjaGVkdWxlLnZpZXdJdGVtKHdlZWtTZWxlY3Rvci5nZXRTZWxlY3RlZFdlZWsoKSwgc3RhdGUuc2VsZWN0ZWRVc2VyKVxufSBlbHNlIGlmIChmYXZvcml0ZS5nZXQoKSAhPSBudWxsKSB7XG4gIHN0YXRlLnNlbGVjdGVkVXNlciA9IGZhdm9yaXRlLmdldCgpXG5cbiAgZmF2b3JpdGUudXBkYXRlKHN0YXRlLnNlbGVjdGVkVXNlcilcbiAgdXJsLnB1c2goc3RhdGUuc2VsZWN0ZWRVc2VyLCBmYWxzZSlcbiAgdXJsLnVwZGF0ZShzdGF0ZS5zZWxlY3RlZFVzZXIpXG4gIGFuYWx5dGljcy5zZW5kLnNlYXJjaChzdGF0ZS5zZWxlY3RlZFVzZXIsIHRydWUpXG5cbiAgc2NoZWR1bGUudmlld0l0ZW0od2Vla1NlbGVjdG9yLmdldFNlbGVjdGVkV2VlaygpLCBzdGF0ZS5zZWxlY3RlZFVzZXIpXG59IGVsc2Uge1xuICBzZWFyY2guZm9jdXMoKVxufVxuXG5zZWFyY2gub24oJ3NlYXJjaCcsIGZ1bmN0aW9uIChzZWxlY3RlZFVzZXIpIHtcbiAgc3RhdGUuc2VsZWN0ZWRVc2VyID0gc2VsZWN0ZWRVc2VyXG5cbiAgZmF2b3JpdGUudXBkYXRlKHN0YXRlLnNlbGVjdGVkVXNlcilcbiAgdXJsLnB1c2goc3RhdGUuc2VsZWN0ZWRVc2VyKVxuICB1cmwudXBkYXRlKHN0YXRlLnNlbGVjdGVkVXNlcilcbiAgYW5hbHl0aWNzLnNlbmQuc2VhcmNoKHN0YXRlLnNlbGVjdGVkVXNlcilcblxuICBzY2hlZHVsZS52aWV3SXRlbSh3ZWVrU2VsZWN0b3IuZ2V0U2VsZWN0ZWRXZWVrKCksIHN0YXRlLnNlbGVjdGVkVXNlcilcbn0pXG5cbnVybC5vbigndXBkYXRlJywgZnVuY3Rpb24gKHNlbGVjdGVkVXNlcikge1xuICBzdGF0ZS5zZWxlY3RlZFVzZXIgPSBzZWxlY3RlZFVzZXJcblxuICBmYXZvcml0ZS51cGRhdGUoc3RhdGUuc2VsZWN0ZWRVc2VyKVxuICB1cmwudXBkYXRlKHN0YXRlLnNlbGVjdGVkVXNlcilcblxuICBzY2hlZHVsZS52aWV3SXRlbSh3ZWVrU2VsZWN0b3IuZ2V0U2VsZWN0ZWRXZWVrKCksIHN0YXRlLnNlbGVjdGVkVXNlcilcbn0pXG5cbndlZWtTZWxlY3Rvci5vbignd2Vla0NoYW5nZWQnLCBmdW5jdGlvbiAobmV3V2Vlaykge1xuICBhbmFseXRpY3Muc2VuZC5zZWFyY2goc3RhdGUuc2VsZWN0ZWRVc2VyKVxuICBzY2hlZHVsZS52aWV3SXRlbShuZXdXZWVrLCBzdGF0ZS5zZWxlY3RlZFVzZXIpXG59KVxuXG5mYXZvcml0ZS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gIGZhdm9yaXRlLnRvZ2dsZShzdGF0ZS5zZWxlY3RlZFVzZXIpXG59KVxuXG5kb2N1bWVudC5ib2R5LnN0eWxlLm9wYWNpdHkgPSAxXG4iLCJjb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuY29uc3QgbGVmdFBhZCA9IHJlcXVpcmUoJ2xlZnQtcGFkJylcbmNvbnN0IHNlYXJjaCA9IHJlcXVpcmUoJy4vc2VhcmNoJylcblxuY29uc3Qgc2VsZiA9IG5ldyBFdmVudEVtaXR0ZXIoKVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgc2NoZWR1bGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzY2hlZHVsZScpXG59XG5cbnNlbGYuX3BhcnNlTWVldGluZ3BvaW50SFRNTCA9IGZ1bmN0aW9uIChodG1sU3RyKSB7XG4gIGNvbnN0IGh0bWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdodG1sJylcbiAgaHRtbC5pbm5lckhUTUwgPSBodG1sU3RyXG4gIGNvbnN0IGNlbnRlck5vZGUgPSBodG1sLnF1ZXJ5U2VsZWN0b3IoJ2NlbnRlcicpXG4gIHJldHVybiBjZW50ZXJOb2RlXG59XG5cbnNlbGYuX2hhbmRsZUxvYWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgY29uc3QgcmVxdWVzdCA9IGV2ZW50LnRhcmdldFxuICBpZiAocmVxdWVzdC5zdGF0dXMgPCAyMDAgfHwgcmVxdWVzdC5zdGF0dXMgPj0gNDAwKSB7XG4gICAgc2VsZi5faGFuZGxlRXJyb3IoZXZlbnQpXG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgZG9jdW1lbnQgPSBzZWxmLl9wYXJzZU1lZXRpbmdwb2ludEhUTUwocmVxdWVzdC5yZXNwb25zZSlcbiAgc2VsZi5fcmVtb3ZlQ2hpbGRzKClcbiAgc2VsZi5fbm9kZXMuc2NoZWR1bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQpXG4gIHNlbGYuX25vZGVzLnNjaGVkdWxlLmNsYXNzTGlzdC5yZW1vdmUoJ2Vycm9yJylcbiAgc2VsZi5lbWl0KCdsb2FkJylcbn1cblxuc2VsZi5faGFuZGxlRXJyb3IgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgY29uc3QgcmVxdWVzdCA9IGV2ZW50LnRhcmdldFxuICBsZXQgZXJyb3JcbiAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSA0MDQpIHtcbiAgICBlcnJvciA9ICdTb3JyeSwgZXIgaXMgKG5vZykgZ2VlbiByb29zdGVyIHZvb3IgZGV6ZSB3ZWVrLidcbiAgfSBlbHNlIHtcbiAgICBlcnJvciA9ICdTb3JyeSwgZXIgaXMgaWV0cyBtaXMgZ2VnYWFuIHRpamRlbnMgaGV0IGxhZGVuIHZhbiBkZXplIHdlZWsuJ1xuICB9XG4gIHNlbGYuX3JlbW92ZUNoaWxkcygpXG4gIHNlbGYuX25vZGVzLnNjaGVkdWxlLnRleHRDb250ZW50ID0gZXJyb3JcbiAgc2VsZi5fbm9kZXMuc2NoZWR1bGUuY2xhc3NMaXN0LmFkZCgnZXJyb3InKVxuICBzZWxmLmVtaXQoJ2xvYWQnKVxufVxuXG5zZWxmLl9nZXRVUkxPZlVzZXJzID0gZnVuY3Rpb24gKHdlZWssIHR5cGUsIGluZGV4KSB7XG4gIGNvbnN0IGlkID0gaW5kZXggKyAxXG4gIGNvbnN0IG1lZXRpbmdwb2ludFVSTCA9XG4gICAgICBgUm9vc3RlcnMtQUwvZG9jL2RhZ3Jvb3N0ZXJzLyR7bGVmdFBhZCh3ZWVrLCAyLCAnMCcpfS8ke3R5cGV9L2AgK1xuICAgICAgYCR7dHlwZX0ke2xlZnRQYWQoaWQsIDUsICcwJyl9Lmh0bWBcbiAgcmV0dXJuIGAvbWVldGluZ3BvaW50UHJveHkvJHt3aW5kb3cuZW5jb2RlVVJJQ29tcG9uZW50KG1lZXRpbmdwb2ludFVSTCl9YFxufVxuXG5zZWxmLl9yZW1vdmVDaGlsZHMgPSBmdW5jdGlvbiAoKSB7XG4gIHdoaWxlIChzZWxmLl9ub2Rlcy5zY2hlZHVsZS5maXJzdENoaWxkKSB7XG4gICAgc2VsZi5fbm9kZXMuc2NoZWR1bGUucmVtb3ZlQ2hpbGQoc2VsZi5fbm9kZXMuc2NoZWR1bGUuZmlyc3RDaGlsZClcbiAgfVxufVxuXG5zZWxmLnZpZXdJdGVtID0gZnVuY3Rpb24gKHdlZWssIHNlbGVjdGVkVXNlcikge1xuICBpZiAoc2VsZWN0ZWRVc2VyID09IG51bGwpIHtcbiAgICBzZWxmLl9yZW1vdmVDaGlsZHMoKVxuICAgIHNlYXJjaC51cGRhdGVEb20oc2VsZWN0ZWRVc2VyKVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IHVybCA9IHNlbGYuX2dldFVSTE9mVXNlcnMod2Vlaywgc2VsZWN0ZWRVc2VyLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFVzZXIuaW5kZXgpXG5cbiAgICBzZWxmLl9yZW1vdmVDaGlsZHMoKVxuXG4gICAgY29uc3QgcmVxdWVzdCA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKVxuICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHNlbGYuX2hhbmRsZUxvYWQpXG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHNlbGYuX2hhbmRsZUVycm9yKVxuICAgIHJlcXVlc3Qub3BlbignR0VUJywgdXJsLCB0cnVlKVxuICAgIHJlcXVlc3Quc2VuZCgpXG5cbiAgICBzZWFyY2gudXBkYXRlRG9tKHNlbGVjdGVkVXNlcilcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsInJlcXVpcmUoJ3Ntb290aHNjcm9sbC1wb2x5ZmlsbCcpLnBvbHlmaWxsKClcblxuY29uc3Qgc2VsZiA9IHt9XG5jb25zdCBzY2hlZHVsZSA9IHJlcXVpcmUoJy4vc2NoZWR1bGUnKVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgc2VhcmNoOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2VhcmNoJyksXG4gIHdlZWtTZWxlY3RvcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3dlZWstc2VsZWN0b3InKVxufVxuXG5zZWxmLl90aW1lb3V0SUQgPSBudWxsXG5cbnNlbGYuX2dldFNjcm9sbFBvc2l0aW9uID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wKSB8fFxuICAgICAgICAgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3Bcbn1cblxuc2VsZi5faGFuZGxlRG9uZVNjcm9sbGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgc2Nyb2xsUG9zaXRpb24gPSBzZWxmLl9nZXRTY3JvbGxQb3NpdGlvbigpXG4gIGNvbnN0IHdlZWtTZWxlY3RvckhlaWdodCA9XG4gICAgICBzZWxmLl9ub2Rlcy53ZWVrU2VsZWN0b3IuY2xpZW50SGVpZ2h0IC0gc2VsZi5fbm9kZXMuc2VhcmNoLmNsaWVudEhlaWdodFxuICBpZiAoc2Nyb2xsUG9zaXRpb24gPCB3ZWVrU2VsZWN0b3JIZWlnaHQgJiYgc2Nyb2xsUG9zaXRpb24gPiAwKSB7XG4gICAgd2luZG93LnNjcm9sbCh7IHRvcDogd2Vla1NlbGVjdG9ySGVpZ2h0LCBsZWZ0OiAwLCBiZWhhdmlvcjogJ3Ntb290aCcgfSlcbiAgfVxufVxuXG5zZWxmLl9oYW5kbGVTY3JvbGwgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChzZWxmLl90aW1lb3V0SUQgIT0gbnVsbCkgd2luZG93LmNsZWFyVGltZW91dChzZWxmLl90aW1lb3V0SUQpXG4gIHNlbGYuX3RpbWVvdXRJRCA9IHdpbmRvdy5zZXRUaW1lb3V0KHNlbGYuX2hhbmRsZURvbmVTY3JvbGxpbmcsIDUwMClcblxuICBjb25zdCBzY3JvbGxQb3NpdGlvbiA9IHNlbGYuX2dldFNjcm9sbFBvc2l0aW9uKClcbiAgY29uc3Qgd2Vla1NlbGVjdG9ySGVpZ2h0ID1cbiAgICAgIHNlbGYuX25vZGVzLndlZWtTZWxlY3Rvci5jbGllbnRIZWlnaHQgLSBzZWxmLl9ub2Rlcy5zZWFyY2guY2xpZW50SGVpZ2h0XG4gIGlmIChzY3JvbGxQb3NpdGlvbiA+PSB3ZWVrU2VsZWN0b3JIZWlnaHQpIHtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3dlZWstc2VsZWN0b3Itbm90LXZpc2libGUnKVxuICB9IGVsc2Uge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnd2Vlay1zZWxlY3Rvci1ub3QtdmlzaWJsZScpXG4gIH1cbn1cblxuc2VsZi5faGFuZGxlV2luZG93UmVzaXplID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCB3ZWVrU2VsZWN0b3JIZWlnaHQgPVxuICAgICAgc2VsZi5fbm9kZXMud2Vla1NlbGVjdG9yLmNsaWVudEhlaWdodCAtIHNlbGYuX25vZGVzLnNlYXJjaC5jbGllbnRIZWlnaHRcbiAgY29uc3QgZXh0cmFQaXhlbHNOZWVkZWQgPVxuICAgICAgd2Vla1NlbGVjdG9ySGVpZ2h0IC0gKGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0IC0gd2luZG93LmlubmVySGVpZ2h0KVxuICBpZiAoZXh0cmFQaXhlbHNOZWVkZWQgPiAwKSB7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5tYXJnaW5Cb3R0b20gPSBleHRyYVBpeGVsc05lZWRlZCArICdweCdcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm1hcmdpbkJvdHRvbSA9IG51bGxcbiAgfVxufVxuXG5zZWxmLnN0YXJ0TGlzdGVuaW5nID0gZnVuY3Rpb24gKCkge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgc2VsZi5faGFuZGxlU2Nyb2xsKVxufVxuXG5zY2hlZHVsZS5vbignbG9hZCcsIHNlbGYuX2hhbmRsZVdpbmRvd1Jlc2l6ZSlcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzZWxmLl9oYW5kbGVXaW5kb3dSZXNpemUpXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsIi8qIGdsb2JhbCBVU0VSUyAqL1xuXG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuY29uc3QgZnV6enkgPSByZXF1aXJlKCdmdXp6eScpXG5jb25zdCBhdXRvY29tcGxldGUgPSByZXF1aXJlKCcuL2F1dG9jb21wbGV0ZScpXG5jb25zdCBicm93c2VyRml4VG9vbGtpdCA9IHJlcXVpcmUoJy4vYnJvd3NlckZpeFRvb2xraXQnKVxuXG5jb25zdCBzZWxmID0gbmV3IEV2ZW50RW1pdHRlcigpXG5cbnNlbGYuX25vZGVzID0ge1xuICBzZWFyY2g6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzZWFyY2gnKSxcbiAgaW5wdXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJzZWFyY2hcIl0nKVxufVxuXG5zZWxmLnN1Ym1pdCA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgc2VsZWN0ZWRVc2VyID0gYXV0b2NvbXBsZXRlLmdldFNlbGVjdGVkVXNlcigpXG4gIGlmIChzZWxlY3RlZFVzZXIgPT0gbnVsbCkgcmV0dXJuXG5cbiAgY29uc29sZS5sb2coc2VsZWN0ZWRVc2VyKVxuXG4gIHNlbGYuX25vZGVzLmlucHV0LmJsdXIoKVxuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3dlZWstc2VsZWN0b3Itbm90LXZpc2libGUnKSAvLyBTYWZhcmkgYnVnXG5cbiAgc2VsZi5lbWl0KCdzZWFyY2gnLCBzZWxlY3RlZFVzZXIpXG59XG5cbnNlbGYudXBkYXRlRG9tID0gZnVuY3Rpb24gKHNlbGVjdGVkVXNlcikge1xuICBpZiAoc2VsZWN0ZWRVc2VyID09IG51bGwpIHtcbiAgICBzZWxmLl9ub2Rlcy5pbnB1dC52YWx1ZSA9ICcnXG4gICAgYXV0b2NvbXBsZXRlLnJlbW92ZUFsbEl0ZW1zKClcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ25vLWlucHV0JylcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3NlYXJjaGVkJylcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9ub2Rlcy5pbnB1dC52YWx1ZSA9IHNlbGVjdGVkVXNlci52YWx1ZVxuICAgIGF1dG9jb21wbGV0ZS5yZW1vdmVBbGxJdGVtcygpXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCduby1pbnB1dCcpXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdzZWFyY2hlZCcpXG4gIH1cbn1cblxuc2VsZi5mb2N1cyA9IGZ1bmN0aW9uICgpIHtcbiAgc2VsZi5fbm9kZXMuaW5wdXQuZm9jdXMoKVxufVxuXG5zZWxmLl9oYW5kbGVTdWJtaXQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICBzZWxmLnN1Ym1pdCgpXG59XG5cbnNlbGYuX2NhbGN1bGF0ZSA9IGZ1bmN0aW9uIChzZWFyY2hUZXJtKSB7XG4gIGNvbnN0IGFsbFJlc3VsdHMgPSBmdXp6eS5maWx0ZXIoc2VhcmNoVGVybSwgVVNFUlMsIHtcbiAgICBleHRyYWN0OiBmdW5jdGlvbiAodXNlcikgeyByZXR1cm4gdXNlci52YWx1ZSB9XG4gIH0pXG4gIGNvbnN0IGZpcnN0UmVzdWx0cyA9IGFsbFJlc3VsdHMuc2xpY2UoMCwgNylcblxuICBjb25zdCBvcmlnaW5hbFJlc3VsdHMgPSBmaXJzdFJlc3VsdHMubWFwKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICByZXR1cm4gcmVzdWx0Lm9yaWdpbmFsXG4gIH0pXG5cbiAgcmV0dXJuIG9yaWdpbmFsUmVzdWx0c1xufVxuXG5zZWxmLl9oYW5kbGVUZXh0VXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCByZXN1bHRzID0gc2VsZi5fY2FsY3VsYXRlKHNlbGYuX25vZGVzLmlucHV0LnZhbHVlKVxuXG4gIGF1dG9jb21wbGV0ZS5yZW1vdmVBbGxJdGVtcygpXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgIGF1dG9jb21wbGV0ZS5hZGRJdGVtKHJlc3VsdHNbaV0pXG4gIH1cbn1cblxuc2VsZi5faGFuZGxlRm9jdXMgPSBmdW5jdGlvbiAoKSB7XG4gIHNlbGYuX25vZGVzLmlucHV0LnNlbGVjdCgpXG59XG5cbnNlbGYuX2hhbmRsZUJsdXIgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIHRoaXMgd2lsbCByZW1vdmVkIHRoZSBzZWxlY3Rpb24gd2l0aG91dCBkcmF3aW5nIGZvY3VzIG9uIGl0IChzYWZhcmkpXG4gIC8vIHRoaXMgd2lsbCByZW1vdmVkIHNlbGVjdGlvbiBldmVuIHdoZW4gZm9jdXNpbmcgYW4gaWZyYW1lIChjaHJvbWUpXG4gIGNvbnN0IG9sZFZhbHVlID0gc2VsZi5fbm9kZXMudmFsdWVcbiAgc2VsZi5fbm9kZXMudmFsdWUgPSAnJ1xuICBzZWxmLl9ub2Rlcy52YWx1ZSA9IG9sZFZhbHVlXG5cbiAgLy8gdGhpcyB3aWxsIGhpZGUgdGhlIGtleWJvYXJkIChpT1Mgc2FmYXJpKVxuICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKVxufVxuXG5hdXRvY29tcGxldGUub24oJ3NlbGVjdCcsIHNlbGYuc3VibWl0KVxuXG5zZWxmLl9ub2Rlcy5zZWFyY2guYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0Jywgc2VsZi5faGFuZGxlU3VibWl0KVxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBzZWxmLl9oYW5kbGVGb2N1cylcbnNlbGYuX25vZGVzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCBzZWxmLl9oYW5kbGVCbHVyKVxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihicm93c2VyRml4VG9vbGtpdC5pbnB1dEV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9oYW5kbGVUZXh0VXBkYXRlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsIi8qIGdsb2JhbCBVU0VSUyBGTEFHUyAqL1xuXG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuXG5jb25zdCBzZWxmID0gbmV3IEV2ZW50RW1pdHRlcigpXG5cbnNlbGYuX2dldFBhZ2VUaXRsZSA9IGZ1bmN0aW9uIChzZWxlY3RlZFVzZXIpIHtcbiAgbGV0IHJldFxuXG4gIGlmIChzZWxlY3RlZFVzZXIgPT0gbnVsbCkge1xuICAgIHJldCA9IGBNZXRpcyBSb29zdGVyYFxuICB9IGVsc2Uge1xuICAgIHJldCA9IGBNZXRpcyBSb29zdGVyIC0gJHtzZWxlY3RlZFVzZXIudmFsdWV9YFxuICB9XG5cbiAgaWYgKEZMQUdTLmluZGV4T2YoJ0JFVEEnKSAhPT0gLTEpIHtcbiAgICByZXQgPSBgQkVUQSAke3JldH1gXG4gIH1cblxuICByZXR1cm4gcmV0XG59XG5cbnNlbGYuX2dldFBhZ2VVUkwgPSBmdW5jdGlvbiAoc2VsZWN0ZWRVc2VyKSB7XG4gIHJldHVybiBgLyR7c2VsZWN0ZWRVc2VyLnR5cGV9LyR7c2VsZWN0ZWRVc2VyLnZhbHVlfWBcbn1cblxuc2VsZi5wdXNoID0gZnVuY3Rpb24gKHNlbGVjdGVkVXNlciwgcHVzaCkge1xuICBpZiAocHVzaCA9PSBudWxsKSBwdXNoID0gdHJ1ZVxuICBjb25zdCBwYWdlVGl0bGUgPSBzZWxmLl9nZXRQYWdlVGl0bGUoc2VsZWN0ZWRVc2VyKVxuICBjb25zdCBwYWdlVVJMID0gc2VsZi5fZ2V0UGFnZVVSTChzZWxlY3RlZFVzZXIpXG4gIGlmIChwdXNoKSB7XG4gICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHNlbGVjdGVkVXNlciwgcGFnZVRpdGxlLCBwYWdlVVJMKVxuICB9IGVsc2Uge1xuICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZShzZWxlY3RlZFVzZXIsIHBhZ2VUaXRsZSwgcGFnZVVSTClcbiAgfVxufVxuXG5zZWxmLnVwZGF0ZSA9IGZ1bmN0aW9uIChzZWxlY3RlZFVzZXIpIHtcbiAgZG9jdW1lbnQudGl0bGUgPSBzZWxmLl9nZXRQYWdlVGl0bGUoc2VsZWN0ZWRVc2VyKVxufVxuXG5zZWxmLmhhc1NlbGVjdGVkVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgcGFnZVVybCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZVxuICByZXR1cm4gL15cXC9zXFwvfF5cXC90XFwvfF5cXC9yXFwvfF5cXC9jXFwvLy50ZXN0KHBhZ2VVcmwpXG59XG5cbnNlbGYuZ2V0U2VsZWN0ZWRVc2VyID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBwYWdlVXJsID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lXG4gIGNvbnN0IHBhZ2VVcmxEYXRhID0gcGFnZVVybC5zcGxpdCgnLycpXG4gIGNvbnN0IHR5cGUgPSBwYWdlVXJsRGF0YVsxXVxuICBjb25zdCB2YWx1ZSA9IHBhZ2VVcmxEYXRhWzJdXG5cbiAgY29uc3QgdXNlciA9IFVTRVJTLmZpbHRlcihmdW5jdGlvbiAodXNlcikge1xuICAgIHJldHVybiB1c2VyLnR5cGUgPT09IHR5cGUgJiZcbiAgICAgICAgICAgdXNlci52YWx1ZSA9PT0gdmFsdWVcbiAgfSlbMF1cblxuICByZXR1cm4gdXNlclxufVxuXG5zZWxmLl9oYW5kbGVVcGRhdGUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgc2VsZi5lbWl0KCd1cGRhdGUnLCBldmVudC5zdGF0ZSlcbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgc2VsZi5faGFuZGxlVXBkYXRlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsImNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5cbmNvbnN0IHNlbGYgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fbm9kZXMgPSB7XG4gIHByZXZCdXR0b246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN3ZWVrLXNlbGVjdG9yIGJ1dHRvbicpWzBdLFxuICBuZXh0QnV0dG9uOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjd2Vlay1zZWxlY3RvciBidXR0b24nKVsxXSxcbiAgY3VycmVudFdlZWtOb2RlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd2Vlay1zZWxlY3RvciAuY3VycmVudCcpLFxuICBjdXJyZW50V2Vla05vcm1hbFRleHQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3ZWVrLXNlbGVjdG9yIC5jdXJyZW50IC5uby1wcmludCcpLFxuICBjdXJyZW50V2Vla1ByaW50VGV4dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3dlZWstc2VsZWN0b3IgLmN1cnJlbnQgLnByaW50Jylcbn1cblxuc2VsZi5fd2Vla09mZnNldCA9IDBcblxuLy8gY29waWVkIGZyb20gaHR0cDovL3d3dy5tZWV0aW5ncG9pbnRtY28ubmwvUm9vc3RlcnMtQUwvZG9jL2RhZ3Jvb3N0ZXJzL3VudGlzc2NyaXB0cy5qcyxcbi8vIHdlcmUgdXNpbmcgdGhlIHNhbWUgY29kZSBhcyB0aGV5IGRvIHRvIGJlIHN1cmUgdGhhdCB3ZSBhbHdheXMgZ2V0IHRoZSBzYW1lXG4vLyB3ZWVrIG51bWJlci5cbnNlbGYuZ2V0Q3VycmVudFdlZWsgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gIGNvbnN0IGRheU5yID0gKHRhcmdldC5nZXREYXkoKSArIDYpICUgN1xuICB0YXJnZXQuc2V0RGF0ZSh0YXJnZXQuZ2V0RGF0ZSgpIC0gZGF5TnIgKyAzKVxuICBjb25zdCBmaXJzdFRodXJzZGF5ID0gdGFyZ2V0LnZhbHVlT2YoKVxuICB0YXJnZXQuc2V0TW9udGgoMCwgMSlcbiAgaWYgKHRhcmdldC5nZXREYXkoKSAhPT0gNCkge1xuICAgIHRhcmdldC5zZXRNb250aCgwLCAxICsgKCg0IC0gdGFyZ2V0LmdldERheSgpKSArIDcpICUgNylcbiAgfVxuXG4gIHJldHVybiAxICsgTWF0aC5jZWlsKChmaXJzdFRodXJzZGF5IC0gdGFyZ2V0KSAvIDYwNDgwMDAwMClcbn1cblxuc2VsZi5nZXRTZWxlY3RlZFdlZWsgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IG5vdyA9IG5ldyBEYXRlKClcbiAgY29uc3QgdGFyZ2V0RGF0ZSA9IG5ldyBEYXRlKG5vdy5nZXRUaW1lKCkgK1xuICAgICAgc2VsZi5fd2Vla09mZnNldCAqIDYwNDgwMCAqIDEwMDAgKyA4NjQwMCAqIDEwMDApXG4gIHJldHVybiBzZWxmLmdldEN1cnJlbnRXZWVrKHRhcmdldERhdGUpXG59XG5cbnNlbGYudXBkYXRlQ3VycmVudFdlZWsgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHNlbGVjdGVkV2Vla051bWJlciA9IHNlbGYuZ2V0U2VsZWN0ZWRXZWVrKClcbiAgaWYgKHNlbGYuZ2V0Q3VycmVudFdlZWsobmV3IERhdGUoKSkgIT09IHNlbGVjdGVkV2Vla051bWJlcikge1xuICAgIHNlbGYuX25vZGVzLmN1cnJlbnRXZWVrTm9kZS5jbGFzc0xpc3QuYWRkKCdjaGFuZ2VkJylcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9ub2Rlcy5jdXJyZW50V2Vla05vZGUuY2xhc3NMaXN0LnJlbW92ZSgnY2hhbmdlZCcpXG4gIH1cbiAgc2VsZi51cGRhdGVEb20oKVxuICBzZWxmLmVtaXQoJ3dlZWtDaGFuZ2VkJywgc2VsZWN0ZWRXZWVrTnVtYmVyKVxufVxuXG5zZWxmLnVwZGF0ZURvbSA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgc2VsZWN0ZWRXZWVrTnVtYmVyID0gc2VsZi5nZXRTZWxlY3RlZFdlZWsoKVxuICBjb25zdCBpc1N1bmRheSA9IG5ldyBEYXRlKCkuZ2V0RGF5KCkgPT09IDBcbiAgbGV0IGh1bWFuUmVhZGFibGVXZWVrID0gbnVsbFxuICBpZiAoaXNTdW5kYXkpIHtcbiAgICBzd2l0Y2ggKHNlbGYuX3dlZWtPZmZzZXQpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgaHVtYW5SZWFkYWJsZVdlZWsgPSAnQWFuc3RhYW5kZSB3ZWVrJ1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAxOlxuICAgICAgICBodW1hblJlYWRhYmxlV2VlayA9ICdWb2xnZW5kZSB3ZWVrJ1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAtMTpcbiAgICAgICAgaHVtYW5SZWFkYWJsZVdlZWsgPSAnQWZnZWxvcGVuIHdlZWsnXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHN3aXRjaCAoc2VsZi5fd2Vla09mZnNldCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICBodW1hblJlYWRhYmxlV2VlayA9ICdIdWlkaWdlIHdlZWsnXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGh1bWFuUmVhZGFibGVXZWVrID0gJ1ZvbGdlbmRlIHdlZWsnXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIC0xOlxuICAgICAgICBodW1hblJlYWRhYmxlV2VlayA9ICdWb3JpZ2Ugd2VlaydcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgaWYgKGh1bWFuUmVhZGFibGVXZWVrICE9IG51bGwpIHtcbiAgICBzZWxmLl9ub2Rlcy5jdXJyZW50V2Vla05vcm1hbFRleHQudGV4dENvbnRlbnQgPSBodW1hblJlYWRhYmxlV2VlayArICcg4oCiICcgKyBzZWxlY3RlZFdlZWtOdW1iZXJcbiAgICBzZWxmLl9ub2Rlcy5jdXJyZW50V2Vla1ByaW50VGV4dC50ZXh0Q29udGVudCA9ICdXZWVrICcgKyBzZWxlY3RlZFdlZWtOdW1iZXJcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9ub2Rlcy5jdXJyZW50V2Vla05vcm1hbFRleHQudGV4dENvbnRlbnQgPSAnV2VlayAnICsgc2VsZWN0ZWRXZWVrTnVtYmVyXG4gICAgc2VsZi5fbm9kZXMuY3VycmVudFdlZWtQcmludFRleHQudGV4dENvbnRlbnQgPSAnV2VlayAnICsgc2VsZWN0ZWRXZWVrTnVtYmVyXG4gIH1cbn1cblxuc2VsZi5faGFuZGxlUHJldkJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICBzZWxmLl93ZWVrT2Zmc2V0IC09IDFcbiAgc2VsZi51cGRhdGVDdXJyZW50V2VlaygpXG59XG5cbnNlbGYuX2hhbmRsZU5leHRCdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgc2VsZi5fd2Vla09mZnNldCArPSAxXG4gIHNlbGYudXBkYXRlQ3VycmVudFdlZWsoKVxufVxuXG5zZWxmLl9ub2Rlcy5wcmV2QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2VsZi5faGFuZGxlUHJldkJ1dHRvbkNsaWNrKVxuc2VsZi5fbm9kZXMubmV4dEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlbGYuX2hhbmRsZU5leHRCdXR0b25DbGljaylcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iXX0=
