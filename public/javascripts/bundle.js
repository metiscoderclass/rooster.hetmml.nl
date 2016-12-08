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
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
/* global USERS */

const fuzzy = require('fuzzy');
const EventEmitter = require('events');
const process = require('process');
const self = {};

self._items = [];
self._selectedItemIndex = -1;

self.events = new EventEmitter();

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

self.show = function () {
  self._nodes.autocomplete.style.display = 'block';
};

self.hide = function () {
  self._nodes.autocomplete.style.display = 'none';
};

self._removeAllItems = function () {
  while (self._nodes.autocomplete.firstChild) {
    self._nodes.autocomplete.removeChild(self._nodes.autocomplete.firstChild);
  }
  self._items = [];
  self._selectedItemIndex = -1;
};

self._addItem = function (item) {
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

self._calculate = function (searchTerm) {
  const allResults = fuzzy.filter(searchTerm, USERS, {
    extract: item => item.value
  });
  const firstResults = allResults.slice(0, 7);

  const originalResults = firstResults.map(result => result.original);

  return originalResults;
};

self._handleItemClick = function (event) {
  if (!self._nodes.autocomplete.contains(event.target)) return;
  const itemIndex = Array.prototype.indexOf.call(self._nodes.autocomplete.children, event.target);
  self._selectedItemIndex = itemIndex;
  self.events.emit('select', self.getSelectedItem());
};

self._handleTextUpdate = function () {
  const results = self._calculate(self._nodes.input.value);

  self._removeAllItems();
  for (let i = 0; i < results.length; i++) {
    self._addItem(results[i]);
  }
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
self._nodes.input.addEventListener('input', self._handleTextUpdate);
self._nodes.input.addEventListener('keydown', self._handleKeydown);

module.exports = self;

},{"events":1,"fuzzy":2,"process":4}],6:[function(require,module,exports){
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

self._nodes.input.addEventListener('input', self.hide);

module.exports = self;

},{}],7:[function(require,module,exports){
var leftPad = require('left-pad');
var getWeek = require('./getWeek');

function getURLOfUsers(weekOffset, type, id) {
  return `//${ window.location.host }/meetingpointProxy/Roosters-AL%2Fdoc%2Fdagroosters%2F` + `${ getWeek() + weekOffset }%2F${ type }%2F${ type }${ leftPad(id, 5, '0') }.htm`;
}

module.exports = getURLOfUsers;

},{"./getWeek":8,"left-pad":3}],8:[function(require,module,exports){
// copied from http://www.meetingpointmco.nl/Roosters-AL/doc/dagroosters/untisscripts.js,
// were using the same code as they do to be sure that we always get the same
// week number.
function getWeek() {
  // Create a copy of this date object
  const target = new Date();

  // ISO week date weeks start on monday
  // so correct the day number
  const dayNr = (target.getDay() + 6) % 7;

  // ISO 8601 states that week 1 is the week
  // with the first thursday of that year.
  // Set the target date to the thursday in the target week
  target.setDate(target.getDate() - dayNr + 3);

  // Store the millisecond value of the target date
  const firstThursday = target.valueOf();

  // Set the target to the first thursday of the year
  // First set the target to january first
  target.setMonth(0, 1);
  // Not a thursday? Correct the date to the next thursday
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + (4 - target.getDay() + 7) % 7);
  }

  // The weeknumber is the number of weeks between the
  // first thursday of the year and the thursday in the target week
  return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000
}

