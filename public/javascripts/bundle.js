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
/*
 * smoothscroll polyfill - v0.3.5
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
      elScroll: Element.prototype.scroll || scrollElement,
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

      // scroll more if we have not reached our destination
      if (currentX !== context.x || currentY !== context.y) {
        w.requestAnimationFrame(step.bind(w, context));
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

      // scroll looping over a frame
      step({
        scrollable: scrollable,
        method: method,
        startTime: startTime,
        startX: startX,
        startY: startY,
        x: x,
        y: y
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

    // Element.prototype.scroll and Element.prototype.scrollTo
    Element.prototype.scroll = Element.prototype.scrollTo = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.elScroll.call(
            this,
            arguments[0].left || arguments[0],
            arguments[0].top || arguments[1]
        );
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
          this,
          this,
          arguments[0].left,
          arguments[0].top
      );
    };

    // Element.prototype.scrollBy
    Element.prototype.scrollBy = function() {
      var arg0 = arguments[0];

      if (typeof arg0 === 'object') {
        this.scroll({
          left: arg0.left + this.scrollLeft,
          top: arg0.top + this.scrollTop,
          behavior: arg0.behavior
        });
      } else {
        this.scroll(
          this.scrollLeft + arg0,
          this.scrollTop + arguments[1]
        );
      }
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{"events":1}],6:[function(require,module,exports){
'use strict';

var self = {};

self.isIE = navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0;

if (self.isIE) {
  self.inputEvent = 'textinput';
} else {
  self.inputEvent = 'input';
}

module.exports = self;

},{}],7:[function(require,module,exports){
'use strict';

/* global USERS */

var EventEmitter = require('events');

var self = new EventEmitter();

self._nodes = {
  toggle: document.querySelector('.fav')
};

