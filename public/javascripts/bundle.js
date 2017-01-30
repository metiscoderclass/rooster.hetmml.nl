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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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

  if (currentUser == null) {
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

/* global USERS */

var EventEmitter = require('events');

var self = new EventEmitter();

self._getPageTitle = function (selectedUser) {
  if (selectedUser == null) {
    return 'Metis Rooster';
  } else {
    return 'Metis Rooster - ' + selectedUser.value;
  }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9mdXp6eS9saWIvZnV6enkuanMiLCJub2RlX21vZHVsZXMvbGVmdC1wYWQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc21vb3Roc2Nyb2xsLXBvbHlmaWxsL2Rpc3Qvc21vb3Roc2Nyb2xsLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2FuYWx5dGljcy5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9hdXRvY29tcGxldGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYnJvd3NlckZpeFRvb2xraXQuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvZmF2b3JpdGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvZmVhdHVyZURldGVjdC5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9mcm9udHBhZ2UuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvbWFpbi5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9zY2hlZHVsZS5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9zY3JvbGxTbmFwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL3NlYXJjaC5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy91cmwuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvd2Vla1NlbGVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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O0FBQ3hDLE9BQUssV0FBTCxJQUFvQixDQUFwQjtBQUNBLE9BQUssaUJBQUw7QUFDRCxDQUhEOztBQUtBLEtBQUssc0JBQUwsR0FBOEIsWUFBWTtBQUN4QyxPQUFLLFdBQUwsSUFBb0IsQ0FBcEI7QUFDQSxPQUFLLGlCQUFMO0FBQ0QsQ0FIRDs7QUFLQSxLQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLGdCQUF2QixDQUF3QyxPQUF4QyxFQUFpRCxLQUFLLHNCQUF0RDtBQUNBLEtBQUssTUFBTCxDQUFZLFVBQVosQ0FBdUIsZ0JBQXZCLENBQXdDLE9BQXhDLEVBQWlELEtBQUssc0JBQXREOztBQUVBLE9BQU8sT0FBUCxHQUFpQixJQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXZsaXN0ZW5lcikpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChldmxpc3RlbmVyKVxuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCIvKlxuICogRnV6enlcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9teW9yay9mdXp6eVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMiBNYXR0IFlvcmtcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG5cbnZhciByb290ID0gdGhpcztcblxudmFyIGZ1enp5ID0ge307XG5cbi8vIFVzZSBpbiBub2RlIG9yIGluIGJyb3dzZXJcbmlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdXp6eTtcbn0gZWxzZSB7XG4gIHJvb3QuZnV6enkgPSBmdXp6eTtcbn1cblxuLy8gUmV0dXJuIGFsbCBlbGVtZW50cyBvZiBgYXJyYXlgIHRoYXQgaGF2ZSBhIGZ1enp5XG4vLyBtYXRjaCBhZ2FpbnN0IGBwYXR0ZXJuYC5cbmZ1enp5LnNpbXBsZUZpbHRlciA9IGZ1bmN0aW9uKHBhdHRlcm4sIGFycmF5KSB7XG4gIHJldHVybiBhcnJheS5maWx0ZXIoZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgcmV0dXJuIGZ1enp5LnRlc3QocGF0dGVybiwgc3RyaW5nKTtcbiAgfSk7XG59O1xuXG4vLyBEb2VzIGBwYXR0ZXJuYCBmdXp6eSBtYXRjaCBgc3RyaW5nYD9cbmZ1enp5LnRlc3QgPSBmdW5jdGlvbihwYXR0ZXJuLCBzdHJpbmcpIHtcbiAgcmV0dXJuIGZ1enp5Lm1hdGNoKHBhdHRlcm4sIHN0cmluZykgIT09IG51bGw7XG59O1xuXG4vLyBJZiBgcGF0dGVybmAgbWF0Y2hlcyBgc3RyaW5nYCwgd3JhcCBlYWNoIG1hdGNoaW5nIGNoYXJhY3RlclxuLy8gaW4gYG9wdHMucHJlYCBhbmQgYG9wdHMucG9zdGAuIElmIG5vIG1hdGNoLCByZXR1cm4gbnVsbFxuZnV6enkubWF0Y2ggPSBmdW5jdGlvbihwYXR0ZXJuLCBzdHJpbmcsIG9wdHMpIHtcbiAgb3B0cyA9IG9wdHMgfHwge307XG4gIHZhciBwYXR0ZXJuSWR4ID0gMFxuICAgICwgcmVzdWx0ID0gW11cbiAgICAsIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgICAsIHRvdGFsU2NvcmUgPSAwXG4gICAgLCBjdXJyU2NvcmUgPSAwXG4gICAgLy8gcHJlZml4XG4gICAgLCBwcmUgPSBvcHRzLnByZSB8fCAnJ1xuICAgIC8vIHN1ZmZpeFxuICAgICwgcG9zdCA9IG9wdHMucG9zdCB8fCAnJ1xuICAgIC8vIFN0cmluZyB0byBjb21wYXJlIGFnYWluc3QuIFRoaXMgbWlnaHQgYmUgYSBsb3dlcmNhc2UgdmVyc2lvbiBvZiB0aGVcbiAgICAvLyByYXcgc3RyaW5nXG4gICAgLCBjb21wYXJlU3RyaW5nID0gIG9wdHMuY2FzZVNlbnNpdGl2ZSAmJiBzdHJpbmcgfHwgc3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAsIGNoLCBjb21wYXJlQ2hhcjtcblxuICBwYXR0ZXJuID0gb3B0cy5jYXNlU2Vuc2l0aXZlICYmIHBhdHRlcm4gfHwgcGF0dGVybi50b0xvd2VyQ2FzZSgpO1xuXG4gIC8vIEZvciBlYWNoIGNoYXJhY3RlciBpbiB0aGUgc3RyaW5nLCBlaXRoZXIgYWRkIGl0IHRvIHRoZSByZXN1bHRcbiAgLy8gb3Igd3JhcCBpbiB0ZW1wbGF0ZSBpZiBpdCdzIHRoZSBuZXh0IHN0cmluZyBpbiB0aGUgcGF0dGVyblxuICBmb3IodmFyIGlkeCA9IDA7IGlkeCA8IGxlbjsgaWR4KyspIHtcbiAgICBjaCA9IHN0cmluZ1tpZHhdO1xuICAgIGlmKGNvbXBhcmVTdHJpbmdbaWR4XSA9PT0gcGF0dGVybltwYXR0ZXJuSWR4XSkge1xuICAgICAgY2ggPSBwcmUgKyBjaCArIHBvc3Q7XG4gICAgICBwYXR0ZXJuSWR4ICs9IDE7XG5cbiAgICAgIC8vIGNvbnNlY3V0aXZlIGNoYXJhY3RlcnMgc2hvdWxkIGluY3JlYXNlIHRoZSBzY29yZSBtb3JlIHRoYW4gbGluZWFybHlcbiAgICAgIGN1cnJTY29yZSArPSAxICsgY3VyclNjb3JlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyU2NvcmUgPSAwO1xuICAgIH1cbiAgICB0b3RhbFNjb3JlICs9IGN1cnJTY29yZTtcbiAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aF0gPSBjaDtcbiAgfVxuXG4gIC8vIHJldHVybiByZW5kZXJlZCBzdHJpbmcgaWYgd2UgaGF2ZSBhIG1hdGNoIGZvciBldmVyeSBjaGFyXG4gIGlmKHBhdHRlcm5JZHggPT09IHBhdHRlcm4ubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHtyZW5kZXJlZDogcmVzdWx0LmpvaW4oJycpLCBzY29yZTogdG90YWxTY29yZX07XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8vIFRoZSBub3JtYWwgZW50cnkgcG9pbnQuIEZpbHRlcnMgYGFycmAgZm9yIG1hdGNoZXMgYWdhaW5zdCBgcGF0dGVybmAuXG4vLyBJdCByZXR1cm5zIGFuIGFycmF5IHdpdGggbWF0Y2hpbmcgdmFsdWVzIG9mIHRoZSB0eXBlOlxuLy9cbi8vICAgICBbe1xuLy8gICAgICAgICBzdHJpbmc6ICAgJzxiPmxhaCcgLy8gVGhlIHJlbmRlcmVkIHN0cmluZ1xuLy8gICAgICAgLCBpbmRleDogICAgMiAgICAgICAgLy8gVGhlIGluZGV4IG9mIHRoZSBlbGVtZW50IGluIGBhcnJgXG4vLyAgICAgICAsIG9yaWdpbmFsOiAnYmxhaCcgICAvLyBUaGUgb3JpZ2luYWwgZWxlbWVudCBpbiBgYXJyYFxuLy8gICAgIH1dXG4vL1xuLy8gYG9wdHNgIGlzIGFuIG9wdGlvbmFsIGFyZ3VtZW50IGJhZy4gRGV0YWlsczpcbi8vXG4vLyAgICBvcHRzID0ge1xuLy8gICAgICAgIC8vIHN0cmluZyB0byBwdXQgYmVmb3JlIGEgbWF0Y2hpbmcgY2hhcmFjdGVyXG4vLyAgICAgICAgcHJlOiAgICAgJzxiPidcbi8vXG4vLyAgICAgICAgLy8gc3RyaW5nIHRvIHB1dCBhZnRlciBtYXRjaGluZyBjaGFyYWN0ZXJcbi8vICAgICAgLCBwb3N0OiAgICAnPC9iPidcbi8vXG4vLyAgICAgICAgLy8gT3B0aW9uYWwgZnVuY3Rpb24uIElucHV0IGlzIGFuIGVudHJ5IGluIHRoZSBnaXZlbiBhcnJgLFxuLy8gICAgICAgIC8vIG91dHB1dCBzaG91bGQgYmUgdGhlIHN0cmluZyB0byB0ZXN0IGBwYXR0ZXJuYCBhZ2FpbnN0LlxuLy8gICAgICAgIC8vIEluIHRoaXMgZXhhbXBsZSwgaWYgYGFyciA9IFt7Y3J5aW5nOiAna29hbGEnfV1gIHdlIHdvdWxkIHJldHVyblxuLy8gICAgICAgIC8vICdrb2FsYScuXG4vLyAgICAgICwgZXh0cmFjdDogZnVuY3Rpb24oYXJnKSB7IHJldHVybiBhcmcuY3J5aW5nOyB9XG4vLyAgICB9XG5mdXp6eS5maWx0ZXIgPSBmdW5jdGlvbihwYXR0ZXJuLCBhcnIsIG9wdHMpIHtcbiAgb3B0cyA9IG9wdHMgfHwge307XG4gIHJldHVybiBhcnJcbiAgICAucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGVsZW1lbnQsIGlkeCwgYXJyKSB7XG4gICAgICB2YXIgc3RyID0gZWxlbWVudDtcbiAgICAgIGlmKG9wdHMuZXh0cmFjdCkge1xuICAgICAgICBzdHIgPSBvcHRzLmV4dHJhY3QoZWxlbWVudCk7XG4gICAgICB9XG4gICAgICB2YXIgcmVuZGVyZWQgPSBmdXp6eS5tYXRjaChwYXR0ZXJuLCBzdHIsIG9wdHMpO1xuICAgICAgaWYocmVuZGVyZWQgIT0gbnVsbCkge1xuICAgICAgICBwcmV2W3ByZXYubGVuZ3RoXSA9IHtcbiAgICAgICAgICAgIHN0cmluZzogcmVuZGVyZWQucmVuZGVyZWRcbiAgICAgICAgICAsIHNjb3JlOiByZW5kZXJlZC5zY29yZVxuICAgICAgICAgICwgaW5kZXg6IGlkeFxuICAgICAgICAgICwgb3JpZ2luYWw6IGVsZW1lbnRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcmV2O1xuICAgIH0sIFtdKVxuXG4gICAgLy8gU29ydCBieSBzY29yZS4gQnJvd3NlcnMgYXJlIGluY29uc2lzdGVudCB3cnQgc3RhYmxlL3Vuc3RhYmxlXG4gICAgLy8gc29ydGluZywgc28gZm9yY2Ugc3RhYmxlIGJ5IHVzaW5nIHRoZSBpbmRleCBpbiB0aGUgY2FzZSBvZiB0aWUuXG4gICAgLy8gU2VlIGh0dHA6Ly9vZmIubmV0L35zZXRobWwvaXMtc29ydC1zdGFibGUuaHRtbFxuICAgIC5zb3J0KGZ1bmN0aW9uKGEsYikge1xuICAgICAgdmFyIGNvbXBhcmUgPSBiLnNjb3JlIC0gYS5zY29yZTtcbiAgICAgIGlmKGNvbXBhcmUpIHJldHVybiBjb21wYXJlO1xuICAgICAgcmV0dXJuIGEuaW5kZXggLSBiLmluZGV4O1xuICAgIH0pO1xufTtcblxuXG59KCkpO1xuXG4iLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGxlZnRQYWQ7XG5cbnZhciBjYWNoZSA9IFtcbiAgJycsXG4gICcgJyxcbiAgJyAgJyxcbiAgJyAgICcsXG4gICcgICAgJyxcbiAgJyAgICAgJyxcbiAgJyAgICAgICcsXG4gICcgICAgICAgJyxcbiAgJyAgICAgICAgJyxcbiAgJyAgICAgICAgICdcbl07XG5cbmZ1bmN0aW9uIGxlZnRQYWQgKHN0ciwgbGVuLCBjaCkge1xuICAvLyBjb252ZXJ0IGBzdHJgIHRvIGBzdHJpbmdgXG4gIHN0ciA9IHN0ciArICcnO1xuICAvLyBgbGVuYCBpcyB0aGUgYHBhZGAncyBsZW5ndGggbm93XG4gIGxlbiA9IGxlbiAtIHN0ci5sZW5ndGg7XG4gIC8vIGRvZXNuJ3QgbmVlZCB0byBwYWRcbiAgaWYgKGxlbiA8PSAwKSByZXR1cm4gc3RyO1xuICAvLyBgY2hgIGRlZmF1bHRzIHRvIGAnICdgXG4gIGlmICghY2ggJiYgY2ggIT09IDApIGNoID0gJyAnO1xuICAvLyBjb252ZXJ0IGBjaGAgdG8gYHN0cmluZ2BcbiAgY2ggPSBjaCArICcnO1xuICAvLyBjYWNoZSBjb21tb24gdXNlIGNhc2VzXG4gIGlmIChjaCA9PT0gJyAnICYmIGxlbiA8IDEwKSByZXR1cm4gY2FjaGVbbGVuXSArIHN0cjtcbiAgLy8gYHBhZGAgc3RhcnRzIHdpdGggYW4gZW1wdHkgc3RyaW5nXG4gIHZhciBwYWQgPSAnJztcbiAgLy8gbG9vcFxuICB3aGlsZSAodHJ1ZSkge1xuICAgIC8vIGFkZCBgY2hgIHRvIGBwYWRgIGlmIGBsZW5gIGlzIG9kZFxuICAgIGlmIChsZW4gJiAxKSBwYWQgKz0gY2g7XG4gICAgLy8gZGV2aWRlIGBsZW5gIGJ5IDIsIGRpdGNoIHRoZSBmcmFjdGlvblxuICAgIGxlbiA+Pj0gMTtcbiAgICAvLyBcImRvdWJsZVwiIHRoZSBgY2hgIHNvIHRoaXMgb3BlcmF0aW9uIGNvdW50IGdyb3dzIGxvZ2FyaXRobWljYWxseSBvbiBgbGVuYFxuICAgIC8vIGVhY2ggdGltZSBgY2hgIGlzIFwiZG91YmxlZFwiLCB0aGUgYGxlbmAgd291bGQgbmVlZCB0byBiZSBcImRvdWJsZWRcIiB0b29cbiAgICAvLyBzaW1pbGFyIHRvIGZpbmRpbmcgYSB2YWx1ZSBpbiBiaW5hcnkgc2VhcmNoIHRyZWUsIGhlbmNlIE8obG9nKG4pKVxuICAgIGlmIChsZW4pIGNoICs9IGNoO1xuICAgIC8vIGBsZW5gIGlzIDAsIGV4aXQgdGhlIGxvb3BcbiAgICBlbHNlIGJyZWFrO1xuICB9XG4gIC8vIHBhZCBgc3RyYCFcbiAgcmV0dXJuIHBhZCArIHN0cjtcbn1cbiIsIi8qXG4gKiBzbW9vdGhzY3JvbGwgcG9seWZpbGwgLSB2MC4zLjRcbiAqIGh0dHBzOi8vaWFtZHVzdGFuLmdpdGh1Yi5pby9zbW9vdGhzY3JvbGxcbiAqIDIwMTYgKGMpIER1c3RhbiBLYXN0ZW4sIEplcmVtaWFzIE1lbmljaGVsbGkgLSBNSVQgTGljZW5zZVxuICovXG5cbihmdW5jdGlvbih3LCBkLCB1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qXG4gICAqIGFsaWFzZXNcbiAgICogdzogd2luZG93IGdsb2JhbCBvYmplY3RcbiAgICogZDogZG9jdW1lbnRcbiAgICogdW5kZWZpbmVkOiB1bmRlZmluZWRcbiAgICovXG5cbiAgLy8gcG9seWZpbGxcbiAgZnVuY3Rpb24gcG9seWZpbGwoKSB7XG4gICAgLy8gcmV0dXJuIHdoZW4gc2Nyb2xsQmVoYXZpb3IgaW50ZXJmYWNlIGlzIHN1cHBvcnRlZFxuICAgIGlmICgnc2Nyb2xsQmVoYXZpb3InIGluIGQuZG9jdW1lbnRFbGVtZW50LnN0eWxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBnbG9iYWxzXG4gICAgICovXG4gICAgdmFyIEVsZW1lbnQgPSB3LkhUTUxFbGVtZW50IHx8IHcuRWxlbWVudDtcbiAgICB2YXIgU0NST0xMX1RJTUUgPSA0Njg7XG5cbiAgICAvKlxuICAgICAqIG9iamVjdCBnYXRoZXJpbmcgb3JpZ2luYWwgc2Nyb2xsIG1ldGhvZHNcbiAgICAgKi9cbiAgICB2YXIgb3JpZ2luYWwgPSB7XG4gICAgICBzY3JvbGw6IHcuc2Nyb2xsIHx8IHcuc2Nyb2xsVG8sXG4gICAgICBzY3JvbGxCeTogdy5zY3JvbGxCeSxcbiAgICAgIHNjcm9sbEludG9WaWV3OiBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxJbnRvVmlld1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIGRlZmluZSB0aW1pbmcgbWV0aG9kXG4gICAgICovXG4gICAgdmFyIG5vdyA9IHcucGVyZm9ybWFuY2UgJiYgdy5wZXJmb3JtYW5jZS5ub3dcbiAgICAgID8gdy5wZXJmb3JtYW5jZS5ub3cuYmluZCh3LnBlcmZvcm1hbmNlKSA6IERhdGUubm93O1xuXG4gICAgLyoqXG4gICAgICogY2hhbmdlcyBzY3JvbGwgcG9zaXRpb24gaW5zaWRlIGFuIGVsZW1lbnRcbiAgICAgKiBAbWV0aG9kIHNjcm9sbEVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gICAgICovXG4gICAgZnVuY3Rpb24gc2Nyb2xsRWxlbWVudCh4LCB5KSB7XG4gICAgICB0aGlzLnNjcm9sbExlZnQgPSB4O1xuICAgICAgdGhpcy5zY3JvbGxUb3AgPSB5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgcmVzdWx0IG9mIGFwcGx5aW5nIGVhc2UgbWF0aCBmdW5jdGlvbiB0byBhIG51bWJlclxuICAgICAqIEBtZXRob2QgZWFzZVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBrXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBlYXNlKGspIHtcbiAgICAgIHJldHVybiAwLjUgKiAoMSAtIE1hdGguY29zKE1hdGguUEkgKiBrKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaW5kaWNhdGVzIGlmIGEgc21vb3RoIGJlaGF2aW9yIHNob3VsZCBiZSBhcHBsaWVkXG4gICAgICogQG1ldGhvZCBzaG91bGRCYWlsT3V0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ8T2JqZWN0fSB4XG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAgICovXG4gICAgZnVuY3Rpb24gc2hvdWxkQmFpbE91dCh4KSB7XG4gICAgICBpZiAodHlwZW9mIHggIT09ICdvYmplY3QnXG4gICAgICAgICAgICB8fCB4ID09PSBudWxsXG4gICAgICAgICAgICB8fCB4LmJlaGF2aW9yID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgIHx8IHguYmVoYXZpb3IgPT09ICdhdXRvJ1xuICAgICAgICAgICAgfHwgeC5iZWhhdmlvciA9PT0gJ2luc3RhbnQnKSB7XG4gICAgICAgIC8vIGZpcnN0IGFyZyBub3QgYW4gb2JqZWN0L251bGxcbiAgICAgICAgLy8gb3IgYmVoYXZpb3IgaXMgYXV0bywgaW5zdGFudCBvciB1bmRlZmluZWRcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgeCA9PT0gJ29iamVjdCdcbiAgICAgICAgICAgICYmIHguYmVoYXZpb3IgPT09ICdzbW9vdGgnKSB7XG4gICAgICAgIC8vIGZpcnN0IGFyZ3VtZW50IGlzIGFuIG9iamVjdCBhbmQgYmVoYXZpb3IgaXMgc21vb3RoXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gdGhyb3cgZXJyb3Igd2hlbiBiZWhhdmlvciBpcyBub3Qgc3VwcG9ydGVkXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdiZWhhdmlvciBub3QgdmFsaWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBmaW5kcyBzY3JvbGxhYmxlIHBhcmVudCBvZiBhbiBlbGVtZW50XG4gICAgICogQG1ldGhvZCBmaW5kU2Nyb2xsYWJsZVBhcmVudFxuICAgICAqIEBwYXJhbSB7Tm9kZX0gZWxcbiAgICAgKiBAcmV0dXJucyB7Tm9kZX0gZWxcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmaW5kU2Nyb2xsYWJsZVBhcmVudChlbCkge1xuICAgICAgdmFyIGlzQm9keTtcbiAgICAgIHZhciBoYXNTY3JvbGxhYmxlU3BhY2U7XG4gICAgICB2YXIgaGFzVmlzaWJsZU92ZXJmbG93O1xuXG4gICAgICBkbyB7XG4gICAgICAgIGVsID0gZWwucGFyZW50Tm9kZTtcblxuICAgICAgICAvLyBzZXQgY29uZGl0aW9uIHZhcmlhYmxlc1xuICAgICAgICBpc0JvZHkgPSBlbCA9PT0gZC5ib2R5O1xuICAgICAgICBoYXNTY3JvbGxhYmxlU3BhY2UgPVxuICAgICAgICAgIGVsLmNsaWVudEhlaWdodCA8IGVsLnNjcm9sbEhlaWdodCB8fFxuICAgICAgICAgIGVsLmNsaWVudFdpZHRoIDwgZWwuc2Nyb2xsV2lkdGg7XG4gICAgICAgIGhhc1Zpc2libGVPdmVyZmxvdyA9XG4gICAgICAgICAgdy5nZXRDb21wdXRlZFN0eWxlKGVsLCBudWxsKS5vdmVyZmxvdyA9PT0gJ3Zpc2libGUnO1xuICAgICAgfSB3aGlsZSAoIWlzQm9keSAmJiAhKGhhc1Njcm9sbGFibGVTcGFjZSAmJiAhaGFzVmlzaWJsZU92ZXJmbG93KSk7XG5cbiAgICAgIGlzQm9keSA9IGhhc1Njcm9sbGFibGVTcGFjZSA9IGhhc1Zpc2libGVPdmVyZmxvdyA9IG51bGw7XG5cbiAgICAgIHJldHVybiBlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzZWxmIGludm9rZWQgZnVuY3Rpb24gdGhhdCwgZ2l2ZW4gYSBjb250ZXh0LCBzdGVwcyB0aHJvdWdoIHNjcm9sbGluZ1xuICAgICAqIEBtZXRob2Qgc3RlcFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gICAgICovXG4gICAgZnVuY3Rpb24gc3RlcChjb250ZXh0KSB7XG4gICAgICAvLyBjYWxsIG1ldGhvZCBhZ2FpbiBvbiBuZXh0IGF2YWlsYWJsZSBmcmFtZVxuICAgICAgY29udGV4dC5mcmFtZSA9IHcucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0ZXAuYmluZCh3LCBjb250ZXh0KSk7XG5cbiAgICAgIHZhciB0aW1lID0gbm93KCk7XG4gICAgICB2YXIgdmFsdWU7XG4gICAgICB2YXIgY3VycmVudFg7XG4gICAgICB2YXIgY3VycmVudFk7XG4gICAgICB2YXIgZWxhcHNlZCA9ICh0aW1lIC0gY29udGV4dC5zdGFydFRpbWUpIC8gU0NST0xMX1RJTUU7XG5cbiAgICAgIC8vIGF2b2lkIGVsYXBzZWQgdGltZXMgaGlnaGVyIHRoYW4gb25lXG4gICAgICBlbGFwc2VkID0gZWxhcHNlZCA+IDEgPyAxIDogZWxhcHNlZDtcblxuICAgICAgLy8gYXBwbHkgZWFzaW5nIHRvIGVsYXBzZWQgdGltZVxuICAgICAgdmFsdWUgPSBlYXNlKGVsYXBzZWQpO1xuXG4gICAgICBjdXJyZW50WCA9IGNvbnRleHQuc3RhcnRYICsgKGNvbnRleHQueCAtIGNvbnRleHQuc3RhcnRYKSAqIHZhbHVlO1xuICAgICAgY3VycmVudFkgPSBjb250ZXh0LnN0YXJ0WSArIChjb250ZXh0LnkgLSBjb250ZXh0LnN0YXJ0WSkgKiB2YWx1ZTtcblxuICAgICAgY29udGV4dC5tZXRob2QuY2FsbChjb250ZXh0LnNjcm9sbGFibGUsIGN1cnJlbnRYLCBjdXJyZW50WSk7XG5cbiAgICAgIC8vIHJldHVybiB3aGVuIGVuZCBwb2ludHMgaGF2ZSBiZWVuIHJlYWNoZWRcbiAgICAgIGlmIChjdXJyZW50WCA9PT0gY29udGV4dC54ICYmIGN1cnJlbnRZID09PSBjb250ZXh0LnkpIHtcbiAgICAgICAgdy5jYW5jZWxBbmltYXRpb25GcmFtZShjb250ZXh0LmZyYW1lKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNjcm9sbHMgd2luZG93IHdpdGggYSBzbW9vdGggYmVoYXZpb3JcbiAgICAgKiBAbWV0aG9kIHNtb290aFNjcm9sbFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fE5vZGV9IGVsXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNtb290aFNjcm9sbChlbCwgeCwgeSkge1xuICAgICAgdmFyIHNjcm9sbGFibGU7XG4gICAgICB2YXIgc3RhcnRYO1xuICAgICAgdmFyIHN0YXJ0WTtcbiAgICAgIHZhciBtZXRob2Q7XG4gICAgICB2YXIgc3RhcnRUaW1lID0gbm93KCk7XG4gICAgICB2YXIgZnJhbWU7XG5cbiAgICAgIC8vIGRlZmluZSBzY3JvbGwgY29udGV4dFxuICAgICAgaWYgKGVsID09PSBkLmJvZHkpIHtcbiAgICAgICAgc2Nyb2xsYWJsZSA9IHc7XG4gICAgICAgIHN0YXJ0WCA9IHcuc2Nyb2xsWCB8fCB3LnBhZ2VYT2Zmc2V0O1xuICAgICAgICBzdGFydFkgPSB3LnNjcm9sbFkgfHwgdy5wYWdlWU9mZnNldDtcbiAgICAgICAgbWV0aG9kID0gb3JpZ2luYWwuc2Nyb2xsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2Nyb2xsYWJsZSA9IGVsO1xuICAgICAgICBzdGFydFggPSBlbC5zY3JvbGxMZWZ0O1xuICAgICAgICBzdGFydFkgPSBlbC5zY3JvbGxUb3A7XG4gICAgICAgIG1ldGhvZCA9IHNjcm9sbEVsZW1lbnQ7XG4gICAgICB9XG5cbiAgICAgIC8vIGNhbmNlbCBmcmFtZSB3aGVuIGEgc2Nyb2xsIGV2ZW50J3MgaGFwcGVuaW5nXG4gICAgICBpZiAoZnJhbWUpIHtcbiAgICAgICAgdy5jYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHNjcm9sbCBsb29waW5nIG92ZXIgYSBmcmFtZVxuICAgICAgc3RlcCh7XG4gICAgICAgIHNjcm9sbGFibGU6IHNjcm9sbGFibGUsXG4gICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICBzdGFydFRpbWU6IHN0YXJ0VGltZSxcbiAgICAgICAgc3RhcnRYOiBzdGFydFgsXG4gICAgICAgIHN0YXJ0WTogc3RhcnRZLFxuICAgICAgICB4OiB4LFxuICAgICAgICB5OiB5LFxuICAgICAgICBmcmFtZTogZnJhbWVcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogT1JJR0lOQUwgTUVUSE9EUyBPVkVSUklERVNcbiAgICAgKi9cblxuICAgIC8vIHcuc2Nyb2xsIGFuZCB3LnNjcm9sbFRvXG4gICAgdy5zY3JvbGwgPSB3LnNjcm9sbFRvID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCBzbW9vdGggYmVoYXZpb3IgaWYgbm90IHJlcXVpcmVkXG4gICAgICBpZiAoc2hvdWxkQmFpbE91dChhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIG9yaWdpbmFsLnNjcm9sbC5jYWxsKFxuICAgICAgICAgIHcsXG4gICAgICAgICAgYXJndW1lbnRzWzBdLmxlZnQgfHwgYXJndW1lbnRzWzBdLFxuICAgICAgICAgIGFyZ3VtZW50c1swXS50b3AgfHwgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgIHcsXG4gICAgICAgIGQuYm9keSxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0ubGVmdCxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0udG9wXG4gICAgICApO1xuICAgIH07XG5cbiAgICAvLyB3LnNjcm9sbEJ5XG4gICAgdy5zY3JvbGxCeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYXZvaWQgc21vb3RoIGJlaGF2aW9yIGlmIG5vdCByZXF1aXJlZFxuICAgICAgaWYgKHNob3VsZEJhaWxPdXQoYXJndW1lbnRzWzBdKSkge1xuICAgICAgICBvcmlnaW5hbC5zY3JvbGxCeS5jYWxsKFxuICAgICAgICAgIHcsXG4gICAgICAgICAgYXJndW1lbnRzWzBdLmxlZnQgfHwgYXJndW1lbnRzWzBdLFxuICAgICAgICAgIGFyZ3VtZW50c1swXS50b3AgfHwgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgIHcsXG4gICAgICAgIGQuYm9keSxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0ubGVmdCArICh3LnNjcm9sbFggfHwgdy5wYWdlWE9mZnNldCksXG4gICAgICAgIH5+YXJndW1lbnRzWzBdLnRvcCArICh3LnNjcm9sbFkgfHwgdy5wYWdlWU9mZnNldClcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8vIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3XG4gICAgRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXcgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGF2b2lkIHNtb290aCBiZWhhdmlvciBpZiBub3QgcmVxdWlyZWRcbiAgICAgIGlmIChzaG91bGRCYWlsT3V0KGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgb3JpZ2luYWwuc2Nyb2xsSW50b1ZpZXcuY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0gfHwgdHJ1ZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgdmFyIHNjcm9sbGFibGVQYXJlbnQgPSBmaW5kU2Nyb2xsYWJsZVBhcmVudCh0aGlzKTtcbiAgICAgIHZhciBwYXJlbnRSZWN0cyA9IHNjcm9sbGFibGVQYXJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB2YXIgY2xpZW50UmVjdHMgPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICBpZiAoc2Nyb2xsYWJsZVBhcmVudCAhPT0gZC5ib2R5KSB7XG4gICAgICAgIC8vIHJldmVhbCBlbGVtZW50IGluc2lkZSBwYXJlbnRcbiAgICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgICAgdGhpcyxcbiAgICAgICAgICBzY3JvbGxhYmxlUGFyZW50LFxuICAgICAgICAgIHNjcm9sbGFibGVQYXJlbnQuc2Nyb2xsTGVmdCArIGNsaWVudFJlY3RzLmxlZnQgLSBwYXJlbnRSZWN0cy5sZWZ0LFxuICAgICAgICAgIHNjcm9sbGFibGVQYXJlbnQuc2Nyb2xsVG9wICsgY2xpZW50UmVjdHMudG9wIC0gcGFyZW50UmVjdHMudG9wXG4gICAgICAgICk7XG4gICAgICAgIC8vIHJldmVhbCBwYXJlbnQgaW4gdmlld3BvcnRcbiAgICAgICAgdy5zY3JvbGxCeSh7XG4gICAgICAgICAgbGVmdDogcGFyZW50UmVjdHMubGVmdCxcbiAgICAgICAgICB0b3A6IHBhcmVudFJlY3RzLnRvcCxcbiAgICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCdcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZXZlYWwgZWxlbWVudCBpbiB2aWV3cG9ydFxuICAgICAgICB3LnNjcm9sbEJ5KHtcbiAgICAgICAgICBsZWZ0OiBjbGllbnRSZWN0cy5sZWZ0LFxuICAgICAgICAgIHRvcDogY2xpZW50UmVjdHMudG9wLFxuICAgICAgICAgIGJlaGF2aW9yOiAnc21vb3RoJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIGNvbW1vbmpzXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7IHBvbHlmaWxsOiBwb2x5ZmlsbCB9O1xuICB9IGVsc2Uge1xuICAgIC8vIGdsb2JhbFxuICAgIHBvbHlmaWxsKCk7XG4gIH1cbn0pKHdpbmRvdywgZG9jdW1lbnQpO1xuIiwiLyogZ2xvYmFsIGdhICovXG5cbmNvbnN0IHNlbGYgPSB7fVxuXG5zZWxmLnNlbmQgPSB7fVxuXG5zZWxmLnNlbmQuc2VhcmNoID0gZnVuY3Rpb24gKHNlbGVjdGVkVXNlciwgZmF2b3JpdGUpIHtcbiAgY29uc3QgaGl0VHlwZSA9ICdldmVudCdcblxuICBjb25zdCBldmVudENhdGVnb3J5ID0gZmF2b3JpdGUgPyAnc2VhcmNoIGZhdicgOiAnc2VhcmNoJ1xuXG4gIGxldCBldmVudEFjdGlvblxuICBzd2l0Y2ggKHNlbGVjdGVkVXNlci50eXBlKSB7XG4gICAgY2FzZSAnYyc6XG4gICAgICBldmVudEFjdGlvbiA9ICdDbGFzcydcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndCc6XG4gICAgICBldmVudEFjdGlvbiA9ICdUZWFjaGVyJ1xuICAgICAgYnJlYWtcbiAgICBjYXNlICdyJzpcbiAgICAgIGV2ZW50QWN0aW9uID0gJ1Jvb20nXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3MnOlxuICAgICAgZXZlbnRBY3Rpb24gPSAnU3R1ZGVudCdcbiAgICAgIGJyZWFrXG4gIH1cblxuICBjb25zdCBldmVudExhYmVsID0gc2VsZWN0ZWRVc2VyLnZhbHVlXG5cbiAgZ2EoZnVuY3Rpb24gKCkge1xuICAgIGdhKCdzZW5kJywgeyBoaXRUeXBlLCBldmVudENhdGVnb3J5LCBldmVudEFjdGlvbiwgZXZlbnRMYWJlbCB9KVxuICB9KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsImNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5cbmNvbnN0IHNlbGYgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fdXNlcnMgPSBbXVxuc2VsZi5fc2VsZWN0ZWRVc2VySW5kZXggPSAtMVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgc2VhcmNoOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2VhcmNoJyksXG4gIGlucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJyksXG4gIGF1dG9jb21wbGV0ZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZScpXG59XG5cbnNlbGYuZ2V0U2VsZWN0ZWRVc2VyID0gZnVuY3Rpb24gKCkge1xuICBpZiAoc2VsZi5nZXRJdGVtcygpID09PSBbXSkgcmV0dXJuXG5cbiAgaWYgKHNlbGYuZ2V0U2VsZWN0ZWRVc2VySW5kZXgoKSA9PT0gLTEpIHtcbiAgICByZXR1cm4gc2VsZi5nZXRJdGVtcygpWzBdXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHNlbGYuZ2V0SXRlbXMoKVtzZWxmLmdldFNlbGVjdGVkVXNlckluZGV4KCldXG4gIH1cbn1cblxuc2VsZi5nZXRTZWxlY3RlZFVzZXJJbmRleCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHNlbGYuX3NlbGVjdGVkVXNlckluZGV4XG59XG5cbnNlbGYuZ2V0SXRlbXMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBzZWxmLl91c2Vyc1xufVxuXG5zZWxmLnJlbW92ZUFsbEl0ZW1zID0gZnVuY3Rpb24gKCkge1xuICB3aGlsZSAoc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmZpcnN0Q2hpbGQpIHtcbiAgICBzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUucmVtb3ZlQ2hpbGQoc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmZpcnN0Q2hpbGQpXG4gIH1cbiAgc2VsZi5fdXNlcnMgPSBbXVxuICBzZWxmLl9zZWxlY3RlZFVzZXJJbmRleCA9IC0xXG59XG5cbnNlbGYuYWRkSXRlbSA9IGZ1bmN0aW9uICh1c2VyKSB7XG4gIGNvbnN0IGxpc3RJdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKVxuICBsaXN0SXRlbS50ZXh0Q29udGVudCA9IHVzZXIudmFsdWVcbiAgc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmFwcGVuZENoaWxkKGxpc3RJdGVtKVxuICBzZWxmLl91c2Vycy5wdXNoKHVzZXIpXG59XG5cbnNlbGYuX21vdmVTZWxlY3RlZCA9IGZ1bmN0aW9uIChzaGlmdCkge1xuICBpZiAoc2VsZi5fc2VsZWN0ZWRVc2VySW5kZXggKyBzaGlmdCA+PSBzZWxmLmdldEl0ZW1zKCkubGVuZ3RoKSB7XG4gICAgc2VsZi5fc2VsZWN0ZWRVc2VySW5kZXggPSAtMVxuICB9IGVsc2UgaWYgKHNlbGYuX3NlbGVjdGVkVXNlckluZGV4ICsgc2hpZnQgPCAtMSkge1xuICAgIHNlbGYuX3NlbGVjdGVkVXNlckluZGV4ID0gc2VsZi5nZXRJdGVtcygpLmxlbmd0aCAtIDFcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9zZWxlY3RlZFVzZXJJbmRleCArPSBzaGlmdFxuICB9XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxmLmdldEl0ZW1zKCkubGVuZ3RoOyBpKyspIHtcbiAgICBzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuY2hpbGRyZW5baV0uY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKVxuICB9XG4gIGlmIChzZWxmLl9zZWxlY3RlZFVzZXJJbmRleCA+PSAwKSB7XG4gICAgc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlXG4gICAgICAgIC5jaGlsZHJlbltzZWxmLl9zZWxlY3RlZFVzZXJJbmRleF0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKVxuICB9XG59XG5cbnNlbGYuX2hhbmRsZUl0ZW1DbGljayA9IGZ1bmN0aW9uIChldmVudCkge1xuICBpZiAoIXNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5jb250YWlucyhldmVudC50YXJnZXQpKSByZXR1cm5cbiAgY29uc3QgdXNlckluZGV4ID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2ZcbiAgICAgIC5jYWxsKHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5jaGlsZHJlbiwgZXZlbnQudGFyZ2V0KVxuICBzZWxmLl9zZWxlY3RlZFVzZXJJbmRleCA9IHVzZXJJbmRleFxuICBzZWxmLmVtaXQoJ3NlbGVjdCcsIHNlbGYuZ2V0U2VsZWN0ZWRVc2VyKCkpXG59XG5cbnNlbGYuX2hhbmRsZUtleWRvd24gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgaWYgKGV2ZW50LmtleSA9PT0gJ0Fycm93RG93bicgfHwgZXZlbnQua2V5ID09PSAnQXJyb3dVcCcpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaWYgKGV2ZW50LmtleSA9PT0gJ0Fycm93RG93bicpIHtcbiAgICAgIHNlbGYuX21vdmVTZWxlY3RlZCgxKVxuICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09PSAnQXJyb3dVcCcpIHtcbiAgICAgIHNlbGYuX21vdmVTZWxlY3RlZCgtMSlcbiAgICB9XG4gIH1cbn1cblxuc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2VsZi5faGFuZGxlSXRlbUNsaWNrKVxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHNlbGYuX2hhbmRsZUtleWRvd24pXG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwiY29uc3Qgc2VsZiA9IHt9XG5cbnNlbGYuaXNJRSA9IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignTVNJRScpICE9PSAtMSB8fFxuICAgICAgICAgICAgbmF2aWdhdG9yLmFwcFZlcnNpb24uaW5kZXhPZignVHJpZGVudC8nKSA+IDBcblxuaWYgKHNlbGYuaXNJRSkge1xuICBzZWxmLmlucHV0RXZlbnQgPSAndGV4dGlucHV0J1xufSBlbHNlIHtcbiAgc2VsZi5pbnB1dEV2ZW50ID0gJ2lucHV0J1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsIi8qIGdsb2JhbCBVU0VSUyAqL1xuXG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuXG5jb25zdCBzZWxmID0gbmV3IEV2ZW50RW1pdHRlcigpXG5cbnNlbGYuX25vZGVzID0ge1xuICB0b2dnbGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mYXYnKVxufVxuXG5zZWxmLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBsb2NhbFN0b3JhZ2VVc2VyID0gSlNPTi5wYXJzZSh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2ZhdicpKVxuICAgIGlmIChsb2NhbFN0b3JhZ2VVc2VyID09IG51bGwpIHJldHVyblxuXG4gICAgY29uc3QgY29ycmVjdGVkVXNlciA9IFVTRVJTLmZpbHRlcihmdW5jdGlvbiAodXNlcikge1xuICAgICAgcmV0dXJuIHVzZXIudHlwZSA9PT0gbG9jYWxTdG9yYWdlVXNlci50eXBlICYmXG4gICAgICAgICAgICAgdXNlci52YWx1ZSA9PT0gbG9jYWxTdG9yYWdlVXNlci52YWx1ZVxuICAgIH0pWzBdXG4gICAgcmV0dXJuIGNvcnJlY3RlZFVzZXJcbiAgfSBjYXRjaCAoZSkge1xuICAgIHNlbGYuZGVsZXRlKClcbiAgICByZXR1cm5cbiAgfVxufVxuXG5zZWxmLnNldCA9IGZ1bmN0aW9uICh1c2VyKSB7XG4gIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZmF2JywgSlNPTi5zdHJpbmdpZnkodXNlcikpXG4gIHNlbGYuX25vZGVzLmlubmVySFRNTCA9ICcmI3hFODM4Oydcbn1cblxuc2VsZi5kZWxldGUgPSBmdW5jdGlvbiAoKSB7XG4gIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnZmF2Jylcbn1cblxuc2VsZi51cGRhdGVEb20gPSBmdW5jdGlvbiAoaXNGYXZvcml0ZSkge1xuICBpZiAoaXNGYXZvcml0ZSkge1xuICAgIHNlbGYuX25vZGVzLnRvZ2dsZS5pbm5lckhUTUwgPSAnJiN4RTgzODsnXG4gIH0gZWxzZSB7XG4gICAgc2VsZi5fbm9kZXMudG9nZ2xlLmlubmVySFRNTCA9ICcmI3hFODNBJ1xuICB9XG59XG5cbnNlbGYudXBkYXRlID0gZnVuY3Rpb24gKHNlbGVjdGVkVXNlcikge1xuICBjb25zdCBjdXJyZW50VXNlciA9IHNlbGYuZ2V0KClcblxuICBpZiAoY3VycmVudFVzZXIgPT0gbnVsbCkge1xuICAgIHNlbGYudXBkYXRlRG9tKGZhbHNlKVxuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3QgaXNFcXVhbCA9IGN1cnJlbnRVc2VyLnR5cGUgPT09IHNlbGVjdGVkVXNlci50eXBlICYmXG4gICAgICAgICAgICAgICAgICBjdXJyZW50VXNlci5pbmRleCA9PT0gc2VsZWN0ZWRVc2VyLmluZGV4XG5cbiAgc2VsZi51cGRhdGVEb20oaXNFcXVhbClcbn1cblxuc2VsZi50b2dnbGUgPSBmdW5jdGlvbiAoc2VsZWN0ZWRVc2VyKSB7XG4gIGNvbnN0IGN1cnJlbnRVc2VyID0gc2VsZi5nZXQoKVxuICBjb25zdCBpc0VxdWFsID0gY3VycmVudFVzZXIgIT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgY3VycmVudFVzZXIudHlwZSA9PT0gc2VsZWN0ZWRVc2VyLnR5cGUgJiZcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRVc2VyLmluZGV4ID09PSBzZWxlY3RlZFVzZXIuaW5kZXhcblxuICBpZiAoaXNFcXVhbCkge1xuICAgIHNlbGYuZGVsZXRlKClcbiAgICBzZWxmLnVwZGF0ZURvbShmYWxzZSlcbiAgfSBlbHNlIHtcbiAgICBzZWxmLnNldChzZWxlY3RlZFVzZXIpXG4gICAgc2VsZi51cGRhdGVEb20odHJ1ZSlcbiAgfVxufVxuXG5zZWxmLl9oYW5kbGVDbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgc2VsZi5lbWl0KCdjbGljaycpXG59XG5cbnNlbGYuX25vZGVzLnRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlbGYuX2hhbmRsZUNsaWNrKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsIi8qIGdsb2JhbCBGTEFHUyAqL1xuXG5jb25zdCBzZWxmID0ge31cblxuc2VsZi5fbm9kZXMgPSB7XG4gIGlucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJyksXG4gIG92ZXJmbG93QnV0dG9uOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjb3ZlcmZsb3ctYnV0dG9uJylcbn1cblxuc2VsZi5fc2hvdWxkQ2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBGTEFHUy5pbmRleE9mKCdOT19GRUFUVVJFX0RFVEVDVCcpID09PSAtMVxufVxuXG5zZWxmLl9yZWRpcmVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnaHR0cDovL3d3dy5tZWV0aW5ncG9pbnRtY28ubmwvUm9vc3RlcnMtQUwvZG9jLydcbn1cblxuc2VsZi5jaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCFzZWxmLl9zaG91bGRDaGVjaygpKSByZXR1cm5cblxuICB3aW5kb3cub25lcnJvciA9IHNlbGYuX3JlZGlyZWN0XG5cbiAgaWYgKHNlbGYuX25vZGVzLmlucHV0LmdldENsaWVudFJlY3RzKClbMF0udG9wICE9PVxuICAgICAgc2VsZi5fbm9kZXMub3ZlcmZsb3dCdXR0b24uZ2V0Q2xpZW50UmVjdHMoKVswXS50b3ApIHtcbiAgICBzZWxmLl9yZWRpcmVjdCgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJjb25zdCBicm93c2VyRml4VG9vbGtpdCA9IHJlcXVpcmUoJy4vYnJvd3NlckZpeFRvb2xraXQnKVxuXG5jb25zdCBzZWxmID0ge31cblxuc2VsZi5fbm9kZXMgPSB7XG4gIGlucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJylcbn1cblxuc2VsZi5pc1Nob3duID0gZmFsc2Vcblxuc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ25vLWlucHV0JylcbiAgc2VsZi5pc1Nob3duID0gdHJ1ZVxufVxuXG5zZWxmLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbm8taW5wdXQnKVxuICBzZWxmLmlzU2hvd24gPSBmYWxzZVxufVxuXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKGJyb3dzZXJGaXhUb29sa2l0LmlucHV0RXZlbnQsIHNlbGYuaGlkZSlcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJyZXF1aXJlKCcuL2ZlYXR1cmVEZXRlY3QnKS5jaGVjaygpXG5cbmNvbnN0IGZyb250cGFnZSA9IHJlcXVpcmUoJy4vZnJvbnRwYWdlJylcbmNvbnN0IHNlYXJjaCA9IHJlcXVpcmUoJy4vc2VhcmNoJylcbmNvbnN0IHNjaGVkdWxlID0gcmVxdWlyZSgnLi9zY2hlZHVsZScpXG5jb25zdCB3ZWVrU2VsZWN0b3IgPSByZXF1aXJlKCcuL3dlZWtTZWxlY3RvcicpXG5jb25zdCBmYXZvcml0ZSA9IHJlcXVpcmUoJy4vZmF2b3JpdGUnKVxuY29uc3Qgc2Nyb2xsU25hcCA9IHJlcXVpcmUoJy4vc2Nyb2xsU25hcCcpXG5jb25zdCBhbmFseXRpY3MgPSByZXF1aXJlKCcuL2FuYWx5dGljcycpXG5jb25zdCB1cmwgPSByZXF1aXJlKCcuL3VybCcpXG5cbmNvbnN0IHN0YXRlID0ge31cblxud2luZG93LnN0YXRlID0gc3RhdGVcbndpbmRvdy5yZXF1aXJlID0gcmVxdWlyZVxuXG5mcm9udHBhZ2Uuc2hvdygpXG53ZWVrU2VsZWN0b3IudXBkYXRlQ3VycmVudFdlZWsoKVxuc2Nyb2xsU25hcC5zdGFydExpc3RlbmluZygpXG5cbmlmICh1cmwuaGFzU2VsZWN0ZWRVc2VyKCkpIHtcbiAgc3RhdGUuc2VsZWN0ZWRVc2VyID0gdXJsLmdldFNlbGVjdGVkVXNlcigpXG5cbiAgZmF2b3JpdGUudXBkYXRlKHN0YXRlLnNlbGVjdGVkVXNlcilcbiAgdXJsLnVwZGF0ZShzdGF0ZS5zZWxlY3RlZFVzZXIpXG4gIGFuYWx5dGljcy5zZW5kLnNlYXJjaChzdGF0ZS5zZWxlY3RlZFVzZXIpXG5cbiAgc2NoZWR1bGUudmlld0l0ZW0od2Vla1NlbGVjdG9yLmdldFNlbGVjdGVkV2VlaygpLCBzdGF0ZS5zZWxlY3RlZFVzZXIpXG59IGVsc2UgaWYgKGZhdm9yaXRlLmdldCgpICE9IG51bGwpIHtcbiAgc3RhdGUuc2VsZWN0ZWRVc2VyID0gZmF2b3JpdGUuZ2V0KClcblxuICBmYXZvcml0ZS51cGRhdGUoc3RhdGUuc2VsZWN0ZWRVc2VyKVxuICB1cmwucHVzaChzdGF0ZS5zZWxlY3RlZFVzZXIsIGZhbHNlKVxuICB1cmwudXBkYXRlKHN0YXRlLnNlbGVjdGVkVXNlcilcbiAgYW5hbHl0aWNzLnNlbmQuc2VhcmNoKHN0YXRlLnNlbGVjdGVkVXNlciwgdHJ1ZSlcblxuICBzY2hlZHVsZS52aWV3SXRlbSh3ZWVrU2VsZWN0b3IuZ2V0U2VsZWN0ZWRXZWVrKCksIHN0YXRlLnNlbGVjdGVkVXNlcilcbn0gZWxzZSB7XG4gIHNlYXJjaC5mb2N1cygpXG59XG5cbnNlYXJjaC5vbignc2VhcmNoJywgZnVuY3Rpb24gKHNlbGVjdGVkVXNlcikge1xuICBzdGF0ZS5zZWxlY3RlZFVzZXIgPSBzZWxlY3RlZFVzZXJcblxuICBmYXZvcml0ZS51cGRhdGUoc3RhdGUuc2VsZWN0ZWRVc2VyKVxuICB1cmwucHVzaChzdGF0ZS5zZWxlY3RlZFVzZXIpXG4gIHVybC51cGRhdGUoc3RhdGUuc2VsZWN0ZWRVc2VyKVxuICBhbmFseXRpY3Muc2VuZC5zZWFyY2goc3RhdGUuc2VsZWN0ZWRVc2VyKVxuXG4gIHNjaGVkdWxlLnZpZXdJdGVtKHdlZWtTZWxlY3Rvci5nZXRTZWxlY3RlZFdlZWsoKSwgc3RhdGUuc2VsZWN0ZWRVc2VyKVxufSlcblxudXJsLm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAoc2VsZWN0ZWRVc2VyKSB7XG4gIHN0YXRlLnNlbGVjdGVkVXNlciA9IHNlbGVjdGVkVXNlclxuXG4gIGZhdm9yaXRlLnVwZGF0ZShzdGF0ZS5zZWxlY3RlZFVzZXIpXG4gIHVybC51cGRhdGUoc3RhdGUuc2VsZWN0ZWRVc2VyKVxuXG4gIHNjaGVkdWxlLnZpZXdJdGVtKHdlZWtTZWxlY3Rvci5nZXRTZWxlY3RlZFdlZWsoKSwgc3RhdGUuc2VsZWN0ZWRVc2VyKVxufSlcblxud2Vla1NlbGVjdG9yLm9uKCd3ZWVrQ2hhbmdlZCcsIGZ1bmN0aW9uIChuZXdXZWVrKSB7XG4gIGFuYWx5dGljcy5zZW5kLnNlYXJjaChzdGF0ZS5zZWxlY3RlZFVzZXIpXG4gIHNjaGVkdWxlLnZpZXdJdGVtKG5ld1dlZWssIHN0YXRlLnNlbGVjdGVkVXNlcilcbn0pXG5cbmZhdm9yaXRlLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgZmF2b3JpdGUudG9nZ2xlKHN0YXRlLnNlbGVjdGVkVXNlcilcbn0pXG5cbmRvY3VtZW50LmJvZHkuc3R5bGUub3BhY2l0eSA9IDFcbiIsImNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5jb25zdCBsZWZ0UGFkID0gcmVxdWlyZSgnbGVmdC1wYWQnKVxuY29uc3Qgc2VhcmNoID0gcmVxdWlyZSgnLi9zZWFyY2gnKVxuXG5jb25zdCBzZWxmID0gbmV3IEV2ZW50RW1pdHRlcigpXG5cbnNlbGYuX25vZGVzID0ge1xuICBzY2hlZHVsZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NjaGVkdWxlJylcbn1cblxuc2VsZi5fcGFyc2VNZWV0aW5ncG9pbnRIVE1MID0gZnVuY3Rpb24gKGh0bWxTdHIpIHtcbiAgY29uc3QgaHRtbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2h0bWwnKVxuICBodG1sLmlubmVySFRNTCA9IGh0bWxTdHJcbiAgY29uc3QgY2VudGVyTm9kZSA9IGh0bWwucXVlcnlTZWxlY3RvcignY2VudGVyJylcbiAgcmV0dXJuIGNlbnRlck5vZGVcbn1cblxuc2VsZi5faGFuZGxlTG9hZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICBjb25zdCByZXF1ZXN0ID0gZXZlbnQudGFyZ2V0XG4gIGlmIChyZXF1ZXN0LnN0YXR1cyA8IDIwMCB8fCByZXF1ZXN0LnN0YXR1cyA+PSA0MDApIHtcbiAgICBzZWxmLl9oYW5kbGVFcnJvcihldmVudClcbiAgICByZXR1cm5cbiAgfVxuICBjb25zdCBkb2N1bWVudCA9IHNlbGYuX3BhcnNlTWVldGluZ3BvaW50SFRNTChyZXF1ZXN0LnJlc3BvbnNlKVxuICBzZWxmLl9yZW1vdmVDaGlsZHMoKVxuICBzZWxmLl9ub2Rlcy5zY2hlZHVsZS5hcHBlbmRDaGlsZChkb2N1bWVudClcbiAgc2VsZi5fbm9kZXMuc2NoZWR1bGUuY2xhc3NMaXN0LnJlbW92ZSgnZXJyb3InKVxuICBzZWxmLmVtaXQoJ2xvYWQnKVxufVxuXG5zZWxmLl9oYW5kbGVFcnJvciA9IGZ1bmN0aW9uIChldmVudCkge1xuICBjb25zdCByZXF1ZXN0ID0gZXZlbnQudGFyZ2V0XG4gIGxldCBlcnJvclxuICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDQwNCkge1xuICAgIGVycm9yID0gJ1NvcnJ5LCBlciBpcyAobm9nKSBnZWVuIHJvb3N0ZXIgdm9vciBkZXplIHdlZWsuJ1xuICB9IGVsc2Uge1xuICAgIGVycm9yID0gJ1NvcnJ5LCBlciBpcyBpZXRzIG1pcyBnZWdhYW4gdGlqZGVucyBoZXQgbGFkZW4gdmFuIGRlemUgd2Vlay4nXG4gIH1cbiAgc2VsZi5fcmVtb3ZlQ2hpbGRzKClcbiAgc2VsZi5fbm9kZXMuc2NoZWR1bGUudGV4dENvbnRlbnQgPSBlcnJvclxuICBzZWxmLl9ub2Rlcy5zY2hlZHVsZS5jbGFzc0xpc3QuYWRkKCdlcnJvcicpXG4gIHNlbGYuZW1pdCgnbG9hZCcpXG59XG5cbnNlbGYuX2dldFVSTE9mVXNlcnMgPSBmdW5jdGlvbiAod2VlaywgdHlwZSwgaW5kZXgpIHtcbiAgY29uc3QgaWQgPSBpbmRleCArIDFcbiAgY29uc3QgbWVldGluZ3BvaW50VVJMID1cbiAgICAgIGBSb29zdGVycy1BTC9kb2MvZGFncm9vc3RlcnMvJHtsZWZ0UGFkKHdlZWssIDIsICcwJyl9LyR7dHlwZX0vYCArXG4gICAgICBgJHt0eXBlfSR7bGVmdFBhZChpZCwgNSwgJzAnKX0uaHRtYFxuICByZXR1cm4gYC9tZWV0aW5ncG9pbnRQcm94eS8ke3dpbmRvdy5lbmNvZGVVUklDb21wb25lbnQobWVldGluZ3BvaW50VVJMKX1gXG59XG5cbnNlbGYuX3JlbW92ZUNoaWxkcyA9IGZ1bmN0aW9uICgpIHtcbiAgd2hpbGUgKHNlbGYuX25vZGVzLnNjaGVkdWxlLmZpcnN0Q2hpbGQpIHtcbiAgICBzZWxmLl9ub2Rlcy5zY2hlZHVsZS5yZW1vdmVDaGlsZChzZWxmLl9ub2Rlcy5zY2hlZHVsZS5maXJzdENoaWxkKVxuICB9XG59XG5cbnNlbGYudmlld0l0ZW0gPSBmdW5jdGlvbiAod2Vlaywgc2VsZWN0ZWRVc2VyKSB7XG4gIGlmIChzZWxlY3RlZFVzZXIgPT0gbnVsbCkge1xuICAgIHNlbGYuX3JlbW92ZUNoaWxkcygpXG4gICAgc2VhcmNoLnVwZGF0ZURvbShzZWxlY3RlZFVzZXIpXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgdXJsID0gc2VsZi5fZ2V0VVJMT2ZVc2Vycyh3ZWVrLCBzZWxlY3RlZFVzZXIudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkVXNlci5pbmRleClcblxuICAgIHNlbGYuX3JlbW92ZUNoaWxkcygpXG5cbiAgICBjb25zdCByZXF1ZXN0ID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpXG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgc2VsZi5faGFuZGxlTG9hZClcbiAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgc2VsZi5faGFuZGxlRXJyb3IpXG4gICAgcmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpXG4gICAgcmVxdWVzdC5zZW5kKClcblxuICAgIHNlYXJjaC51cGRhdGVEb20oc2VsZWN0ZWRVc2VyKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwicmVxdWlyZSgnc21vb3Roc2Nyb2xsLXBvbHlmaWxsJykucG9seWZpbGwoKVxuXG5jb25zdCBzZWxmID0ge31cbmNvbnN0IHNjaGVkdWxlID0gcmVxdWlyZSgnLi9zY2hlZHVsZScpXG5cbnNlbGYuX25vZGVzID0ge1xuICBzZWFyY2g6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzZWFyY2gnKSxcbiAgd2Vla1NlbGVjdG9yOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd2Vlay1zZWxlY3RvcicpXG59XG5cbnNlbGYuX3RpbWVvdXRJRCA9IG51bGxcblxuc2VsZi5fZ2V0U2Nyb2xsUG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3ApIHx8XG4gICAgICAgICBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxufVxuXG5zZWxmLl9oYW5kbGVEb25lU2Nyb2xsaW5nID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBzY3JvbGxQb3NpdGlvbiA9IHNlbGYuX2dldFNjcm9sbFBvc2l0aW9uKClcbiAgY29uc3Qgd2Vla1NlbGVjdG9ySGVpZ2h0ID1cbiAgICAgIHNlbGYuX25vZGVzLndlZWtTZWxlY3Rvci5jbGllbnRIZWlnaHQgLSBzZWxmLl9ub2Rlcy5zZWFyY2guY2xpZW50SGVpZ2h0XG4gIGlmIChzY3JvbGxQb3NpdGlvbiA8IHdlZWtTZWxlY3RvckhlaWdodCAmJiBzY3JvbGxQb3NpdGlvbiA+IDApIHtcbiAgICB3aW5kb3cuc2Nyb2xsKHsgdG9wOiB3ZWVrU2VsZWN0b3JIZWlnaHQsIGxlZnQ6IDAsIGJlaGF2aW9yOiAnc21vb3RoJyB9KVxuICB9XG59XG5cbnNlbGYuX2hhbmRsZVNjcm9sbCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHNlbGYuX3RpbWVvdXRJRCAhPSBudWxsKSB3aW5kb3cuY2xlYXJUaW1lb3V0KHNlbGYuX3RpbWVvdXRJRClcbiAgc2VsZi5fdGltZW91dElEID0gd2luZG93LnNldFRpbWVvdXQoc2VsZi5faGFuZGxlRG9uZVNjcm9sbGluZywgNTAwKVxuXG4gIGNvbnN0IHNjcm9sbFBvc2l0aW9uID0gc2VsZi5fZ2V0U2Nyb2xsUG9zaXRpb24oKVxuICBjb25zdCB3ZWVrU2VsZWN0b3JIZWlnaHQgPVxuICAgICAgc2VsZi5fbm9kZXMud2Vla1NlbGVjdG9yLmNsaWVudEhlaWdodCAtIHNlbGYuX25vZGVzLnNlYXJjaC5jbGllbnRIZWlnaHRcbiAgaWYgKHNjcm9sbFBvc2l0aW9uID49IHdlZWtTZWxlY3RvckhlaWdodCkge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnd2Vlay1zZWxlY3Rvci1ub3QtdmlzaWJsZScpXG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCd3ZWVrLXNlbGVjdG9yLW5vdC12aXNpYmxlJylcbiAgfVxufVxuXG5zZWxmLl9oYW5kbGVXaW5kb3dSZXNpemUgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHdlZWtTZWxlY3RvckhlaWdodCA9XG4gICAgICBzZWxmLl9ub2Rlcy53ZWVrU2VsZWN0b3IuY2xpZW50SGVpZ2h0IC0gc2VsZi5fbm9kZXMuc2VhcmNoLmNsaWVudEhlaWdodFxuICBjb25zdCBleHRyYVBpeGVsc05lZWRlZCA9XG4gICAgICB3ZWVrU2VsZWN0b3JIZWlnaHQgLSAoZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQgLSB3aW5kb3cuaW5uZXJIZWlnaHQpXG4gIGlmIChleHRyYVBpeGVsc05lZWRlZCA+IDApIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm1hcmdpbkJvdHRvbSA9IGV4dHJhUGl4ZWxzTmVlZGVkICsgJ3B4J1xuICB9IGVsc2Uge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUubWFyZ2luQm90dG9tID0gbnVsbFxuICB9XG59XG5cbnNlbGYuc3RhcnRMaXN0ZW5pbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzZWxmLl9oYW5kbGVTY3JvbGwpXG59XG5cbnNjaGVkdWxlLm9uKCdsb2FkJywgc2VsZi5faGFuZGxlV2luZG93UmVzaXplKVxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNlbGYuX2hhbmRsZVdpbmRvd1Jlc2l6ZSlcbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwiLyogZ2xvYmFsIFVTRVJTICovXG5cbmNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5jb25zdCBmdXp6eSA9IHJlcXVpcmUoJ2Z1enp5JylcbmNvbnN0IGF1dG9jb21wbGV0ZSA9IHJlcXVpcmUoJy4vYXV0b2NvbXBsZXRlJylcbmNvbnN0IGJyb3dzZXJGaXhUb29sa2l0ID0gcmVxdWlyZSgnLi9icm93c2VyRml4VG9vbGtpdCcpXG5cbmNvbnN0IHNlbGYgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fbm9kZXMgPSB7XG4gIHNlYXJjaDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NlYXJjaCcpLFxuICBpbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpXG59XG5cbnNlbGYuc3VibWl0ID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBzZWxlY3RlZFVzZXIgPSBhdXRvY29tcGxldGUuZ2V0U2VsZWN0ZWRVc2VyKClcbiAgaWYgKHNlbGVjdGVkVXNlciA9PSBudWxsKSByZXR1cm5cblxuICBjb25zb2xlLmxvZyhzZWxlY3RlZFVzZXIpXG5cbiAgc2VsZi5fbm9kZXMuaW5wdXQuYmx1cigpXG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnd2Vlay1zZWxlY3Rvci1ub3QtdmlzaWJsZScpIC8vIFNhZmFyaSBidWdcblxuICBzZWxmLmVtaXQoJ3NlYXJjaCcsIHNlbGVjdGVkVXNlcilcbn1cblxuc2VsZi51cGRhdGVEb20gPSBmdW5jdGlvbiAoc2VsZWN0ZWRVc2VyKSB7XG4gIGlmIChzZWxlY3RlZFVzZXIgPT0gbnVsbCkge1xuICAgIHNlbGYuX25vZGVzLmlucHV0LnZhbHVlID0gJydcbiAgICBhdXRvY29tcGxldGUucmVtb3ZlQWxsSXRlbXMoKVxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnbm8taW5wdXQnKVxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnc2VhcmNoZWQnKVxuICB9IGVsc2Uge1xuICAgIHNlbGYuX25vZGVzLmlucHV0LnZhbHVlID0gc2VsZWN0ZWRVc2VyLnZhbHVlXG4gICAgYXV0b2NvbXBsZXRlLnJlbW92ZUFsbEl0ZW1zKClcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ25vLWlucHV0JylcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3NlYXJjaGVkJylcbiAgfVxufVxuXG5zZWxmLmZvY3VzID0gZnVuY3Rpb24gKCkge1xuICBzZWxmLl9ub2Rlcy5pbnB1dC5mb2N1cygpXG59XG5cbnNlbGYuX2hhbmRsZVN1Ym1pdCA9IGZ1bmN0aW9uIChldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIHNlbGYuc3VibWl0KClcbn1cblxuc2VsZi5fY2FsY3VsYXRlID0gZnVuY3Rpb24gKHNlYXJjaFRlcm0pIHtcbiAgY29uc3QgYWxsUmVzdWx0cyA9IGZ1enp5LmZpbHRlcihzZWFyY2hUZXJtLCBVU0VSUywge1xuICAgIGV4dHJhY3Q6IGZ1bmN0aW9uICh1c2VyKSB7IHJldHVybiB1c2VyLnZhbHVlIH1cbiAgfSlcbiAgY29uc3QgZmlyc3RSZXN1bHRzID0gYWxsUmVzdWx0cy5zbGljZSgwLCA3KVxuXG4gIGNvbnN0IG9yaWdpbmFsUmVzdWx0cyA9IGZpcnN0UmVzdWx0cy5tYXAoZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgIHJldHVybiByZXN1bHQub3JpZ2luYWxcbiAgfSlcblxuICByZXR1cm4gb3JpZ2luYWxSZXN1bHRzXG59XG5cbnNlbGYuX2hhbmRsZVRleHRVcGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHJlc3VsdHMgPSBzZWxmLl9jYWxjdWxhdGUoc2VsZi5fbm9kZXMuaW5wdXQudmFsdWUpXG5cbiAgYXV0b2NvbXBsZXRlLnJlbW92ZUFsbEl0ZW1zKClcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgYXV0b2NvbXBsZXRlLmFkZEl0ZW0ocmVzdWx0c1tpXSlcbiAgfVxufVxuXG5zZWxmLl9oYW5kbGVGb2N1cyA9IGZ1bmN0aW9uICgpIHtcbiAgc2VsZi5fbm9kZXMuaW5wdXQuc2VsZWN0KClcbn1cblxuc2VsZi5faGFuZGxlQmx1ciA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gdGhpcyB3aWxsIHJlbW92ZWQgdGhlIHNlbGVjdGlvbiB3aXRob3V0IGRyYXdpbmcgZm9jdXMgb24gaXQgKHNhZmFyaSlcbiAgLy8gdGhpcyB3aWxsIHJlbW92ZWQgc2VsZWN0aW9uIGV2ZW4gd2hlbiBmb2N1c2luZyBhbiBpZnJhbWUgKGNocm9tZSlcbiAgY29uc3Qgb2xkVmFsdWUgPSBzZWxmLl9ub2Rlcy52YWx1ZVxuICBzZWxmLl9ub2Rlcy52YWx1ZSA9ICcnXG4gIHNlbGYuX25vZGVzLnZhbHVlID0gb2xkVmFsdWVcblxuICAvLyB0aGlzIHdpbGwgaGlkZSB0aGUga2V5Ym9hcmQgKGlPUyBzYWZhcmkpXG4gIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpXG59XG5cbmF1dG9jb21wbGV0ZS5vbignc2VsZWN0Jywgc2VsZi5zdWJtaXQpXG5cbnNlbGYuX25vZGVzLnNlYXJjaC5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBzZWxmLl9oYW5kbGVTdWJtaXQpXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHNlbGYuX2hhbmRsZUZvY3VzKVxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHNlbGYuX2hhbmRsZUJsdXIpXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKGJyb3dzZXJGaXhUb29sa2l0LmlucHV0RXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2hhbmRsZVRleHRVcGRhdGUpXG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwiLyogZ2xvYmFsIFVTRVJTICovXG5cbmNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5cbmNvbnN0IHNlbGYgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fZ2V0UGFnZVRpdGxlID0gZnVuY3Rpb24gKHNlbGVjdGVkVXNlcikge1xuICBpZiAoc2VsZWN0ZWRVc2VyID09IG51bGwpIHtcbiAgICByZXR1cm4gYE1ldGlzIFJvb3N0ZXJgXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGBNZXRpcyBSb29zdGVyIC0gJHtzZWxlY3RlZFVzZXIudmFsdWV9YFxuICB9XG59XG5cbnNlbGYuX2dldFBhZ2VVUkwgPSBmdW5jdGlvbiAoc2VsZWN0ZWRVc2VyKSB7XG4gIHJldHVybiBgLyR7c2VsZWN0ZWRVc2VyLnR5cGV9LyR7c2VsZWN0ZWRVc2VyLnZhbHVlfWBcbn1cblxuc2VsZi5wdXNoID0gZnVuY3Rpb24gKHNlbGVjdGVkVXNlciwgcHVzaCkge1xuICBpZiAocHVzaCA9PSBudWxsKSBwdXNoID0gdHJ1ZVxuICBjb25zdCBwYWdlVGl0bGUgPSBzZWxmLl9nZXRQYWdlVGl0bGUoc2VsZWN0ZWRVc2VyKVxuICBjb25zdCBwYWdlVVJMID0gc2VsZi5fZ2V0UGFnZVVSTChzZWxlY3RlZFVzZXIpXG4gIGlmIChwdXNoKSB7XG4gICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHNlbGVjdGVkVXNlciwgcGFnZVRpdGxlLCBwYWdlVVJMKVxuICB9IGVsc2Uge1xuICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZShzZWxlY3RlZFVzZXIsIHBhZ2VUaXRsZSwgcGFnZVVSTClcbiAgfVxufVxuXG5zZWxmLnVwZGF0ZSA9IGZ1bmN0aW9uIChzZWxlY3RlZFVzZXIpIHtcbiAgZG9jdW1lbnQudGl0bGUgPSBzZWxmLl9nZXRQYWdlVGl0bGUoc2VsZWN0ZWRVc2VyKVxufVxuXG5zZWxmLmhhc1NlbGVjdGVkVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgcGFnZVVybCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZVxuICByZXR1cm4gL15cXC9zXFwvfF5cXC90XFwvfF5cXC9yXFwvfF5cXC9jXFwvLy50ZXN0KHBhZ2VVcmwpXG59XG5cbnNlbGYuZ2V0U2VsZWN0ZWRVc2VyID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBwYWdlVXJsID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lXG4gIGNvbnN0IHBhZ2VVcmxEYXRhID0gcGFnZVVybC5zcGxpdCgnLycpXG4gIGNvbnN0IHR5cGUgPSBwYWdlVXJsRGF0YVsxXVxuICBjb25zdCB2YWx1ZSA9IHBhZ2VVcmxEYXRhWzJdXG5cbiAgY29uc3QgdXNlciA9IFVTRVJTLmZpbHRlcihmdW5jdGlvbiAodXNlcikge1xuICAgIHJldHVybiB1c2VyLnR5cGUgPT09IHR5cGUgJiZcbiAgICAgICAgICAgdXNlci52YWx1ZSA9PT0gdmFsdWVcbiAgfSlbMF1cblxuICByZXR1cm4gdXNlclxufVxuXG5zZWxmLl9oYW5kbGVVcGRhdGUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgc2VsZi5lbWl0KCd1cGRhdGUnLCBldmVudC5zdGF0ZSlcbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgc2VsZi5faGFuZGxlVXBkYXRlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsImNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5cbmNvbnN0IHNlbGYgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fbm9kZXMgPSB7XG4gIHByZXZCdXR0b246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN3ZWVrLXNlbGVjdG9yIGJ1dHRvbicpWzBdLFxuICBuZXh0QnV0dG9uOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjd2Vlay1zZWxlY3RvciBidXR0b24nKVsxXSxcbiAgY3VycmVudFdlZWtOb2RlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd2Vlay1zZWxlY3RvciAuY3VycmVudCcpLFxuICBjdXJyZW50V2Vla05vcm1hbFRleHQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3ZWVrLXNlbGVjdG9yIC5jdXJyZW50IC5uby1wcmludCcpLFxuICBjdXJyZW50V2Vla1ByaW50VGV4dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3dlZWstc2VsZWN0b3IgLmN1cnJlbnQgLnByaW50Jylcbn1cblxuc2VsZi5fd2Vla09mZnNldCA9IDBcblxuLy8gY29waWVkIGZyb20gaHR0cDovL3d3dy5tZWV0aW5ncG9pbnRtY28ubmwvUm9vc3RlcnMtQUwvZG9jL2RhZ3Jvb3N0ZXJzL3VudGlzc2NyaXB0cy5qcyxcbi8vIHdlcmUgdXNpbmcgdGhlIHNhbWUgY29kZSBhcyB0aGV5IGRvIHRvIGJlIHN1cmUgdGhhdCB3ZSBhbHdheXMgZ2V0IHRoZSBzYW1lXG4vLyB3ZWVrIG51bWJlci5cbnNlbGYuZ2V0Q3VycmVudFdlZWsgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gIGNvbnN0IGRheU5yID0gKHRhcmdldC5nZXREYXkoKSArIDYpICUgN1xuICB0YXJnZXQuc2V0RGF0ZSh0YXJnZXQuZ2V0RGF0ZSgpIC0gZGF5TnIgKyAzKVxuICBjb25zdCBmaXJzdFRodXJzZGF5ID0gdGFyZ2V0LnZhbHVlT2YoKVxuICB0YXJnZXQuc2V0TW9udGgoMCwgMSlcbiAgaWYgKHRhcmdldC5nZXREYXkoKSAhPT0gNCkge1xuICAgIHRhcmdldC5zZXRNb250aCgwLCAxICsgKCg0IC0gdGFyZ2V0LmdldERheSgpKSArIDcpICUgNylcbiAgfVxuXG4gIHJldHVybiAxICsgTWF0aC5jZWlsKChmaXJzdFRodXJzZGF5IC0gdGFyZ2V0KSAvIDYwNDgwMDAwMClcbn1cblxuc2VsZi5nZXRTZWxlY3RlZFdlZWsgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IG5vdyA9IG5ldyBEYXRlKClcbiAgY29uc3QgdGFyZ2V0RGF0ZSA9IG5ldyBEYXRlKG5vdy5nZXRUaW1lKCkgK1xuICAgICAgc2VsZi5fd2Vla09mZnNldCAqIDYwNDgwMCAqIDEwMDAgKyA4NjQwMCAqIDEwMDApXG4gIHJldHVybiBzZWxmLmdldEN1cnJlbnRXZWVrKHRhcmdldERhdGUpXG59XG5cbnNlbGYudXBkYXRlQ3VycmVudFdlZWsgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHNlbGVjdGVkV2Vla051bWJlciA9IHNlbGYuZ2V0U2VsZWN0ZWRXZWVrKClcbiAgaWYgKHNlbGYuZ2V0Q3VycmVudFdlZWsobmV3IERhdGUoKSkgIT09IHNlbGVjdGVkV2Vla051bWJlcikge1xuICAgIHNlbGYuX25vZGVzLmN1cnJlbnRXZWVrTm9kZS5jbGFzc0xpc3QuYWRkKCdjaGFuZ2VkJylcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9ub2Rlcy5jdXJyZW50V2Vla05vZGUuY2xhc3NMaXN0LnJlbW92ZSgnY2hhbmdlZCcpXG4gIH1cbiAgc2VsZi51cGRhdGVEb20oKVxuICBzZWxmLmVtaXQoJ3dlZWtDaGFuZ2VkJywgc2VsZWN0ZWRXZWVrTnVtYmVyKVxufVxuXG5zZWxmLnVwZGF0ZURvbSA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgc2VsZWN0ZWRXZWVrTnVtYmVyID0gc2VsZi5nZXRTZWxlY3RlZFdlZWsoKVxuICBjb25zdCBpc1N1bmRheSA9IG5ldyBEYXRlKCkuZ2V0RGF5KCkgPT09IDBcbiAgbGV0IGh1bWFuUmVhZGFibGVXZWVrID0gbnVsbFxuICBpZiAoaXNTdW5kYXkpIHtcbiAgICBzd2l0Y2ggKHNlbGYuX3dlZWtPZmZzZXQpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgaHVtYW5SZWFkYWJsZVdlZWsgPSAnQWFuc3RhYW5kZSB3ZWVrJ1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAxOlxuICAgICAgICBodW1hblJlYWRhYmxlV2VlayA9ICdWb2xnZW5kZSB3ZWVrJ1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAtMTpcbiAgICAgICAgaHVtYW5SZWFkYWJsZVdlZWsgPSAnQWZnZWxvcGVuIHdlZWsnXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHN3aXRjaCAoc2VsZi5fd2Vla09mZnNldCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICBodW1hblJlYWRhYmxlV2VlayA9ICdIdWlkaWdlIHdlZWsnXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGh1bWFuUmVhZGFibGVXZWVrID0gJ1ZvbGdlbmRlIHdlZWsnXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIC0xOlxuICAgICAgICBodW1hblJlYWRhYmxlV2VlayA9ICdWb3JpZ2Ugd2VlaydcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgaWYgKGh1bWFuUmVhZGFibGVXZWVrICE9IG51bGwpIHtcbiAgICBzZWxmLl9ub2Rlcy5jdXJyZW50V2Vla05vcm1hbFRleHQudGV4dENvbnRlbnQgPSBodW1hblJlYWRhYmxlV2VlayArICcg4oCiICcgKyBzZWxlY3RlZFdlZWtOdW1iZXJcbiAgICBzZWxmLl9ub2Rlcy5jdXJyZW50V2Vla1ByaW50VGV4dC50ZXh0Q29udGVudCA9ICdXZWVrICcgKyBzZWxlY3RlZFdlZWtOdW1iZXJcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9ub2Rlcy5jdXJyZW50V2Vla05vcm1hbFRleHQudGV4dENvbnRlbnQgPSAnV2VlayAnICsgc2VsZWN0ZWRXZWVrTnVtYmVyXG4gICAgc2VsZi5fbm9kZXMuY3VycmVudFdlZWtQcmludFRleHQudGV4dENvbnRlbnQgPSAnV2VlayAnICsgc2VsZWN0ZWRXZWVrTnVtYmVyXG4gIH1cbn1cblxuc2VsZi5faGFuZGxlUHJldkJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICBzZWxmLl93ZWVrT2Zmc2V0IC09IDFcbiAgc2VsZi51cGRhdGVDdXJyZW50V2VlaygpXG59XG5cbnNlbGYuX2hhbmRsZU5leHRCdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgc2VsZi5fd2Vla09mZnNldCArPSAxXG4gIHNlbGYudXBkYXRlQ3VycmVudFdlZWsoKVxufVxuXG5zZWxmLl9ub2Rlcy5wcmV2QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2VsZi5faGFuZGxlUHJldkJ1dHRvbkNsaWNrKVxuc2VsZi5fbm9kZXMubmV4dEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlbGYuX2hhbmRsZU5leHRCdXR0b25DbGljaylcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iXX0=