module.exports = getWeek;

},{}],9:[function(require,module,exports){
const getURLOfUser = require('./getURLOfUser');

const self = {};

self._nodes = {
  iframe: document.querySelector('iframe')
};

self.viewItem = function (offset, selectedUser) {
  const url = getURLOfUser(offset, selectedUser.type, selectedUser.index + 1);
  self._nodes.iframe.src = url;
};

module.exports = self;

},{"./getURLOfUser":7}],10:[function(require,module,exports){
const frontpage = require('./frontpage');
require('./search');

frontpage.show();

document.body.style.opacity = 1;

},{"./frontpage":6,"./search":11}],11:[function(require,module,exports){
const autocomplete = require('./autocomplete');
const iframe = require('./iframe');

const self = {};

self._nodes = {
  search: document.querySelector('#search'),
  input: document.querySelector('input[type="search"]')
};

self.submit = function () {
  self._nodes.input.blur();

  const selectedItem = autocomplete.getSelectedItem();
  console.log(selectedItem);
  iframe.viewItem(0, selectedItem);
};

self._handleSubmit = function (event) {
  event.preventDefault();
  self.submit();
};

autocomplete.events.on('select', self.submit);

self._nodes.search.addEventListener('submit', self._handleSubmit);
self._nodes.input.addEventListener('focus', autocomplete.show);
// self._nodes.input.addEventListener('blur', autocomplete.hide)

module.exports = self;

},{"./autocomplete":5,"./iframe":9}]},{},[10])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9mdXp6eS9saWIvZnV6enkuanMiLCJub2RlX21vZHVsZXMvbGVmdC1wYWQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2F1dG9jb21wbGV0ZS5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9mcm9udHBhZ2UuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvZ2V0VVJMT2ZVc2VyLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2dldFdlZWsuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvaWZyYW1lLmpzIiwicHVibGljL2phdmFzY3JpcHRzL21haW4uanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvc2VhcmNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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UyxhQUFULENBQXVCLFNBQXZCLENBREk7QUFFWixTQUFPLFNBQVMsYUFBVCxDQUF1QixzQkFBdkI7QUFGSyxDQUFkOztBQUtBLEtBQUssTUFBTCxHQUFjLFlBQVk7QUFDeEIsT0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixJQUFsQjs7QUFFQSxRQUFNLGVBQWUsYUFBYSxlQUFiLEVBQXJCO0FBQ0EsVUFBUSxHQUFSLENBQVksWUFBWjtBQUNBLFNBQU8sUUFBUCxDQUFnQixDQUFoQixFQUFtQixZQUFuQjtBQUNELENBTkQ7O0FBUUEsS0FBSyxhQUFMLEdBQXFCLFVBQVUsS0FBVixFQUFpQjtBQUNwQyxRQUFNLGNBQU47QUFDQSxPQUFLLE1BQUw7QUFDRCxDQUhEOztBQUtBLGFBQWEsTUFBYixDQUFvQixFQUFwQixDQUF1QixRQUF2QixFQUFpQyxLQUFLLE1BQXRDOztBQUVBLEtBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsZ0JBQW5CLENBQW9DLFFBQXBDLEVBQThDLEtBQUssYUFBbkQ7QUFDQSxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLGdCQUFsQixDQUFtQyxPQUFuQyxFQUE0QyxhQUFhLElBQXpEO0FBQ0E7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLElBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBdCBsZWFzdCBnaXZlIHNvbWUga2luZCBvZiBjb250ZXh0IHRvIHRoZSB1c2VyXG4gICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuICgnICsgZXIgKyAnKScpO1xuICAgICAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSBpZiAobGlzdGVuZXJzKSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24odHlwZSkge1xuICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgICBpZiAoaXNGdW5jdGlvbihldmxpc3RlbmVyKSlcbiAgICAgIHJldHVybiAxO1xuICAgIGVsc2UgaWYgKGV2bGlzdGVuZXIpXG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIDA7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsIi8qXG4gKiBGdXp6eVxuICogaHR0cHM6Ly9naXRodWIuY29tL215b3JrL2Z1enp5XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEyIE1hdHQgWW9ya1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICovXG5cbihmdW5jdGlvbigpIHtcblxudmFyIHJvb3QgPSB0aGlzO1xuXG52YXIgZnV6enkgPSB7fTtcblxuLy8gVXNlIGluIG5vZGUgb3IgaW4gYnJvd3NlclxuaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1enp5O1xufSBlbHNlIHtcbiAgcm9vdC5mdXp6eSA9IGZ1enp5O1xufVxuXG4vLyBSZXR1cm4gYWxsIGVsZW1lbnRzIG9mIGBhcnJheWAgdGhhdCBoYXZlIGEgZnV6enlcbi8vIG1hdGNoIGFnYWluc3QgYHBhdHRlcm5gLlxuZnV6enkuc2ltcGxlRmlsdGVyID0gZnVuY3Rpb24ocGF0dGVybiwgYXJyYXkpIHtcbiAgcmV0dXJuIGFycmF5LmZpbHRlcihmdW5jdGlvbihzdHIpIHtcbiAgICByZXR1cm4gZnV6enkudGVzdChwYXR0ZXJuLCBzdHIpO1xuICB9KTtcbn07XG5cbi8vIERvZXMgYHBhdHRlcm5gIGZ1enp5IG1hdGNoIGBzdHJgP1xuZnV6enkudGVzdCA9IGZ1bmN0aW9uKHBhdHRlcm4sIHN0cikge1xuICByZXR1cm4gZnV6enkubWF0Y2gocGF0dGVybiwgc3RyKSAhPT0gbnVsbDtcbn07XG5cbi8vIElmIGBwYXR0ZXJuYCBtYXRjaGVzIGBzdHJgLCB3cmFwIGVhY2ggbWF0Y2hpbmcgY2hhcmFjdGVyXG4vLyBpbiBgb3B0cy5wcmVgIGFuZCBgb3B0cy5wb3N0YC4gSWYgbm8gbWF0Y2gsIHJldHVybiBudWxsXG5mdXp6eS5tYXRjaCA9IGZ1bmN0aW9uKHBhdHRlcm4sIHN0ciwgb3B0cykge1xuICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgdmFyIHBhdHRlcm5JZHggPSAwXG4gICAgLCByZXN1bHQgPSBbXVxuICAgICwgbGVuID0gc3RyLmxlbmd0aFxuICAgICwgdG90YWxTY29yZSA9IDBcbiAgICAsIGN1cnJTY29yZSA9IDBcbiAgICAvLyBwcmVmaXhcbiAgICAsIHByZSA9IG9wdHMucHJlIHx8ICcnXG4gICAgLy8gc3VmZml4XG4gICAgLCBwb3N0ID0gb3B0cy5wb3N0IHx8ICcnXG4gICAgLy8gU3RyaW5nIHRvIGNvbXBhcmUgYWdhaW5zdC4gVGhpcyBtaWdodCBiZSBhIGxvd2VyY2FzZSB2ZXJzaW9uIG9mIHRoZVxuICAgIC8vIHJhdyBzdHJpbmdcbiAgICAsIGNvbXBhcmVTdHJpbmcgPSAgb3B0cy5jYXNlU2Vuc2l0aXZlICYmIHN0ciB8fCBzdHIudG9Mb3dlckNhc2UoKVxuICAgICwgY2g7XG5cbiAgcGF0dGVybiA9IG9wdHMuY2FzZVNlbnNpdGl2ZSAmJiBwYXR0ZXJuIHx8IHBhdHRlcm4udG9Mb3dlckNhc2UoKTtcblxuICAvLyBGb3IgZWFjaCBjaGFyYWN0ZXIgaW4gdGhlIHN0cmluZywgZWl0aGVyIGFkZCBpdCB0byB0aGUgcmVzdWx0XG4gIC8vIG9yIHdyYXAgaW4gdGVtcGxhdGUgaWYgaXQncyB0aGUgbmV4dCBzdHJpbmcgaW4gdGhlIHBhdHRlcm5cbiAgZm9yKHZhciBpZHggPSAwOyBpZHggPCBsZW47IGlkeCsrKSB7XG4gICAgY2ggPSBzdHJbaWR4XTtcbiAgICBpZihjb21wYXJlU3RyaW5nW2lkeF0gPT09IHBhdHRlcm5bcGF0dGVybklkeF0pIHtcbiAgICAgIGNoID0gcHJlICsgY2ggKyBwb3N0O1xuICAgICAgcGF0dGVybklkeCArPSAxO1xuXG4gICAgICAvLyBjb25zZWN1dGl2ZSBjaGFyYWN0ZXJzIHNob3VsZCBpbmNyZWFzZSB0aGUgc2NvcmUgbW9yZSB0aGFuIGxpbmVhcmx5XG4gICAgICBjdXJyU2NvcmUgKz0gMSArIGN1cnJTY29yZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VyclNjb3JlID0gMDtcbiAgICB9XG4gICAgdG90YWxTY29yZSArPSBjdXJyU2NvcmU7XG4gICAgcmVzdWx0W3Jlc3VsdC5sZW5ndGhdID0gY2g7XG4gIH1cblxuICAvLyByZXR1cm4gcmVuZGVyZWQgc3RyaW5nIGlmIHdlIGhhdmUgYSBtYXRjaCBmb3IgZXZlcnkgY2hhclxuICBpZihwYXR0ZXJuSWR4ID09PSBwYXR0ZXJuLmxlbmd0aCkge1xuICAgIC8vIGlmIHRoZSBzdHJpbmcgaXMgYW4gZXhhY3QgbWF0Y2ggd2l0aCBwYXR0ZXJuLCB0b3RhbFNjb3JlIHNob3VsZCBiZSBtYXhlZFxuICAgIHRvdGFsU2NvcmUgPSAoY29tcGFyZVN0cmluZyA9PT0gcGF0dGVybikgPyBJbmZpbml0eSA6IHRvdGFsU2NvcmU7XG4gICAgcmV0dXJuIHtyZW5kZXJlZDogcmVzdWx0LmpvaW4oJycpLCBzY29yZTogdG90YWxTY29yZX07XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8vIFRoZSBub3JtYWwgZW50cnkgcG9pbnQuIEZpbHRlcnMgYGFycmAgZm9yIG1hdGNoZXMgYWdhaW5zdCBgcGF0dGVybmAuXG4vLyBJdCByZXR1cm5zIGFuIGFycmF5IHdpdGggbWF0Y2hpbmcgdmFsdWVzIG9mIHRoZSB0eXBlOlxuLy9cbi8vICAgICBbe1xuLy8gICAgICAgICBzdHJpbmc6ICAgJzxiPmxhaCcgLy8gVGhlIHJlbmRlcmVkIHN0cmluZ1xuLy8gICAgICAgLCBpbmRleDogICAgMiAgICAgICAgLy8gVGhlIGluZGV4IG9mIHRoZSBlbGVtZW50IGluIGBhcnJgXG4vLyAgICAgICAsIG9yaWdpbmFsOiAnYmxhaCcgICAvLyBUaGUgb3JpZ2luYWwgZWxlbWVudCBpbiBgYXJyYFxuLy8gICAgIH1dXG4vL1xuLy8gYG9wdHNgIGlzIGFuIG9wdGlvbmFsIGFyZ3VtZW50IGJhZy4gRGV0YWlsczpcbi8vXG4vLyAgICBvcHRzID0ge1xuLy8gICAgICAgIC8vIHN0cmluZyB0byBwdXQgYmVmb3JlIGEgbWF0Y2hpbmcgY2hhcmFjdGVyXG4vLyAgICAgICAgcHJlOiAgICAgJzxiPidcbi8vXG4vLyAgICAgICAgLy8gc3RyaW5nIHRvIHB1dCBhZnRlciBtYXRjaGluZyBjaGFyYWN0ZXJcbi8vICAgICAgLCBwb3N0OiAgICAnPC9iPidcbi8vXG4vLyAgICAgICAgLy8gT3B0aW9uYWwgZnVuY3Rpb24uIElucHV0IGlzIGFuIGVudHJ5IGluIHRoZSBnaXZlbiBhcnJgLFxuLy8gICAgICAgIC8vIG91dHB1dCBzaG91bGQgYmUgdGhlIHN0cmluZyB0byB0ZXN0IGBwYXR0ZXJuYCBhZ2FpbnN0LlxuLy8gICAgICAgIC8vIEluIHRoaXMgZXhhbXBsZSwgaWYgYGFyciA9IFt7Y3J5aW5nOiAna29hbGEnfV1gIHdlIHdvdWxkIHJldHVyblxuLy8gICAgICAgIC8vICdrb2FsYScuXG4vLyAgICAgICwgZXh0cmFjdDogZnVuY3Rpb24oYXJnKSB7IHJldHVybiBhcmcuY3J5aW5nOyB9XG4vLyAgICB9XG5mdXp6eS5maWx0ZXIgPSBmdW5jdGlvbihwYXR0ZXJuLCBhcnIsIG9wdHMpIHtcbiAgaWYoIWFyciB8fCBhcnIubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGlmICh0eXBlb2YgcGF0dGVybiAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gYXJyO1xuICB9XG4gIG9wdHMgPSBvcHRzIHx8IHt9O1xuICByZXR1cm4gYXJyXG4gICAgLnJlZHVjZShmdW5jdGlvbihwcmV2LCBlbGVtZW50LCBpZHgsIGFycikge1xuICAgICAgdmFyIHN0ciA9IGVsZW1lbnQ7XG4gICAgICBpZihvcHRzLmV4dHJhY3QpIHtcbiAgICAgICAgc3RyID0gb3B0cy5leHRyYWN0KGVsZW1lbnQpO1xuICAgICAgfVxuICAgICAgdmFyIHJlbmRlcmVkID0gZnV6enkubWF0Y2gocGF0dGVybiwgc3RyLCBvcHRzKTtcbiAgICAgIGlmKHJlbmRlcmVkICE9IG51bGwpIHtcbiAgICAgICAgcHJldltwcmV2Lmxlbmd0aF0gPSB7XG4gICAgICAgICAgICBzdHJpbmc6IHJlbmRlcmVkLnJlbmRlcmVkXG4gICAgICAgICAgLCBzY29yZTogcmVuZGVyZWQuc2NvcmVcbiAgICAgICAgICAsIGluZGV4OiBpZHhcbiAgICAgICAgICAsIG9yaWdpbmFsOiBlbGVtZW50XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJldjtcbiAgICB9LCBbXSlcblxuICAgIC8vIFNvcnQgYnkgc2NvcmUuIEJyb3dzZXJzIGFyZSBpbmNvbnNpc3RlbnQgd3J0IHN0YWJsZS91bnN0YWJsZVxuICAgIC8vIHNvcnRpbmcsIHNvIGZvcmNlIHN0YWJsZSBieSB1c2luZyB0aGUgaW5kZXggaW4gdGhlIGNhc2Ugb2YgdGllLlxuICAgIC8vIFNlZSBodHRwOi8vb2ZiLm5ldC9+c2V0aG1sL2lzLXNvcnQtc3RhYmxlLmh0bWxcbiAgICAuc29ydChmdW5jdGlvbihhLGIpIHtcbiAgICAgIHZhciBjb21wYXJlID0gYi5zY29yZSAtIGEuc2NvcmU7XG4gICAgICBpZihjb21wYXJlKSByZXR1cm4gY29tcGFyZTtcbiAgICAgIHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcbiAgICB9KTtcbn07XG5cblxufSgpKTtcblxuIiwiLyogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmUuIEl0IGNvbWVzIHdpdGhvdXQgYW55IHdhcnJhbnR5LCB0b1xuICAgICAqIHRoZSBleHRlbnQgcGVybWl0dGVkIGJ5IGFwcGxpY2FibGUgbGF3LiBZb3UgY2FuIHJlZGlzdHJpYnV0ZSBpdFxuICAgICAqIGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBEbyBXaGF0IFRoZSBGdWNrIFlvdSBXYW50XG4gICAgICogVG8gUHVibGljIExpY2Vuc2UsIFZlcnNpb24gMiwgYXMgcHVibGlzaGVkIGJ5IFNhbSBIb2NldmFyLiBTZWVcbiAgICAgKiBodHRwOi8vd3d3Lnd0ZnBsLm5ldC8gZm9yIG1vcmUgZGV0YWlscy4gKi9cbid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gbGVmdFBhZDtcblxudmFyIGNhY2hlID0gW1xuICAnJyxcbiAgJyAnLFxuICAnICAnLFxuICAnICAgJyxcbiAgJyAgICAnLFxuICAnICAgICAnLFxuICAnICAgICAgJyxcbiAgJyAgICAgICAnLFxuICAnICAgICAgICAnLFxuICAnICAgICAgICAgJ1xuXTtcblxuZnVuY3Rpb24gbGVmdFBhZCAoc3RyLCBsZW4sIGNoKSB7XG4gIC8vIGNvbnZlcnQgYHN0cmAgdG8gYHN0cmluZ2BcbiAgc3RyID0gc3RyICsgJyc7XG4gIC8vIGBsZW5gIGlzIHRoZSBgcGFkYCdzIGxlbmd0aCBub3dcbiAgbGVuID0gbGVuIC0gc3RyLmxlbmd0aDtcbiAgLy8gZG9lc24ndCBuZWVkIHRvIHBhZFxuICBpZiAobGVuIDw9IDApIHJldHVybiBzdHI7XG4gIC8vIGBjaGAgZGVmYXVsdHMgdG8gYCcgJ2BcbiAgaWYgKCFjaCAmJiBjaCAhPT0gMCkgY2ggPSAnICc7XG4gIC8vIGNvbnZlcnQgYGNoYCB0byBgc3RyaW5nYFxuICBjaCA9IGNoICsgJyc7XG4gIC8vIGNhY2hlIGNvbW1vbiB1c2UgY2FzZXNcbiAgaWYgKGNoID09PSAnICcgJiYgbGVuIDwgMTApIHJldHVybiBjYWNoZVtsZW5dICsgc3RyO1xuICAvLyBgcGFkYCBzdGFydHMgd2l0aCBhbiBlbXB0eSBzdHJpbmdcbiAgdmFyIHBhZCA9ICcnO1xuICAvLyBsb29wXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgLy8gYWRkIGBjaGAgdG8gYHBhZGAgaWYgYGxlbmAgaXMgb2RkXG4gICAgaWYgKGxlbiAmIDEpIHBhZCArPSBjaDtcbiAgICAvLyBkaXZpZGUgYGxlbmAgYnkgMiwgZGl0Y2ggdGhlIHJlbWFpbmRlclxuICAgIGxlbiA+Pj0gMTtcbiAgICAvLyBcImRvdWJsZVwiIHRoZSBgY2hgIHNvIHRoaXMgb3BlcmF0aW9uIGNvdW50IGdyb3dzIGxvZ2FyaXRobWljYWxseSBvbiBgbGVuYFxuICAgIC8vIGVhY2ggdGltZSBgY2hgIGlzIFwiZG91YmxlZFwiLCB0aGUgYGxlbmAgd291bGQgbmVlZCB0byBiZSBcImRvdWJsZWRcIiB0b29cbiAgICAvLyBzaW1pbGFyIHRvIGZpbmRpbmcgYSB2YWx1ZSBpbiBiaW5hcnkgc2VhcmNoIHRyZWUsIGhlbmNlIE8obG9nKG4pKVxuICAgIGlmIChsZW4pIGNoICs9IGNoO1xuICAgIC8vIGBsZW5gIGlzIDAsIGV4aXQgdGhlIGxvb3BcbiAgICBlbHNlIGJyZWFrO1xuICB9XG4gIC8vIHBhZCBgc3RyYCFcbiAgcmV0dXJuIHBhZCArIHN0cjtcbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKiBnbG9iYWwgVVNFUlMgKi9cblxuY29uc3QgZnV6enkgPSByZXF1aXJlKCdmdXp6eScpXG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuY29uc3QgcHJvY2VzcyA9IHJlcXVpcmUoJ3Byb2Nlc3MnKVxuY29uc3Qgc2VsZiA9IHt9XG5cbnNlbGYuX2l0ZW1zID0gW11cbnNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ID0gLTFcblxuc2VsZi5ldmVudHMgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fbm9kZXMgPSB7XG4gIHNlYXJjaDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NlYXJjaCcpLFxuICBpbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpLFxuICBhdXRvY29tcGxldGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUnKVxufVxuXG5zZWxmLmdldFNlbGVjdGVkSXRlbSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHNlbGYuZ2V0SXRlbXMoKSA9PT0gW10pIHJldHVyblxuXG4gIGlmIChzZWxmLmdldFNlbGVjdGVkSXRlbUluZGV4KCkgPT09IC0xKSB7XG4gICAgcmV0dXJuIHNlbGYuZ2V0SXRlbXMoKVswXVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBzZWxmLmdldEl0ZW1zKClbc2VsZi5nZXRTZWxlY3RlZEl0ZW1JbmRleCgpXVxuICB9XG59XG5cbnNlbGYuZ2V0U2VsZWN0ZWRJdGVtSW5kZXggPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleFxufVxuXG5zZWxmLmdldEl0ZW1zID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gc2VsZi5faXRlbXNcbn1cblxuc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICBzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbn1cblxuc2VsZi5oaWRlID0gZnVuY3Rpb24gKCkge1xuICBzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xufVxuXG5zZWxmLl9yZW1vdmVBbGxJdGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgd2hpbGUgKHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5maXJzdENoaWxkKSB7XG4gICAgc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLnJlbW92ZUNoaWxkKHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5maXJzdENoaWxkKVxuICB9XG4gIHNlbGYuX2l0ZW1zID0gW11cbiAgc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggPSAtMVxufVxuXG5zZWxmLl9hZGRJdGVtID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgY29uc3QgbGlzdEl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpXG4gIGxpc3RJdGVtLnRleHRDb250ZW50ID0gaXRlbS52YWx1ZVxuICBzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuYXBwZW5kQ2hpbGQobGlzdEl0ZW0pXG4gIHNlbGYuX2l0ZW1zLnB1c2goaXRlbSlcbn1cblxuc2VsZi5fbW92ZVNlbGVjdGVkID0gZnVuY3Rpb24gKHNoaWZ0KSB7XG4gIGlmIChzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleCArIHNoaWZ0ID49IHNlbGYuZ2V0SXRlbXMoKS5sZW5ndGgpIHtcbiAgICBzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleCA9IC0xXG4gIH0gZWxzZSBpZiAoc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggKyBzaGlmdCA8IC0xKSB7XG4gICAgc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggPSBzZWxmLmdldEl0ZW1zKCkubGVuZ3RoIC0gMVxuICB9IGVsc2Uge1xuICAgIHNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ICs9IHNoaWZ0XG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGYuZ2V0SXRlbXMoKS5sZW5ndGg7IGkrKykge1xuICAgIHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5jaGlsZHJlbltpXS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpXG4gIH1cbiAgaWYgKHNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ID49IDApIHtcbiAgICBzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGVcbiAgICAgICAgLmNoaWxkcmVuW3NlbGYuX3NlbGVjdGVkSXRlbUluZGV4XS5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpXG4gIH1cbn1cblxuc2VsZi5fY2FsY3VsYXRlID0gZnVuY3Rpb24gKHNlYXJjaFRlcm0pIHtcbiAgY29uc3QgYWxsUmVzdWx0cyA9IGZ1enp5LmZpbHRlcihzZWFyY2hUZXJtLCBVU0VSUywge1xuICAgIGV4dHJhY3Q6IGl0ZW0gPT4gaXRlbS52YWx1ZVxuICB9KVxuICBjb25zdCBmaXJzdFJlc3VsdHMgPSBhbGxSZXN1bHRzLnNsaWNlKDAsIDcpXG5cbiAgY29uc3Qgb3JpZ2luYWxSZXN1bHRzID0gZmlyc3RSZXN1bHRzLm1hcChyZXN1bHQgPT4gcmVzdWx0Lm9yaWdpbmFsKVxuXG4gIHJldHVybiBvcmlnaW5hbFJlc3VsdHNcbn1cblxuc2VsZi5faGFuZGxlSXRlbUNsaWNrID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGlmICghc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVyblxuICBjb25zdCBpdGVtSW5kZXggPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZlxuICAgICAgLmNhbGwoc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmNoaWxkcmVuLCBldmVudC50YXJnZXQpXG4gIHNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ID0gaXRlbUluZGV4XG4gIHNlbGYuZXZlbnRzLmVtaXQoJ3NlbGVjdCcsIHNlbGYuZ2V0U2VsZWN0ZWRJdGVtKCkpXG59XG5cbnNlbGYuX2hhbmRsZVRleHRVcGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHJlc3VsdHMgPSBzZWxmLl9jYWxjdWxhdGUoc2VsZi5fbm9kZXMuaW5wdXQudmFsdWUpXG5cbiAgc2VsZi5fcmVtb3ZlQWxsSXRlbXMoKVxuICBmb3IgKGxldCBpID0gMDsgaSA8IHJlc3VsdHMubGVuZ3RoOyBpKyspIHtcbiAgICBzZWxmLl9hZGRJdGVtKHJlc3VsdHNbaV0pXG4gIH1cbn1cblxuc2VsZi5faGFuZGxlS2V5ZG93biA9IGZ1bmN0aW9uIChldmVudCkge1xuICBpZiAoZXZlbnQua2V5ID09PSAnQXJyb3dEb3duJyB8fCBldmVudC5rZXkgPT09ICdBcnJvd1VwJykge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBpZiAoZXZlbnQua2V5ID09PSAnQXJyb3dEb3duJykge1xuICAgICAgc2VsZi5fbW92ZVNlbGVjdGVkKDEpXG4gICAgfSBlbHNlIGlmIChldmVudC5rZXkgPT09ICdBcnJvd1VwJykge1xuICAgICAgc2VsZi5fbW92ZVNlbGVjdGVkKC0xKVxuICAgIH1cbiAgfVxufVxuXG5zZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxmLl9oYW5kbGVJdGVtQ2xpY2spXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHNlbGYuX2hhbmRsZVRleHRVcGRhdGUpXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgc2VsZi5faGFuZGxlS2V5ZG93bilcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJjb25zdCBzZWxmID0ge31cblxuc2VsZi5fbm9kZXMgPSB7XG4gIGlucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJylcbn1cblxuc2VsZi5pc1Nob3duID0gZmFsc2Vcblxuc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ25vLWlucHV0JylcbiAgc2VsZi5pc1Nob3duID0gdHJ1ZVxufVxuXG5zZWxmLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbm8taW5wdXQnKVxuICBzZWxmLmlzU2hvd24gPSBmYWxzZVxufVxuXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHNlbGYuaGlkZSlcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJ2YXIgbGVmdFBhZCA9IHJlcXVpcmUoJ2xlZnQtcGFkJylcbnZhciBnZXRXZWVrID0gcmVxdWlyZSgnLi9nZXRXZWVrJylcblxuZnVuY3Rpb24gZ2V0VVJMT2ZVc2VycyAod2Vla09mZnNldCwgdHlwZSwgaWQpIHtcbiAgcmV0dXJuIGAvLyR7d2luZG93LmxvY2F0aW9uLmhvc3R9L21lZXRpbmdwb2ludFByb3h5L1Jvb3N0ZXJzLUFMJTJGZG9jJTJGZGFncm9vc3RlcnMlMkZgICtcbiAgICAgIGAkeyhnZXRXZWVrKCkgKyB3ZWVrT2Zmc2V0KX0lMkYke3R5cGV9JTJGJHt0eXBlfSR7bGVmdFBhZChpZCwgNSwgJzAnKX0uaHRtYFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFVSTE9mVXNlcnNcbiIsIi8vIGNvcGllZCBmcm9tIGh0dHA6Ly93d3cubWVldGluZ3BvaW50bWNvLm5sL1Jvb3N0ZXJzLUFML2RvYy9kYWdyb29zdGVycy91bnRpc3NjcmlwdHMuanMsXG4vLyB3ZXJlIHVzaW5nIHRoZSBzYW1lIGNvZGUgYXMgdGhleSBkbyB0byBiZSBzdXJlIHRoYXQgd2UgYWx3YXlzIGdldCB0aGUgc2FtZVxuLy8gd2VlayBudW1iZXIuXG5mdW5jdGlvbiBnZXRXZWVrICgpIHtcbiAgLy8gQ3JlYXRlIGEgY29weSBvZiB0aGlzIGRhdGUgb2JqZWN0XG4gIGNvbnN0IHRhcmdldCA9IG5ldyBEYXRlKClcblxuICAvLyBJU08gd2VlayBkYXRlIHdlZWtzIHN0YXJ0IG9uIG1vbmRheVxuICAvLyBzbyBjb3JyZWN0IHRoZSBkYXkgbnVtYmVyXG4gIGNvbnN0IGRheU5yID0gKHRhcmdldC5nZXREYXkoKSArIDYpICUgN1xuXG4gIC8vIElTTyA4NjAxIHN0YXRlcyB0aGF0IHdlZWsgMSBpcyB0aGUgd2Vla1xuICAvLyB3aXRoIHRoZSBmaXJzdCB0aHVyc2RheSBvZiB0aGF0IHllYXIuXG4gIC8vIFNldCB0aGUgdGFyZ2V0IGRhdGUgdG8gdGhlIHRodXJzZGF5IGluIHRoZSB0YXJnZXQgd2Vla1xuICB0YXJnZXQuc2V0RGF0ZSh0YXJnZXQuZ2V0RGF0ZSgpIC0gZGF5TnIgKyAzKVxuXG4gIC8vIFN0b3JlIHRoZSBtaWxsaXNlY29uZCB2YWx1ZSBvZiB0aGUgdGFyZ2V0IGRhdGVcbiAgY29uc3QgZmlyc3RUaHVyc2RheSA9IHRhcmdldC52YWx1ZU9mKClcblxuICAvLyBTZXQgdGhlIHRhcmdldCB0byB0aGUgZmlyc3QgdGh1cnNkYXkgb2YgdGhlIHllYXJcbiAgLy8gRmlyc3Qgc2V0IHRoZSB0YXJnZXQgdG8gamFudWFyeSBmaXJzdFxuICB0YXJnZXQuc2V0TW9udGgoMCwgMSlcbiAgLy8gTm90IGEgdGh1cnNkYXk/IENvcnJlY3QgdGhlIGRhdGUgdG8gdGhlIG5leHQgdGh1cnNkYXlcbiAgaWYgKHRhcmdldC5nZXREYXkoKSAhPT0gNCkge1xuICAgIHRhcmdldC5zZXRNb250aCgwLCAxICsgKCg0IC0gdGFyZ2V0LmdldERheSgpKSArIDcpICUgNylcbiAgfVxuXG4gIC8vIFRoZSB3ZWVrbnVtYmVyIGlzIHRoZSBudW1iZXIgb2Ygd2Vla3MgYmV0d2VlbiB0aGVcbiAgLy8gZmlyc3QgdGh1cnNkYXkgb2YgdGhlIHllYXIgYW5kIHRoZSB0aHVyc2RheSBpbiB0aGUgdGFyZ2V0IHdlZWtcbiAgcmV0dXJuIDEgKyBNYXRoLmNlaWwoKGZpcnN0VGh1cnNkYXkgLSB0YXJnZXQpIC8gNjA0ODAwMDAwKSAvLyA2MDQ4MDAwMDAgPSA3ICogMjQgKiAzNjAwICogMTAwMFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFdlZWtcbiIsImNvbnN0IGdldFVSTE9mVXNlciA9IHJlcXVpcmUoJy4vZ2V0VVJMT2ZVc2VyJylcblxuY29uc3Qgc2VsZiA9IHt9XG5cbnNlbGYuX25vZGVzID0ge1xuICBpZnJhbWU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lmcmFtZScpXG59XG5cbnNlbGYudmlld0l0ZW0gPSBmdW5jdGlvbiAob2Zmc2V0LCBzZWxlY3RlZFVzZXIpIHtcbiAgY29uc3QgdXJsID0gZ2V0VVJMT2ZVc2VyKG9mZnNldCwgc2VsZWN0ZWRVc2VyLnR5cGUsIHNlbGVjdGVkVXNlci5pbmRleCArIDEpXG4gIHNlbGYuX25vZGVzLmlmcmFtZS5zcmMgPSB1cmxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJjb25zdCBmcm9udHBhZ2UgPSByZXF1aXJlKCcuL2Zyb250cGFnZScpXG5yZXF1aXJlKCcuL3NlYXJjaCcpXG5cbmZyb250cGFnZS5zaG93KClcblxuZG9jdW1lbnQuYm9keS5zdHlsZS5vcGFjaXR5ID0gMVxuIiwiY29uc3QgYXV0b2NvbXBsZXRlID0gcmVxdWlyZSgnLi9hdXRvY29tcGxldGUnKVxuY29uc3QgaWZyYW1lID0gcmVxdWlyZSgnLi9pZnJhbWUnKVxuXG5jb25zdCBzZWxmID0ge31cblxuc2VsZi5fbm9kZXMgPSB7XG4gIHNlYXJjaDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NlYXJjaCcpLFxuICBpbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpXG59XG5cbnNlbGYuc3VibWl0ID0gZnVuY3Rpb24gKCkge1xuICBzZWxmLl9ub2Rlcy5pbnB1dC5ibHVyKClcblxuICBjb25zdCBzZWxlY3RlZEl0ZW0gPSBhdXRvY29tcGxldGUuZ2V0U2VsZWN0ZWRJdGVtKClcbiAgY29uc29sZS5sb2coc2VsZWN0ZWRJdGVtKVxuICBpZnJhbWUudmlld0l0ZW0oMCwgc2VsZWN0ZWRJdGVtKVxufVxuXG5zZWxmLl9oYW5kbGVTdWJtaXQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICBzZWxmLnN1Ym1pdCgpXG59XG5cbmF1dG9jb21wbGV0ZS5ldmVudHMub24oJ3NlbGVjdCcsIHNlbGYuc3VibWl0KVxuXG5zZWxmLl9ub2Rlcy5zZWFyY2guYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0Jywgc2VsZi5faGFuZGxlU3VibWl0KVxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBhdXRvY29tcGxldGUuc2hvdylcbi8vIHNlbGYuX25vZGVzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCBhdXRvY29tcGxldGUuaGlkZSlcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iXX0=
