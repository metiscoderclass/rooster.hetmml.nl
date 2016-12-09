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
const EventEmitter = require('events');
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
  self.events.emit('select', self.getSelectedItem());
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

},{"events":1}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
var leftPad = require('left-pad');
var getWeek = require('./getWeek');

function getURLOfUsers(weekOffset, type, id) {
  return `//${ window.location.host }/meetingpointProxy/Roosters-AL%2Fdoc%2Fdagroosters%2F` + `${ getWeek() + weekOffset }%2F${ type }%2F${ type }${ leftPad(id, 5, '0') }.htm`;
}

module.exports = getURLOfUsers;

},{"./getWeek":7,"left-pad":3}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
const frontpage = require('./frontpage');
require('./search');

frontpage.show();

document.body.style.opacity = 1;

},{"./frontpage":5,"./search":10}],9:[function(require,module,exports){
const getURLOfUser = require('./getURLOfUser');

const self = {};

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
};

self._handleError = function (event) {
  const request = event.target;
  console.error(request);
};

self.viewItem = function (offset, selectedUser) {
  const url = getURLOfUser(offset, selectedUser.type, selectedUser.index + 1);

  while (self._nodes.schedule.firstChild) {
    self._nodes.schedule.removeChild(self._nodes.schedule.firstChild);
  }

  const request = new window.XMLHttpRequest();
  request.addEventListener('load', self._handleLoad);
  request.addEventListener('error', self._handleError);
  request.open('GET', url, true);
  request.send();
};

module.exports = self;

},{"./getURLOfUser":6}],10:[function(require,module,exports){
/* global USERS */

const fuzzy = require('fuzzy');
const autocomplete = require('./autocomplete');
const schedule = require('./schedule');

const self = {};

self._nodes = {
  search: document.querySelector('#search'),
  input: document.querySelector('input[type="search"]')
};

self.submit = function () {
  self._nodes.input.blur();

  const selectedItem = autocomplete.getSelectedItem();
  self._nodes.input.value = selectedItem.value;
  schedule.viewItem(0, selectedItem);

  autocomplete.removeAllItems();
  document.body.classList.add('searched');
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

autocomplete.events.on('select', self.submit);

self._nodes.search.addEventListener('submit', self._handleSubmit);
self._nodes.input.addEventListener('input', self._handleTextUpdate);

module.exports = self;

},{"./autocomplete":4,"./schedule":9,"fuzzy":2}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9mdXp6eS9saWIvZnV6enkuanMiLCJub2RlX21vZHVsZXMvbGVmdC1wYWQvaW5kZXguanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYXV0b2NvbXBsZXRlLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2Zyb250cGFnZS5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9nZXRVUkxPZlVzZXIuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvZ2V0V2Vlay5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9tYWluLmpzIiwicHVibGljL2phdmFzY3JpcHRzL3NjaGVkdWxlLmpzIiwicHVibGljL2phdmFzY3JpcHRzL3NlYXJjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQSxNQUFNLGVBQWUsUUFBUSxRQUFSLENBQXJCO0FBQ0EsTUFBTSxPQUFPLEVBQWI7O0FBRUEsS0FBSyxNQUFMLEdBQWMsRUFBZDtBQUNBLEtBQUssa0JBQUwsR0FBMEIsQ0FBQyxDQUEzQjs7QUFFQSxLQUFLLE1BQUwsR0FBYyxJQUFJLFlBQUosRUFBZDs7QUFFQSxLQUFLLE1BQUwsR0FBYztBQUNaLFVBQVEsU0FBUyxhQUFULENBQXVCLFNBQXZCLENBREk7QUFFWixTQUFPLFNBQVMsYUFBVCxDQUF1QixzQkFBdkIsQ0FGSztBQUdaLGdCQUFjLFNBQVMsYUFBVCxDQUF1QixlQUF2QjtBQUhGLENBQWQ7O0FBTUEsS0FBSyxlQUFMLEdBQXVCLFlBQVk7QUFDakMsTUFBSSxLQUFLLFFBQUwsT0FBb0IsRUFBeEIsRUFBNEI7O0FBRTVCLE1BQUksS0FBSyxvQkFBTCxPQUFnQyxDQUFDLENBQXJDLEVBQXdDO0FBQ3RDLFdBQU8sS0FBSyxRQUFMLEdBQWdCLENBQWhCLENBQVA7QUFDRCxHQUZELE1BRU87QUFDTCxXQUFPLEtBQUssUUFBTCxHQUFnQixLQUFLLG9CQUFMLEVBQWhCLENBQVA7QUFDRDtBQUNGLENBUkQ7O0FBVUEsS0FBSyxvQkFBTCxHQUE0QixZQUFZO0FBQ3RDLFNBQU8sS0FBSyxrQkFBWjtBQUNELENBRkQ7O0FBSUEsS0FBSyxRQUFMLEdBQWdCLFlBQVk7QUFDMUIsU0FBTyxLQUFLLE1BQVo7QUFDRCxDQUZEOztBQUlBLEtBQUssY0FBTCxHQUFzQixZQUFZO0FBQ2hDLFNBQU8sS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixVQUFoQyxFQUE0QztBQUMxQyxTQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLFdBQXpCLENBQXFDLEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsVUFBOUQ7QUFDRDtBQUNELE9BQUssTUFBTCxHQUFjLEVBQWQ7QUFDQSxPQUFLLGtCQUFMLEdBQTBCLENBQUMsQ0FBM0I7QUFDRCxDQU5EOztBQVFBLEtBQUssT0FBTCxHQUFlLFVBQVUsSUFBVixFQUFnQjtBQUM3QixRQUFNLFdBQVcsU0FBUyxhQUFULENBQXVCLElBQXZCLENBQWpCO0FBQ0EsV0FBUyxXQUFULEdBQXVCLEtBQUssS0FBNUI7QUFDQSxPQUFLLE1BQUwsQ0FBWSxZQUFaLENBQXlCLFdBQXpCLENBQXFDLFFBQXJDO0FBQ0EsT0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixJQUFqQjtBQUNELENBTEQ7O0FBT0EsS0FBSyxhQUFMLEdBQXFCLFVBQVUsS0FBVixFQUFpQjtBQUNwQyxNQUFJLEtBQUssa0JBQUwsR0FBMEIsS0FBMUIsSUFBbUMsS0FBSyxRQUFMLEdBQWdCLE1BQXZELEVBQStEO0FBQzdELFNBQUssa0JBQUwsR0FBMEIsQ0FBQyxDQUEzQjtBQUNELEdBRkQsTUFFTyxJQUFJLEtBQUssa0JBQUwsR0FBMEIsS0FBMUIsR0FBa0MsQ0FBQyxDQUF2QyxFQUEwQztBQUMvQyxTQUFLLGtCQUFMLEdBQTBCLEtBQUssUUFBTCxHQUFnQixNQUFoQixHQUF5QixDQUFuRDtBQUNELEdBRk0sTUFFQTtBQUNMLFNBQUssa0JBQUwsSUFBMkIsS0FBM0I7QUFDRDs7QUFFRCxPQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksS0FBSyxRQUFMLEdBQWdCLE1BQXBDLEVBQTRDLEdBQTVDLEVBQWlEO0FBQy9DLFNBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsUUFBekIsQ0FBa0MsQ0FBbEMsRUFBcUMsU0FBckMsQ0FBK0MsTUFBL0MsQ0FBc0QsVUFBdEQ7QUFDRDtBQUNELE1BQUksS0FBSyxrQkFBTCxJQUEyQixDQUEvQixFQUFrQztBQUNoQyxTQUFLLE1BQUwsQ0FBWSxZQUFaLENBQ0ssUUFETCxDQUNjLEtBQUssa0JBRG5CLEVBQ3VDLFNBRHZDLENBQ2lELEdBRGpELENBQ3FELFVBRHJEO0FBRUQ7QUFDRixDQWhCRDs7QUFrQkEsS0FBSyxnQkFBTCxHQUF3QixVQUFVLEtBQVYsRUFBaUI7QUFDdkMsTUFBSSxDQUFDLEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsUUFBekIsQ0FBa0MsTUFBTSxNQUF4QyxDQUFMLEVBQXNEO0FBQ3RELFFBQU0sWUFBWSxNQUFNLFNBQU4sQ0FBZ0IsT0FBaEIsQ0FDYixJQURhLENBQ1IsS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixRQURqQixFQUMyQixNQUFNLE1BRGpDLENBQWxCO0FBRUEsT0FBSyxrQkFBTCxHQUEwQixTQUExQjtBQUNBLE9BQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsUUFBakIsRUFBMkIsS0FBSyxlQUFMLEVBQTNCO0FBQ0QsQ0FORDs7QUFRQSxLQUFLLGNBQUwsR0FBc0IsVUFBVSxLQUFWLEVBQWlCO0FBQ3JDLE1BQUksTUFBTSxHQUFOLEtBQWMsV0FBZCxJQUE2QixNQUFNLEdBQU4sS0FBYyxTQUEvQyxFQUEwRDtBQUN4RCxVQUFNLGNBQU47QUFDQSxRQUFJLE1BQU0sR0FBTixLQUFjLFdBQWxCLEVBQStCO0FBQzdCLFdBQUssYUFBTCxDQUFtQixDQUFuQjtBQUNELEtBRkQsTUFFTyxJQUFJLE1BQU0sR0FBTixLQUFjLFNBQWxCLEVBQTZCO0FBQ2xDLFdBQUssYUFBTCxDQUFtQixDQUFDLENBQXBCO0FBQ0Q7QUFDRjtBQUNGLENBVEQ7O0FBV0EsS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixnQkFBekIsQ0FBMEMsT0FBMUMsRUFBbUQsS0FBSyxnQkFBeEQ7QUFDQSxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLGdCQUFsQixDQUFtQyxTQUFuQyxFQUE4QyxLQUFLLGNBQW5EOztBQUVBLE9BQU8sT0FBUCxHQUFpQixJQUFqQjs7O0FDdkZBLE1BQU0sT0FBTyxFQUFiOztBQUVBLEtBQUssTUFBTCxHQUFjO0FBQ1osU0FBTyxTQUFTLGFBQVQsQ0FBdUIsc0JBQXZCO0FBREssQ0FBZDs7QUFJQSxLQUFLLE9BQUwsR0FBZSxLQUFmOztBQUVBLEtBQUssSUFBTCxHQUFZLFlBQVk7QUFDdEIsV0FBUyxJQUFULENBQWMsU0FBZCxDQUF3QixHQUF4QixDQUE0QixVQUE1QjtBQUNBLE9BQUssT0FBTCxHQUFlLElBQWY7QUFDRCxDQUhEOztBQUtBLEtBQUssSUFBTCxHQUFZLFlBQVk7QUFDdEIsV0FBUyxJQUFULENBQWMsU0FBZCxDQUF3QixNQUF4QixDQUErQixVQUEvQjtBQUNBLE9BQUssT0FBTCxHQUFlLEtBQWY7QUFDRCxDQUhEOztBQUtBLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsZ0JBQWxCLENBQW1DLE9BQW5DLEVBQTRDLEtBQUssSUFBakQ7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLElBQWpCOzs7QUNwQkEsSUFBSSxVQUFVLFFBQVEsVUFBUixDQUFkO0FBQ0EsSUFBSSxVQUFVLFFBQVEsV0FBUixDQUFkOztBQUVBLFNBQVMsYUFBVCxDQUF3QixVQUF4QixFQUFvQyxJQUFwQyxFQUEwQyxFQUExQyxFQUE4QztBQUM1QyxTQUFRLE1BQUksT0FBTyxRQUFQLENBQWdCLElBQUssd0RBQTFCLEdBQ0YsSUFBRyxZQUFZLFVBQVksUUFBSyxJQUFLLFFBQUssSUFBSyxLQUFFLFFBQVEsRUFBUixFQUFZLENBQVosRUFBZSxHQUFmLENBQW9CLE9BRDFFO0FBRUQ7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLGFBQWpCOzs7QUNSQTtBQUNBO0FBQ0E7QUFDQSxTQUFTLE9BQVQsR0FBb0I7QUFDbEI7QUFDQSxRQUFNLFNBQVMsSUFBSSxJQUFKLEVBQWY7O0FBRUE7QUFDQTtBQUNBLFFBQU0sUUFBUSxDQUFDLE9BQU8sTUFBUCxLQUFrQixDQUFuQixJQUF3QixDQUF0Qzs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFPLE9BQVAsQ0FBZSxPQUFPLE9BQVAsS0FBbUIsS0FBbkIsR0FBMkIsQ0FBMUM7O0FBRUE7QUFDQSxRQUFNLGdCQUFnQixPQUFPLE9BQVAsRUFBdEI7O0FBRUE7QUFDQTtBQUNBLFNBQU8sUUFBUCxDQUFnQixDQUFoQixFQUFtQixDQUFuQjtBQUNBO0FBQ0EsTUFBSSxPQUFPLE1BQVAsT0FBb0IsQ0FBeEIsRUFBMkI7QUFDekIsV0FBTyxRQUFQLENBQWdCLENBQWhCLEVBQW1CLElBQUksQ0FBRSxJQUFJLE9BQU8sTUFBUCxFQUFMLEdBQXdCLENBQXpCLElBQThCLENBQXJEO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBLFNBQU8sSUFBSSxLQUFLLElBQUwsQ0FBVSxDQUFDLGdCQUFnQixNQUFqQixJQUEyQixTQUFyQyxDQUFYLENBMUJrQixDQTBCeUM7QUFDNUQ7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLE9BQWpCOzs7QUNoQ0EsTUFBTSxZQUFZLFFBQVEsYUFBUixDQUFsQjtBQUNBLFFBQVEsVUFBUjs7QUFFQSxVQUFVLElBQVY7O0FBRUEsU0FBUyxJQUFULENBQWMsS0FBZCxDQUFvQixPQUFwQixHQUE4QixDQUE5Qjs7O0FDTEEsTUFBTSxlQUFlLFFBQVEsZ0JBQVIsQ0FBckI7O0FBRUEsTUFBTSxPQUFPLEVBQWI7O0FBRUEsS0FBSyxNQUFMLEdBQWM7QUFDWixZQUFVLFNBQVMsYUFBVCxDQUF1QixXQUF2QjtBQURFLENBQWQ7O0FBSUEsS0FBSyxzQkFBTCxHQUE4QixVQUFVLE9BQVYsRUFBbUI7QUFDL0MsUUFBTSxPQUFPLFNBQVMsYUFBVCxDQUF1QixNQUF2QixDQUFiO0FBQ0EsT0FBSyxTQUFMLEdBQWlCLE9BQWpCO0FBQ0EsUUFBTSxhQUFhLEtBQUssYUFBTCxDQUFtQixRQUFuQixDQUFuQjtBQUNBLFNBQU8sVUFBUDtBQUNELENBTEQ7O0FBT0EsS0FBSyxXQUFMLEdBQW1CLFVBQVUsS0FBVixFQUFpQjtBQUNsQyxRQUFNLFVBQVUsTUFBTSxNQUF0QjtBQUNBLE1BQUksUUFBUSxNQUFSLEdBQWlCLEdBQWpCLElBQXdCLFFBQVEsTUFBUixJQUFrQixHQUE5QyxFQUFtRDtBQUNqRCxTQUFLLFlBQUwsQ0FBa0IsS0FBbEI7QUFDQTtBQUNEO0FBQ0QsUUFBTSxXQUFXLEtBQUssc0JBQUwsQ0FBNEIsUUFBUSxRQUFwQyxDQUFqQjtBQUNBLE9BQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsV0FBckIsQ0FBaUMsUUFBakM7QUFDRCxDQVJEOztBQVVBLEtBQUssWUFBTCxHQUFvQixVQUFVLEtBQVYsRUFBaUI7QUFDbkMsUUFBTSxVQUFVLE1BQU0sTUFBdEI7QUFDQSxVQUFRLEtBQVIsQ0FBYyxPQUFkO0FBQ0QsQ0FIRDs7QUFLQSxLQUFLLFFBQUwsR0FBZ0IsVUFBVSxNQUFWLEVBQWtCLFlBQWxCLEVBQWdDO0FBQzlDLFFBQU0sTUFBTSxhQUFhLE1BQWIsRUFBcUIsYUFBYSxJQUFsQyxFQUF3QyxhQUFhLEtBQWIsR0FBcUIsQ0FBN0QsQ0FBWjs7QUFFQSxTQUFPLEtBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsVUFBNUIsRUFBd0M7QUFDdEMsU0FBSyxNQUFMLENBQVksUUFBWixDQUFxQixXQUFyQixDQUFpQyxLQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLFVBQXREO0FBQ0Q7O0FBRUQsUUFBTSxVQUFVLElBQUksT0FBTyxjQUFYLEVBQWhCO0FBQ0EsVUFBUSxnQkFBUixDQUF5QixNQUF6QixFQUFpQyxLQUFLLFdBQXRDO0FBQ0EsVUFBUSxnQkFBUixDQUF5QixPQUF6QixFQUFrQyxLQUFLLFlBQXZDO0FBQ0EsVUFBUSxJQUFSLENBQWEsS0FBYixFQUFvQixHQUFwQixFQUF5QixJQUF6QjtBQUNBLFVBQVEsSUFBUjtBQUNELENBWkQ7O0FBY0EsT0FBTyxPQUFQLEdBQWlCLElBQWpCOzs7QUM1Q0E7O0FBRUEsTUFBTSxRQUFRLFFBQVEsT0FBUixDQUFkO0FBQ0EsTUFBTSxlQUFlLFFBQVEsZ0JBQVIsQ0FBckI7QUFDQSxNQUFNLFdBQVcsUUFBUSxZQUFSLENBQWpCOztBQUVBLE1BQU0sT0FBTyxFQUFiOztBQUVBLEtBQUssTUFBTCxHQUFjO0FBQ1osVUFBUSxTQUFTLGFBQVQsQ0FBdUIsU0FBdkIsQ0FESTtBQUVaLFNBQU8sU0FBUyxhQUFULENBQXVCLHNCQUF2QjtBQUZLLENBQWQ7O0FBS0EsS0FBSyxNQUFMLEdBQWMsWUFBWTtBQUN4QixPQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLElBQWxCOztBQUVBLFFBQU0sZUFBZSxhQUFhLGVBQWIsRUFBckI7QUFDQSxPQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEtBQWxCLEdBQTBCLGFBQWEsS0FBdkM7QUFDQSxXQUFTLFFBQVQsQ0FBa0IsQ0FBbEIsRUFBcUIsWUFBckI7O0FBRUEsZUFBYSxjQUFiO0FBQ0EsV0FBUyxJQUFULENBQWMsU0FBZCxDQUF3QixHQUF4QixDQUE0QixVQUE1QjtBQUNELENBVEQ7O0FBV0EsS0FBSyxhQUFMLEdBQXFCLFVBQVUsS0FBVixFQUFpQjtBQUNwQyxRQUFNLGNBQU47QUFDQSxPQUFLLE1BQUw7QUFDRCxDQUhEOztBQUtBLEtBQUssVUFBTCxHQUFrQixVQUFVLFVBQVYsRUFBc0I7QUFDdEMsUUFBTSxhQUFhLE1BQU0sTUFBTixDQUFhLFVBQWIsRUFBeUIsS0FBekIsRUFBZ0M7QUFDakQsYUFBUyxRQUFRLEtBQUs7QUFEMkIsR0FBaEMsQ0FBbkI7QUFHQSxRQUFNLGVBQWUsV0FBVyxLQUFYLENBQWlCLENBQWpCLEVBQW9CLENBQXBCLENBQXJCOztBQUVBLFFBQU0sa0JBQWtCLGFBQWEsR0FBYixDQUFpQixVQUFVLE9BQU8sUUFBbEMsQ0FBeEI7O0FBRUEsU0FBTyxlQUFQO0FBQ0QsQ0FURDs7QUFXQSxLQUFLLGlCQUFMLEdBQXlCLFlBQVk7QUFDbkMsUUFBTSxVQUFVLEtBQUssVUFBTCxDQUFnQixLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEtBQWxDLENBQWhCOztBQUVBLGVBQWEsY0FBYjtBQUNBLE9BQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxRQUFRLE1BQTVCLEVBQW9DLEdBQXBDLEVBQXlDO0FBQ3ZDLGlCQUFhLE9BQWIsQ0FBcUIsUUFBUSxDQUFSLENBQXJCO0FBQ0Q7QUFDRixDQVBEOztBQVNBLGFBQWEsTUFBYixDQUFvQixFQUFwQixDQUF1QixRQUF2QixFQUFpQyxLQUFLLE1BQXRDOztBQUVBLEtBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsZ0JBQW5CLENBQW9DLFFBQXBDLEVBQThDLEtBQUssYUFBbkQ7QUFDQSxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLGdCQUFsQixDQUFtQyxPQUFuQyxFQUE0QyxLQUFLLGlCQUFqRDs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsSUFBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4gKCcgKyBlciArICcpJyk7XG4gICAgICAgIGVyci5jb250ZXh0ID0gZXI7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIGlmICh0aGlzLl9ldmVudHMpIHtcbiAgICB2YXIgZXZsaXN0ZW5lciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGV2bGlzdGVuZXIpKVxuICAgICAgcmV0dXJuIDE7XG4gICAgZWxzZSBpZiAoZXZsaXN0ZW5lcilcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgfVxuICByZXR1cm4gMDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiLypcbiAqIEZ1enp5XG4gKiBodHRwczovL2dpdGh1Yi5jb20vbXlvcmsvZnV6enlcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTIgTWF0dCBZb3JrXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuXG52YXIgcm9vdCA9IHRoaXM7XG5cbnZhciBmdXp6eSA9IHt9O1xuXG4vLyBVc2UgaW4gbm9kZSBvciBpbiBicm93c2VyXG5pZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZnV6enk7XG59IGVsc2Uge1xuICByb290LmZ1enp5ID0gZnV6enk7XG59XG5cbi8vIFJldHVybiBhbGwgZWxlbWVudHMgb2YgYGFycmF5YCB0aGF0IGhhdmUgYSBmdXp6eVxuLy8gbWF0Y2ggYWdhaW5zdCBgcGF0dGVybmAuXG5mdXp6eS5zaW1wbGVGaWx0ZXIgPSBmdW5jdGlvbihwYXR0ZXJuLCBhcnJheSkge1xuICByZXR1cm4gYXJyYXkuZmlsdGVyKGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHJldHVybiBmdXp6eS50ZXN0KHBhdHRlcm4sIHN0cmluZyk7XG4gIH0pO1xufTtcblxuLy8gRG9lcyBgcGF0dGVybmAgZnV6enkgbWF0Y2ggYHN0cmluZ2A/XG5mdXp6eS50ZXN0ID0gZnVuY3Rpb24ocGF0dGVybiwgc3RyaW5nKSB7XG4gIHJldHVybiBmdXp6eS5tYXRjaChwYXR0ZXJuLCBzdHJpbmcpICE9PSBudWxsO1xufTtcblxuLy8gSWYgYHBhdHRlcm5gIG1hdGNoZXMgYHN0cmluZ2AsIHdyYXAgZWFjaCBtYXRjaGluZyBjaGFyYWN0ZXJcbi8vIGluIGBvcHRzLnByZWAgYW5kIGBvcHRzLnBvc3RgLiBJZiBubyBtYXRjaCwgcmV0dXJuIG51bGxcbmZ1enp5Lm1hdGNoID0gZnVuY3Rpb24ocGF0dGVybiwgc3RyaW5nLCBvcHRzKSB7XG4gIG9wdHMgPSBvcHRzIHx8IHt9O1xuICB2YXIgcGF0dGVybklkeCA9IDBcbiAgICAsIHJlc3VsdCA9IFtdXG4gICAgLCBsZW4gPSBzdHJpbmcubGVuZ3RoXG4gICAgLCB0b3RhbFNjb3JlID0gMFxuICAgICwgY3VyclNjb3JlID0gMFxuICAgIC8vIHByZWZpeFxuICAgICwgcHJlID0gb3B0cy5wcmUgfHwgJydcbiAgICAvLyBzdWZmaXhcbiAgICAsIHBvc3QgPSBvcHRzLnBvc3QgfHwgJydcbiAgICAvLyBTdHJpbmcgdG8gY29tcGFyZSBhZ2FpbnN0LiBUaGlzIG1pZ2h0IGJlIGEgbG93ZXJjYXNlIHZlcnNpb24gb2YgdGhlXG4gICAgLy8gcmF3IHN0cmluZ1xuICAgICwgY29tcGFyZVN0cmluZyA9ICBvcHRzLmNhc2VTZW5zaXRpdmUgJiYgc3RyaW5nIHx8IHN0cmluZy50b0xvd2VyQ2FzZSgpXG4gICAgLCBjaCwgY29tcGFyZUNoYXI7XG5cbiAgcGF0dGVybiA9IG9wdHMuY2FzZVNlbnNpdGl2ZSAmJiBwYXR0ZXJuIHx8IHBhdHRlcm4udG9Mb3dlckNhc2UoKTtcblxuICAvLyBGb3IgZWFjaCBjaGFyYWN0ZXIgaW4gdGhlIHN0cmluZywgZWl0aGVyIGFkZCBpdCB0byB0aGUgcmVzdWx0XG4gIC8vIG9yIHdyYXAgaW4gdGVtcGxhdGUgaWYgaXQncyB0aGUgbmV4dCBzdHJpbmcgaW4gdGhlIHBhdHRlcm5cbiAgZm9yKHZhciBpZHggPSAwOyBpZHggPCBsZW47IGlkeCsrKSB7XG4gICAgY2ggPSBzdHJpbmdbaWR4XTtcbiAgICBpZihjb21wYXJlU3RyaW5nW2lkeF0gPT09IHBhdHRlcm5bcGF0dGVybklkeF0pIHtcbiAgICAgIGNoID0gcHJlICsgY2ggKyBwb3N0O1xuICAgICAgcGF0dGVybklkeCArPSAxO1xuXG4gICAgICAvLyBjb25zZWN1dGl2ZSBjaGFyYWN0ZXJzIHNob3VsZCBpbmNyZWFzZSB0aGUgc2NvcmUgbW9yZSB0aGFuIGxpbmVhcmx5XG4gICAgICBjdXJyU2NvcmUgKz0gMSArIGN1cnJTY29yZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VyclNjb3JlID0gMDtcbiAgICB9XG4gICAgdG90YWxTY29yZSArPSBjdXJyU2NvcmU7XG4gICAgcmVzdWx0W3Jlc3VsdC5sZW5ndGhdID0gY2g7XG4gIH1cblxuICAvLyByZXR1cm4gcmVuZGVyZWQgc3RyaW5nIGlmIHdlIGhhdmUgYSBtYXRjaCBmb3IgZXZlcnkgY2hhclxuICBpZihwYXR0ZXJuSWR4ID09PSBwYXR0ZXJuLmxlbmd0aCkge1xuICAgIHJldHVybiB7cmVuZGVyZWQ6IHJlc3VsdC5qb2luKCcnKSwgc2NvcmU6IHRvdGFsU2NvcmV9O1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59O1xuXG4vLyBUaGUgbm9ybWFsIGVudHJ5IHBvaW50LiBGaWx0ZXJzIGBhcnJgIGZvciBtYXRjaGVzIGFnYWluc3QgYHBhdHRlcm5gLlxuLy8gSXQgcmV0dXJucyBhbiBhcnJheSB3aXRoIG1hdGNoaW5nIHZhbHVlcyBvZiB0aGUgdHlwZTpcbi8vXG4vLyAgICAgW3tcbi8vICAgICAgICAgc3RyaW5nOiAgICc8Yj5sYWgnIC8vIFRoZSByZW5kZXJlZCBzdHJpbmdcbi8vICAgICAgICwgaW5kZXg6ICAgIDIgICAgICAgIC8vIFRoZSBpbmRleCBvZiB0aGUgZWxlbWVudCBpbiBgYXJyYFxuLy8gICAgICAgLCBvcmlnaW5hbDogJ2JsYWgnICAgLy8gVGhlIG9yaWdpbmFsIGVsZW1lbnQgaW4gYGFycmBcbi8vICAgICB9XVxuLy9cbi8vIGBvcHRzYCBpcyBhbiBvcHRpb25hbCBhcmd1bWVudCBiYWcuIERldGFpbHM6XG4vL1xuLy8gICAgb3B0cyA9IHtcbi8vICAgICAgICAvLyBzdHJpbmcgdG8gcHV0IGJlZm9yZSBhIG1hdGNoaW5nIGNoYXJhY3RlclxuLy8gICAgICAgIHByZTogICAgICc8Yj4nXG4vL1xuLy8gICAgICAgIC8vIHN0cmluZyB0byBwdXQgYWZ0ZXIgbWF0Y2hpbmcgY2hhcmFjdGVyXG4vLyAgICAgICwgcG9zdDogICAgJzwvYj4nXG4vL1xuLy8gICAgICAgIC8vIE9wdGlvbmFsIGZ1bmN0aW9uLiBJbnB1dCBpcyBhbiBlbnRyeSBpbiB0aGUgZ2l2ZW4gYXJyYCxcbi8vICAgICAgICAvLyBvdXRwdXQgc2hvdWxkIGJlIHRoZSBzdHJpbmcgdG8gdGVzdCBgcGF0dGVybmAgYWdhaW5zdC5cbi8vICAgICAgICAvLyBJbiB0aGlzIGV4YW1wbGUsIGlmIGBhcnIgPSBbe2NyeWluZzogJ2tvYWxhJ31dYCB3ZSB3b3VsZCByZXR1cm5cbi8vICAgICAgICAvLyAna29hbGEnLlxuLy8gICAgICAsIGV4dHJhY3Q6IGZ1bmN0aW9uKGFyZykgeyByZXR1cm4gYXJnLmNyeWluZzsgfVxuLy8gICAgfVxuZnV6enkuZmlsdGVyID0gZnVuY3Rpb24ocGF0dGVybiwgYXJyLCBvcHRzKSB7XG4gIG9wdHMgPSBvcHRzIHx8IHt9O1xuICByZXR1cm4gYXJyXG4gICAgLnJlZHVjZShmdW5jdGlvbihwcmV2LCBlbGVtZW50LCBpZHgsIGFycikge1xuICAgICAgdmFyIHN0ciA9IGVsZW1lbnQ7XG4gICAgICBpZihvcHRzLmV4dHJhY3QpIHtcbiAgICAgICAgc3RyID0gb3B0cy5leHRyYWN0KGVsZW1lbnQpO1xuICAgICAgfVxuICAgICAgdmFyIHJlbmRlcmVkID0gZnV6enkubWF0Y2gocGF0dGVybiwgc3RyLCBvcHRzKTtcbiAgICAgIGlmKHJlbmRlcmVkICE9IG51bGwpIHtcbiAgICAgICAgcHJldltwcmV2Lmxlbmd0aF0gPSB7XG4gICAgICAgICAgICBzdHJpbmc6IHJlbmRlcmVkLnJlbmRlcmVkXG4gICAgICAgICAgLCBzY29yZTogcmVuZGVyZWQuc2NvcmVcbiAgICAgICAgICAsIGluZGV4OiBpZHhcbiAgICAgICAgICAsIG9yaWdpbmFsOiBlbGVtZW50XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJldjtcbiAgICB9LCBbXSlcblxuICAgIC8vIFNvcnQgYnkgc2NvcmUuIEJyb3dzZXJzIGFyZSBpbmNvbnNpc3RlbnQgd3J0IHN0YWJsZS91bnN0YWJsZVxuICAgIC8vIHNvcnRpbmcsIHNvIGZvcmNlIHN0YWJsZSBieSB1c2luZyB0aGUgaW5kZXggaW4gdGhlIGNhc2Ugb2YgdGllLlxuICAgIC8vIFNlZSBodHRwOi8vb2ZiLm5ldC9+c2V0aG1sL2lzLXNvcnQtc3RhYmxlLmh0bWxcbiAgICAuc29ydChmdW5jdGlvbihhLGIpIHtcbiAgICAgIHZhciBjb21wYXJlID0gYi5zY29yZSAtIGEuc2NvcmU7XG4gICAgICBpZihjb21wYXJlKSByZXR1cm4gY29tcGFyZTtcbiAgICAgIHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcbiAgICB9KTtcbn07XG5cblxufSgpKTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBsZWZ0UGFkO1xuXG52YXIgY2FjaGUgPSBbXG4gICcnLFxuICAnICcsXG4gICcgICcsXG4gICcgICAnLFxuICAnICAgICcsXG4gICcgICAgICcsXG4gICcgICAgICAnLFxuICAnICAgICAgICcsXG4gICcgICAgICAgICcsXG4gICcgICAgICAgICAnXG5dO1xuXG5mdW5jdGlvbiBsZWZ0UGFkIChzdHIsIGxlbiwgY2gpIHtcbiAgLy8gY29udmVydCBgc3RyYCB0byBgc3RyaW5nYFxuICBzdHIgPSBzdHIgKyAnJztcbiAgLy8gYGxlbmAgaXMgdGhlIGBwYWRgJ3MgbGVuZ3RoIG5vd1xuICBsZW4gPSBsZW4gLSBzdHIubGVuZ3RoO1xuICAvLyBkb2Vzbid0IG5lZWQgdG8gcGFkXG4gIGlmIChsZW4gPD0gMCkgcmV0dXJuIHN0cjtcbiAgLy8gYGNoYCBkZWZhdWx0cyB0byBgJyAnYFxuICBpZiAoIWNoICYmIGNoICE9PSAwKSBjaCA9ICcgJztcbiAgLy8gY29udmVydCBgY2hgIHRvIGBzdHJpbmdgXG4gIGNoID0gY2ggKyAnJztcbiAgLy8gY2FjaGUgY29tbW9uIHVzZSBjYXNlc1xuICBpZiAoY2ggPT09ICcgJyAmJiBsZW4gPCAxMCkgcmV0dXJuIGNhY2hlW2xlbl0gKyBzdHI7XG4gIC8vIGBwYWRgIHN0YXJ0cyB3aXRoIGFuIGVtcHR5IHN0cmluZ1xuICB2YXIgcGFkID0gJyc7XG4gIC8vIGxvb3BcbiAgd2hpbGUgKHRydWUpIHtcbiAgICAvLyBhZGQgYGNoYCB0byBgcGFkYCBpZiBgbGVuYCBpcyBvZGRcbiAgICBpZiAobGVuICYgMSkgcGFkICs9IGNoO1xuICAgIC8vIGRldmlkZSBgbGVuYCBieSAyLCBkaXRjaCB0aGUgZnJhY3Rpb25cbiAgICBsZW4gPj49IDE7XG4gICAgLy8gXCJkb3VibGVcIiB0aGUgYGNoYCBzbyB0aGlzIG9wZXJhdGlvbiBjb3VudCBncm93cyBsb2dhcml0aG1pY2FsbHkgb24gYGxlbmBcbiAgICAvLyBlYWNoIHRpbWUgYGNoYCBpcyBcImRvdWJsZWRcIiwgdGhlIGBsZW5gIHdvdWxkIG5lZWQgdG8gYmUgXCJkb3VibGVkXCIgdG9vXG4gICAgLy8gc2ltaWxhciB0byBmaW5kaW5nIGEgdmFsdWUgaW4gYmluYXJ5IHNlYXJjaCB0cmVlLCBoZW5jZSBPKGxvZyhuKSlcbiAgICBpZiAobGVuKSBjaCArPSBjaDtcbiAgICAvLyBgbGVuYCBpcyAwLCBleGl0IHRoZSBsb29wXG4gICAgZWxzZSBicmVhaztcbiAgfVxuICAvLyBwYWQgYHN0cmAhXG4gIHJldHVybiBwYWQgKyBzdHI7XG59XG4iLCJjb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuY29uc3Qgc2VsZiA9IHt9XG5cbnNlbGYuX2l0ZW1zID0gW11cbnNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ID0gLTFcblxuc2VsZi5ldmVudHMgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5fbm9kZXMgPSB7XG4gIHNlYXJjaDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NlYXJjaCcpLFxuICBpbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpLFxuICBhdXRvY29tcGxldGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUnKVxufVxuXG5zZWxmLmdldFNlbGVjdGVkSXRlbSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHNlbGYuZ2V0SXRlbXMoKSA9PT0gW10pIHJldHVyblxuXG4gIGlmIChzZWxmLmdldFNlbGVjdGVkSXRlbUluZGV4KCkgPT09IC0xKSB7XG4gICAgcmV0dXJuIHNlbGYuZ2V0SXRlbXMoKVswXVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBzZWxmLmdldEl0ZW1zKClbc2VsZi5nZXRTZWxlY3RlZEl0ZW1JbmRleCgpXVxuICB9XG59XG5cbnNlbGYuZ2V0U2VsZWN0ZWRJdGVtSW5kZXggPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleFxufVxuXG5zZWxmLmdldEl0ZW1zID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gc2VsZi5faXRlbXNcbn1cblxuc2VsZi5yZW1vdmVBbGxJdGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgd2hpbGUgKHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5maXJzdENoaWxkKSB7XG4gICAgc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLnJlbW92ZUNoaWxkKHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5maXJzdENoaWxkKVxuICB9XG4gIHNlbGYuX2l0ZW1zID0gW11cbiAgc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggPSAtMVxufVxuXG5zZWxmLmFkZEl0ZW0gPSBmdW5jdGlvbiAoaXRlbSkge1xuICBjb25zdCBsaXN0SXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgbGlzdEl0ZW0udGV4dENvbnRlbnQgPSBpdGVtLnZhbHVlXG4gIHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5hcHBlbmRDaGlsZChsaXN0SXRlbSlcbiAgc2VsZi5faXRlbXMucHVzaChpdGVtKVxufVxuXG5zZWxmLl9tb3ZlU2VsZWN0ZWQgPSBmdW5jdGlvbiAoc2hpZnQpIHtcbiAgaWYgKHNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ICsgc2hpZnQgPj0gc2VsZi5nZXRJdGVtcygpLmxlbmd0aCkge1xuICAgIHNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ID0gLTFcbiAgfSBlbHNlIGlmIChzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleCArIHNoaWZ0IDwgLTEpIHtcbiAgICBzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleCA9IHNlbGYuZ2V0SXRlbXMoKS5sZW5ndGggLSAxXG4gIH0gZWxzZSB7XG4gICAgc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggKz0gc2hpZnRcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZi5nZXRJdGVtcygpLmxlbmd0aDsgaSsrKSB7XG4gICAgc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmNoaWxkcmVuW2ldLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJylcbiAgfVxuICBpZiAoc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggPj0gMCkge1xuICAgIHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZVxuICAgICAgICAuY2hpbGRyZW5bc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXhdLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJylcbiAgfVxufVxuXG5zZWxmLl9oYW5kbGVJdGVtQ2xpY2sgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgaWYgKCFzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgcmV0dXJuXG4gIGNvbnN0IGl0ZW1JbmRleCA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mXG4gICAgICAuY2FsbChzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuY2hpbGRyZW4sIGV2ZW50LnRhcmdldClcbiAgc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggPSBpdGVtSW5kZXhcbiAgc2VsZi5ldmVudHMuZW1pdCgnc2VsZWN0Jywgc2VsZi5nZXRTZWxlY3RlZEl0ZW0oKSlcbn1cblxuc2VsZi5faGFuZGxlS2V5ZG93biA9IGZ1bmN0aW9uIChldmVudCkge1xuICBpZiAoZXZlbnQua2V5ID09PSAnQXJyb3dEb3duJyB8fCBldmVudC5rZXkgPT09ICdBcnJvd1VwJykge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBpZiAoZXZlbnQua2V5ID09PSAnQXJyb3dEb3duJykge1xuICAgICAgc2VsZi5fbW92ZVNlbGVjdGVkKDEpXG4gICAgfSBlbHNlIGlmIChldmVudC5rZXkgPT09ICdBcnJvd1VwJykge1xuICAgICAgc2VsZi5fbW92ZVNlbGVjdGVkKC0xKVxuICAgIH1cbiAgfVxufVxuXG5zZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxmLl9oYW5kbGVJdGVtQ2xpY2spXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgc2VsZi5faGFuZGxlS2V5ZG93bilcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJjb25zdCBzZWxmID0ge31cblxuc2VsZi5fbm9kZXMgPSB7XG4gIGlucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJylcbn1cblxuc2VsZi5pc1Nob3duID0gZmFsc2Vcblxuc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ25vLWlucHV0JylcbiAgc2VsZi5pc1Nob3duID0gdHJ1ZVxufVxuXG5zZWxmLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbm8taW5wdXQnKVxuICBzZWxmLmlzU2hvd24gPSBmYWxzZVxufVxuXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHNlbGYuaGlkZSlcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJ2YXIgbGVmdFBhZCA9IHJlcXVpcmUoJ2xlZnQtcGFkJylcbnZhciBnZXRXZWVrID0gcmVxdWlyZSgnLi9nZXRXZWVrJylcblxuZnVuY3Rpb24gZ2V0VVJMT2ZVc2VycyAod2Vla09mZnNldCwgdHlwZSwgaWQpIHtcbiAgcmV0dXJuIGAvLyR7d2luZG93LmxvY2F0aW9uLmhvc3R9L21lZXRpbmdwb2ludFByb3h5L1Jvb3N0ZXJzLUFMJTJGZG9jJTJGZGFncm9vc3RlcnMlMkZgICtcbiAgICAgIGAkeyhnZXRXZWVrKCkgKyB3ZWVrT2Zmc2V0KX0lMkYke3R5cGV9JTJGJHt0eXBlfSR7bGVmdFBhZChpZCwgNSwgJzAnKX0uaHRtYFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFVSTE9mVXNlcnNcbiIsIi8vIGNvcGllZCBmcm9tIGh0dHA6Ly93d3cubWVldGluZ3BvaW50bWNvLm5sL1Jvb3N0ZXJzLUFML2RvYy9kYWdyb29zdGVycy91bnRpc3NjcmlwdHMuanMsXG4vLyB3ZXJlIHVzaW5nIHRoZSBzYW1lIGNvZGUgYXMgdGhleSBkbyB0byBiZSBzdXJlIHRoYXQgd2UgYWx3YXlzIGdldCB0aGUgc2FtZVxuLy8gd2VlayBudW1iZXIuXG5mdW5jdGlvbiBnZXRXZWVrICgpIHtcbiAgLy8gQ3JlYXRlIGEgY29weSBvZiB0aGlzIGRhdGUgb2JqZWN0XG4gIGNvbnN0IHRhcmdldCA9IG5ldyBEYXRlKClcblxuICAvLyBJU08gd2VlayBkYXRlIHdlZWtzIHN0YXJ0IG9uIG1vbmRheVxuICAvLyBzbyBjb3JyZWN0IHRoZSBkYXkgbnVtYmVyXG4gIGNvbnN0IGRheU5yID0gKHRhcmdldC5nZXREYXkoKSArIDYpICUgN1xuXG4gIC8vIElTTyA4NjAxIHN0YXRlcyB0aGF0IHdlZWsgMSBpcyB0aGUgd2Vla1xuICAvLyB3aXRoIHRoZSBmaXJzdCB0aHVyc2RheSBvZiB0aGF0IHllYXIuXG4gIC8vIFNldCB0aGUgdGFyZ2V0IGRhdGUgdG8gdGhlIHRodXJzZGF5IGluIHRoZSB0YXJnZXQgd2Vla1xuICB0YXJnZXQuc2V0RGF0ZSh0YXJnZXQuZ2V0RGF0ZSgpIC0gZGF5TnIgKyAzKVxuXG4gIC8vIFN0b3JlIHRoZSBtaWxsaXNlY29uZCB2YWx1ZSBvZiB0aGUgdGFyZ2V0IGRhdGVcbiAgY29uc3QgZmlyc3RUaHVyc2RheSA9IHRhcmdldC52YWx1ZU9mKClcblxuICAvLyBTZXQgdGhlIHRhcmdldCB0byB0aGUgZmlyc3QgdGh1cnNkYXkgb2YgdGhlIHllYXJcbiAgLy8gRmlyc3Qgc2V0IHRoZSB0YXJnZXQgdG8gamFudWFyeSBmaXJzdFxuICB0YXJnZXQuc2V0TW9udGgoMCwgMSlcbiAgLy8gTm90IGEgdGh1cnNkYXk/IENvcnJlY3QgdGhlIGRhdGUgdG8gdGhlIG5leHQgdGh1cnNkYXlcbiAgaWYgKHRhcmdldC5nZXREYXkoKSAhPT0gNCkge1xuICAgIHRhcmdldC5zZXRNb250aCgwLCAxICsgKCg0IC0gdGFyZ2V0LmdldERheSgpKSArIDcpICUgNylcbiAgfVxuXG4gIC8vIFRoZSB3ZWVrbnVtYmVyIGlzIHRoZSBudW1iZXIgb2Ygd2Vla3MgYmV0d2VlbiB0aGVcbiAgLy8gZmlyc3QgdGh1cnNkYXkgb2YgdGhlIHllYXIgYW5kIHRoZSB0aHVyc2RheSBpbiB0aGUgdGFyZ2V0IHdlZWtcbiAgcmV0dXJuIDEgKyBNYXRoLmNlaWwoKGZpcnN0VGh1cnNkYXkgLSB0YXJnZXQpIC8gNjA0ODAwMDAwKSAvLyA2MDQ4MDAwMDAgPSA3ICogMjQgKiAzNjAwICogMTAwMFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFdlZWtcbiIsImNvbnN0IGZyb250cGFnZSA9IHJlcXVpcmUoJy4vZnJvbnRwYWdlJylcbnJlcXVpcmUoJy4vc2VhcmNoJylcblxuZnJvbnRwYWdlLnNob3coKVxuXG5kb2N1bWVudC5ib2R5LnN0eWxlLm9wYWNpdHkgPSAxXG4iLCJjb25zdCBnZXRVUkxPZlVzZXIgPSByZXF1aXJlKCcuL2dldFVSTE9mVXNlcicpXG5cbmNvbnN0IHNlbGYgPSB7fVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgc2NoZWR1bGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzY2hlZHVsZScpXG59XG5cbnNlbGYuX3BhcnNlTWVldGluZ3BvaW50SFRNTCA9IGZ1bmN0aW9uIChodG1sU3RyKSB7XG4gIGNvbnN0IGh0bWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdodG1sJylcbiAgaHRtbC5pbm5lckhUTUwgPSBodG1sU3RyXG4gIGNvbnN0IGNlbnRlck5vZGUgPSBodG1sLnF1ZXJ5U2VsZWN0b3IoJ2NlbnRlcicpXG4gIHJldHVybiBjZW50ZXJOb2RlXG59XG5cbnNlbGYuX2hhbmRsZUxvYWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgY29uc3QgcmVxdWVzdCA9IGV2ZW50LnRhcmdldFxuICBpZiAocmVxdWVzdC5zdGF0dXMgPCAyMDAgfHwgcmVxdWVzdC5zdGF0dXMgPj0gNDAwKSB7XG4gICAgc2VsZi5faGFuZGxlRXJyb3IoZXZlbnQpXG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgZG9jdW1lbnQgPSBzZWxmLl9wYXJzZU1lZXRpbmdwb2ludEhUTUwocmVxdWVzdC5yZXNwb25zZSlcbiAgc2VsZi5fbm9kZXMuc2NoZWR1bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQpXG59XG5cbnNlbGYuX2hhbmRsZUVycm9yID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGNvbnN0IHJlcXVlc3QgPSBldmVudC50YXJnZXRcbiAgY29uc29sZS5lcnJvcihyZXF1ZXN0KVxufVxuXG5zZWxmLnZpZXdJdGVtID0gZnVuY3Rpb24gKG9mZnNldCwgc2VsZWN0ZWRVc2VyKSB7XG4gIGNvbnN0IHVybCA9IGdldFVSTE9mVXNlcihvZmZzZXQsIHNlbGVjdGVkVXNlci50eXBlLCBzZWxlY3RlZFVzZXIuaW5kZXggKyAxKVxuXG4gIHdoaWxlIChzZWxmLl9ub2Rlcy5zY2hlZHVsZS5maXJzdENoaWxkKSB7XG4gICAgc2VsZi5fbm9kZXMuc2NoZWR1bGUucmVtb3ZlQ2hpbGQoc2VsZi5fbm9kZXMuc2NoZWR1bGUuZmlyc3RDaGlsZClcbiAgfVxuXG4gIGNvbnN0IHJlcXVlc3QgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KClcbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgc2VsZi5faGFuZGxlTG9hZClcbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHNlbGYuX2hhbmRsZUVycm9yKVxuICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSlcbiAgcmVxdWVzdC5zZW5kKClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCIvKiBnbG9iYWwgVVNFUlMgKi9cblxuY29uc3QgZnV6enkgPSByZXF1aXJlKCdmdXp6eScpXG5jb25zdCBhdXRvY29tcGxldGUgPSByZXF1aXJlKCcuL2F1dG9jb21wbGV0ZScpXG5jb25zdCBzY2hlZHVsZSA9IHJlcXVpcmUoJy4vc2NoZWR1bGUnKVxuXG5jb25zdCBzZWxmID0ge31cblxuc2VsZi5fbm9kZXMgPSB7XG4gIHNlYXJjaDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NlYXJjaCcpLFxuICBpbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpXG59XG5cbnNlbGYuc3VibWl0ID0gZnVuY3Rpb24gKCkge1xuICBzZWxmLl9ub2Rlcy5pbnB1dC5ibHVyKClcblxuICBjb25zdCBzZWxlY3RlZEl0ZW0gPSBhdXRvY29tcGxldGUuZ2V0U2VsZWN0ZWRJdGVtKClcbiAgc2VsZi5fbm9kZXMuaW5wdXQudmFsdWUgPSBzZWxlY3RlZEl0ZW0udmFsdWVcbiAgc2NoZWR1bGUudmlld0l0ZW0oMCwgc2VsZWN0ZWRJdGVtKVxuXG4gIGF1dG9jb21wbGV0ZS5yZW1vdmVBbGxJdGVtcygpXG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnc2VhcmNoZWQnKVxufVxuXG5zZWxmLl9oYW5kbGVTdWJtaXQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICBzZWxmLnN1Ym1pdCgpXG59XG5cbnNlbGYuX2NhbGN1bGF0ZSA9IGZ1bmN0aW9uIChzZWFyY2hUZXJtKSB7XG4gIGNvbnN0IGFsbFJlc3VsdHMgPSBmdXp6eS5maWx0ZXIoc2VhcmNoVGVybSwgVVNFUlMsIHtcbiAgICBleHRyYWN0OiBpdGVtID0+IGl0ZW0udmFsdWVcbiAgfSlcbiAgY29uc3QgZmlyc3RSZXN1bHRzID0gYWxsUmVzdWx0cy5zbGljZSgwLCA3KVxuXG4gIGNvbnN0IG9yaWdpbmFsUmVzdWx0cyA9IGZpcnN0UmVzdWx0cy5tYXAocmVzdWx0ID0+IHJlc3VsdC5vcmlnaW5hbClcblxuICByZXR1cm4gb3JpZ2luYWxSZXN1bHRzXG59XG5cbnNlbGYuX2hhbmRsZVRleHRVcGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHJlc3VsdHMgPSBzZWxmLl9jYWxjdWxhdGUoc2VsZi5fbm9kZXMuaW5wdXQudmFsdWUpXG5cbiAgYXV0b2NvbXBsZXRlLnJlbW92ZUFsbEl0ZW1zKClcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgYXV0b2NvbXBsZXRlLmFkZEl0ZW0ocmVzdWx0c1tpXSlcbiAgfVxufVxuXG5hdXRvY29tcGxldGUuZXZlbnRzLm9uKCdzZWxlY3QnLCBzZWxmLnN1Ym1pdClcblxuc2VsZi5fbm9kZXMuc2VhcmNoLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIHNlbGYuX2hhbmRsZVN1Ym1pdClcbnNlbGYuX25vZGVzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0Jywgc2VsZi5faGFuZGxlVGV4dFVwZGF0ZSlcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iXX0=
