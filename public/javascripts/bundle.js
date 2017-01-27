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
  var listItem = document.createElement('li');
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

  for (var i = 0; i < self.getItems().length; i++) {
    self._nodes.autocomplete.children[i].classList.remove('selected');
  }
  if (self._selectedItemIndex >= 0) {
    self._nodes.autocomplete.children[self._selectedItemIndex].classList.add('selected');
  }
};

self._handleItemClick = function (event) {
  if (!self._nodes.autocomplete.contains(event.target)) return;
  var itemIndex = Array.prototype.indexOf.call(self._nodes.autocomplete.children, event.target);
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

var state = {};

window.state = state;
window.require = require;

frontpage.show();
weekSelector.updateCurrentWeek();
scrollSnap.startListening();

if (favorite.get() != null) {
  state.selectedItem = favorite.get();
  favorite.update(state.selectedItem);
  analytics.send.search(state.selectedItem, true);
  schedule.viewItem(weekSelector.getSelectedWeek(), state.selectedItem);
} else {
  search.focus();
}

search.on('search', function (selectedItem) {
  state.selectedItem = selectedItem;
  favorite.update(state.selectedItem);
  analytics.send.search(state.selectedItem);
  schedule.viewItem(weekSelector.getSelectedWeek(), state.selectedItem);
});

weekSelector.on('weekChanged', function (newWeek) {
  analytics.send.search(state.selectedItem);
  schedule.viewItem(newWeek, state.selectedItem);
});

favorite.on('click', function () {
  favorite.toggle(state.selectedItem);
});

document.body.style.opacity = 1;

},{"./analytics":5,"./favorite":8,"./featureDetect":9,"./frontpage":10,"./schedule":12,"./scrollSnap":13,"./search":14,"./weekSelector":15}],12:[function(require,module,exports){
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
  return '//' + window.location.host + '/meetingpointProxy/Roosters-AL%2Fdoc%2Fdagroosters%2F' + leftPad(week, 2, '0') + '%2F' + type + '%2F' + type + leftPad(id, 5, '0') + '.htm';
};

self._removeChilds = function () {
  while (self._nodes.schedule.firstChild) {
    self._nodes.schedule.removeChild(self._nodes.schedule.firstChild);
  }
};

self.viewItem = function (week, selectedUser) {
  var url = self._getURLOfUsers(week, selectedUser.type, selectedUser.index);

  self._removeChilds();

  var request = new window.XMLHttpRequest();
  request.addEventListener('load', self._handleLoad);
  request.addEventListener('error', self._handleError);
  request.open('GET', url, true);
  request.send();

  search.updateDom(selectedUser);
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
  var selectedItem = autocomplete.getSelectedItem();
  if (selectedItem == null) return;

  console.log(selectedItem);

  self._nodes.input.blur();
  document.body.classList.remove('week-selector-not-visible'); // Safari bug

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
  var allResults = fuzzy.filter(searchTerm, USERS, {
    extract: function extract(item) {
      return item.value;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9mdXp6eS9saWIvZnV6enkuanMiLCJub2RlX21vZHVsZXMvbGVmdC1wYWQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc21vb3Roc2Nyb2xsLXBvbHlmaWxsL2Rpc3Qvc21vb3Roc2Nyb2xsLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2FuYWx5dGljcy5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9hdXRvY29tcGxldGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYnJvd3NlckZpeFRvb2xraXQuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvZmF2b3JpdGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvZmVhdHVyZURldGVjdC5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9mcm9udHBhZ2UuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvbWFpbi5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9zY2hlZHVsZS5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9zY3JvbGxTbmFwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL3NlYXJjaC5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy93ZWVrU2VsZWN0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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V0FBSyxDQUFMO0FBQ0UsNEJBQW9CLGNBQXBCO0FBQ0E7QUFDRixXQUFLLENBQUw7QUFDRSw0QkFBb0IsZUFBcEI7QUFDQTtBQUNGLFdBQUssQ0FBQyxDQUFOO0FBQ0UsNEJBQW9CLGFBQXBCO0FBQ0E7QUFUSjtBQVdEO0FBQ0QsTUFBSSxxQkFBcUIsSUFBekIsRUFBK0I7QUFDN0IsU0FBSyxNQUFMLENBQVkscUJBQVosQ0FBa0MsV0FBbEMsR0FBZ0Qsb0JBQW9CLEtBQXBCLEdBQTRCLGtCQUE1RTtBQUNBLFNBQUssTUFBTCxDQUFZLG9CQUFaLENBQWlDLFdBQWpDLEdBQStDLFVBQVUsa0JBQXpEO0FBQ0QsR0FIRCxNQUdPO0FBQ0wsU0FBSyxNQUFMLENBQVkscUJBQVosQ0FBa0MsV0FBbEMsR0FBZ0QsVUFBVSxrQkFBMUQ7QUFDQSxTQUFLLE1BQUwsQ0FBWSxvQkFBWixDQUFpQyxXQUFqQyxHQUErQyxVQUFVLGtCQUF6RDtBQUNEO0FBQ0YsQ0FwQ0Q7O0FBc0NBLEtBQUssc0JBQUwsR0FBOEIsWUFBWTtBQUN4QyxPQUFLLFdBQUwsSUFBb0IsQ0FBcEI7QUFDQSxPQUFLLGlCQUFMO0FBQ0QsQ0FIRDs7QUFLQSxLQUFLLHNCQUFMLEdBQThCLFlBQVk7QUFDeEMsT0FBSyxXQUFMLElBQW9CLENBQXBCO0FBQ0EsT0FBSyxpQkFBTDtBQUNELENBSEQ7O0FBS0EsS0FBSyxNQUFMLENBQVksVUFBWixDQUF1QixnQkFBdkIsQ0FBd0MsT0FBeEMsRUFBaUQsS0FBSyxzQkFBdEQ7QUFDQSxLQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLGdCQUF2QixDQUF3QyxPQUF4QyxFQUFpRCxLQUFLLHNCQUF0RDs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsSUFBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4gKCcgKyBlciArICcpJyk7XG4gICAgICAgIGVyci5jb250ZXh0ID0gZXI7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIGlmICh0aGlzLl9ldmVudHMpIHtcbiAgICB2YXIgZXZsaXN0ZW5lciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGV2bGlzdGVuZXIpKVxuICAgICAgcmV0dXJuIDE7XG4gICAgZWxzZSBpZiAoZXZsaXN0ZW5lcilcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgfVxuICByZXR1cm4gMDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiLypcbiAqIEZ1enp5XG4gKiBodHRwczovL2dpdGh1Yi5jb20vbXlvcmsvZnV6enlcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTIgTWF0dCBZb3JrXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuXG52YXIgcm9vdCA9IHRoaXM7XG5cbnZhciBmdXp6eSA9IHt9O1xuXG4vLyBVc2UgaW4gbm9kZSBvciBpbiBicm93c2VyXG5pZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZnV6enk7XG59IGVsc2Uge1xuICByb290LmZ1enp5ID0gZnV6enk7XG59XG5cbi8vIFJldHVybiBhbGwgZWxlbWVudHMgb2YgYGFycmF5YCB0aGF0IGhhdmUgYSBmdXp6eVxuLy8gbWF0Y2ggYWdhaW5zdCBgcGF0dGVybmAuXG5mdXp6eS5zaW1wbGVGaWx0ZXIgPSBmdW5jdGlvbihwYXR0ZXJuLCBhcnJheSkge1xuICByZXR1cm4gYXJyYXkuZmlsdGVyKGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHJldHVybiBmdXp6eS50ZXN0KHBhdHRlcm4sIHN0cmluZyk7XG4gIH0pO1xufTtcblxuLy8gRG9lcyBgcGF0dGVybmAgZnV6enkgbWF0Y2ggYHN0cmluZ2A/XG5mdXp6eS50ZXN0ID0gZnVuY3Rpb24ocGF0dGVybiwgc3RyaW5nKSB7XG4gIHJldHVybiBmdXp6eS5tYXRjaChwYXR0ZXJuLCBzdHJpbmcpICE9PSBudWxsO1xufTtcblxuLy8gSWYgYHBhdHRlcm5gIG1hdGNoZXMgYHN0cmluZ2AsIHdyYXAgZWFjaCBtYXRjaGluZyBjaGFyYWN0ZXJcbi8vIGluIGBvcHRzLnByZWAgYW5kIGBvcHRzLnBvc3RgLiBJZiBubyBtYXRjaCwgcmV0dXJuIG51bGxcbmZ1enp5Lm1hdGNoID0gZnVuY3Rpb24ocGF0dGVybiwgc3RyaW5nLCBvcHRzKSB7XG4gIG9wdHMgPSBvcHRzIHx8IHt9O1xuICB2YXIgcGF0dGVybklkeCA9IDBcbiAgICAsIHJlc3VsdCA9IFtdXG4gICAgLCBsZW4gPSBzdHJpbmcubGVuZ3RoXG4gICAgLCB0b3RhbFNjb3JlID0gMFxuICAgICwgY3VyclNjb3JlID0gMFxuICAgIC8vIHByZWZpeFxuICAgICwgcHJlID0gb3B0cy5wcmUgfHwgJydcbiAgICAvLyBzdWZmaXhcbiAgICAsIHBvc3QgPSBvcHRzLnBvc3QgfHwgJydcbiAgICAvLyBTdHJpbmcgdG8gY29tcGFyZSBhZ2FpbnN0LiBUaGlzIG1pZ2h0IGJlIGEgbG93ZXJjYXNlIHZlcnNpb24gb2YgdGhlXG4gICAgLy8gcmF3IHN0cmluZ1xuICAgICwgY29tcGFyZVN0cmluZyA9ICBvcHRzLmNhc2VTZW5zaXRpdmUgJiYgc3RyaW5nIHx8IHN0cmluZy50b0xvd2VyQ2FzZSgpXG4gICAgLCBjaCwgY29tcGFyZUNoYXI7XG5cbiAgcGF0dGVybiA9IG9wdHMuY2FzZVNlbnNpdGl2ZSAmJiBwYXR0ZXJuIHx8IHBhdHRlcm4udG9Mb3dlckNhc2UoKTtcblxuICAvLyBGb3IgZWFjaCBjaGFyYWN0ZXIgaW4gdGhlIHN0cmluZywgZWl0aGVyIGFkZCBpdCB0byB0aGUgcmVzdWx0XG4gIC8vIG9yIHdyYXAgaW4gdGVtcGxhdGUgaWYgaXQncyB0aGUgbmV4dCBzdHJpbmcgaW4gdGhlIHBhdHRlcm5cbiAgZm9yKHZhciBpZHggPSAwOyBpZHggPCBsZW47IGlkeCsrKSB7XG4gICAgY2ggPSBzdHJpbmdbaWR4XTtcbiAgICBpZihjb21wYXJlU3RyaW5nW2lkeF0gPT09IHBhdHRlcm5bcGF0dGVybklkeF0pIHtcbiAgICAgIGNoID0gcHJlICsgY2ggKyBwb3N0O1xuICAgICAgcGF0dGVybklkeCArPSAxO1xuXG4gICAgICAvLyBjb25zZWN1dGl2ZSBjaGFyYWN0ZXJzIHNob3VsZCBpbmNyZWFzZSB0aGUgc2NvcmUgbW9yZSB0aGFuIGxpbmVhcmx5XG4gICAgICBjdXJyU2NvcmUgKz0gMSArIGN1cnJTY29yZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VyclNjb3JlID0gMDtcbiAgICB9XG4gICAgdG90YWxTY29yZSArPSBjdXJyU2NvcmU7XG4gICAgcmVzdWx0W3Jlc3VsdC5sZW5ndGhdID0gY2g7XG4gIH1cblxuICAvLyByZXR1cm4gcmVuZGVyZWQgc3RyaW5nIGlmIHdlIGhhdmUgYSBtYXRjaCBmb3IgZXZlcnkgY2hhclxuICBpZihwYXR0ZXJuSWR4ID09PSBwYXR0ZXJuLmxlbmd0aCkge1xuICAgIHJldHVybiB7cmVuZGVyZWQ6IHJlc3VsdC5qb2luKCcnKSwgc2NvcmU6IHRvdGFsU2NvcmV9O1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59O1xuXG4vLyBUaGUgbm9ybWFsIGVudHJ5IHBvaW50LiBGaWx0ZXJzIGBhcnJgIGZvciBtYXRjaGVzIGFnYWluc3QgYHBhdHRlcm5gLlxuLy8gSXQgcmV0dXJucyBhbiBhcnJheSB3aXRoIG1hdGNoaW5nIHZhbHVlcyBvZiB0aGUgdHlwZTpcbi8vXG4vLyAgICAgW3tcbi8vICAgICAgICAgc3RyaW5nOiAgICc8Yj5sYWgnIC8vIFRoZSByZW5kZXJlZCBzdHJpbmdcbi8vICAgICAgICwgaW5kZXg6ICAgIDIgICAgICAgIC8vIFRoZSBpbmRleCBvZiB0aGUgZWxlbWVudCBpbiBgYXJyYFxuLy8gICAgICAgLCBvcmlnaW5hbDogJ2JsYWgnICAgLy8gVGhlIG9yaWdpbmFsIGVsZW1lbnQgaW4gYGFycmBcbi8vICAgICB9XVxuLy9cbi8vIGBvcHRzYCBpcyBhbiBvcHRpb25hbCBhcmd1bWVudCBiYWcuIERldGFpbHM6XG4vL1xuLy8gICAgb3B0cyA9IHtcbi8vICAgICAgICAvLyBzdHJpbmcgdG8gcHV0IGJlZm9yZSBhIG1hdGNoaW5nIGNoYXJhY3RlclxuLy8gICAgICAgIHByZTogICAgICc8Yj4nXG4vL1xuLy8gICAgICAgIC8vIHN0cmluZyB0byBwdXQgYWZ0ZXIgbWF0Y2hpbmcgY2hhcmFjdGVyXG4vLyAgICAgICwgcG9zdDogICAgJzwvYj4nXG4vL1xuLy8gICAgICAgIC8vIE9wdGlvbmFsIGZ1bmN0aW9uLiBJbnB1dCBpcyBhbiBlbnRyeSBpbiB0aGUgZ2l2ZW4gYXJyYCxcbi8vICAgICAgICAvLyBvdXRwdXQgc2hvdWxkIGJlIHRoZSBzdHJpbmcgdG8gdGVzdCBgcGF0dGVybmAgYWdhaW5zdC5cbi8vICAgICAgICAvLyBJbiB0aGlzIGV4YW1wbGUsIGlmIGBhcnIgPSBbe2NyeWluZzogJ2tvYWxhJ31dYCB3ZSB3b3VsZCByZXR1cm5cbi8vICAgICAgICAvLyAna29hbGEnLlxuLy8gICAgICAsIGV4dHJhY3Q6IGZ1bmN0aW9uKGFyZykgeyByZXR1cm4gYXJnLmNyeWluZzsgfVxuLy8gICAgfVxuZnV6enkuZmlsdGVyID0gZnVuY3Rpb24ocGF0dGVybiwgYXJyLCBvcHRzKSB7XG4gIG9wdHMgPSBvcHRzIHx8IHt9O1xuICByZXR1cm4gYXJyXG4gICAgLnJlZHVjZShmdW5jdGlvbihwcmV2LCBlbGVtZW50LCBpZHgsIGFycikge1xuICAgICAgdmFyIHN0ciA9IGVsZW1lbnQ7XG4gICAgICBpZihvcHRzLmV4dHJhY3QpIHtcbiAgICAgICAgc3RyID0gb3B0cy5leHRyYWN0KGVsZW1lbnQpO1xuICAgICAgfVxuICAgICAgdmFyIHJlbmRlcmVkID0gZnV6enkubWF0Y2gocGF0dGVybiwgc3RyLCBvcHRzKTtcbiAgICAgIGlmKHJlbmRlcmVkICE9IG51bGwpIHtcbiAgICAgICAgcHJldltwcmV2Lmxlbmd0aF0gPSB7XG4gICAgICAgICAgICBzdHJpbmc6IHJlbmRlcmVkLnJlbmRlcmVkXG4gICAgICAgICAgLCBzY29yZTogcmVuZGVyZWQuc2NvcmVcbiAgICAgICAgICAsIGluZGV4OiBpZHhcbiAgICAgICAgICAsIG9yaWdpbmFsOiBlbGVtZW50XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJldjtcbiAgICB9LCBbXSlcblxuICAgIC8vIFNvcnQgYnkgc2NvcmUuIEJyb3dzZXJzIGFyZSBpbmNvbnNpc3RlbnQgd3J0IHN0YWJsZS91bnN0YWJsZVxuICAgIC8vIHNvcnRpbmcsIHNvIGZvcmNlIHN0YWJsZSBieSB1c2luZyB0aGUgaW5kZXggaW4gdGhlIGNhc2Ugb2YgdGllLlxuICAgIC8vIFNlZSBodHRwOi8vb2ZiLm5ldC9+c2V0aG1sL2lzLXNvcnQtc3RhYmxlLmh0bWxcbiAgICAuc29ydChmdW5jdGlvbihhLGIpIHtcbiAgICAgIHZhciBjb21wYXJlID0gYi5zY29yZSAtIGEuc2NvcmU7XG4gICAgICBpZihjb21wYXJlKSByZXR1cm4gY29tcGFyZTtcbiAgICAgIHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcbiAgICB9KTtcbn07XG5cblxufSgpKTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBsZWZ0UGFkO1xuXG52YXIgY2FjaGUgPSBbXG4gICcnLFxuICAnICcsXG4gICcgICcsXG4gICcgICAnLFxuICAnICAgICcsXG4gICcgICAgICcsXG4gICcgICAgICAnLFxuICAnICAgICAgICcsXG4gICcgICAgICAgICcsXG4gICcgICAgICAgICAnXG5dO1xuXG5mdW5jdGlvbiBsZWZ0UGFkIChzdHIsIGxlbiwgY2gpIHtcbiAgLy8gY29udmVydCBgc3RyYCB0byBgc3RyaW5nYFxuICBzdHIgPSBzdHIgKyAnJztcbiAgLy8gYGxlbmAgaXMgdGhlIGBwYWRgJ3MgbGVuZ3RoIG5vd1xuICBsZW4gPSBsZW4gLSBzdHIubGVuZ3RoO1xuICAvLyBkb2Vzbid0IG5lZWQgdG8gcGFkXG4gIGlmIChsZW4gPD0gMCkgcmV0dXJuIHN0cjtcbiAgLy8gYGNoYCBkZWZhdWx0cyB0byBgJyAnYFxuICBpZiAoIWNoICYmIGNoICE9PSAwKSBjaCA9ICcgJztcbiAgLy8gY29udmVydCBgY2hgIHRvIGBzdHJpbmdgXG4gIGNoID0gY2ggKyAnJztcbiAgLy8gY2FjaGUgY29tbW9uIHVzZSBjYXNlc1xuICBpZiAoY2ggPT09ICcgJyAmJiBsZW4gPCAxMCkgcmV0dXJuIGNhY2hlW2xlbl0gKyBzdHI7XG4gIC8vIGBwYWRgIHN0YXJ0cyB3aXRoIGFuIGVtcHR5IHN0cmluZ1xuICB2YXIgcGFkID0gJyc7XG4gIC8vIGxvb3BcbiAgd2hpbGUgKHRydWUpIHtcbiAgICAvLyBhZGQgYGNoYCB0byBgcGFkYCBpZiBgbGVuYCBpcyBvZGRcbiAgICBpZiAobGVuICYgMSkgcGFkICs9IGNoO1xuICAgIC8vIGRldmlkZSBgbGVuYCBieSAyLCBkaXRjaCB0aGUgZnJhY3Rpb25cbiAgICBsZW4gPj49IDE7XG4gICAgLy8gXCJkb3VibGVcIiB0aGUgYGNoYCBzbyB0aGlzIG9wZXJhdGlvbiBjb3VudCBncm93cyBsb2dhcml0aG1pY2FsbHkgb24gYGxlbmBcbiAgICAvLyBlYWNoIHRpbWUgYGNoYCBpcyBcImRvdWJsZWRcIiwgdGhlIGBsZW5gIHdvdWxkIG5lZWQgdG8gYmUgXCJkb3VibGVkXCIgdG9vXG4gICAgLy8gc2ltaWxhciB0byBmaW5kaW5nIGEgdmFsdWUgaW4gYmluYXJ5IHNlYXJjaCB0cmVlLCBoZW5jZSBPKGxvZyhuKSlcbiAgICBpZiAobGVuKSBjaCArPSBjaDtcbiAgICAvLyBgbGVuYCBpcyAwLCBleGl0IHRoZSBsb29wXG4gICAgZWxzZSBicmVhaztcbiAgfVxuICAvLyBwYWQgYHN0cmAhXG4gIHJldHVybiBwYWQgKyBzdHI7XG59XG4iLCIvKlxuICogc21vb3Roc2Nyb2xsIHBvbHlmaWxsIC0gdjAuMy40XG4gKiBodHRwczovL2lhbWR1c3Rhbi5naXRodWIuaW8vc21vb3Roc2Nyb2xsXG4gKiAyMDE2IChjKSBEdXN0YW4gS2FzdGVuLCBKZXJlbWlhcyBNZW5pY2hlbGxpIC0gTUlUIExpY2Vuc2VcbiAqL1xuXG4oZnVuY3Rpb24odywgZCwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKlxuICAgKiBhbGlhc2VzXG4gICAqIHc6IHdpbmRvdyBnbG9iYWwgb2JqZWN0XG4gICAqIGQ6IGRvY3VtZW50XG4gICAqIHVuZGVmaW5lZDogdW5kZWZpbmVkXG4gICAqL1xuXG4gIC8vIHBvbHlmaWxsXG4gIGZ1bmN0aW9uIHBvbHlmaWxsKCkge1xuICAgIC8vIHJldHVybiB3aGVuIHNjcm9sbEJlaGF2aW9yIGludGVyZmFjZSBpcyBzdXBwb3J0ZWRcbiAgICBpZiAoJ3Njcm9sbEJlaGF2aW9yJyBpbiBkLmRvY3VtZW50RWxlbWVudC5zdHlsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogZ2xvYmFsc1xuICAgICAqL1xuICAgIHZhciBFbGVtZW50ID0gdy5IVE1MRWxlbWVudCB8fCB3LkVsZW1lbnQ7XG4gICAgdmFyIFNDUk9MTF9USU1FID0gNDY4O1xuXG4gICAgLypcbiAgICAgKiBvYmplY3QgZ2F0aGVyaW5nIG9yaWdpbmFsIHNjcm9sbCBtZXRob2RzXG4gICAgICovXG4gICAgdmFyIG9yaWdpbmFsID0ge1xuICAgICAgc2Nyb2xsOiB3LnNjcm9sbCB8fCB3LnNjcm9sbFRvLFxuICAgICAgc2Nyb2xsQnk6IHcuc2Nyb2xsQnksXG4gICAgICBzY3JvbGxJbnRvVmlldzogRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXdcbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBkZWZpbmUgdGltaW5nIG1ldGhvZFxuICAgICAqL1xuICAgIHZhciBub3cgPSB3LnBlcmZvcm1hbmNlICYmIHcucGVyZm9ybWFuY2Uubm93XG4gICAgICA/IHcucGVyZm9ybWFuY2Uubm93LmJpbmQody5wZXJmb3JtYW5jZSkgOiBEYXRlLm5vdztcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZXMgc2Nyb2xsIHBvc2l0aW9uIGluc2lkZSBhbiBlbGVtZW50XG4gICAgICogQG1ldGhvZCBzY3JvbGxFbGVtZW50XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNjcm9sbEVsZW1lbnQoeCwgeSkge1xuICAgICAgdGhpcy5zY3JvbGxMZWZ0ID0geDtcbiAgICAgIHRoaXMuc2Nyb2xsVG9wID0geTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIHJlc3VsdCBvZiBhcHBseWluZyBlYXNlIG1hdGggZnVuY3Rpb24gdG8gYSBudW1iZXJcbiAgICAgKiBAbWV0aG9kIGVhc2VcbiAgICAgKiBAcGFyYW0ge051bWJlcn0ga1xuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZnVuY3Rpb24gZWFzZShrKSB7XG4gICAgICByZXR1cm4gMC41ICogKDEgLSBNYXRoLmNvcyhNYXRoLlBJICogaykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGluZGljYXRlcyBpZiBhIHNtb290aCBiZWhhdmlvciBzaG91bGQgYmUgYXBwbGllZFxuICAgICAqIEBtZXRob2Qgc2hvdWxkQmFpbE91dFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfE9iamVjdH0geFxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNob3VsZEJhaWxPdXQoeCkge1xuICAgICAgaWYgKHR5cGVvZiB4ICE9PSAnb2JqZWN0J1xuICAgICAgICAgICAgfHwgeCA9PT0gbnVsbFxuICAgICAgICAgICAgfHwgeC5iZWhhdmlvciA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICB8fCB4LmJlaGF2aW9yID09PSAnYXV0bydcbiAgICAgICAgICAgIHx8IHguYmVoYXZpb3IgPT09ICdpbnN0YW50Jykge1xuICAgICAgICAvLyBmaXJzdCBhcmcgbm90IGFuIG9iamVjdC9udWxsXG4gICAgICAgIC8vIG9yIGJlaGF2aW9yIGlzIGF1dG8sIGluc3RhbnQgb3IgdW5kZWZpbmVkXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHggPT09ICdvYmplY3QnXG4gICAgICAgICAgICAmJiB4LmJlaGF2aW9yID09PSAnc21vb3RoJykge1xuICAgICAgICAvLyBmaXJzdCBhcmd1bWVudCBpcyBhbiBvYmplY3QgYW5kIGJlaGF2aW9yIGlzIHNtb290aFxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIHRocm93IGVycm9yIHdoZW4gYmVoYXZpb3IgaXMgbm90IHN1cHBvcnRlZFxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYmVoYXZpb3Igbm90IHZhbGlkJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogZmluZHMgc2Nyb2xsYWJsZSBwYXJlbnQgb2YgYW4gZWxlbWVudFxuICAgICAqIEBtZXRob2QgZmluZFNjcm9sbGFibGVQYXJlbnRcbiAgICAgKiBAcGFyYW0ge05vZGV9IGVsXG4gICAgICogQHJldHVybnMge05vZGV9IGVsXG4gICAgICovXG4gICAgZnVuY3Rpb24gZmluZFNjcm9sbGFibGVQYXJlbnQoZWwpIHtcbiAgICAgIHZhciBpc0JvZHk7XG4gICAgICB2YXIgaGFzU2Nyb2xsYWJsZVNwYWNlO1xuICAgICAgdmFyIGhhc1Zpc2libGVPdmVyZmxvdztcblxuICAgICAgZG8ge1xuICAgICAgICBlbCA9IGVsLnBhcmVudE5vZGU7XG5cbiAgICAgICAgLy8gc2V0IGNvbmRpdGlvbiB2YXJpYWJsZXNcbiAgICAgICAgaXNCb2R5ID0gZWwgPT09IGQuYm9keTtcbiAgICAgICAgaGFzU2Nyb2xsYWJsZVNwYWNlID1cbiAgICAgICAgICBlbC5jbGllbnRIZWlnaHQgPCBlbC5zY3JvbGxIZWlnaHQgfHxcbiAgICAgICAgICBlbC5jbGllbnRXaWR0aCA8IGVsLnNjcm9sbFdpZHRoO1xuICAgICAgICBoYXNWaXNpYmxlT3ZlcmZsb3cgPVxuICAgICAgICAgIHcuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbCkub3ZlcmZsb3cgPT09ICd2aXNpYmxlJztcbiAgICAgIH0gd2hpbGUgKCFpc0JvZHkgJiYgIShoYXNTY3JvbGxhYmxlU3BhY2UgJiYgIWhhc1Zpc2libGVPdmVyZmxvdykpO1xuXG4gICAgICBpc0JvZHkgPSBoYXNTY3JvbGxhYmxlU3BhY2UgPSBoYXNWaXNpYmxlT3ZlcmZsb3cgPSBudWxsO1xuXG4gICAgICByZXR1cm4gZWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc2VsZiBpbnZva2VkIGZ1bmN0aW9uIHRoYXQsIGdpdmVuIGEgY29udGV4dCwgc3RlcHMgdGhyb3VnaCBzY3JvbGxpbmdcbiAgICAgKiBAbWV0aG9kIHN0ZXBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHN0ZXAoY29udGV4dCkge1xuICAgICAgLy8gY2FsbCBtZXRob2QgYWdhaW4gb24gbmV4dCBhdmFpbGFibGUgZnJhbWVcbiAgICAgIGNvbnRleHQuZnJhbWUgPSB3LnJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwLmJpbmQodywgY29udGV4dCkpO1xuXG4gICAgICB2YXIgdGltZSA9IG5vdygpO1xuICAgICAgdmFyIHZhbHVlO1xuICAgICAgdmFyIGN1cnJlbnRYO1xuICAgICAgdmFyIGN1cnJlbnRZO1xuICAgICAgdmFyIGVsYXBzZWQgPSAodGltZSAtIGNvbnRleHQuc3RhcnRUaW1lKSAvIFNDUk9MTF9USU1FO1xuXG4gICAgICAvLyBhdm9pZCBlbGFwc2VkIHRpbWVzIGhpZ2hlciB0aGFuIG9uZVxuICAgICAgZWxhcHNlZCA9IGVsYXBzZWQgPiAxID8gMSA6IGVsYXBzZWQ7XG5cbiAgICAgIC8vIGFwcGx5IGVhc2luZyB0byBlbGFwc2VkIHRpbWVcbiAgICAgIHZhbHVlID0gZWFzZShlbGFwc2VkKTtcblxuICAgICAgY3VycmVudFggPSBjb250ZXh0LnN0YXJ0WCArIChjb250ZXh0LnggLSBjb250ZXh0LnN0YXJ0WCkgKiB2YWx1ZTtcbiAgICAgIGN1cnJlbnRZID0gY29udGV4dC5zdGFydFkgKyAoY29udGV4dC55IC0gY29udGV4dC5zdGFydFkpICogdmFsdWU7XG5cbiAgICAgIGNvbnRleHQubWV0aG9kLmNhbGwoY29udGV4dC5zY3JvbGxhYmxlLCBjdXJyZW50WCwgY3VycmVudFkpO1xuXG4gICAgICAvLyByZXR1cm4gd2hlbiBlbmQgcG9pbnRzIGhhdmUgYmVlbiByZWFjaGVkXG4gICAgICBpZiAoY3VycmVudFggPT09IGNvbnRleHQueCAmJiBjdXJyZW50WSA9PT0gY29udGV4dC55KSB7XG4gICAgICAgIHcuY2FuY2VsQW5pbWF0aW9uRnJhbWUoY29udGV4dC5mcmFtZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzY3JvbGxzIHdpbmRvdyB3aXRoIGEgc21vb3RoIGJlaGF2aW9yXG4gICAgICogQG1ldGhvZCBzbW9vdGhTY3JvbGxcbiAgICAgKiBAcGFyYW0ge09iamVjdHxOb2RlfSBlbFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzbW9vdGhTY3JvbGwoZWwsIHgsIHkpIHtcbiAgICAgIHZhciBzY3JvbGxhYmxlO1xuICAgICAgdmFyIHN0YXJ0WDtcbiAgICAgIHZhciBzdGFydFk7XG4gICAgICB2YXIgbWV0aG9kO1xuICAgICAgdmFyIHN0YXJ0VGltZSA9IG5vdygpO1xuICAgICAgdmFyIGZyYW1lO1xuXG4gICAgICAvLyBkZWZpbmUgc2Nyb2xsIGNvbnRleHRcbiAgICAgIGlmIChlbCA9PT0gZC5ib2R5KSB7XG4gICAgICAgIHNjcm9sbGFibGUgPSB3O1xuICAgICAgICBzdGFydFggPSB3LnNjcm9sbFggfHwgdy5wYWdlWE9mZnNldDtcbiAgICAgICAgc3RhcnRZID0gdy5zY3JvbGxZIHx8IHcucGFnZVlPZmZzZXQ7XG4gICAgICAgIG1ldGhvZCA9IG9yaWdpbmFsLnNjcm9sbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjcm9sbGFibGUgPSBlbDtcbiAgICAgICAgc3RhcnRYID0gZWwuc2Nyb2xsTGVmdDtcbiAgICAgICAgc3RhcnRZID0gZWwuc2Nyb2xsVG9wO1xuICAgICAgICBtZXRob2QgPSBzY3JvbGxFbGVtZW50O1xuICAgICAgfVxuXG4gICAgICAvLyBjYW5jZWwgZnJhbWUgd2hlbiBhIHNjcm9sbCBldmVudCdzIGhhcHBlbmluZ1xuICAgICAgaWYgKGZyYW1lKSB7XG4gICAgICAgIHcuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xuICAgICAgfVxuXG4gICAgICAvLyBzY3JvbGwgbG9vcGluZyBvdmVyIGEgZnJhbWVcbiAgICAgIHN0ZXAoe1xuICAgICAgICBzY3JvbGxhYmxlOiBzY3JvbGxhYmxlLFxuICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgc3RhcnRUaW1lOiBzdGFydFRpbWUsXG4gICAgICAgIHN0YXJ0WDogc3RhcnRYLFxuICAgICAgICBzdGFydFk6IHN0YXJ0WSxcbiAgICAgICAgeDogeCxcbiAgICAgICAgeTogeSxcbiAgICAgICAgZnJhbWU6IGZyYW1lXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIE9SSUdJTkFMIE1FVEhPRFMgT1ZFUlJJREVTXG4gICAgICovXG5cbiAgICAvLyB3LnNjcm9sbCBhbmQgdy5zY3JvbGxUb1xuICAgIHcuc2Nyb2xsID0gdy5zY3JvbGxUbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYXZvaWQgc21vb3RoIGJlaGF2aW9yIGlmIG5vdCByZXF1aXJlZFxuICAgICAgaWYgKHNob3VsZEJhaWxPdXQoYXJndW1lbnRzWzBdKSkge1xuICAgICAgICBvcmlnaW5hbC5zY3JvbGwuY2FsbChcbiAgICAgICAgICB3LFxuICAgICAgICAgIGFyZ3VtZW50c1swXS5sZWZ0IHx8IGFyZ3VtZW50c1swXSxcbiAgICAgICAgICBhcmd1bWVudHNbMF0udG9wIHx8IGFyZ3VtZW50c1sxXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIExFVCBUSEUgU01PT1RITkVTUyBCRUdJTiFcbiAgICAgIHNtb290aFNjcm9sbC5jYWxsKFxuICAgICAgICB3LFxuICAgICAgICBkLmJvZHksXG4gICAgICAgIH5+YXJndW1lbnRzWzBdLmxlZnQsXG4gICAgICAgIH5+YXJndW1lbnRzWzBdLnRvcFxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgLy8gdy5zY3JvbGxCeVxuICAgIHcuc2Nyb2xsQnkgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGF2b2lkIHNtb290aCBiZWhhdmlvciBpZiBub3QgcmVxdWlyZWRcbiAgICAgIGlmIChzaG91bGRCYWlsT3V0KGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgb3JpZ2luYWwuc2Nyb2xsQnkuY2FsbChcbiAgICAgICAgICB3LFxuICAgICAgICAgIGFyZ3VtZW50c1swXS5sZWZ0IHx8IGFyZ3VtZW50c1swXSxcbiAgICAgICAgICBhcmd1bWVudHNbMF0udG9wIHx8IGFyZ3VtZW50c1sxXVxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIExFVCBUSEUgU01PT1RITkVTUyBCRUdJTiFcbiAgICAgIHNtb290aFNjcm9sbC5jYWxsKFxuICAgICAgICB3LFxuICAgICAgICBkLmJvZHksXG4gICAgICAgIH5+YXJndW1lbnRzWzBdLmxlZnQgKyAody5zY3JvbGxYIHx8IHcucGFnZVhPZmZzZXQpLFxuICAgICAgICB+fmFyZ3VtZW50c1swXS50b3AgKyAody5zY3JvbGxZIHx8IHcucGFnZVlPZmZzZXQpXG4gICAgICApO1xuICAgIH07XG5cbiAgICAvLyBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxJbnRvVmlld1xuICAgIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3ID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCBzbW9vdGggYmVoYXZpb3IgaWYgbm90IHJlcXVpcmVkXG4gICAgICBpZiAoc2hvdWxkQmFpbE91dChhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIG9yaWdpbmFsLnNjcm9sbEludG9WaWV3LmNhbGwodGhpcywgYXJndW1lbnRzWzBdIHx8IHRydWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIExFVCBUSEUgU01PT1RITkVTUyBCRUdJTiFcbiAgICAgIHZhciBzY3JvbGxhYmxlUGFyZW50ID0gZmluZFNjcm9sbGFibGVQYXJlbnQodGhpcyk7XG4gICAgICB2YXIgcGFyZW50UmVjdHMgPSBzY3JvbGxhYmxlUGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgdmFyIGNsaWVudFJlY3RzID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgaWYgKHNjcm9sbGFibGVQYXJlbnQgIT09IGQuYm9keSkge1xuICAgICAgICAvLyByZXZlYWwgZWxlbWVudCBpbnNpZGUgcGFyZW50XG4gICAgICAgIHNtb290aFNjcm9sbC5jYWxsKFxuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgc2Nyb2xsYWJsZVBhcmVudCxcbiAgICAgICAgICBzY3JvbGxhYmxlUGFyZW50LnNjcm9sbExlZnQgKyBjbGllbnRSZWN0cy5sZWZ0IC0gcGFyZW50UmVjdHMubGVmdCxcbiAgICAgICAgICBzY3JvbGxhYmxlUGFyZW50LnNjcm9sbFRvcCArIGNsaWVudFJlY3RzLnRvcCAtIHBhcmVudFJlY3RzLnRvcFxuICAgICAgICApO1xuICAgICAgICAvLyByZXZlYWwgcGFyZW50IGluIHZpZXdwb3J0XG4gICAgICAgIHcuc2Nyb2xsQnkoe1xuICAgICAgICAgIGxlZnQ6IHBhcmVudFJlY3RzLmxlZnQsXG4gICAgICAgICAgdG9wOiBwYXJlbnRSZWN0cy50b3AsXG4gICAgICAgICAgYmVoYXZpb3I6ICdzbW9vdGgnXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmV2ZWFsIGVsZW1lbnQgaW4gdmlld3BvcnRcbiAgICAgICAgdy5zY3JvbGxCeSh7XG4gICAgICAgICAgbGVmdDogY2xpZW50UmVjdHMubGVmdCxcbiAgICAgICAgICB0b3A6IGNsaWVudFJlY3RzLnRvcCxcbiAgICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBjb21tb25qc1xuICAgIG1vZHVsZS5leHBvcnRzID0geyBwb2x5ZmlsbDogcG9seWZpbGwgfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBnbG9iYWxcbiAgICBwb2x5ZmlsbCgpO1xuICB9XG59KSh3aW5kb3csIGRvY3VtZW50KTtcbiIsIi8qIGdsb2JhbCBnYSAqL1xuXG5jb25zdCBzZWxmID0ge31cblxuc2VsZi5zZW5kID0ge31cblxuc2VsZi5zZW5kLnNlYXJjaCA9IGZ1bmN0aW9uIChzZWxlY3RlZFVzZXIsIGZhdm9yaXRlKSB7XG4gIGNvbnN0IGhpdFR5cGUgPSAnZXZlbnQnXG5cbiAgY29uc3QgZXZlbnRDYXRlZ29yeSA9IGZhdm9yaXRlID8gJ3NlYXJjaCBmYXYnIDogJ3NlYXJjaCdcblxuICBsZXQgZXZlbnRBY3Rpb25cbiAgc3dpdGNoIChzZWxlY3RlZFVzZXIudHlwZSkge1xuICAgIGNhc2UgJ2MnOlxuICAgICAgZXZlbnRBY3Rpb24gPSAnQ2xhc3MnXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3QnOlxuICAgICAgZXZlbnRBY3Rpb24gPSAnVGVhY2hlcidcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAncic6XG4gICAgICBldmVudEFjdGlvbiA9ICdSb29tJ1xuICAgICAgYnJlYWtcbiAgICBjYXNlICdzJzpcbiAgICAgIGV2ZW50QWN0aW9uID0gJ1N0dWRlbnQnXG4gICAgICBicmVha1xuICB9XG5cbiAgY29uc3QgZXZlbnRMYWJlbCA9IHNlbGVjdGVkVXNlci52YWx1ZVxuXG4gIGdhKGZ1bmN0aW9uICgpIHtcbiAgICBnYSgnc2VuZCcsIHsgaGl0VHlwZSwgZXZlbnRDYXRlZ29yeSwgZXZlbnRBY3Rpb24sIGV2ZW50TGFiZWwgfSlcbiAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJjb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuXG5jb25zdCBzZWxmID0gbmV3IEV2ZW50RW1pdHRlcigpXG5cbnNlbGYuX2l0ZW1zID0gW11cbnNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ID0gLTFcblxuc2VsZi5fbm9kZXMgPSB7XG4gIHNlYXJjaDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NlYXJjaCcpLFxuICBpbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpLFxuICBhdXRvY29tcGxldGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUnKVxufVxuXG5zZWxmLmdldFNlbGVjdGVkSXRlbSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHNlbGYuZ2V0SXRlbXMoKSA9PT0gW10pIHJldHVyblxuXG4gIGlmIChzZWxmLmdldFNlbGVjdGVkSXRlbUluZGV4KCkgPT09IC0xKSB7XG4gICAgcmV0dXJuIHNlbGYuZ2V0SXRlbXMoKVswXVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBzZWxmLmdldEl0ZW1zKClbc2VsZi5nZXRTZWxlY3RlZEl0ZW1JbmRleCgpXVxuICB9XG59XG5cbnNlbGYuZ2V0U2VsZWN0ZWRJdGVtSW5kZXggPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleFxufVxuXG5zZWxmLmdldEl0ZW1zID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gc2VsZi5faXRlbXNcbn1cblxuc2VsZi5yZW1vdmVBbGxJdGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgd2hpbGUgKHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5maXJzdENoaWxkKSB7XG4gICAgc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLnJlbW92ZUNoaWxkKHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5maXJzdENoaWxkKVxuICB9XG4gIHNlbGYuX2l0ZW1zID0gW11cbiAgc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggPSAtMVxufVxuXG5zZWxmLmFkZEl0ZW0gPSBmdW5jdGlvbiAoaXRlbSkge1xuICBjb25zdCBsaXN0SXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgbGlzdEl0ZW0udGV4dENvbnRlbnQgPSBpdGVtLnZhbHVlXG4gIHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5hcHBlbmRDaGlsZChsaXN0SXRlbSlcbiAgc2VsZi5faXRlbXMucHVzaChpdGVtKVxufVxuXG5zZWxmLl9tb3ZlU2VsZWN0ZWQgPSBmdW5jdGlvbiAoc2hpZnQpIHtcbiAgaWYgKHNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ICsgc2hpZnQgPj0gc2VsZi5nZXRJdGVtcygpLmxlbmd0aCkge1xuICAgIHNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ID0gLTFcbiAgfSBlbHNlIGlmIChzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleCArIHNoaWZ0IDwgLTEpIHtcbiAgICBzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleCA9IHNlbGYuZ2V0SXRlbXMoKS5sZW5ndGggLSAxXG4gIH0gZWxzZSB7XG4gICAgc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggKz0gc2hpZnRcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZi5nZXRJdGVtcygpLmxlbmd0aDsgaSsrKSB7XG4gICAgc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmNoaWxkcmVuW2ldLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJylcbiAgfVxuICBpZiAoc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggPj0gMCkge1xuICAgIHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZVxuICAgICAgICAuY2hpbGRyZW5bc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXhdLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJylcbiAgfVxufVxuXG5zZWxmLl9oYW5kbGVJdGVtQ2xpY2sgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgaWYgKCFzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgcmV0dXJuXG4gIGNvbnN0IGl0ZW1JbmRleCA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mXG4gICAgICAuY2FsbChzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuY2hpbGRyZW4sIGV2ZW50LnRhcmdldClcbiAgc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggPSBpdGVtSW5kZXhcbiAgc2VsZi5lbWl0KCdzZWxlY3QnLCBzZWxmLmdldFNlbGVjdGVkSXRlbSgpKVxufVxuXG5zZWxmLl9oYW5kbGVLZXlkb3duID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGlmIChldmVudC5rZXkgPT09ICdBcnJvd0Rvd24nIHx8IGV2ZW50LmtleSA9PT0gJ0Fycm93VXAnKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGlmIChldmVudC5rZXkgPT09ICdBcnJvd0Rvd24nKSB7XG4gICAgICBzZWxmLl9tb3ZlU2VsZWN0ZWQoMSlcbiAgICB9IGVsc2UgaWYgKGV2ZW50LmtleSA9PT0gJ0Fycm93VXAnKSB7XG4gICAgICBzZWxmLl9tb3ZlU2VsZWN0ZWQoLTEpXG4gICAgfVxuICB9XG59XG5cbnNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlbGYuX2hhbmRsZUl0ZW1DbGljaylcbnNlbGYuX25vZGVzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBzZWxmLl9oYW5kbGVLZXlkb3duKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsImNvbnN0IHNlbGYgPSB7fVxuXG5zZWxmLmlzSUUgPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ01TSUUnKSAhPT0gLTEgfHxcbiAgICAgICAgICAgIG5hdmlnYXRvci5hcHBWZXJzaW9uLmluZGV4T2YoJ1RyaWRlbnQvJykgPiAwXG5cbmlmIChzZWxmLmlzSUUpIHtcbiAgc2VsZi5pbnB1dEV2ZW50ID0gJ3RleHRpbnB1dCdcbn0gZWxzZSB7XG4gIHNlbGYuaW5wdXRFdmVudCA9ICdpbnB1dCdcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCIvKiBnbG9iYWwgVVNFUlMgKi9cblxuY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJylcblxuY29uc3Qgc2VsZiA9IG5ldyBFdmVudEVtaXR0ZXIoKVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgdG9nZ2xlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZmF2Jylcbn1cblxuc2VsZi5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgbG9jYWxTdG9yYWdlVXNlciA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdmYXYnKSlcbiAgICBpZiAobG9jYWxTdG9yYWdlVXNlciA9PSBudWxsKSByZXR1cm5cblxuICAgIGNvbnN0IGNvcnJlY3RlZFVzZXIgPSBVU0VSUy5maWx0ZXIoZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgIHJldHVybiB1c2VyLnR5cGUgPT09IGxvY2FsU3RvcmFnZVVzZXIudHlwZSAmJlxuICAgICAgICAgICAgIHVzZXIudmFsdWUgPT09IGxvY2FsU3RvcmFnZVVzZXIudmFsdWVcbiAgICB9KVswXVxuICAgIHJldHVybiBjb3JyZWN0ZWRVc2VyXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzZWxmLmRlbGV0ZSgpXG4gICAgcmV0dXJuXG4gIH1cbn1cblxuc2VsZi5zZXQgPSBmdW5jdGlvbiAodXNlcikge1xuICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2ZhdicsIEpTT04uc3RyaW5naWZ5KHVzZXIpKVxuICBzZWxmLl9ub2Rlcy5pbm5lckhUTUwgPSAnJiN4RTgzODsnXG59XG5cbnNlbGYuZGVsZXRlID0gZnVuY3Rpb24gKCkge1xuICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2ZhdicpXG59XG5cbnNlbGYudXBkYXRlRG9tID0gZnVuY3Rpb24gKGlzRmF2b3JpdGUpIHtcbiAgaWYgKGlzRmF2b3JpdGUpIHtcbiAgICBzZWxmLl9ub2Rlcy50b2dnbGUuaW5uZXJIVE1MID0gJyYjeEU4Mzg7J1xuICB9IGVsc2Uge1xuICAgIHNlbGYuX25vZGVzLnRvZ2dsZS5pbm5lckhUTUwgPSAnJiN4RTgzQSdcbiAgfVxufVxuXG5zZWxmLnVwZGF0ZSA9IGZ1bmN0aW9uIChzZWxlY3RlZFVzZXIpIHtcbiAgY29uc3QgY3VycmVudFVzZXIgPSBzZWxmLmdldCgpXG5cbiAgaWYgKGN1cnJlbnRVc2VyID09IG51bGwpIHtcbiAgICBzZWxmLnVwZGF0ZURvbShmYWxzZSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbnN0IGlzRXF1YWwgPSBjdXJyZW50VXNlci50eXBlID09PSBzZWxlY3RlZFVzZXIudHlwZSAmJlxuICAgICAgICAgICAgICAgICAgY3VycmVudFVzZXIuaW5kZXggPT09IHNlbGVjdGVkVXNlci5pbmRleFxuXG4gIHNlbGYudXBkYXRlRG9tKGlzRXF1YWwpXG59XG5cbnNlbGYudG9nZ2xlID0gZnVuY3Rpb24gKHNlbGVjdGVkVXNlcikge1xuICBjb25zdCBjdXJyZW50VXNlciA9IHNlbGYuZ2V0KClcbiAgY29uc3QgaXNFcXVhbCA9IGN1cnJlbnRVc2VyICE9IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRVc2VyLnR5cGUgPT09IHNlbGVjdGVkVXNlci50eXBlICYmXG4gICAgICAgICAgICAgICAgICBjdXJyZW50VXNlci5pbmRleCA9PT0gc2VsZWN0ZWRVc2VyLmluZGV4XG5cbiAgaWYgKGlzRXF1YWwpIHtcbiAgICBzZWxmLmRlbGV0ZSgpXG4gICAgc2VsZi51cGRhdGVEb20oZmFsc2UpXG4gIH0gZWxzZSB7XG4gICAgc2VsZi5zZXQoc2VsZWN0ZWRVc2VyKVxuICAgIHNlbGYudXBkYXRlRG9tKHRydWUpXG4gIH1cbn1cblxuc2VsZi5faGFuZGxlQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHNlbGYuZW1pdCgnY2xpY2snKVxufVxuXG5zZWxmLl9ub2Rlcy50b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxmLl9oYW5kbGVDbGljaylcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCIvKiBnbG9iYWwgRkxBR1MgKi9cblxuY29uc3Qgc2VsZiA9IHt9XG5cbnNlbGYuX25vZGVzID0ge1xuICBpbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpLFxuICBvdmVyZmxvd0J1dHRvbjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI292ZXJmbG93LWJ1dHRvbicpXG59XG5cbnNlbGYuX3Nob3VsZENoZWNrID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gRkxBR1MuaW5kZXhPZignTk9fRkVBVFVSRV9ERVRFQ1QnKSA9PT0gLTFcbn1cblxuc2VsZi5fcmVkaXJlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJ2h0dHA6Ly93d3cubWVldGluZ3BvaW50bWNvLm5sL1Jvb3N0ZXJzLUFML2RvYy8nXG59XG5cbnNlbGYuY2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghc2VsZi5fc2hvdWxkQ2hlY2soKSkgcmV0dXJuXG5cbiAgd2luZG93Lm9uZXJyb3IgPSBzZWxmLl9yZWRpcmVjdFxuXG4gIGlmIChzZWxmLl9ub2Rlcy5pbnB1dC5nZXRDbGllbnRSZWN0cygpWzBdLnRvcCAhPT1cbiAgICAgIHNlbGYuX25vZGVzLm92ZXJmbG93QnV0dG9uLmdldENsaWVudFJlY3RzKClbMF0udG9wKSB7XG4gICAgc2VsZi5fcmVkaXJlY3QoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwiY29uc3QgYnJvd3NlckZpeFRvb2xraXQgPSByZXF1aXJlKCcuL2Jyb3dzZXJGaXhUb29sa2l0JylcblxuY29uc3Qgc2VsZiA9IHt9XG5cbnNlbGYuX25vZGVzID0ge1xuICBpbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpXG59XG5cbnNlbGYuaXNTaG93biA9IGZhbHNlXG5cbnNlbGYuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCduby1pbnB1dCcpXG4gIHNlbGYuaXNTaG93biA9IHRydWVcbn1cblxuc2VsZi5oaWRlID0gZnVuY3Rpb24gKCkge1xuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ25vLWlucHV0JylcbiAgc2VsZi5pc1Nob3duID0gZmFsc2Vcbn1cblxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihicm93c2VyRml4VG9vbGtpdC5pbnB1dEV2ZW50LCBzZWxmLmhpZGUpXG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwicmVxdWlyZSgnLi9mZWF0dXJlRGV0ZWN0JykuY2hlY2soKVxuXG5jb25zdCBmcm9udHBhZ2UgPSByZXF1aXJlKCcuL2Zyb250cGFnZScpXG5jb25zdCBzZWFyY2ggPSByZXF1aXJlKCcuL3NlYXJjaCcpXG5jb25zdCBzY2hlZHVsZSA9IHJlcXVpcmUoJy4vc2NoZWR1bGUnKVxuY29uc3Qgd2Vla1NlbGVjdG9yID0gcmVxdWlyZSgnLi93ZWVrU2VsZWN0b3InKVxuY29uc3QgZmF2b3JpdGUgPSByZXF1aXJlKCcuL2Zhdm9yaXRlJylcbmNvbnN0IHNjcm9sbFNuYXAgPSByZXF1aXJlKCcuL3Njcm9sbFNuYXAnKVxuY29uc3QgYW5hbHl0aWNzID0gcmVxdWlyZSgnLi9hbmFseXRpY3MnKVxuXG5jb25zdCBzdGF0ZSA9IHt9XG5cbndpbmRvdy5zdGF0ZSA9IHN0YXRlXG53aW5kb3cucmVxdWlyZSA9IHJlcXVpcmVcblxuZnJvbnRwYWdlLnNob3coKVxud2Vla1NlbGVjdG9yLnVwZGF0ZUN1cnJlbnRXZWVrKClcbnNjcm9sbFNuYXAuc3RhcnRMaXN0ZW5pbmcoKVxuXG5pZiAoZmF2b3JpdGUuZ2V0KCkgIT0gbnVsbCkge1xuICBzdGF0ZS5zZWxlY3RlZEl0ZW0gPSBmYXZvcml0ZS5nZXQoKVxuICBmYXZvcml0ZS51cGRhdGUoc3RhdGUuc2VsZWN0ZWRJdGVtKVxuICBhbmFseXRpY3Muc2VuZC5zZWFyY2goc3RhdGUuc2VsZWN0ZWRJdGVtLCB0cnVlKVxuICBzY2hlZHVsZS52aWV3SXRlbSh3ZWVrU2VsZWN0b3IuZ2V0U2VsZWN0ZWRXZWVrKCksIHN0YXRlLnNlbGVjdGVkSXRlbSlcbn0gZWxzZSB7XG4gIHNlYXJjaC5mb2N1cygpXG59XG5cbnNlYXJjaC5vbignc2VhcmNoJywgZnVuY3Rpb24gKHNlbGVjdGVkSXRlbSkge1xuICBzdGF0ZS5zZWxlY3RlZEl0ZW0gPSBzZWxlY3RlZEl0ZW1cbiAgZmF2b3JpdGUudXBkYXRlKHN0YXRlLnNlbGVjdGVkSXRlbSlcbiAgYW5hbHl0aWNzLnNlbmQuc2VhcmNoKHN0YXRlLnNlbGVjdGVkSXRlbSlcbiAgc2NoZWR1bGUudmlld0l0ZW0od2Vla1NlbGVjdG9yLmdldFNlbGVjdGVkV2VlaygpLCBzdGF0ZS5zZWxlY3RlZEl0ZW0pXG59KVxuXG53ZWVrU2VsZWN0b3Iub24oJ3dlZWtDaGFuZ2VkJywgZnVuY3Rpb24gKG5ld1dlZWspIHtcbiAgYW5hbHl0aWNzLnNlbmQuc2VhcmNoKHN0YXRlLnNlbGVjdGVkSXRlbSlcbiAgc2NoZWR1bGUudmlld0l0ZW0obmV3V2Vlaywgc3RhdGUuc2VsZWN0ZWRJdGVtKVxufSlcblxuZmF2b3JpdGUub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICBmYXZvcml0ZS50b2dnbGUoc3RhdGUuc2VsZWN0ZWRJdGVtKVxufSlcblxuZG9jdW1lbnQuYm9keS5zdHlsZS5vcGFjaXR5ID0gMVxuIiwiY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJylcbmNvbnN0IGxlZnRQYWQgPSByZXF1aXJlKCdsZWZ0LXBhZCcpXG5jb25zdCBzZWFyY2ggPSByZXF1aXJlKCcuL3NlYXJjaCcpXG5cbmNvbnN0IHNlbGYgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fbm9kZXMgPSB7XG4gIHNjaGVkdWxlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2NoZWR1bGUnKVxufVxuXG5zZWxmLl9wYXJzZU1lZXRpbmdwb2ludEhUTUwgPSBmdW5jdGlvbiAoaHRtbFN0cikge1xuICBjb25zdCBodG1sID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaHRtbCcpXG4gIGh0bWwuaW5uZXJIVE1MID0gaHRtbFN0clxuICBjb25zdCBjZW50ZXJOb2RlID0gaHRtbC5xdWVyeVNlbGVjdG9yKCdjZW50ZXInKVxuICByZXR1cm4gY2VudGVyTm9kZVxufVxuXG5zZWxmLl9oYW5kbGVMb2FkID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGNvbnN0IHJlcXVlc3QgPSBldmVudC50YXJnZXRcbiAgaWYgKHJlcXVlc3Quc3RhdHVzIDwgMjAwIHx8IHJlcXVlc3Quc3RhdHVzID49IDQwMCkge1xuICAgIHNlbGYuX2hhbmRsZUVycm9yKGV2ZW50KVxuICAgIHJldHVyblxuICB9XG4gIGNvbnN0IGRvY3VtZW50ID0gc2VsZi5fcGFyc2VNZWV0aW5ncG9pbnRIVE1MKHJlcXVlc3QucmVzcG9uc2UpXG4gIHNlbGYuX3JlbW92ZUNoaWxkcygpXG4gIHNlbGYuX25vZGVzLnNjaGVkdWxlLmFwcGVuZENoaWxkKGRvY3VtZW50KVxuICBzZWxmLl9ub2Rlcy5zY2hlZHVsZS5jbGFzc0xpc3QucmVtb3ZlKCdlcnJvcicpXG4gIHNlbGYuZW1pdCgnbG9hZCcpXG59XG5cbnNlbGYuX2hhbmRsZUVycm9yID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGNvbnN0IHJlcXVlc3QgPSBldmVudC50YXJnZXRcbiAgbGV0IGVycm9yXG4gIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgZXJyb3IgPSAnU29ycnksIGVyIGlzIChub2cpIGdlZW4gcm9vc3RlciB2b29yIGRlemUgd2Vlay4nXG4gIH0gZWxzZSB7XG4gICAgZXJyb3IgPSAnU29ycnksIGVyIGlzIGlldHMgbWlzIGdlZ2FhbiB0aWpkZW5zIGhldCBsYWRlbiB2YW4gZGV6ZSB3ZWVrLidcbiAgfVxuICBzZWxmLl9yZW1vdmVDaGlsZHMoKVxuICBzZWxmLl9ub2Rlcy5zY2hlZHVsZS50ZXh0Q29udGVudCA9IGVycm9yXG4gIHNlbGYuX25vZGVzLnNjaGVkdWxlLmNsYXNzTGlzdC5hZGQoJ2Vycm9yJylcbiAgc2VsZi5lbWl0KCdsb2FkJylcbn1cblxuc2VsZi5fZ2V0VVJMT2ZVc2VycyA9IGZ1bmN0aW9uICh3ZWVrLCB0eXBlLCBpbmRleCkge1xuICBjb25zdCBpZCA9IGluZGV4ICsgMVxuICByZXR1cm4gJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgJy9tZWV0aW5ncG9pbnRQcm94eS9Sb29zdGVycy1BTCUyRmRvYyUyRmRhZ3Jvb3N0ZXJzJTJGJyArXG4gICAgICBsZWZ0UGFkKHdlZWssIDIsICcwJykgKyAnJTJGJyArIHR5cGUgKyAnJTJGJyArIHR5cGUgKyBsZWZ0UGFkKGlkLCA1LCAnMCcpICsgJy5odG0nXG59XG5cbnNlbGYuX3JlbW92ZUNoaWxkcyA9IGZ1bmN0aW9uICgpIHtcbiAgd2hpbGUgKHNlbGYuX25vZGVzLnNjaGVkdWxlLmZpcnN0Q2hpbGQpIHtcbiAgICBzZWxmLl9ub2Rlcy5zY2hlZHVsZS5yZW1vdmVDaGlsZChzZWxmLl9ub2Rlcy5zY2hlZHVsZS5maXJzdENoaWxkKVxuICB9XG59XG5cbnNlbGYudmlld0l0ZW0gPSBmdW5jdGlvbiAod2Vlaywgc2VsZWN0ZWRVc2VyKSB7XG4gIGNvbnN0IHVybCA9IHNlbGYuX2dldFVSTE9mVXNlcnMod2Vlaywgc2VsZWN0ZWRVc2VyLnR5cGUsIHNlbGVjdGVkVXNlci5pbmRleClcblxuICBzZWxmLl9yZW1vdmVDaGlsZHMoKVxuXG4gIGNvbnN0IHJlcXVlc3QgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KClcbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgc2VsZi5faGFuZGxlTG9hZClcbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHNlbGYuX2hhbmRsZUVycm9yKVxuICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSlcbiAgcmVxdWVzdC5zZW5kKClcblxuICBzZWFyY2gudXBkYXRlRG9tKHNlbGVjdGVkVXNlcilcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJyZXF1aXJlKCdzbW9vdGhzY3JvbGwtcG9seWZpbGwnKS5wb2x5ZmlsbCgpXG5cbmNvbnN0IHNlbGYgPSB7fVxuY29uc3Qgc2NoZWR1bGUgPSByZXF1aXJlKCcuL3NjaGVkdWxlJylcblxuc2VsZi5fbm9kZXMgPSB7XG4gIHNlYXJjaDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NlYXJjaCcpLFxuICB3ZWVrU2VsZWN0b3I6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3ZWVrLXNlbGVjdG9yJylcbn1cblxuc2VsZi5fdGltZW91dElEID0gbnVsbFxuXG5zZWxmLl9nZXRTY3JvbGxQb3NpdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCkgfHxcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxufVxuXG5zZWxmLl9oYW5kbGVEb25lU2Nyb2xsaW5nID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBzY3JvbGxQb3NpdGlvbiA9IHNlbGYuX2dldFNjcm9sbFBvc2l0aW9uKClcbiAgY29uc3Qgd2Vla1NlbGVjdG9ySGVpZ2h0ID0gc2VsZi5fbm9kZXMud2Vla1NlbGVjdG9yLmNsaWVudEhlaWdodCAtIHNlbGYuX25vZGVzLnNlYXJjaC5jbGllbnRIZWlnaHRcbiAgaWYgKHNjcm9sbFBvc2l0aW9uIDwgd2Vla1NlbGVjdG9ySGVpZ2h0ICYmIHNjcm9sbFBvc2l0aW9uID4gMCkge1xuICAgIHdpbmRvdy5zY3JvbGwoeyB0b3A6IHdlZWtTZWxlY3RvckhlaWdodCwgbGVmdDogMCwgYmVoYXZpb3I6ICdzbW9vdGgnIH0pXG4gIH1cbn1cblxuc2VsZi5faGFuZGxlU2Nyb2xsID0gZnVuY3Rpb24gKCkge1xuICBpZiAoc2VsZi5fdGltZW91dElEICE9IG51bGwpIHdpbmRvdy5jbGVhclRpbWVvdXQoc2VsZi5fdGltZW91dElEKVxuICBzZWxmLl90aW1lb3V0SUQgPSB3aW5kb3cuc2V0VGltZW91dChzZWxmLl9oYW5kbGVEb25lU2Nyb2xsaW5nLCA1MDApXG5cbiAgY29uc3Qgc2Nyb2xsUG9zaXRpb24gPSBzZWxmLl9nZXRTY3JvbGxQb3NpdGlvbigpXG4gIGNvbnN0IHdlZWtTZWxlY3RvckhlaWdodCA9IHNlbGYuX25vZGVzLndlZWtTZWxlY3Rvci5jbGllbnRIZWlnaHQgLSBzZWxmLl9ub2Rlcy5zZWFyY2guY2xpZW50SGVpZ2h0XG4gIGlmIChzY3JvbGxQb3NpdGlvbiA+PSB3ZWVrU2VsZWN0b3JIZWlnaHQpIHtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3dlZWstc2VsZWN0b3Itbm90LXZpc2libGUnKVxuICB9IGVsc2Uge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnd2Vlay1zZWxlY3Rvci1ub3QtdmlzaWJsZScpXG4gIH1cbn1cblxuc2VsZi5faGFuZGxlV2luZG93UmVzaXplID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCB3ZWVrU2VsZWN0b3JIZWlnaHQgPSBzZWxmLl9ub2Rlcy53ZWVrU2VsZWN0b3IuY2xpZW50SGVpZ2h0IC0gc2VsZi5fbm9kZXMuc2VhcmNoLmNsaWVudEhlaWdodFxuICBjb25zdCBleHRyYVBpeGVsc05lZWRlZCA9IHdlZWtTZWxlY3RvckhlaWdodCAtIChkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodCAtIHdpbmRvdy5pbm5lckhlaWdodClcbiAgaWYgKGV4dHJhUGl4ZWxzTmVlZGVkID4gMCkge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUubWFyZ2luQm90dG9tID0gZXh0cmFQaXhlbHNOZWVkZWQgKyAncHgnXG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5tYXJnaW5Cb3R0b20gPSBudWxsXG4gIH1cbn1cblxuc2VsZi5zdGFydExpc3RlbmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHNlbGYuX2hhbmRsZVNjcm9sbClcbn1cblxuc2NoZWR1bGUub24oJ2xvYWQnLCBzZWxmLl9oYW5kbGVXaW5kb3dSZXNpemUpXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc2VsZi5faGFuZGxlV2luZG93UmVzaXplKVxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCIvKiBnbG9iYWwgVVNFUlMgKi9cblxuY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJylcbmNvbnN0IGZ1enp5ID0gcmVxdWlyZSgnZnV6enknKVxuY29uc3QgYXV0b2NvbXBsZXRlID0gcmVxdWlyZSgnLi9hdXRvY29tcGxldGUnKVxuY29uc3QgYnJvd3NlckZpeFRvb2xraXQgPSByZXF1aXJlKCcuL2Jyb3dzZXJGaXhUb29sa2l0JylcblxuY29uc3Qgc2VsZiA9IG5ldyBFdmVudEVtaXR0ZXIoKVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgc2VhcmNoOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2VhcmNoJyksXG4gIGlucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJylcbn1cblxuc2VsZi5zdWJtaXQgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHNlbGVjdGVkSXRlbSA9IGF1dG9jb21wbGV0ZS5nZXRTZWxlY3RlZEl0ZW0oKVxuICBpZiAoc2VsZWN0ZWRJdGVtID09IG51bGwpIHJldHVyblxuXG4gIGNvbnNvbGUubG9nKHNlbGVjdGVkSXRlbSlcblxuICBzZWxmLl9ub2Rlcy5pbnB1dC5ibHVyKClcbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCd3ZWVrLXNlbGVjdG9yLW5vdC12aXNpYmxlJykgLy8gU2FmYXJpIGJ1Z1xuXG4gIHNlbGYuZW1pdCgnc2VhcmNoJywgc2VsZWN0ZWRJdGVtKVxufVxuXG5zZWxmLnVwZGF0ZURvbSA9IGZ1bmN0aW9uIChzZWxlY3RlZEl0ZW0pIHtcbiAgc2VsZi5fbm9kZXMuaW5wdXQudmFsdWUgPSBzZWxlY3RlZEl0ZW0udmFsdWVcbiAgYXV0b2NvbXBsZXRlLnJlbW92ZUFsbEl0ZW1zKClcbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCduby1pbnB1dCcpXG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnc2VhcmNoZWQnKVxufVxuXG5zZWxmLmZvY3VzID0gZnVuY3Rpb24gKCkge1xuICBzZWxmLl9ub2Rlcy5pbnB1dC5mb2N1cygpXG59XG5cbnNlbGYuX2hhbmRsZVN1Ym1pdCA9IGZ1bmN0aW9uIChldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIHNlbGYuc3VibWl0KClcbn1cblxuc2VsZi5fY2FsY3VsYXRlID0gZnVuY3Rpb24gKHNlYXJjaFRlcm0pIHtcbiAgY29uc3QgYWxsUmVzdWx0cyA9IGZ1enp5LmZpbHRlcihzZWFyY2hUZXJtLCBVU0VSUywge1xuICAgIGV4dHJhY3Q6IGZ1bmN0aW9uIChpdGVtKSB7IHJldHVybiBpdGVtLnZhbHVlIH1cbiAgfSlcbiAgY29uc3QgZmlyc3RSZXN1bHRzID0gYWxsUmVzdWx0cy5zbGljZSgwLCA3KVxuXG4gIGNvbnN0IG9yaWdpbmFsUmVzdWx0cyA9IGZpcnN0UmVzdWx0cy5tYXAoZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgIHJldHVybiByZXN1bHQub3JpZ2luYWxcbiAgfSlcblxuICByZXR1cm4gb3JpZ2luYWxSZXN1bHRzXG59XG5cbnNlbGYuX2hhbmRsZVRleHRVcGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHJlc3VsdHMgPSBzZWxmLl9jYWxjdWxhdGUoc2VsZi5fbm9kZXMuaW5wdXQudmFsdWUpXG5cbiAgYXV0b2NvbXBsZXRlLnJlbW92ZUFsbEl0ZW1zKClcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgYXV0b2NvbXBsZXRlLmFkZEl0ZW0ocmVzdWx0c1tpXSlcbiAgfVxufVxuXG5zZWxmLl9oYW5kbGVGb2N1cyA9IGZ1bmN0aW9uICgpIHtcbiAgc2VsZi5fbm9kZXMuaW5wdXQuc2VsZWN0KClcbn1cblxuc2VsZi5faGFuZGxlQmx1ciA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gdGhpcyB3aWxsIHJlbW92ZWQgdGhlIHNlbGVjdGlvbiB3aXRob3V0IGRyYXdpbmcgZm9jdXMgb24gaXQgKHNhZmFyaSlcbiAgLy8gdGhpcyB3aWxsIHJlbW92ZWQgc2VsZWN0aW9uIGV2ZW4gd2hlbiBmb2N1c2luZyBhbiBpZnJhbWUgKGNocm9tZSlcbiAgY29uc3Qgb2xkVmFsdWUgPSBzZWxmLl9ub2Rlcy52YWx1ZVxuICBzZWxmLl9ub2Rlcy52YWx1ZSA9ICcnXG4gIHNlbGYuX25vZGVzLnZhbHVlID0gb2xkVmFsdWVcblxuICAvLyB0aGlzIHdpbGwgaGlkZSB0aGUga2V5Ym9hcmQgKGlPUyBzYWZhcmkpXG4gIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpXG59XG5cbmF1dG9jb21wbGV0ZS5vbignc2VsZWN0Jywgc2VsZi5zdWJtaXQpXG5cbnNlbGYuX25vZGVzLnNlYXJjaC5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBzZWxmLl9oYW5kbGVTdWJtaXQpXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHNlbGYuX2hhbmRsZUZvY3VzKVxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHNlbGYuX2hhbmRsZUJsdXIpXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKGJyb3dzZXJGaXhUb29sa2l0LmlucHV0RXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2hhbmRsZVRleHRVcGRhdGUpXG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwiY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJylcblxuY29uc3Qgc2VsZiA9IG5ldyBFdmVudEVtaXR0ZXIoKVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgcHJldkJ1dHRvbjogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3dlZWstc2VsZWN0b3IgYnV0dG9uJylbMF0sXG4gIG5leHRCdXR0b246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN3ZWVrLXNlbGVjdG9yIGJ1dHRvbicpWzFdLFxuICBjdXJyZW50V2Vla05vZGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3ZWVrLXNlbGVjdG9yIC5jdXJyZW50JyksXG4gIGN1cnJlbnRXZWVrTm9ybWFsVGV4dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3dlZWstc2VsZWN0b3IgLmN1cnJlbnQgLm5vLXByaW50JyksXG4gIGN1cnJlbnRXZWVrUHJpbnRUZXh0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd2Vlay1zZWxlY3RvciAuY3VycmVudCAucHJpbnQnKVxufVxuXG5zZWxmLl93ZWVrT2Zmc2V0ID0gMFxuXG4vLyBjb3BpZWQgZnJvbSBodHRwOi8vd3d3Lm1lZXRpbmdwb2ludG1jby5ubC9Sb29zdGVycy1BTC9kb2MvZGFncm9vc3RlcnMvdW50aXNzY3JpcHRzLmpzLFxuLy8gd2VyZSB1c2luZyB0aGUgc2FtZSBjb2RlIGFzIHRoZXkgZG8gdG8gYmUgc3VyZSB0aGF0IHdlIGFsd2F5cyBnZXQgdGhlIHNhbWVcbi8vIHdlZWsgbnVtYmVyLlxuc2VsZi5nZXRDdXJyZW50V2VlayA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgY29uc3QgZGF5TnIgPSAodGFyZ2V0LmdldERheSgpICsgNikgJSA3XG4gIHRhcmdldC5zZXREYXRlKHRhcmdldC5nZXREYXRlKCkgLSBkYXlOciArIDMpXG4gIGNvbnN0IGZpcnN0VGh1cnNkYXkgPSB0YXJnZXQudmFsdWVPZigpXG4gIHRhcmdldC5zZXRNb250aCgwLCAxKVxuICBpZiAodGFyZ2V0LmdldERheSgpICE9PSA0KSB7XG4gICAgdGFyZ2V0LnNldE1vbnRoKDAsIDEgKyAoKDQgLSB0YXJnZXQuZ2V0RGF5KCkpICsgNykgJSA3KVxuICB9XG5cbiAgcmV0dXJuIDEgKyBNYXRoLmNlaWwoKGZpcnN0VGh1cnNkYXkgLSB0YXJnZXQpIC8gNjA0ODAwMDAwKVxufVxuXG5zZWxmLmdldFNlbGVjdGVkV2VlayA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgbm93ID0gbmV3IERhdGUoKVxuICBjb25zdCB0YXJnZXREYXRlID0gbmV3IERhdGUobm93LmdldFRpbWUoKSArXG4gICAgICBzZWxmLl93ZWVrT2Zmc2V0ICogNjA0ODAwICogMTAwMCArIDg2NDAwICogMTAwMClcbiAgcmV0dXJuIHNlbGYuZ2V0Q3VycmVudFdlZWsodGFyZ2V0RGF0ZSlcbn1cblxuc2VsZi51cGRhdGVDdXJyZW50V2VlayA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgc2VsZWN0ZWRXZWVrTnVtYmVyID0gc2VsZi5nZXRTZWxlY3RlZFdlZWsoKVxuICBpZiAoc2VsZi5nZXRDdXJyZW50V2VlayhuZXcgRGF0ZSgpKSAhPT0gc2VsZWN0ZWRXZWVrTnVtYmVyKSB7XG4gICAgc2VsZi5fbm9kZXMuY3VycmVudFdlZWtOb2RlLmNsYXNzTGlzdC5hZGQoJ2NoYW5nZWQnKVxuICB9IGVsc2Uge1xuICAgIHNlbGYuX25vZGVzLmN1cnJlbnRXZWVrTm9kZS5jbGFzc0xpc3QucmVtb3ZlKCdjaGFuZ2VkJylcbiAgfVxuICBzZWxmLnVwZGF0ZURvbSgpXG4gIHNlbGYuZW1pdCgnd2Vla0NoYW5nZWQnLCBzZWxlY3RlZFdlZWtOdW1iZXIpXG59XG5cbnNlbGYudXBkYXRlRG9tID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBzZWxlY3RlZFdlZWtOdW1iZXIgPSBzZWxmLmdldFNlbGVjdGVkV2VlaygpXG4gIGNvbnN0IGlzU3VuZGF5ID0gbmV3IERhdGUoKS5nZXREYXkoKSA9PT0gMFxuICBsZXQgaHVtYW5SZWFkYWJsZVdlZWsgPSBudWxsXG4gIGlmIChpc1N1bmRheSkge1xuICAgIHN3aXRjaCAoc2VsZi5fd2Vla09mZnNldCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICBodW1hblJlYWRhYmxlV2VlayA9ICdBYW5zdGFhbmRlIHdlZWsnXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGh1bWFuUmVhZGFibGVXZWVrID0gJ1ZvbGdlbmRlIHdlZWsnXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIC0xOlxuICAgICAgICBodW1hblJlYWRhYmxlV2VlayA9ICdBZmdlbG9wZW4gd2VlaydcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgc3dpdGNoIChzZWxmLl93ZWVrT2Zmc2V0KSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIGh1bWFuUmVhZGFibGVXZWVrID0gJ0h1aWRpZ2Ugd2VlaydcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaHVtYW5SZWFkYWJsZVdlZWsgPSAnVm9sZ2VuZGUgd2VlaydcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgLTE6XG4gICAgICAgIGh1bWFuUmVhZGFibGVXZWVrID0gJ1ZvcmlnZSB3ZWVrJ1xuICAgICAgICBicmVha1xuICAgIH1cbiAgfVxuICBpZiAoaHVtYW5SZWFkYWJsZVdlZWsgIT0gbnVsbCkge1xuICAgIHNlbGYuX25vZGVzLmN1cnJlbnRXZWVrTm9ybWFsVGV4dC50ZXh0Q29udGVudCA9IGh1bWFuUmVhZGFibGVXZWVrICsgJyDigKIgJyArIHNlbGVjdGVkV2Vla051bWJlclxuICAgIHNlbGYuX25vZGVzLmN1cnJlbnRXZWVrUHJpbnRUZXh0LnRleHRDb250ZW50ID0gJ1dlZWsgJyArIHNlbGVjdGVkV2Vla051bWJlclxuICB9IGVsc2Uge1xuICAgIHNlbGYuX25vZGVzLmN1cnJlbnRXZWVrTm9ybWFsVGV4dC50ZXh0Q29udGVudCA9ICdXZWVrICcgKyBzZWxlY3RlZFdlZWtOdW1iZXJcbiAgICBzZWxmLl9ub2Rlcy5jdXJyZW50V2Vla1ByaW50VGV4dC50ZXh0Q29udGVudCA9ICdXZWVrICcgKyBzZWxlY3RlZFdlZWtOdW1iZXJcbiAgfVxufVxuXG5zZWxmLl9oYW5kbGVQcmV2QnV0dG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHNlbGYuX3dlZWtPZmZzZXQgLT0gMVxuICBzZWxmLnVwZGF0ZUN1cnJlbnRXZWVrKClcbn1cblxuc2VsZi5faGFuZGxlTmV4dEJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICBzZWxmLl93ZWVrT2Zmc2V0ICs9IDFcbiAgc2VsZi51cGRhdGVDdXJyZW50V2VlaygpXG59XG5cbnNlbGYuX25vZGVzLnByZXZCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxmLl9oYW5kbGVQcmV2QnV0dG9uQ2xpY2spXG5zZWxmLl9ub2Rlcy5uZXh0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2VsZi5faGFuZGxlTmV4dEJ1dHRvbkNsaWNrKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiJdfQ==