self.get = function () {
  try {
    var localStorageUser = JSON.parse(window.localStorage.getItem('fav'));
    if (localStorageUser == null) return;

    var correctedUser = USERS.filter(function (user) {
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

},{"events":1}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{"./browserFixToolkit":6}],10:[function(require,module,exports){
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

},{"./analytics":4,"./favorite":7,"./featureDetect":8,"./frontpage":9,"./schedule":11,"./scrollSnap":12,"./search":13,"./url":14,"./weekSelector":15,"./zoom":16}],11:[function(require,module,exports){
'use strict';

var EventEmitter = require('events');
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

self._getURLOfUser = function (week, user) {
  return '/get/' + user.type + '/' + user.value + '?week=' + week;
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
    var url = self._getURLOfUser(week, selectedUser);

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

},{"./search":13,"events":1}],12:[function(require,module,exports){
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

},{"./schedule":11,"smoothscroll-polyfill":3}],13:[function(require,module,exports){
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

},{"./autocomplete":5,"./browserFixToolkit":6,"events":1,"fuzzy":2}],14:[function(require,module,exports){
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

},{"events":1}],15:[function(require,module,exports){
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

},{"events":1}],16:[function(require,module,exports){
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

},{"./schedule":11}]},{},[10])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9mdXp6eS9saWIvZnV6enkuanMiLCJub2RlX21vZHVsZXMvc21vb3Roc2Nyb2xsLXBvbHlmaWxsL2Rpc3Qvc21vb3Roc2Nyb2xsLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2FuYWx5dGljcy5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9hdXRvY29tcGxldGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYnJvd3NlckZpeFRvb2xraXQuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvZmF2b3JpdGUuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvZmVhdHVyZURldGVjdC5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9mcm9udHBhZ2UuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvbWFpbi5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9zY2hlZHVsZS5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9zY3JvbGxTbmFwLmpzIiwicHVibGljL2phdmFzY3JpcHRzL3NlYXJjaC5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy91cmwuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvd2Vla1NlbGVjdG9yLmpzIiwicHVibGljL2phdmFzY3JpcHRzL3pvb20uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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WixDQUF1QixnQkFBdkIsQ0FBd0MsT0FBeEMsRUFBaUQsS0FBSyxzQkFBdEQ7QUFDQSxLQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCLGdCQUF2QixDQUF3QyxPQUF4QyxFQUFpRCxLQUFLLHNCQUF0RDs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsSUFBakI7Ozs7O0FDbEdBLElBQU0sV0FBVyxRQUFRLFlBQVIsQ0FBakI7O0FBRUEsSUFBTSxPQUFPLEVBQWI7O0FBRUEsS0FBSyxNQUFMLEdBQWM7QUFDWixRQUFNLFNBQVM7QUFESCxDQUFkOztBQUlBLEtBQUssYUFBTCxHQUFxQixZQUFZO0FBQy9CO0FBQ0EsTUFBTSxZQUFZLFNBQVMsYUFBVCxDQUF1QixnQkFBdkIsQ0FBbEI7O0FBRUE7QUFDQSxNQUFJLENBQUMsU0FBTCxFQUFnQjs7QUFFaEIsTUFBTSxhQUFhLFVBQVUscUJBQVYsR0FBa0MsS0FBckQ7QUFDQSxNQUFNLGlCQUFpQixLQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLHFCQUFqQixHQUF5QyxLQUF6QyxHQUFpRCxHQUF4RTtBQUNBLE1BQU0sYUFBYSxpQkFBaUIsVUFBcEM7O0FBRUEsTUFBSSxhQUFhLENBQWpCLEVBQW9CO0FBQ2xCLGNBQVUsS0FBVixDQUFnQixJQUFoQixRQUEwQixVQUExQjtBQUNELEdBRkQsTUFFTztBQUNMLGNBQVUsS0FBVixDQUFnQixJQUFoQjtBQUNEO0FBQ0YsQ0FoQkQ7O0FBa0JBLFNBQVMsRUFBVCxDQUFZLE1BQVosRUFBb0IsS0FBSyxhQUF6QjtBQUNBLE9BQU8sZ0JBQVAsQ0FBd0IsUUFBeEIsRUFBa0MsS0FBSyxhQUF2Qzs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsSUFBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4gKCcgKyBlciArICcpJyk7XG4gICAgICAgIGVyci5jb250ZXh0ID0gZXI7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIGlmICh0aGlzLl9ldmVudHMpIHtcbiAgICB2YXIgZXZsaXN0ZW5lciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGV2bGlzdGVuZXIpKVxuICAgICAgcmV0dXJuIDE7XG4gICAgZWxzZSBpZiAoZXZsaXN0ZW5lcilcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgfVxuICByZXR1cm4gMDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiLypcbiAqIEZ1enp5XG4gKiBodHRwczovL2dpdGh1Yi5jb20vbXlvcmsvZnV6enlcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTIgTWF0dCBZb3JrXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuXG52YXIgcm9vdCA9IHRoaXM7XG5cbnZhciBmdXp6eSA9IHt9O1xuXG4vLyBVc2UgaW4gbm9kZSBvciBpbiBicm93c2VyXG5pZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZnV6enk7XG59IGVsc2Uge1xuICByb290LmZ1enp5ID0gZnV6enk7XG59XG5cbi8vIFJldHVybiBhbGwgZWxlbWVudHMgb2YgYGFycmF5YCB0aGF0IGhhdmUgYSBmdXp6eVxuLy8gbWF0Y2ggYWdhaW5zdCBgcGF0dGVybmAuXG5mdXp6eS5zaW1wbGVGaWx0ZXIgPSBmdW5jdGlvbihwYXR0ZXJuLCBhcnJheSkge1xuICByZXR1cm4gYXJyYXkuZmlsdGVyKGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiBmdXp6eS50ZXN0KHBhdHRlcm4sIHN0cik7XG4gIH0pO1xufTtcblxuLy8gRG9lcyBgcGF0dGVybmAgZnV6enkgbWF0Y2ggYHN0cmA/XG5mdXp6eS50ZXN0ID0gZnVuY3Rpb24ocGF0dGVybiwgc3RyKSB7XG4gIHJldHVybiBmdXp6eS5tYXRjaChwYXR0ZXJuLCBzdHIpICE9PSBudWxsO1xufTtcblxuLy8gSWYgYHBhdHRlcm5gIG1hdGNoZXMgYHN0cmAsIHdyYXAgZWFjaCBtYXRjaGluZyBjaGFyYWN0ZXJcbi8vIGluIGBvcHRzLnByZWAgYW5kIGBvcHRzLnBvc3RgLiBJZiBubyBtYXRjaCwgcmV0dXJuIG51bGxcbmZ1enp5Lm1hdGNoID0gZnVuY3Rpb24ocGF0dGVybiwgc3RyLCBvcHRzKSB7XG4gIG9wdHMgPSBvcHRzIHx8IHt9O1xuICB2YXIgcGF0dGVybklkeCA9IDBcbiAgICAsIHJlc3VsdCA9IFtdXG4gICAgLCBsZW4gPSBzdHIubGVuZ3RoXG4gICAgLCB0b3RhbFNjb3JlID0gMFxuICAgICwgY3VyclNjb3JlID0gMFxuICAgIC8vIHByZWZpeFxuICAgICwgcHJlID0gb3B0cy5wcmUgfHwgJydcbiAgICAvLyBzdWZmaXhcbiAgICAsIHBvc3QgPSBvcHRzLnBvc3QgfHwgJydcbiAgICAvLyBTdHJpbmcgdG8gY29tcGFyZSBhZ2FpbnN0LiBUaGlzIG1pZ2h0IGJlIGEgbG93ZXJjYXNlIHZlcnNpb24gb2YgdGhlXG4gICAgLy8gcmF3IHN0cmluZ1xuICAgICwgY29tcGFyZVN0cmluZyA9ICBvcHRzLmNhc2VTZW5zaXRpdmUgJiYgc3RyIHx8IHN0ci50b0xvd2VyQ2FzZSgpXG4gICAgLCBjaDtcblxuICBwYXR0ZXJuID0gb3B0cy5jYXNlU2Vuc2l0aXZlICYmIHBhdHRlcm4gfHwgcGF0dGVybi50b0xvd2VyQ2FzZSgpO1xuXG4gIC8vIEZvciBlYWNoIGNoYXJhY3RlciBpbiB0aGUgc3RyaW5nLCBlaXRoZXIgYWRkIGl0IHRvIHRoZSByZXN1bHRcbiAgLy8gb3Igd3JhcCBpbiB0ZW1wbGF0ZSBpZiBpdCdzIHRoZSBuZXh0IHN0cmluZyBpbiB0aGUgcGF0dGVyblxuICBmb3IodmFyIGlkeCA9IDA7IGlkeCA8IGxlbjsgaWR4KyspIHtcbiAgICBjaCA9IHN0cltpZHhdO1xuICAgIGlmKGNvbXBhcmVTdHJpbmdbaWR4XSA9PT0gcGF0dGVybltwYXR0ZXJuSWR4XSkge1xuICAgICAgY2ggPSBwcmUgKyBjaCArIHBvc3Q7XG4gICAgICBwYXR0ZXJuSWR4ICs9IDE7XG5cbiAgICAgIC8vIGNvbnNlY3V0aXZlIGNoYXJhY3RlcnMgc2hvdWxkIGluY3JlYXNlIHRoZSBzY29yZSBtb3JlIHRoYW4gbGluZWFybHlcbiAgICAgIGN1cnJTY29yZSArPSAxICsgY3VyclNjb3JlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyU2NvcmUgPSAwO1xuICAgIH1cbiAgICB0b3RhbFNjb3JlICs9IGN1cnJTY29yZTtcbiAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aF0gPSBjaDtcbiAgfVxuXG4gIC8vIHJldHVybiByZW5kZXJlZCBzdHJpbmcgaWYgd2UgaGF2ZSBhIG1hdGNoIGZvciBldmVyeSBjaGFyXG4gIGlmKHBhdHRlcm5JZHggPT09IHBhdHRlcm4ubGVuZ3RoKSB7XG4gICAgLy8gaWYgdGhlIHN0cmluZyBpcyBhbiBleGFjdCBtYXRjaCB3aXRoIHBhdHRlcm4sIHRvdGFsU2NvcmUgc2hvdWxkIGJlIG1heGVkXG4gICAgdG90YWxTY29yZSA9IChjb21wYXJlU3RyaW5nID09PSBwYXR0ZXJuKSA/IEluZmluaXR5IDogdG90YWxTY29yZTtcbiAgICByZXR1cm4ge3JlbmRlcmVkOiByZXN1bHQuam9pbignJyksIHNjb3JlOiB0b3RhbFNjb3JlfTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufTtcblxuLy8gVGhlIG5vcm1hbCBlbnRyeSBwb2ludC4gRmlsdGVycyBgYXJyYCBmb3IgbWF0Y2hlcyBhZ2FpbnN0IGBwYXR0ZXJuYC5cbi8vIEl0IHJldHVybnMgYW4gYXJyYXkgd2l0aCBtYXRjaGluZyB2YWx1ZXMgb2YgdGhlIHR5cGU6XG4vL1xuLy8gICAgIFt7XG4vLyAgICAgICAgIHN0cmluZzogICAnPGI+bGFoJyAvLyBUaGUgcmVuZGVyZWQgc3RyaW5nXG4vLyAgICAgICAsIGluZGV4OiAgICAyICAgICAgICAvLyBUaGUgaW5kZXggb2YgdGhlIGVsZW1lbnQgaW4gYGFycmBcbi8vICAgICAgICwgb3JpZ2luYWw6ICdibGFoJyAgIC8vIFRoZSBvcmlnaW5hbCBlbGVtZW50IGluIGBhcnJgXG4vLyAgICAgfV1cbi8vXG4vLyBgb3B0c2AgaXMgYW4gb3B0aW9uYWwgYXJndW1lbnQgYmFnLiBEZXRhaWxzOlxuLy9cbi8vICAgIG9wdHMgPSB7XG4vLyAgICAgICAgLy8gc3RyaW5nIHRvIHB1dCBiZWZvcmUgYSBtYXRjaGluZyBjaGFyYWN0ZXJcbi8vICAgICAgICBwcmU6ICAgICAnPGI+J1xuLy9cbi8vICAgICAgICAvLyBzdHJpbmcgdG8gcHV0IGFmdGVyIG1hdGNoaW5nIGNoYXJhY3RlclxuLy8gICAgICAsIHBvc3Q6ICAgICc8L2I+J1xuLy9cbi8vICAgICAgICAvLyBPcHRpb25hbCBmdW5jdGlvbi4gSW5wdXQgaXMgYW4gZW50cnkgaW4gdGhlIGdpdmVuIGFycmAsXG4vLyAgICAgICAgLy8gb3V0cHV0IHNob3VsZCBiZSB0aGUgc3RyaW5nIHRvIHRlc3QgYHBhdHRlcm5gIGFnYWluc3QuXG4vLyAgICAgICAgLy8gSW4gdGhpcyBleGFtcGxlLCBpZiBgYXJyID0gW3tjcnlpbmc6ICdrb2FsYSd9XWAgd2Ugd291bGQgcmV0dXJuXG4vLyAgICAgICAgLy8gJ2tvYWxhJy5cbi8vICAgICAgLCBleHRyYWN0OiBmdW5jdGlvbihhcmcpIHsgcmV0dXJuIGFyZy5jcnlpbmc7IH1cbi8vICAgIH1cbmZ1enp5LmZpbHRlciA9IGZ1bmN0aW9uKHBhdHRlcm4sIGFyciwgb3B0cykge1xuICBpZighYXJyIHx8IGFyci5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgaWYgKHR5cGVvZiBwYXR0ZXJuICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBhcnI7XG4gIH1cbiAgb3B0cyA9IG9wdHMgfHwge307XG4gIHJldHVybiBhcnJcbiAgICAucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGVsZW1lbnQsIGlkeCwgYXJyKSB7XG4gICAgICB2YXIgc3RyID0gZWxlbWVudDtcbiAgICAgIGlmKG9wdHMuZXh0cmFjdCkge1xuICAgICAgICBzdHIgPSBvcHRzLmV4dHJhY3QoZWxlbWVudCk7XG4gICAgICB9XG4gICAgICB2YXIgcmVuZGVyZWQgPSBmdXp6eS5tYXRjaChwYXR0ZXJuLCBzdHIsIG9wdHMpO1xuICAgICAgaWYocmVuZGVyZWQgIT0gbnVsbCkge1xuICAgICAgICBwcmV2W3ByZXYubGVuZ3RoXSA9IHtcbiAgICAgICAgICAgIHN0cmluZzogcmVuZGVyZWQucmVuZGVyZWRcbiAgICAgICAgICAsIHNjb3JlOiByZW5kZXJlZC5zY29yZVxuICAgICAgICAgICwgaW5kZXg6IGlkeFxuICAgICAgICAgICwgb3JpZ2luYWw6IGVsZW1lbnRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcmV2O1xuICAgIH0sIFtdKVxuXG4gICAgLy8gU29ydCBieSBzY29yZS4gQnJvd3NlcnMgYXJlIGluY29uc2lzdGVudCB3cnQgc3RhYmxlL3Vuc3RhYmxlXG4gICAgLy8gc29ydGluZywgc28gZm9yY2Ugc3RhYmxlIGJ5IHVzaW5nIHRoZSBpbmRleCBpbiB0aGUgY2FzZSBvZiB0aWUuXG4gICAgLy8gU2VlIGh0dHA6Ly9vZmIubmV0L35zZXRobWwvaXMtc29ydC1zdGFibGUuaHRtbFxuICAgIC5zb3J0KGZ1bmN0aW9uKGEsYikge1xuICAgICAgdmFyIGNvbXBhcmUgPSBiLnNjb3JlIC0gYS5zY29yZTtcbiAgICAgIGlmKGNvbXBhcmUpIHJldHVybiBjb21wYXJlO1xuICAgICAgcmV0dXJuIGEuaW5kZXggLSBiLmluZGV4O1xuICAgIH0pO1xufTtcblxuXG59KCkpO1xuXG4iLCIvKlxuICogc21vb3Roc2Nyb2xsIHBvbHlmaWxsIC0gdjAuMy41XG4gKiBodHRwczovL2lhbWR1c3Rhbi5naXRodWIuaW8vc21vb3Roc2Nyb2xsXG4gKiAyMDE2IChjKSBEdXN0YW4gS2FzdGVuLCBKZXJlbWlhcyBNZW5pY2hlbGxpIC0gTUlUIExpY2Vuc2VcbiAqL1xuXG4oZnVuY3Rpb24odywgZCwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKlxuICAgKiBhbGlhc2VzXG4gICAqIHc6IHdpbmRvdyBnbG9iYWwgb2JqZWN0XG4gICAqIGQ6IGRvY3VtZW50XG4gICAqIHVuZGVmaW5lZDogdW5kZWZpbmVkXG4gICAqL1xuXG4gIC8vIHBvbHlmaWxsXG4gIGZ1bmN0aW9uIHBvbHlmaWxsKCkge1xuICAgIC8vIHJldHVybiB3aGVuIHNjcm9sbEJlaGF2aW9yIGludGVyZmFjZSBpcyBzdXBwb3J0ZWRcbiAgICBpZiAoJ3Njcm9sbEJlaGF2aW9yJyBpbiBkLmRvY3VtZW50RWxlbWVudC5zdHlsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogZ2xvYmFsc1xuICAgICAqL1xuICAgIHZhciBFbGVtZW50ID0gdy5IVE1MRWxlbWVudCB8fCB3LkVsZW1lbnQ7XG4gICAgdmFyIFNDUk9MTF9USU1FID0gNDY4O1xuXG4gICAgLypcbiAgICAgKiBvYmplY3QgZ2F0aGVyaW5nIG9yaWdpbmFsIHNjcm9sbCBtZXRob2RzXG4gICAgICovXG4gICAgdmFyIG9yaWdpbmFsID0ge1xuICAgICAgc2Nyb2xsOiB3LnNjcm9sbCB8fCB3LnNjcm9sbFRvLFxuICAgICAgc2Nyb2xsQnk6IHcuc2Nyb2xsQnksXG4gICAgICBlbFNjcm9sbDogRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsIHx8IHNjcm9sbEVsZW1lbnQsXG4gICAgICBzY3JvbGxJbnRvVmlldzogRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXdcbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBkZWZpbmUgdGltaW5nIG1ldGhvZFxuICAgICAqL1xuICAgIHZhciBub3cgPSB3LnBlcmZvcm1hbmNlICYmIHcucGVyZm9ybWFuY2Uubm93XG4gICAgICA/IHcucGVyZm9ybWFuY2Uubm93LmJpbmQody5wZXJmb3JtYW5jZSkgOiBEYXRlLm5vdztcblxuICAgIC8qKlxuICAgICAqIGNoYW5nZXMgc2Nyb2xsIHBvc2l0aW9uIGluc2lkZSBhbiBlbGVtZW50XG4gICAgICogQG1ldGhvZCBzY3JvbGxFbGVtZW50XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNjcm9sbEVsZW1lbnQoeCwgeSkge1xuICAgICAgdGhpcy5zY3JvbGxMZWZ0ID0geDtcbiAgICAgIHRoaXMuc2Nyb2xsVG9wID0geTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIHJlc3VsdCBvZiBhcHBseWluZyBlYXNlIG1hdGggZnVuY3Rpb24gdG8gYSBudW1iZXJcbiAgICAgKiBAbWV0aG9kIGVhc2VcbiAgICAgKiBAcGFyYW0ge051bWJlcn0ga1xuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZnVuY3Rpb24gZWFzZShrKSB7XG4gICAgICByZXR1cm4gMC41ICogKDEgLSBNYXRoLmNvcyhNYXRoLlBJICogaykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGluZGljYXRlcyBpZiBhIHNtb290aCBiZWhhdmlvciBzaG91bGQgYmUgYXBwbGllZFxuICAgICAqIEBtZXRob2Qgc2hvdWxkQmFpbE91dFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfE9iamVjdH0geFxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNob3VsZEJhaWxPdXQoeCkge1xuICAgICAgaWYgKHR5cGVvZiB4ICE9PSAnb2JqZWN0J1xuICAgICAgICAgICAgfHwgeCA9PT0gbnVsbFxuICAgICAgICAgICAgfHwgeC5iZWhhdmlvciA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICB8fCB4LmJlaGF2aW9yID09PSAnYXV0bydcbiAgICAgICAgICAgIHx8IHguYmVoYXZpb3IgPT09ICdpbnN0YW50Jykge1xuICAgICAgICAvLyBmaXJzdCBhcmcgbm90IGFuIG9iamVjdC9udWxsXG4gICAgICAgIC8vIG9yIGJlaGF2aW9yIGlzIGF1dG8sIGluc3RhbnQgb3IgdW5kZWZpbmVkXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHggPT09ICdvYmplY3QnXG4gICAgICAgICAgICAmJiB4LmJlaGF2aW9yID09PSAnc21vb3RoJykge1xuICAgICAgICAvLyBmaXJzdCBhcmd1bWVudCBpcyBhbiBvYmplY3QgYW5kIGJlaGF2aW9yIGlzIHNtb290aFxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIHRocm93IGVycm9yIHdoZW4gYmVoYXZpb3IgaXMgbm90IHN1cHBvcnRlZFxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYmVoYXZpb3Igbm90IHZhbGlkJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogZmluZHMgc2Nyb2xsYWJsZSBwYXJlbnQgb2YgYW4gZWxlbWVudFxuICAgICAqIEBtZXRob2QgZmluZFNjcm9sbGFibGVQYXJlbnRcbiAgICAgKiBAcGFyYW0ge05vZGV9IGVsXG4gICAgICogQHJldHVybnMge05vZGV9IGVsXG4gICAgICovXG4gICAgZnVuY3Rpb24gZmluZFNjcm9sbGFibGVQYXJlbnQoZWwpIHtcbiAgICAgIHZhciBpc0JvZHk7XG4gICAgICB2YXIgaGFzU2Nyb2xsYWJsZVNwYWNlO1xuICAgICAgdmFyIGhhc1Zpc2libGVPdmVyZmxvdztcblxuICAgICAgZG8ge1xuICAgICAgICBlbCA9IGVsLnBhcmVudE5vZGU7XG5cbiAgICAgICAgLy8gc2V0IGNvbmRpdGlvbiB2YXJpYWJsZXNcbiAgICAgICAgaXNCb2R5ID0gZWwgPT09IGQuYm9keTtcbiAgICAgICAgaGFzU2Nyb2xsYWJsZVNwYWNlID1cbiAgICAgICAgICBlbC5jbGllbnRIZWlnaHQgPCBlbC5zY3JvbGxIZWlnaHQgfHxcbiAgICAgICAgICBlbC5jbGllbnRXaWR0aCA8IGVsLnNjcm9sbFdpZHRoO1xuICAgICAgICBoYXNWaXNpYmxlT3ZlcmZsb3cgPVxuICAgICAgICAgIHcuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbCkub3ZlcmZsb3cgPT09ICd2aXNpYmxlJztcbiAgICAgIH0gd2hpbGUgKCFpc0JvZHkgJiYgIShoYXNTY3JvbGxhYmxlU3BhY2UgJiYgIWhhc1Zpc2libGVPdmVyZmxvdykpO1xuXG4gICAgICBpc0JvZHkgPSBoYXNTY3JvbGxhYmxlU3BhY2UgPSBoYXNWaXNpYmxlT3ZlcmZsb3cgPSBudWxsO1xuXG4gICAgICByZXR1cm4gZWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc2VsZiBpbnZva2VkIGZ1bmN0aW9uIHRoYXQsIGdpdmVuIGEgY29udGV4dCwgc3RlcHMgdGhyb3VnaCBzY3JvbGxpbmdcbiAgICAgKiBAbWV0aG9kIHN0ZXBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHN0ZXAoY29udGV4dCkge1xuICAgICAgdmFyIHRpbWUgPSBub3coKTtcbiAgICAgIHZhciB2YWx1ZTtcbiAgICAgIHZhciBjdXJyZW50WDtcbiAgICAgIHZhciBjdXJyZW50WTtcbiAgICAgIHZhciBlbGFwc2VkID0gKHRpbWUgLSBjb250ZXh0LnN0YXJ0VGltZSkgLyBTQ1JPTExfVElNRTtcblxuICAgICAgLy8gYXZvaWQgZWxhcHNlZCB0aW1lcyBoaWdoZXIgdGhhbiBvbmVcbiAgICAgIGVsYXBzZWQgPSBlbGFwc2VkID4gMSA/IDEgOiBlbGFwc2VkO1xuXG4gICAgICAvLyBhcHBseSBlYXNpbmcgdG8gZWxhcHNlZCB0aW1lXG4gICAgICB2YWx1ZSA9IGVhc2UoZWxhcHNlZCk7XG5cbiAgICAgIGN1cnJlbnRYID0gY29udGV4dC5zdGFydFggKyAoY29udGV4dC54IC0gY29udGV4dC5zdGFydFgpICogdmFsdWU7XG4gICAgICBjdXJyZW50WSA9IGNvbnRleHQuc3RhcnRZICsgKGNvbnRleHQueSAtIGNvbnRleHQuc3RhcnRZKSAqIHZhbHVlO1xuXG4gICAgICBjb250ZXh0Lm1ldGhvZC5jYWxsKGNvbnRleHQuc2Nyb2xsYWJsZSwgY3VycmVudFgsIGN1cnJlbnRZKTtcblxuICAgICAgLy8gc2Nyb2xsIG1vcmUgaWYgd2UgaGF2ZSBub3QgcmVhY2hlZCBvdXIgZGVzdGluYXRpb25cbiAgICAgIGlmIChjdXJyZW50WCAhPT0gY29udGV4dC54IHx8IGN1cnJlbnRZICE9PSBjb250ZXh0LnkpIHtcbiAgICAgICAgdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc3RlcC5iaW5kKHcsIGNvbnRleHQpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzY3JvbGxzIHdpbmRvdyB3aXRoIGEgc21vb3RoIGJlaGF2aW9yXG4gICAgICogQG1ldGhvZCBzbW9vdGhTY3JvbGxcbiAgICAgKiBAcGFyYW0ge09iamVjdHxOb2RlfSBlbFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzbW9vdGhTY3JvbGwoZWwsIHgsIHkpIHtcbiAgICAgIHZhciBzY3JvbGxhYmxlO1xuICAgICAgdmFyIHN0YXJ0WDtcbiAgICAgIHZhciBzdGFydFk7XG4gICAgICB2YXIgbWV0aG9kO1xuICAgICAgdmFyIHN0YXJ0VGltZSA9IG5vdygpO1xuXG4gICAgICAvLyBkZWZpbmUgc2Nyb2xsIGNvbnRleHRcbiAgICAgIGlmIChlbCA9PT0gZC5ib2R5KSB7XG4gICAgICAgIHNjcm9sbGFibGUgPSB3O1xuICAgICAgICBzdGFydFggPSB3LnNjcm9sbFggfHwgdy5wYWdlWE9mZnNldDtcbiAgICAgICAgc3RhcnRZID0gdy5zY3JvbGxZIHx8IHcucGFnZVlPZmZzZXQ7XG4gICAgICAgIG1ldGhvZCA9IG9yaWdpbmFsLnNjcm9sbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjcm9sbGFibGUgPSBlbDtcbiAgICAgICAgc3RhcnRYID0gZWwuc2Nyb2xsTGVmdDtcbiAgICAgICAgc3RhcnRZID0gZWwuc2Nyb2xsVG9wO1xuICAgICAgICBtZXRob2QgPSBzY3JvbGxFbGVtZW50O1xuICAgICAgfVxuXG4gICAgICAvLyBzY3JvbGwgbG9vcGluZyBvdmVyIGEgZnJhbWVcbiAgICAgIHN0ZXAoe1xuICAgICAgICBzY3JvbGxhYmxlOiBzY3JvbGxhYmxlLFxuICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgc3RhcnRUaW1lOiBzdGFydFRpbWUsXG4gICAgICAgIHN0YXJ0WDogc3RhcnRYLFxuICAgICAgICBzdGFydFk6IHN0YXJ0WSxcbiAgICAgICAgeDogeCxcbiAgICAgICAgeTogeVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBPUklHSU5BTCBNRVRIT0RTIE9WRVJSSURFU1xuICAgICAqL1xuXG4gICAgLy8gdy5zY3JvbGwgYW5kIHcuc2Nyb2xsVG9cbiAgICB3LnNjcm9sbCA9IHcuc2Nyb2xsVG8gPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGF2b2lkIHNtb290aCBiZWhhdmlvciBpZiBub3QgcmVxdWlyZWRcbiAgICAgIGlmIChzaG91bGRCYWlsT3V0KGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgb3JpZ2luYWwuc2Nyb2xsLmNhbGwoXG4gICAgICAgICAgdyxcbiAgICAgICAgICBhcmd1bWVudHNbMF0ubGVmdCB8fCBhcmd1bWVudHNbMF0sXG4gICAgICAgICAgYXJndW1lbnRzWzBdLnRvcCB8fCBhcmd1bWVudHNbMV1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBMRVQgVEhFIFNNT09USE5FU1MgQkVHSU4hXG4gICAgICBzbW9vdGhTY3JvbGwuY2FsbChcbiAgICAgICAgdyxcbiAgICAgICAgZC5ib2R5LFxuICAgICAgICB+fmFyZ3VtZW50c1swXS5sZWZ0LFxuICAgICAgICB+fmFyZ3VtZW50c1swXS50b3BcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8vIHcuc2Nyb2xsQnlcbiAgICB3LnNjcm9sbEJ5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCBzbW9vdGggYmVoYXZpb3IgaWYgbm90IHJlcXVpcmVkXG4gICAgICBpZiAoc2hvdWxkQmFpbE91dChhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIG9yaWdpbmFsLnNjcm9sbEJ5LmNhbGwoXG4gICAgICAgICAgdyxcbiAgICAgICAgICBhcmd1bWVudHNbMF0ubGVmdCB8fCBhcmd1bWVudHNbMF0sXG4gICAgICAgICAgYXJndW1lbnRzWzBdLnRvcCB8fCBhcmd1bWVudHNbMV1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBMRVQgVEhFIFNNT09USE5FU1MgQkVHSU4hXG4gICAgICBzbW9vdGhTY3JvbGwuY2FsbChcbiAgICAgICAgdyxcbiAgICAgICAgZC5ib2R5LFxuICAgICAgICB+fmFyZ3VtZW50c1swXS5sZWZ0ICsgKHcuc2Nyb2xsWCB8fCB3LnBhZ2VYT2Zmc2V0KSxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0udG9wICsgKHcuc2Nyb2xsWSB8fCB3LnBhZ2VZT2Zmc2V0KVxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgLy8gRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsIGFuZCBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxUb1xuICAgIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbCA9IEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbFRvID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCBzbW9vdGggYmVoYXZpb3IgaWYgbm90IHJlcXVpcmVkXG4gICAgICBpZiAoc2hvdWxkQmFpbE91dChhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIG9yaWdpbmFsLmVsU2Nyb2xsLmNhbGwoXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgYXJndW1lbnRzWzBdLmxlZnQgfHwgYXJndW1lbnRzWzBdLFxuICAgICAgICAgICAgYXJndW1lbnRzWzBdLnRvcCB8fCBhcmd1bWVudHNbMV1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBMRVQgVEhFIFNNT09USE5FU1MgQkVHSU4hXG4gICAgICBzbW9vdGhTY3JvbGwuY2FsbChcbiAgICAgICAgICB0aGlzLFxuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgYXJndW1lbnRzWzBdLmxlZnQsXG4gICAgICAgICAgYXJndW1lbnRzWzBdLnRvcFxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgLy8gRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsQnlcbiAgICBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxCeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZzAgPSBhcmd1bWVudHNbMF07XG5cbiAgICAgIGlmICh0eXBlb2YgYXJnMCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhpcy5zY3JvbGwoe1xuICAgICAgICAgIGxlZnQ6IGFyZzAubGVmdCArIHRoaXMuc2Nyb2xsTGVmdCxcbiAgICAgICAgICB0b3A6IGFyZzAudG9wICsgdGhpcy5zY3JvbGxUb3AsXG4gICAgICAgICAgYmVoYXZpb3I6IGFyZzAuYmVoYXZpb3JcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNjcm9sbChcbiAgICAgICAgICB0aGlzLnNjcm9sbExlZnQgKyBhcmcwLFxuICAgICAgICAgIHRoaXMuc2Nyb2xsVG9wICsgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3XG4gICAgRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXcgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGF2b2lkIHNtb290aCBiZWhhdmlvciBpZiBub3QgcmVxdWlyZWRcbiAgICAgIGlmIChzaG91bGRCYWlsT3V0KGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgb3JpZ2luYWwuc2Nyb2xsSW50b1ZpZXcuY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0gfHwgdHJ1ZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgdmFyIHNjcm9sbGFibGVQYXJlbnQgPSBmaW5kU2Nyb2xsYWJsZVBhcmVudCh0aGlzKTtcbiAgICAgIHZhciBwYXJlbnRSZWN0cyA9IHNjcm9sbGFibGVQYXJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB2YXIgY2xpZW50UmVjdHMgPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICBpZiAoc2Nyb2xsYWJsZVBhcmVudCAhPT0gZC5ib2R5KSB7XG4gICAgICAgIC8vIHJldmVhbCBlbGVtZW50IGluc2lkZSBwYXJlbnRcbiAgICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgICAgdGhpcyxcbiAgICAgICAgICBzY3JvbGxhYmxlUGFyZW50LFxuICAgICAgICAgIHNjcm9sbGFibGVQYXJlbnQuc2Nyb2xsTGVmdCArIGNsaWVudFJlY3RzLmxlZnQgLSBwYXJlbnRSZWN0cy5sZWZ0LFxuICAgICAgICAgIHNjcm9sbGFibGVQYXJlbnQuc2Nyb2xsVG9wICsgY2xpZW50UmVjdHMudG9wIC0gcGFyZW50UmVjdHMudG9wXG4gICAgICAgICk7XG4gICAgICAgIC8vIHJldmVhbCBwYXJlbnQgaW4gdmlld3BvcnRcbiAgICAgICAgdy5zY3JvbGxCeSh7XG4gICAgICAgICAgbGVmdDogcGFyZW50UmVjdHMubGVmdCxcbiAgICAgICAgICB0b3A6IHBhcmVudFJlY3RzLnRvcCxcbiAgICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCdcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZXZlYWwgZWxlbWVudCBpbiB2aWV3cG9ydFxuICAgICAgICB3LnNjcm9sbEJ5KHtcbiAgICAgICAgICBsZWZ0OiBjbGllbnRSZWN0cy5sZWZ0LFxuICAgICAgICAgIHRvcDogY2xpZW50UmVjdHMudG9wLFxuICAgICAgICAgIGJlaGF2aW9yOiAnc21vb3RoJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIGNvbW1vbmpzXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7IHBvbHlmaWxsOiBwb2x5ZmlsbCB9O1xuICB9IGVsc2Uge1xuICAgIC8vIGdsb2JhbFxuICAgIHBvbHlmaWxsKCk7XG4gIH1cbn0pKHdpbmRvdywgZG9jdW1lbnQpO1xuIiwiLyogZ2xvYmFsIGdhICovXG5cbmNvbnN0IHNlbGYgPSB7fVxuXG5zZWxmLnNlbmQgPSB7fVxuXG5zZWxmLnNlbmQuc2VhcmNoID0gZnVuY3Rpb24gKHNlbGVjdGVkVXNlciwgZmF2b3JpdGUpIHtcbiAgY29uc3QgaGl0VHlwZSA9ICdldmVudCdcblxuICBjb25zdCBldmVudENhdGVnb3J5ID0gZmF2b3JpdGUgPyAnc2VhcmNoIGZhdicgOiAnc2VhcmNoJ1xuXG4gIGxldCBldmVudEFjdGlvblxuICBzd2l0Y2ggKHNlbGVjdGVkVXNlci50eXBlKSB7XG4gICAgY2FzZSAnYyc6XG4gICAgICBldmVudEFjdGlvbiA9ICdDbGFzcydcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndCc6XG4gICAgICBldmVudEFjdGlvbiA9ICdUZWFjaGVyJ1xuICAgICAgYnJlYWtcbiAgICBjYXNlICdyJzpcbiAgICAgIGV2ZW50QWN0aW9uID0gJ1Jvb20nXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3MnOlxuICAgICAgZXZlbnRBY3Rpb24gPSAnU3R1ZGVudCdcbiAgICAgIGJyZWFrXG4gIH1cblxuICBjb25zdCBldmVudExhYmVsID0gc2VsZWN0ZWRVc2VyLnZhbHVlXG5cbiAgZ2EoZnVuY3Rpb24gKCkge1xuICAgIGdhKCdzZW5kJywgeyBoaXRUeXBlLCBldmVudENhdGVnb3J5LCBldmVudEFjdGlvbiwgZXZlbnRMYWJlbCB9KVxuICB9KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsImNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5cbmNvbnN0IHNlbGYgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fdXNlcnMgPSBbXVxuc2VsZi5fc2VsZWN0ZWRVc2VySW5kZXggPSAtMVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgc2VhcmNoOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2VhcmNoJyksXG4gIGlucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJyksXG4gIGF1dG9jb21wbGV0ZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZScpXG59XG5cbnNlbGYuZ2V0U2VsZWN0ZWRVc2VyID0gZnVuY3Rpb24gKCkge1xuICBpZiAoc2VsZi5nZXRJdGVtcygpID09PSBbXSkgcmV0dXJuXG5cbiAgaWYgKHNlbGYuZ2V0U2VsZWN0ZWRVc2VySW5kZXgoKSA9PT0gLTEpIHtcbiAgICByZXR1cm4gc2VsZi5nZXRJdGVtcygpWzBdXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHNlbGYuZ2V0SXRlbXMoKVtzZWxmLmdldFNlbGVjdGVkVXNlckluZGV4KCldXG4gIH1cbn1cblxuc2VsZi5nZXRTZWxlY3RlZFVzZXJJbmRleCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHNlbGYuX3NlbGVjdGVkVXNlckluZGV4XG59XG5cbnNlbGYuZ2V0SXRlbXMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBzZWxmLl91c2Vyc1xufVxuXG5zZWxmLnJlbW92ZUFsbEl0ZW1zID0gZnVuY3Rpb24gKCkge1xuICB3aGlsZSAoc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmZpcnN0Q2hpbGQpIHtcbiAgICBzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUucmVtb3ZlQ2hpbGQoc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmZpcnN0Q2hpbGQpXG4gIH1cbiAgc2VsZi5fdXNlcnMgPSBbXVxuICBzZWxmLl9zZWxlY3RlZFVzZXJJbmRleCA9IC0xXG59XG5cbnNlbGYuYWRkSXRlbSA9IGZ1bmN0aW9uICh1c2VyKSB7XG4gIGNvbnN0IGxpc3RJdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKVxuICBsaXN0SXRlbS50ZXh0Q29udGVudCA9IHVzZXIudmFsdWVcbiAgc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmFwcGVuZENoaWxkKGxpc3RJdGVtKVxuICBzZWxmLl91c2Vycy5wdXNoKHVzZXIpXG59XG5cbnNlbGYuX21vdmVTZWxlY3RlZCA9IGZ1bmN0aW9uIChzaGlmdCkge1xuICBpZiAoc2VsZi5fc2VsZWN0ZWRVc2VySW5kZXggKyBzaGlmdCA+PSBzZWxmLmdldEl0ZW1zKCkubGVuZ3RoKSB7XG4gICAgc2VsZi5fc2VsZWN0ZWRVc2VySW5kZXggPSAtMVxuICB9IGVsc2UgaWYgKHNlbGYuX3NlbGVjdGVkVXNlckluZGV4ICsgc2hpZnQgPCAtMSkge1xuICAgIHNlbGYuX3NlbGVjdGVkVXNlckluZGV4ID0gc2VsZi5nZXRJdGVtcygpLmxlbmd0aCAtIDFcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9zZWxlY3RlZFVzZXJJbmRleCArPSBzaGlmdFxuICB9XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxmLmdldEl0ZW1zKCkubGVuZ3RoOyBpKyspIHtcbiAgICBzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuY2hpbGRyZW5baV0uY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKVxuICB9XG4gIGlmIChzZWxmLl9zZWxlY3RlZFVzZXJJbmRleCA+PSAwKSB7XG4gICAgc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlXG4gICAgICAgIC5jaGlsZHJlbltzZWxmLl9zZWxlY3RlZFVzZXJJbmRleF0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKVxuICB9XG59XG5cbnNlbGYuX2hhbmRsZUl0ZW1DbGljayA9IGZ1bmN0aW9uIChldmVudCkge1xuICBpZiAoIXNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5jb250YWlucyhldmVudC50YXJnZXQpKSByZXR1cm5cbiAgY29uc3QgdXNlckluZGV4ID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2ZcbiAgICAgIC5jYWxsKHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5jaGlsZHJlbiwgZXZlbnQudGFyZ2V0KVxuICBzZWxmLl9zZWxlY3RlZFVzZXJJbmRleCA9IHVzZXJJbmRleFxuICBzZWxmLmVtaXQoJ3NlbGVjdCcsIHNlbGYuZ2V0U2VsZWN0ZWRVc2VyKCkpXG59XG5cbnNlbGYuX2hhbmRsZUtleWRvd24gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgaWYgKGV2ZW50LmtleSA9PT0gJ0Fycm93RG93bicgfHwgZXZlbnQua2V5ID09PSAnQXJyb3dVcCcpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaWYgKGV2ZW50LmtleSA9PT0gJ0Fycm93RG93bicpIHtcbiAgICAgIHNlbGYuX21vdmVTZWxlY3RlZCgxKVxuICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09PSAnQXJyb3dVcCcpIHtcbiAgICAgIHNlbGYuX21vdmVTZWxlY3RlZCgtMSlcbiAgICB9XG4gIH1cbn1cblxuc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2VsZi5faGFuZGxlSXRlbUNsaWNrKVxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHNlbGYuX2hhbmRsZUtleWRvd24pXG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwiY29uc3Qgc2VsZiA9IHt9XG5cbnNlbGYuaXNJRSA9IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignTVNJRScpICE9PSAtMSB8fFxuICAgICAgICAgICAgbmF2aWdhdG9yLmFwcFZlcnNpb24uaW5kZXhPZignVHJpZGVudC8nKSA+IDBcblxuaWYgKHNlbGYuaXNJRSkge1xuICBzZWxmLmlucHV0RXZlbnQgPSAndGV4dGlucHV0J1xufSBlbHNlIHtcbiAgc2VsZi5pbnB1dEV2ZW50ID0gJ2lucHV0J1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsIi8qIGdsb2JhbCBVU0VSUyAqL1xuXG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuXG5jb25zdCBzZWxmID0gbmV3IEV2ZW50RW1pdHRlcigpXG5cbnNlbGYuX25vZGVzID0ge1xuICB0b2dnbGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mYXYnKVxufVxuXG5zZWxmLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBsb2NhbFN0b3JhZ2VVc2VyID0gSlNPTi5wYXJzZSh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2ZhdicpKVxuICAgIGlmIChsb2NhbFN0b3JhZ2VVc2VyID09IG51bGwpIHJldHVyblxuXG4gICAgY29uc3QgY29ycmVjdGVkVXNlciA9IFVTRVJTLmZpbHRlcihmdW5jdGlvbiAodXNlcikge1xuICAgICAgcmV0dXJuIHVzZXIudHlwZSA9PT0gbG9jYWxTdG9yYWdlVXNlci50eXBlICYmXG4gICAgICAgICAgICAgdXNlci52YWx1ZSA9PT0gbG9jYWxTdG9yYWdlVXNlci52YWx1ZVxuICAgIH0pWzBdXG4gICAgcmV0dXJuIGNvcnJlY3RlZFVzZXJcbiAgfSBjYXRjaCAoZSkge1xuICAgIHNlbGYuZGVsZXRlKClcbiAgICByZXR1cm5cbiAgfVxufVxuXG5zZWxmLnNldCA9IGZ1bmN0aW9uICh1c2VyKSB7XG4gIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZmF2JywgSlNPTi5zdHJpbmdpZnkodXNlcikpXG4gIHNlbGYuX25vZGVzLmlubmVySFRNTCA9ICcmI3hFODM4Oydcbn1cblxuc2VsZi5kZWxldGUgPSBmdW5jdGlvbiAoKSB7XG4gIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnZmF2Jylcbn1cblxuc2VsZi51cGRhdGVEb20gPSBmdW5jdGlvbiAoaXNGYXZvcml0ZSkge1xuICBpZiAoaXNGYXZvcml0ZSkge1xuICAgIHNlbGYuX25vZGVzLnRvZ2dsZS5pbm5lckhUTUwgPSAnJiN4RTgzODsnXG4gIH0gZWxzZSB7XG4gICAgc2VsZi5fbm9kZXMudG9nZ2xlLmlubmVySFRNTCA9ICcmI3hFODNBJ1xuICB9XG59XG5cbnNlbGYudXBkYXRlID0gZnVuY3Rpb24gKHNlbGVjdGVkVXNlcikge1xuICBjb25zdCBjdXJyZW50VXNlciA9IHNlbGYuZ2V0KClcblxuICBpZiAoY3VycmVudFVzZXIgPT0gbnVsbCB8fCBzZWxlY3RlZFVzZXIgPT0gbnVsbCkge1xuICAgIHNlbGYudXBkYXRlRG9tKGZhbHNlKVxuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3QgaXNFcXVhbCA9IGN1cnJlbnRVc2VyLnR5cGUgPT09IHNlbGVjdGVkVXNlci50eXBlICYmXG4gICAgICAgICAgICAgICAgICBjdXJyZW50VXNlci5pbmRleCA9PT0gc2VsZWN0ZWRVc2VyLmluZGV4XG5cbiAgc2VsZi51cGRhdGVEb20oaXNFcXVhbClcbn1cblxuc2VsZi50b2dnbGUgPSBmdW5jdGlvbiAoc2VsZWN0ZWRVc2VyKSB7XG4gIGNvbnN0IGN1cnJlbnRVc2VyID0gc2VsZi5nZXQoKVxuICBjb25zdCBpc0VxdWFsID0gY3VycmVudFVzZXIgIT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgY3VycmVudFVzZXIudHlwZSA9PT0gc2VsZWN0ZWRVc2VyLnR5cGUgJiZcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRVc2VyLmluZGV4ID09PSBzZWxlY3RlZFVzZXIuaW5kZXhcblxuICBpZiAoaXNFcXVhbCkge1xuICAgIHNlbGYuZGVsZXRlKClcbiAgICBzZWxmLnVwZGF0ZURvbShmYWxzZSlcbiAgfSBlbHNlIHtcbiAgICBzZWxmLnNldChzZWxlY3RlZFVzZXIpXG4gICAgc2VsZi51cGRhdGVEb20odHJ1ZSlcbiAgfVxufVxuXG5zZWxmLl9oYW5kbGVDbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgc2VsZi5lbWl0KCdjbGljaycpXG59XG5cbnNlbGYuX25vZGVzLnRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlbGYuX2hhbmRsZUNsaWNrKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsIi8qIGdsb2JhbCBGTEFHUyAqL1xuXG5jb25zdCBzZWxmID0ge31cblxuc2VsZi5fbm9kZXMgPSB7XG4gIGlucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJyksXG4gIG92ZXJmbG93QnV0dG9uOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjb3ZlcmZsb3ctYnV0dG9uJylcbn1cblxuc2VsZi5fc2hvdWxkQ2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBGTEFHUy5pbmRleE9mKCdOT19GRUFUVVJFX0RFVEVDVCcpID09PSAtMVxufVxuXG5zZWxmLl9yZWRpcmVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnaHR0cDovL3d3dy5tZWV0aW5ncG9pbnRtY28ubmwvUm9vc3RlcnMtQUwvZG9jLydcbn1cblxuc2VsZi5jaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCFzZWxmLl9zaG91bGRDaGVjaygpKSByZXR1cm5cblxuICB3aW5kb3cub25lcnJvciA9IHNlbGYuX3JlZGlyZWN0XG5cbiAgaWYgKHNlbGYuX25vZGVzLmlucHV0LmdldENsaWVudFJlY3RzKClbMF0udG9wICE9PVxuICAgICAgc2VsZi5fbm9kZXMub3ZlcmZsb3dCdXR0b24uZ2V0Q2xpZW50UmVjdHMoKVswXS50b3ApIHtcbiAgICBzZWxmLl9yZWRpcmVjdCgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJjb25zdCBicm93c2VyRml4VG9vbGtpdCA9IHJlcXVpcmUoJy4vYnJvd3NlckZpeFRvb2xraXQnKVxuXG5jb25zdCBzZWxmID0ge31cblxuc2VsZi5fbm9kZXMgPSB7XG4gIGlucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJylcbn1cblxuc2VsZi5pc1Nob3duID0gZmFsc2Vcblxuc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ25vLWlucHV0JylcbiAgc2VsZi5pc1Nob3duID0gdHJ1ZVxufVxuXG5zZWxmLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbm8taW5wdXQnKVxuICBzZWxmLmlzU2hvd24gPSBmYWxzZVxufVxuXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKGJyb3dzZXJGaXhUb29sa2l0LmlucHV0RXZlbnQsIHNlbGYuaGlkZSlcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJyZXF1aXJlKCcuL2ZlYXR1cmVEZXRlY3QnKS5jaGVjaygpXG5yZXF1aXJlKCcuL3pvb20nKVxuXG5jb25zdCBmcm9udHBhZ2UgPSByZXF1aXJlKCcuL2Zyb250cGFnZScpXG5jb25zdCBzZWFyY2ggPSByZXF1aXJlKCcuL3NlYXJjaCcpXG5jb25zdCBzY2hlZHVsZSA9IHJlcXVpcmUoJy4vc2NoZWR1bGUnKVxuY29uc3Qgd2Vla1NlbGVjdG9yID0gcmVxdWlyZSgnLi93ZWVrU2VsZWN0b3InKVxuY29uc3QgZmF2b3JpdGUgPSByZXF1aXJlKCcuL2Zhdm9yaXRlJylcbmNvbnN0IHNjcm9sbFNuYXAgPSByZXF1aXJlKCcuL3Njcm9sbFNuYXAnKVxuY29uc3QgYW5hbHl0aWNzID0gcmVxdWlyZSgnLi9hbmFseXRpY3MnKVxuY29uc3QgdXJsID0gcmVxdWlyZSgnLi91cmwnKVxuXG5jb25zdCBzdGF0ZSA9IHt9XG5cbndpbmRvdy5zdGF0ZSA9IHN0YXRlXG53aW5kb3cucmVxdWlyZSA9IHJlcXVpcmVcblxuZnJvbnRwYWdlLnNob3coKVxud2Vla1NlbGVjdG9yLnVwZGF0ZUN1cnJlbnRXZWVrKClcbnNjcm9sbFNuYXAuc3RhcnRMaXN0ZW5pbmcoKVxuXG5pZiAodXJsLmhhc1NlbGVjdGVkVXNlcigpKSB7XG4gIHN0YXRlLnNlbGVjdGVkVXNlciA9IHVybC5nZXRTZWxlY3RlZFVzZXIoKVxuXG4gIGZhdm9yaXRlLnVwZGF0ZShzdGF0ZS5zZWxlY3RlZFVzZXIpXG4gIHVybC51cGRhdGUoc3RhdGUuc2VsZWN0ZWRVc2VyKVxuICBhbmFseXRpY3Muc2VuZC5zZWFyY2goc3RhdGUuc2VsZWN0ZWRVc2VyKVxuXG4gIHNjaGVkdWxlLnZpZXdJdGVtKHdlZWtTZWxlY3Rvci5nZXRTZWxlY3RlZFdlZWsoKSwgc3RhdGUuc2VsZWN0ZWRVc2VyKVxufSBlbHNlIGlmIChmYXZvcml0ZS5nZXQoKSAhPSBudWxsKSB7XG4gIHN0YXRlLnNlbGVjdGVkVXNlciA9IGZhdm9yaXRlLmdldCgpXG5cbiAgZmF2b3JpdGUudXBkYXRlKHN0YXRlLnNlbGVjdGVkVXNlcilcbiAgdXJsLnB1c2goc3RhdGUuc2VsZWN0ZWRVc2VyLCBmYWxzZSlcbiAgdXJsLnVwZGF0ZShzdGF0ZS5zZWxlY3RlZFVzZXIpXG4gIGFuYWx5dGljcy5zZW5kLnNlYXJjaChzdGF0ZS5zZWxlY3RlZFVzZXIsIHRydWUpXG5cbiAgc2NoZWR1bGUudmlld0l0ZW0od2Vla1NlbGVjdG9yLmdldFNlbGVjdGVkV2VlaygpLCBzdGF0ZS5zZWxlY3RlZFVzZXIpXG59IGVsc2Uge1xuICBzZWFyY2guZm9jdXMoKVxufVxuXG5zZWFyY2gub24oJ3NlYXJjaCcsIGZ1bmN0aW9uIChzZWxlY3RlZFVzZXIpIHtcbiAgc3RhdGUuc2VsZWN0ZWRVc2VyID0gc2VsZWN0ZWRVc2VyXG5cbiAgZmF2b3JpdGUudXBkYXRlKHN0YXRlLnNlbGVjdGVkVXNlcilcbiAgdXJsLnB1c2goc3RhdGUuc2VsZWN0ZWRVc2VyKVxuICB1cmwudXBkYXRlKHN0YXRlLnNlbGVjdGVkVXNlcilcbiAgYW5hbHl0aWNzLnNlbmQuc2VhcmNoKHN0YXRlLnNlbGVjdGVkVXNlcilcblxuICBzY2hlZHVsZS52aWV3SXRlbSh3ZWVrU2VsZWN0b3IuZ2V0U2VsZWN0ZWRXZWVrKCksIHN0YXRlLnNlbGVjdGVkVXNlcilcbn0pXG5cbnVybC5vbigndXBkYXRlJywgZnVuY3Rpb24gKHNlbGVjdGVkVXNlcikge1xuICBzdGF0ZS5zZWxlY3RlZFVzZXIgPSBzZWxlY3RlZFVzZXJcblxuICBmYXZvcml0ZS51cGRhdGUoc3RhdGUuc2VsZWN0ZWRVc2VyKVxuICB1cmwudXBkYXRlKHN0YXRlLnNlbGVjdGVkVXNlcilcblxuICBzY2hlZHVsZS52aWV3SXRlbSh3ZWVrU2VsZWN0b3IuZ2V0U2VsZWN0ZWRXZWVrKCksIHN0YXRlLnNlbGVjdGVkVXNlcilcbn0pXG5cbndlZWtTZWxlY3Rvci5vbignd2Vla0NoYW5nZWQnLCBmdW5jdGlvbiAobmV3V2Vlaykge1xuICBhbmFseXRpY3Muc2VuZC5zZWFyY2goc3RhdGUuc2VsZWN0ZWRVc2VyKVxuICBzY2hlZHVsZS52aWV3SXRlbShuZXdXZWVrLCBzdGF0ZS5zZWxlY3RlZFVzZXIpXG59KVxuXG5mYXZvcml0ZS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gIGZhdm9yaXRlLnRvZ2dsZShzdGF0ZS5zZWxlY3RlZFVzZXIpXG59KVxuXG5kb2N1bWVudC5ib2R5LnN0eWxlLm9wYWNpdHkgPSAxXG4iLCJjb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuY29uc3Qgc2VhcmNoID0gcmVxdWlyZSgnLi9zZWFyY2gnKVxuXG5jb25zdCBzZWxmID0gbmV3IEV2ZW50RW1pdHRlcigpXG5cbnNlbGYuX25vZGVzID0ge1xuICBzY2hlZHVsZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NjaGVkdWxlJylcbn1cblxuc2VsZi5fcGFyc2VNZWV0aW5ncG9pbnRIVE1MID0gZnVuY3Rpb24gKGh0bWxTdHIpIHtcbiAgY29uc3QgaHRtbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2h0bWwnKVxuICBodG1sLmlubmVySFRNTCA9IGh0bWxTdHJcbiAgY29uc3QgY2VudGVyTm9kZSA9IGh0bWwucXVlcnlTZWxlY3RvcignY2VudGVyJylcbiAgcmV0dXJuIGNlbnRlck5vZGVcbn1cblxuc2VsZi5faGFuZGxlTG9hZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICBjb25zdCByZXF1ZXN0ID0gZXZlbnQudGFyZ2V0XG4gIGlmIChyZXF1ZXN0LnN0YXR1cyA8IDIwMCB8fCByZXF1ZXN0LnN0YXR1cyA+PSA0MDApIHtcbiAgICBzZWxmLl9oYW5kbGVFcnJvcihldmVudClcbiAgICByZXR1cm5cbiAgfVxuICBjb25zdCBkb2N1bWVudCA9IHNlbGYuX3BhcnNlTWVldGluZ3BvaW50SFRNTChyZXF1ZXN0LnJlc3BvbnNlKVxuICBzZWxmLl9yZW1vdmVDaGlsZHMoKVxuICBzZWxmLl9ub2Rlcy5zY2hlZHVsZS5hcHBlbmRDaGlsZChkb2N1bWVudClcbiAgc2VsZi5fbm9kZXMuc2NoZWR1bGUuY2xhc3NMaXN0LnJlbW92ZSgnZXJyb3InKVxuICBzZWxmLmVtaXQoJ2xvYWQnKVxufVxuXG5zZWxmLl9oYW5kbGVFcnJvciA9IGZ1bmN0aW9uIChldmVudCkge1xuICBjb25zdCByZXF1ZXN0ID0gZXZlbnQudGFyZ2V0XG4gIGxldCBlcnJvclxuICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDQwNCkge1xuICAgIGVycm9yID0gJ1NvcnJ5LCBlciBpcyAobm9nKSBnZWVuIHJvb3N0ZXIgdm9vciBkZXplIHdlZWsuJ1xuICB9IGVsc2Uge1xuICAgIGVycm9yID0gJ1NvcnJ5LCBlciBpcyBpZXRzIG1pcyBnZWdhYW4gdGlqZGVucyBoZXQgbGFkZW4gdmFuIGRlemUgd2Vlay4nXG4gIH1cbiAgc2VsZi5fcmVtb3ZlQ2hpbGRzKClcbiAgc2VsZi5fbm9kZXMuc2NoZWR1bGUudGV4dENvbnRlbnQgPSBlcnJvclxuICBzZWxmLl9ub2Rlcy5zY2hlZHVsZS5jbGFzc0xpc3QuYWRkKCdlcnJvcicpXG4gIHNlbGYuZW1pdCgnbG9hZCcpXG59XG5cbnNlbGYuX2dldFVSTE9mVXNlciA9IGZ1bmN0aW9uICh3ZWVrLCB1c2VyKSB7XG4gIHJldHVybiBgL2dldC8ke3VzZXIudHlwZX0vJHt1c2VyLnZhbHVlfT93ZWVrPSR7d2Vla31gXG59XG5cbnNlbGYuX3JlbW92ZUNoaWxkcyA9IGZ1bmN0aW9uICgpIHtcbiAgd2hpbGUgKHNlbGYuX25vZGVzLnNjaGVkdWxlLmZpcnN0Q2hpbGQpIHtcbiAgICBzZWxmLl9ub2Rlcy5zY2hlZHVsZS5yZW1vdmVDaGlsZChzZWxmLl9ub2Rlcy5zY2hlZHVsZS5maXJzdENoaWxkKVxuICB9XG59XG5cbnNlbGYudmlld0l0ZW0gPSBmdW5jdGlvbiAod2Vlaywgc2VsZWN0ZWRVc2VyKSB7XG4gIGlmIChzZWxlY3RlZFVzZXIgPT0gbnVsbCkge1xuICAgIHNlbGYuX3JlbW92ZUNoaWxkcygpXG4gICAgc2VhcmNoLnVwZGF0ZURvbShzZWxlY3RlZFVzZXIpXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgdXJsID0gc2VsZi5fZ2V0VVJMT2ZVc2VyKHdlZWssIHNlbGVjdGVkVXNlcilcblxuICAgIHNlbGYuX3JlbW92ZUNoaWxkcygpXG5cbiAgICBjb25zdCByZXF1ZXN0ID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpXG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgc2VsZi5faGFuZGxlTG9hZClcbiAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgc2VsZi5faGFuZGxlRXJyb3IpXG4gICAgcmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpXG4gICAgcmVxdWVzdC5zZW5kKClcblxuICAgIHNlYXJjaC51cGRhdGVEb20oc2VsZWN0ZWRVc2VyKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwicmVxdWlyZSgnc21vb3Roc2Nyb2xsLXBvbHlmaWxsJykucG9seWZpbGwoKVxuXG5jb25zdCBzZWxmID0ge31cbmNvbnN0IHNjaGVkdWxlID0gcmVxdWlyZSgnLi9zY2hlZHVsZScpXG5cbnNlbGYuX25vZGVzID0ge1xuICBzZWFyY2g6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzZWFyY2gnKSxcbiAgd2Vla1NlbGVjdG9yOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd2Vlay1zZWxlY3RvcicpXG59XG5cbnNlbGYuX3RpbWVvdXRJRCA9IG51bGxcblxuc2VsZi5fZ2V0U2Nyb2xsUG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3ApIHx8XG4gICAgICAgICBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxufVxuXG5zZWxmLl9oYW5kbGVEb25lU2Nyb2xsaW5nID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBzY3JvbGxQb3NpdGlvbiA9IHNlbGYuX2dldFNjcm9sbFBvc2l0aW9uKClcbiAgY29uc3Qgd2Vla1NlbGVjdG9ySGVpZ2h0ID1cbiAgICAgIHNlbGYuX25vZGVzLndlZWtTZWxlY3Rvci5jbGllbnRIZWlnaHQgLSBzZWxmLl9ub2Rlcy5zZWFyY2guY2xpZW50SGVpZ2h0XG4gIGlmIChzY3JvbGxQb3NpdGlvbiA8IHdlZWtTZWxlY3RvckhlaWdodCAmJiBzY3JvbGxQb3NpdGlvbiA+IDApIHtcbiAgICB3aW5kb3cuc2Nyb2xsKHsgdG9wOiB3ZWVrU2VsZWN0b3JIZWlnaHQsIGxlZnQ6IDAsIGJlaGF2aW9yOiAnc21vb3RoJyB9KVxuICB9XG59XG5cbnNlbGYuX2hhbmRsZVNjcm9sbCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHNlbGYuX3RpbWVvdXRJRCAhPSBudWxsKSB3aW5kb3cuY2xlYXJUaW1lb3V0KHNlbGYuX3RpbWVvdXRJRClcbiAgc2VsZi5fdGltZW91dElEID0gd2luZG93LnNldFRpbWVvdXQoc2VsZi5faGFuZGxlRG9uZVNjcm9sbGluZywgNTAwKVxuXG4gIGNvbnN0IHNjcm9sbFBvc2l0aW9uID0gc2VsZi5fZ2V0U2Nyb2xsUG9zaXRpb24oKVxuICBjb25zdCB3ZWVrU2VsZWN0b3JIZWlnaHQgPVxuICAgICAgc2VsZi5fbm9kZXMud2Vla1NlbGVjdG9yLmNsaWVudEhlaWdodCAtIHNlbGYuX25vZGVzLnNlYXJjaC5jbGllbnRIZWlnaHRcbiAgaWYgKHNjcm9sbFBvc2l0aW9uID49IHdlZWtTZWxlY3RvckhlaWdodCkge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnd2Vlay1zZWxlY3Rvci1ub3QtdmlzaWJsZScpXG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCd3ZWVrLXNlbGVjdG9yLW5vdC12aXNpYmxlJylcbiAgfVxufVxuXG5zZWxmLl9oYW5kbGVXaW5kb3dSZXNpemUgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHdlZWtTZWxlY3RvckhlaWdodCA9XG4gICAgICBzZWxmLl9ub2Rlcy53ZWVrU2VsZWN0b3IuY2xpZW50SGVpZ2h0IC0gc2VsZi5fbm9kZXMuc2VhcmNoLmNsaWVudEhlaWdodFxuICBjb25zdCBleHRyYVBpeGVsc05lZWRlZCA9XG4gICAgICB3ZWVrU2VsZWN0b3JIZWlnaHQgLSAoZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQgLSB3aW5kb3cuaW5uZXJIZWlnaHQpXG4gIGlmIChleHRyYVBpeGVsc05lZWRlZCA+IDApIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm1hcmdpbkJvdHRvbSA9IGV4dHJhUGl4ZWxzTmVlZGVkICsgJ3B4J1xuICB9IGVsc2Uge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUubWFyZ2luQm90dG9tID0gbnVsbFxuICB9XG59XG5cbnNlbGYuc3RhcnRMaXN0ZW5pbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzZWxmLl9oYW5kbGVTY3JvbGwpXG59XG5cbnNjaGVkdWxlLm9uKCdsb2FkJywgc2VsZi5faGFuZGxlV2luZG93UmVzaXplKVxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNlbGYuX2hhbmRsZVdpbmRvd1Jlc2l6ZSlcbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwiLyogZ2xvYmFsIFVTRVJTICovXG5cbmNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5jb25zdCBmdXp6eSA9IHJlcXVpcmUoJ2Z1enp5JylcbmNvbnN0IGF1dG9jb21wbGV0ZSA9IHJlcXVpcmUoJy4vYXV0b2NvbXBsZXRlJylcbmNvbnN0IGJyb3dzZXJGaXhUb29sa2l0ID0gcmVxdWlyZSgnLi9icm93c2VyRml4VG9vbGtpdCcpXG5cbmNvbnN0IHNlbGYgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fbm9kZXMgPSB7XG4gIHNlYXJjaDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NlYXJjaCcpLFxuICBpbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpXG59XG5cbnNlbGYuc3VibWl0ID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBzZWxlY3RlZFVzZXIgPSBhdXRvY29tcGxldGUuZ2V0U2VsZWN0ZWRVc2VyKClcbiAgaWYgKHNlbGVjdGVkVXNlciA9PSBudWxsKSByZXR1cm5cblxuICBjb25zb2xlLmxvZyhzZWxlY3RlZFVzZXIpXG5cbiAgc2VsZi5fbm9kZXMuaW5wdXQuYmx1cigpXG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnd2Vlay1zZWxlY3Rvci1ub3QtdmlzaWJsZScpIC8vIFNhZmFyaSBidWdcblxuICBzZWxmLmVtaXQoJ3NlYXJjaCcsIHNlbGVjdGVkVXNlcilcbn1cblxuc2VsZi51cGRhdGVEb20gPSBmdW5jdGlvbiAoc2VsZWN0ZWRVc2VyKSB7XG4gIGlmIChzZWxlY3RlZFVzZXIgPT0gbnVsbCkge1xuICAgIHNlbGYuX25vZGVzLmlucHV0LnZhbHVlID0gJydcbiAgICBhdXRvY29tcGxldGUucmVtb3ZlQWxsSXRlbXMoKVxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnbm8taW5wdXQnKVxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnc2VhcmNoZWQnKVxuICB9IGVsc2Uge1xuICAgIHNlbGYuX25vZGVzLmlucHV0LnZhbHVlID0gc2VsZWN0ZWRVc2VyLnZhbHVlXG4gICAgYXV0b2NvbXBsZXRlLnJlbW92ZUFsbEl0ZW1zKClcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ25vLWlucHV0JylcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3NlYXJjaGVkJylcbiAgfVxufVxuXG5zZWxmLmZvY3VzID0gZnVuY3Rpb24gKCkge1xuICBzZWxmLl9ub2Rlcy5pbnB1dC5mb2N1cygpXG59XG5cbnNlbGYuX2hhbmRsZVN1Ym1pdCA9IGZ1bmN0aW9uIChldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIHNlbGYuc3VibWl0KClcbn1cblxuc2VsZi5fY2FsY3VsYXRlID0gZnVuY3Rpb24gKHNlYXJjaFRlcm0pIHtcbiAgY29uc3QgYWxsUmVzdWx0cyA9IGZ1enp5LmZpbHRlcihzZWFyY2hUZXJtLCBVU0VSUywge1xuICAgIGV4dHJhY3Q6IGZ1bmN0aW9uICh1c2VyKSB7IHJldHVybiB1c2VyLnZhbHVlIH1cbiAgfSlcbiAgY29uc3QgZmlyc3RSZXN1bHRzID0gYWxsUmVzdWx0cy5zbGljZSgwLCA3KVxuXG4gIGNvbnN0IG9yaWdpbmFsUmVzdWx0cyA9IGZpcnN0UmVzdWx0cy5tYXAoZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgIHJldHVybiByZXN1bHQub3JpZ2luYWxcbiAgfSlcblxuICByZXR1cm4gb3JpZ2luYWxSZXN1bHRzXG59XG5cbnNlbGYuX2hhbmRsZVRleHRVcGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHJlc3VsdHMgPSBzZWxmLl9jYWxjdWxhdGUoc2VsZi5fbm9kZXMuaW5wdXQudmFsdWUpXG5cbiAgYXV0b2NvbXBsZXRlLnJlbW92ZUFsbEl0ZW1zKClcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgYXV0b2NvbXBsZXRlLmFkZEl0ZW0ocmVzdWx0c1tpXSlcbiAgfVxufVxuXG5zZWxmLl9oYW5kbGVGb2N1cyA9IGZ1bmN0aW9uICgpIHtcbiAgc2VsZi5fbm9kZXMuaW5wdXQuc2VsZWN0KClcbn1cblxuc2VsZi5faGFuZGxlQmx1ciA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gdGhpcyB3aWxsIHJlbW92ZWQgdGhlIHNlbGVjdGlvbiB3aXRob3V0IGRyYXdpbmcgZm9jdXMgb24gaXQgKHNhZmFyaSlcbiAgLy8gdGhpcyB3aWxsIHJlbW92ZWQgc2VsZWN0aW9uIGV2ZW4gd2hlbiBmb2N1c2luZyBhbiBpZnJhbWUgKGNocm9tZSlcbiAgY29uc3Qgb2xkVmFsdWUgPSBzZWxmLl9ub2Rlcy52YWx1ZVxuICBzZWxmLl9ub2Rlcy52YWx1ZSA9ICcnXG4gIHNlbGYuX25vZGVzLnZhbHVlID0gb2xkVmFsdWVcblxuICAvLyB0aGlzIHdpbGwgaGlkZSB0aGUga2V5Ym9hcmQgKGlPUyBzYWZhcmkpXG4gIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpXG59XG5cbmF1dG9jb21wbGV0ZS5vbignc2VsZWN0Jywgc2VsZi5zdWJtaXQpXG5cbnNlbGYuX25vZGVzLnNlYXJjaC5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBzZWxmLl9oYW5kbGVTdWJtaXQpXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHNlbGYuX2hhbmRsZUZvY3VzKVxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHNlbGYuX2hhbmRsZUJsdXIpXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKGJyb3dzZXJGaXhUb29sa2l0LmlucHV0RXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2hhbmRsZVRleHRVcGRhdGUpXG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwiLyogZ2xvYmFsIFVTRVJTIEZMQUdTICovXG5cbmNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5cbmNvbnN0IHNlbGYgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fZ2V0UGFnZVRpdGxlID0gZnVuY3Rpb24gKHNlbGVjdGVkVXNlcikge1xuICBsZXQgcmV0XG5cbiAgaWYgKHNlbGVjdGVkVXNlciA9PSBudWxsKSB7XG4gICAgcmV0ID0gYE1ldGlzIFJvb3N0ZXJgXG4gIH0gZWxzZSB7XG4gICAgcmV0ID0gYE1ldGlzIFJvb3N0ZXIgLSAke3NlbGVjdGVkVXNlci52YWx1ZX1gXG4gIH1cblxuICBpZiAoRkxBR1MuaW5kZXhPZignQkVUQScpICE9PSAtMSkge1xuICAgIHJldCA9IGBCRVRBICR7cmV0fWBcbiAgfVxuXG4gIHJldHVybiByZXRcbn1cblxuc2VsZi5fZ2V0UGFnZVVSTCA9IGZ1bmN0aW9uIChzZWxlY3RlZFVzZXIpIHtcbiAgcmV0dXJuIGAvJHtzZWxlY3RlZFVzZXIudHlwZX0vJHtzZWxlY3RlZFVzZXIudmFsdWV9YFxufVxuXG5zZWxmLnB1c2ggPSBmdW5jdGlvbiAoc2VsZWN0ZWRVc2VyLCBwdXNoKSB7XG4gIGlmIChwdXNoID09IG51bGwpIHB1c2ggPSB0cnVlXG4gIGNvbnN0IHBhZ2VUaXRsZSA9IHNlbGYuX2dldFBhZ2VUaXRsZShzZWxlY3RlZFVzZXIpXG4gIGNvbnN0IHBhZ2VVUkwgPSBzZWxmLl9nZXRQYWdlVVJMKHNlbGVjdGVkVXNlcilcbiAgaWYgKHB1c2gpIHtcbiAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoc2VsZWN0ZWRVc2VyLCBwYWdlVGl0bGUsIHBhZ2VVUkwpXG4gIH0gZWxzZSB7XG4gICAgd2luZG93Lmhpc3RvcnkucmVwbGFjZVN0YXRlKHNlbGVjdGVkVXNlciwgcGFnZVRpdGxlLCBwYWdlVVJMKVxuICB9XG59XG5cbnNlbGYudXBkYXRlID0gZnVuY3Rpb24gKHNlbGVjdGVkVXNlcikge1xuICBkb2N1bWVudC50aXRsZSA9IHNlbGYuX2dldFBhZ2VUaXRsZShzZWxlY3RlZFVzZXIpXG59XG5cbnNlbGYuaGFzU2VsZWN0ZWRVc2VyID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBwYWdlVXJsID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lXG4gIHJldHVybiAvXlxcL3NcXC98XlxcL3RcXC98XlxcL3JcXC98XlxcL2NcXC8vLnRlc3QocGFnZVVybClcbn1cblxuc2VsZi5nZXRTZWxlY3RlZFVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHBhZ2VVcmwgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWVcbiAgY29uc3QgcGFnZVVybERhdGEgPSBwYWdlVXJsLnNwbGl0KCcvJylcbiAgY29uc3QgdHlwZSA9IHBhZ2VVcmxEYXRhWzFdXG4gIGNvbnN0IHZhbHVlID0gcGFnZVVybERhdGFbMl1cblxuICBjb25zdCB1c2VyID0gVVNFUlMuZmlsdGVyKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgcmV0dXJuIHVzZXIudHlwZSA9PT0gdHlwZSAmJlxuICAgICAgICAgICB1c2VyLnZhbHVlID09PSB2YWx1ZVxuICB9KVswXVxuXG4gIHJldHVybiB1c2VyXG59XG5cbnNlbGYuX2hhbmRsZVVwZGF0ZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICBzZWxmLmVtaXQoJ3VwZGF0ZScsIGV2ZW50LnN0YXRlKVxufVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBzZWxmLl9oYW5kbGVVcGRhdGUpXG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwiY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJylcblxuY29uc3Qgc2VsZiA9IG5ldyBFdmVudEVtaXR0ZXIoKVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgcHJldkJ1dHRvbjogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3dlZWstc2VsZWN0b3IgYnV0dG9uJylbMF0sXG4gIG5leHRCdXR0b246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN3ZWVrLXNlbGVjdG9yIGJ1dHRvbicpWzFdLFxuICBjdXJyZW50V2Vla05vZGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3ZWVrLXNlbGVjdG9yIC5jdXJyZW50JyksXG4gIGN1cnJlbnRXZWVrTm9ybWFsVGV4dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3dlZWstc2VsZWN0b3IgLmN1cnJlbnQgLm5vLXByaW50JyksXG4gIGN1cnJlbnRXZWVrUHJpbnRUZXh0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd2Vlay1zZWxlY3RvciAuY3VycmVudCAucHJpbnQnKVxufVxuXG5zZWxmLl93ZWVrT2Zmc2V0ID0gMFxuXG4vLyBjb3BpZWQgZnJvbSBodHRwOi8vd3d3Lm1lZXRpbmdwb2ludG1jby5ubC9Sb29zdGVycy1BTC9kb2MvZGFncm9vc3RlcnMvdW50aXNzY3JpcHRzLmpzLFxuLy8gd2VyZSB1c2luZyB0aGUgc2FtZSBjb2RlIGFzIHRoZXkgZG8gdG8gYmUgc3VyZSB0aGF0IHdlIGFsd2F5cyBnZXQgdGhlIHNhbWVcbi8vIHdlZWsgbnVtYmVyLlxuc2VsZi5nZXRDdXJyZW50V2VlayA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgY29uc3QgZGF5TnIgPSAodGFyZ2V0LmdldERheSgpICsgNikgJSA3XG4gIHRhcmdldC5zZXREYXRlKHRhcmdldC5nZXREYXRlKCkgLSBkYXlOciArIDMpXG4gIGNvbnN0IGZpcnN0VGh1cnNkYXkgPSB0YXJnZXQudmFsdWVPZigpXG4gIHRhcmdldC5zZXRNb250aCgwLCAxKVxuICBpZiAodGFyZ2V0LmdldERheSgpICE9PSA0KSB7XG4gICAgdGFyZ2V0LnNldE1vbnRoKDAsIDEgKyAoKDQgLSB0YXJnZXQuZ2V0RGF5KCkpICsgNykgJSA3KVxuICB9XG5cbiAgcmV0dXJuIDEgKyBNYXRoLmNlaWwoKGZpcnN0VGh1cnNkYXkgLSB0YXJnZXQpIC8gNjA0ODAwMDAwKVxufVxuXG5zZWxmLmdldFNlbGVjdGVkV2VlayA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgbm93ID0gbmV3IERhdGUoKVxuICBjb25zdCB0YXJnZXREYXRlID0gbmV3IERhdGUobm93LmdldFRpbWUoKSArXG4gICAgICBzZWxmLl93ZWVrT2Zmc2V0ICogNjA0ODAwICogMTAwMCArIDg2NDAwICogMTAwMClcbiAgcmV0dXJuIHNlbGYuZ2V0Q3VycmVudFdlZWsodGFyZ2V0RGF0ZSlcbn1cblxuc2VsZi51cGRhdGVDdXJyZW50V2VlayA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgc2VsZWN0ZWRXZWVrTnVtYmVyID0gc2VsZi5nZXRTZWxlY3RlZFdlZWsoKVxuICBpZiAoc2VsZi5nZXRDdXJyZW50V2VlayhuZXcgRGF0ZSgpKSAhPT0gc2VsZWN0ZWRXZWVrTnVtYmVyKSB7XG4gICAgc2VsZi5fbm9kZXMuY3VycmVudFdlZWtOb2RlLmNsYXNzTGlzdC5hZGQoJ2NoYW5nZWQnKVxuICB9IGVsc2Uge1xuICAgIHNlbGYuX25vZGVzLmN1cnJlbnRXZWVrTm9kZS5jbGFzc0xpc3QucmVtb3ZlKCdjaGFuZ2VkJylcbiAgfVxuICBzZWxmLnVwZGF0ZURvbSgpXG4gIHNlbGYuZW1pdCgnd2Vla0NoYW5nZWQnLCBzZWxlY3RlZFdlZWtOdW1iZXIpXG59XG5cbnNlbGYudXBkYXRlRG9tID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBzZWxlY3RlZFdlZWtOdW1iZXIgPSBzZWxmLmdldFNlbGVjdGVkV2VlaygpXG4gIGNvbnN0IGlzU3VuZGF5ID0gbmV3IERhdGUoKS5nZXREYXkoKSA9PT0gMFxuICBsZXQgaHVtYW5SZWFkYWJsZVdlZWsgPSBudWxsXG4gIGlmIChpc1N1bmRheSkge1xuICAgIHN3aXRjaCAoc2VsZi5fd2Vla09mZnNldCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICBodW1hblJlYWRhYmxlV2VlayA9ICdBYW5zdGFhbmRlIHdlZWsnXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGh1bWFuUmVhZGFibGVXZWVrID0gJ1ZvbGdlbmRlIHdlZWsnXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIC0xOlxuICAgICAgICBodW1hblJlYWRhYmxlV2VlayA9ICdBZmdlbG9wZW4gd2VlaydcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgc3dpdGNoIChzZWxmLl93ZWVrT2Zmc2V0KSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIGh1bWFuUmVhZGFibGVXZWVrID0gJ0h1aWRpZ2Ugd2VlaydcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaHVtYW5SZWFkYWJsZVdlZWsgPSAnVm9sZ2VuZGUgd2VlaydcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgLTE6XG4gICAgICAgIGh1bWFuUmVhZGFibGVXZWVrID0gJ1ZvcmlnZSB3ZWVrJ1xuICAgICAgICBicmVha1xuICAgIH1cbiAgfVxuICBpZiAoaHVtYW5SZWFkYWJsZVdlZWsgIT0gbnVsbCkge1xuICAgIHNlbGYuX25vZGVzLmN1cnJlbnRXZWVrTm9ybWFsVGV4dC50ZXh0Q29udGVudCA9IGh1bWFuUmVhZGFibGVXZWVrICsgJyDigKIgJyArIHNlbGVjdGVkV2Vla051bWJlclxuICAgIHNlbGYuX25vZGVzLmN1cnJlbnRXZWVrUHJpbnRUZXh0LnRleHRDb250ZW50ID0gJ1dlZWsgJyArIHNlbGVjdGVkV2Vla051bWJlclxuICB9IGVsc2Uge1xuICAgIHNlbGYuX25vZGVzLmN1cnJlbnRXZWVrTm9ybWFsVGV4dC50ZXh0Q29udGVudCA9ICdXZWVrICcgKyBzZWxlY3RlZFdlZWtOdW1iZXJcbiAgICBzZWxmLl9ub2Rlcy5jdXJyZW50V2Vla1ByaW50VGV4dC50ZXh0Q29udGVudCA9ICdXZWVrICcgKyBzZWxlY3RlZFdlZWtOdW1iZXJcbiAgfVxufVxuXG5zZWxmLl9oYW5kbGVQcmV2QnV0dG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHNlbGYuX3dlZWtPZmZzZXQgLT0gMVxuICBzZWxmLnVwZGF0ZUN1cnJlbnRXZWVrKClcbn1cblxuc2VsZi5faGFuZGxlTmV4dEJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICBzZWxmLl93ZWVrT2Zmc2V0ICs9IDFcbiAgc2VsZi51cGRhdGVDdXJyZW50V2VlaygpXG59XG5cbnNlbGYuX25vZGVzLnByZXZCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxmLl9oYW5kbGVQcmV2QnV0dG9uQ2xpY2spXG5zZWxmLl9ub2Rlcy5uZXh0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2VsZi5faGFuZGxlTmV4dEJ1dHRvbkNsaWNrKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsImNvbnN0IHNjaGVkdWxlID0gcmVxdWlyZSgnLi9zY2hlZHVsZScpXG5cbmNvbnN0IHNlbGYgPSB7fVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgYm9keTogZG9jdW1lbnQuYm9keVxufVxuXG5zZWxmLl9oYW5kbGVSZXNpemUgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIHRoZSB0YWJsZSBub2RlIG1heSBub3QgZXhpc3QgYmVmb3JlIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkXG4gIGNvbnN0IHRhYmxlTm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NlbnRlciA+IHRhYmxlJylcblxuICAvLyBpbmZhY3QsIGl0IG1heSBub3QgZXZlbiBleGlzdCB3aGVuIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkLlxuICBpZiAoIXRhYmxlTm9kZSkgcmV0dXJuXG5cbiAgY29uc3QgdGFibGVXaWR0aCA9IHRhYmxlTm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxuICBjb25zdCB0YWJsZUdvYWxXaWR0aCA9IHNlbGYuX25vZGVzLmJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGggKiAwLjlcbiAgY29uc3Qgem9vbUZhY3RvciA9IHRhYmxlR29hbFdpZHRoIC8gdGFibGVXaWR0aFxuXG4gIGlmICh6b29tRmFjdG9yIDwgMSkge1xuICAgIHRhYmxlTm9kZS5zdHlsZS56b29tID0gYCR7em9vbUZhY3Rvcn1gXG4gIH0gZWxzZSB7XG4gICAgdGFibGVOb2RlLnN0eWxlLnpvb20gPSBgMWBcbiAgfVxufVxuXG5zY2hlZHVsZS5vbignbG9hZCcsIHNlbGYuX2hhbmRsZVJlc2l6ZSlcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzZWxmLl9oYW5kbGVSZXNpemUpXG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIl19
