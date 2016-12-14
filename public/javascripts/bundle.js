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

},{"events":1}],5:[function(require,module,exports){
const self = {};

self.isIE = navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0;

if (self.isIE) {
  self.inputEvent = 'textinput';
} else {
  self.inputEvent = 'input';
}

module.exports = self;

},{}],6:[function(require,module,exports){
/* global USERS */

const EventEmitter = require('events');

const self = new EventEmitter();

self._nodes = {
  toggle: document.querySelector('.fav')
};

self.get = function () {
  const localStorageUser = JSON.parse(window.localStorage.getItem('fav'));
  if (localStorageUser == null) return;

  const correctedUser = USERS.filter(user => user.type === localStorageUser.type && user.value === localStorageUser.value)[0];
  return correctedUser;
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

},{"events":1}],7:[function(require,module,exports){
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

},{"./browserFixToolkit":5}],8:[function(require,module,exports){
const frontpage = require('./frontpage');
const search = require('./search');
const schedule = require('./schedule');
const weekSelector = require('./weekSelector');
const favorite = require('./favorite');

const state = {};

window.state = state;
window.require = require;

frontpage.show();
weekSelector.updateCurrentWeek();

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

window.weekSelector = weekSelector;

document.body.style.opacity = 1;

},{"./favorite":6,"./frontpage":7,"./schedule":9,"./search":10,"./weekSelector":11}],9:[function(require,module,exports){
const leftPad = require('left-pad');
const autocomplete = require('./autocomplete');
const search = require('./search');

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

},{"./autocomplete":4,"./search":10,"left-pad":3}],10:[function(require,module,exports){
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

},{"./autocomplete":4,"./browserFixToolkit":5,"events":1,"fuzzy":2}],11:[function(require,module,exports){
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
  const targetDate = new Date(now.getTime() + self._weekOffset * 604800 * 1000);
  return self.getCurrentWeek(targetDate);
};

self.updateCurrentWeek = function () {
  const selectedWeekNumber = self.getSelectedWeek();
  self._nodes.currentWeekText.textContent = `Week ${ selectedWeekNumber }`;
  if (self.getCurrentWeek(new Date()) !== selectedWeekNumber) {
    self._nodes.currentWeekText.classList.add('changed');
  } else {
    self._nodes.currentWeekText.classList.remove('changed');
  }
  self.emit('weekChanged', selectedWeekNumber);
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

},{"events":1}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9mdXp6eS9saWIvZnV6enkuanMiLCJub2RlX21vZHVsZXMvbGVmdC1wYWQvaW5kZXguanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvYXV0b2NvbXBsZXRlLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2Jyb3dzZXJGaXhUb29sa2l0LmpzIiwicHVibGljL2phdmFzY3JpcHRzL2Zhdm9yaXRlLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2Zyb250cGFnZS5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9tYWluLmpzIiwicHVibGljL2phdmFzY3JpcHRzL3NjaGVkdWxlLmpzIiwicHVibGljL2phdmFzY3JpcHRzL3NlYXJjaC5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy93ZWVrU2VsZWN0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXZsaXN0ZW5lcikpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChldmxpc3RlbmVyKVxuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCIvKlxuICogRnV6enlcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9teW9yay9mdXp6eVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMiBNYXR0IFlvcmtcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG5cbnZhciByb290ID0gdGhpcztcblxudmFyIGZ1enp5ID0ge307XG5cbi8vIFVzZSBpbiBub2RlIG9yIGluIGJyb3dzZXJcbmlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdXp6eTtcbn0gZWxzZSB7XG4gIHJvb3QuZnV6enkgPSBmdXp6eTtcbn1cblxuLy8gUmV0dXJuIGFsbCBlbGVtZW50cyBvZiBgYXJyYXlgIHRoYXQgaGF2ZSBhIGZ1enp5XG4vLyBtYXRjaCBhZ2FpbnN0IGBwYXR0ZXJuYC5cbmZ1enp5LnNpbXBsZUZpbHRlciA9IGZ1bmN0aW9uKHBhdHRlcm4sIGFycmF5KSB7XG4gIHJldHVybiBhcnJheS5maWx0ZXIoZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgcmV0dXJuIGZ1enp5LnRlc3QocGF0dGVybiwgc3RyaW5nKTtcbiAgfSk7XG59O1xuXG4vLyBEb2VzIGBwYXR0ZXJuYCBmdXp6eSBtYXRjaCBgc3RyaW5nYD9cbmZ1enp5LnRlc3QgPSBmdW5jdGlvbihwYXR0ZXJuLCBzdHJpbmcpIHtcbiAgcmV0dXJuIGZ1enp5Lm1hdGNoKHBhdHRlcm4sIHN0cmluZykgIT09IG51bGw7XG59O1xuXG4vLyBJZiBgcGF0dGVybmAgbWF0Y2hlcyBgc3RyaW5nYCwgd3JhcCBlYWNoIG1hdGNoaW5nIGNoYXJhY3RlclxuLy8gaW4gYG9wdHMucHJlYCBhbmQgYG9wdHMucG9zdGAuIElmIG5vIG1hdGNoLCByZXR1cm4gbnVsbFxuZnV6enkubWF0Y2ggPSBmdW5jdGlvbihwYXR0ZXJuLCBzdHJpbmcsIG9wdHMpIHtcbiAgb3B0cyA9IG9wdHMgfHwge307XG4gIHZhciBwYXR0ZXJuSWR4ID0gMFxuICAgICwgcmVzdWx0ID0gW11cbiAgICAsIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgICAsIHRvdGFsU2NvcmUgPSAwXG4gICAgLCBjdXJyU2NvcmUgPSAwXG4gICAgLy8gcHJlZml4XG4gICAgLCBwcmUgPSBvcHRzLnByZSB8fCAnJ1xuICAgIC8vIHN1ZmZpeFxuICAgICwgcG9zdCA9IG9wdHMucG9zdCB8fCAnJ1xuICAgIC8vIFN0cmluZyB0byBjb21wYXJlIGFnYWluc3QuIFRoaXMgbWlnaHQgYmUgYSBsb3dlcmNhc2UgdmVyc2lvbiBvZiB0aGVcbiAgICAvLyByYXcgc3RyaW5nXG4gICAgLCBjb21wYXJlU3RyaW5nID0gIG9wdHMuY2FzZVNlbnNpdGl2ZSAmJiBzdHJpbmcgfHwgc3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAsIGNoLCBjb21wYXJlQ2hhcjtcblxuICBwYXR0ZXJuID0gb3B0cy5jYXNlU2Vuc2l0aXZlICYmIHBhdHRlcm4gfHwgcGF0dGVybi50b0xvd2VyQ2FzZSgpO1xuXG4gIC8vIEZvciBlYWNoIGNoYXJhY3RlciBpbiB0aGUgc3RyaW5nLCBlaXRoZXIgYWRkIGl0IHRvIHRoZSByZXN1bHRcbiAgLy8gb3Igd3JhcCBpbiB0ZW1wbGF0ZSBpZiBpdCdzIHRoZSBuZXh0IHN0cmluZyBpbiB0aGUgcGF0dGVyblxuICBmb3IodmFyIGlkeCA9IDA7IGlkeCA8IGxlbjsgaWR4KyspIHtcbiAgICBjaCA9IHN0cmluZ1tpZHhdO1xuICAgIGlmKGNvbXBhcmVTdHJpbmdbaWR4XSA9PT0gcGF0dGVybltwYXR0ZXJuSWR4XSkge1xuICAgICAgY2ggPSBwcmUgKyBjaCArIHBvc3Q7XG4gICAgICBwYXR0ZXJuSWR4ICs9IDE7XG5cbiAgICAgIC8vIGNvbnNlY3V0aXZlIGNoYXJhY3RlcnMgc2hvdWxkIGluY3JlYXNlIHRoZSBzY29yZSBtb3JlIHRoYW4gbGluZWFybHlcbiAgICAgIGN1cnJTY29yZSArPSAxICsgY3VyclNjb3JlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyU2NvcmUgPSAwO1xuICAgIH1cbiAgICB0b3RhbFNjb3JlICs9IGN1cnJTY29yZTtcbiAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aF0gPSBjaDtcbiAgfVxuXG4gIC8vIHJldHVybiByZW5kZXJlZCBzdHJpbmcgaWYgd2UgaGF2ZSBhIG1hdGNoIGZvciBldmVyeSBjaGFyXG4gIGlmKHBhdHRlcm5JZHggPT09IHBhdHRlcm4ubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHtyZW5kZXJlZDogcmVzdWx0LmpvaW4oJycpLCBzY29yZTogdG90YWxTY29yZX07XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8vIFRoZSBub3JtYWwgZW50cnkgcG9pbnQuIEZpbHRlcnMgYGFycmAgZm9yIG1hdGNoZXMgYWdhaW5zdCBgcGF0dGVybmAuXG4vLyBJdCByZXR1cm5zIGFuIGFycmF5IHdpdGggbWF0Y2hpbmcgdmFsdWVzIG9mIHRoZSB0eXBlOlxuLy9cbi8vICAgICBbe1xuLy8gICAgICAgICBzdHJpbmc6ICAgJzxiPmxhaCcgLy8gVGhlIHJlbmRlcmVkIHN0cmluZ1xuLy8gICAgICAgLCBpbmRleDogICAgMiAgICAgICAgLy8gVGhlIGluZGV4IG9mIHRoZSBlbGVtZW50IGluIGBhcnJgXG4vLyAgICAgICAsIG9yaWdpbmFsOiAnYmxhaCcgICAvLyBUaGUgb3JpZ2luYWwgZWxlbWVudCBpbiBgYXJyYFxuLy8gICAgIH1dXG4vL1xuLy8gYG9wdHNgIGlzIGFuIG9wdGlvbmFsIGFyZ3VtZW50IGJhZy4gRGV0YWlsczpcbi8vXG4vLyAgICBvcHRzID0ge1xuLy8gICAgICAgIC8vIHN0cmluZyB0byBwdXQgYmVmb3JlIGEgbWF0Y2hpbmcgY2hhcmFjdGVyXG4vLyAgICAgICAgcHJlOiAgICAgJzxiPidcbi8vXG4vLyAgICAgICAgLy8gc3RyaW5nIHRvIHB1dCBhZnRlciBtYXRjaGluZyBjaGFyYWN0ZXJcbi8vICAgICAgLCBwb3N0OiAgICAnPC9iPidcbi8vXG4vLyAgICAgICAgLy8gT3B0aW9uYWwgZnVuY3Rpb24uIElucHV0IGlzIGFuIGVudHJ5IGluIHRoZSBnaXZlbiBhcnJgLFxuLy8gICAgICAgIC8vIG91dHB1dCBzaG91bGQgYmUgdGhlIHN0cmluZyB0byB0ZXN0IGBwYXR0ZXJuYCBhZ2FpbnN0LlxuLy8gICAgICAgIC8vIEluIHRoaXMgZXhhbXBsZSwgaWYgYGFyciA9IFt7Y3J5aW5nOiAna29hbGEnfV1gIHdlIHdvdWxkIHJldHVyblxuLy8gICAgICAgIC8vICdrb2FsYScuXG4vLyAgICAgICwgZXh0cmFjdDogZnVuY3Rpb24oYXJnKSB7IHJldHVybiBhcmcuY3J5aW5nOyB9XG4vLyAgICB9XG5mdXp6eS5maWx0ZXIgPSBmdW5jdGlvbihwYXR0ZXJuLCBhcnIsIG9wdHMpIHtcbiAgb3B0cyA9IG9wdHMgfHwge307XG4gIHJldHVybiBhcnJcbiAgICAucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGVsZW1lbnQsIGlkeCwgYXJyKSB7XG4gICAgICB2YXIgc3RyID0gZWxlbWVudDtcbiAgICAgIGlmKG9wdHMuZXh0cmFjdCkge1xuICAgICAgICBzdHIgPSBvcHRzLmV4dHJhY3QoZWxlbWVudCk7XG4gICAgICB9XG4gICAgICB2YXIgcmVuZGVyZWQgPSBmdXp6eS5tYXRjaChwYXR0ZXJuLCBzdHIsIG9wdHMpO1xuICAgICAgaWYocmVuZGVyZWQgIT0gbnVsbCkge1xuICAgICAgICBwcmV2W3ByZXYubGVuZ3RoXSA9IHtcbiAgICAgICAgICAgIHN0cmluZzogcmVuZGVyZWQucmVuZGVyZWRcbiAgICAgICAgICAsIHNjb3JlOiByZW5kZXJlZC5zY29yZVxuICAgICAgICAgICwgaW5kZXg6IGlkeFxuICAgICAgICAgICwgb3JpZ2luYWw6IGVsZW1lbnRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcmV2O1xuICAgIH0sIFtdKVxuXG4gICAgLy8gU29ydCBieSBzY29yZS4gQnJvd3NlcnMgYXJlIGluY29uc2lzdGVudCB3cnQgc3RhYmxlL3Vuc3RhYmxlXG4gICAgLy8gc29ydGluZywgc28gZm9yY2Ugc3RhYmxlIGJ5IHVzaW5nIHRoZSBpbmRleCBpbiB0aGUgY2FzZSBvZiB0aWUuXG4gICAgLy8gU2VlIGh0dHA6Ly9vZmIubmV0L35zZXRobWwvaXMtc29ydC1zdGFibGUuaHRtbFxuICAgIC5zb3J0KGZ1bmN0aW9uKGEsYikge1xuICAgICAgdmFyIGNvbXBhcmUgPSBiLnNjb3JlIC0gYS5zY29yZTtcbiAgICAgIGlmKGNvbXBhcmUpIHJldHVybiBjb21wYXJlO1xuICAgICAgcmV0dXJuIGEuaW5kZXggLSBiLmluZGV4O1xuICAgIH0pO1xufTtcblxuXG59KCkpO1xuXG4iLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGxlZnRQYWQ7XG5cbnZhciBjYWNoZSA9IFtcbiAgJycsXG4gICcgJyxcbiAgJyAgJyxcbiAgJyAgICcsXG4gICcgICAgJyxcbiAgJyAgICAgJyxcbiAgJyAgICAgICcsXG4gICcgICAgICAgJyxcbiAgJyAgICAgICAgJyxcbiAgJyAgICAgICAgICdcbl07XG5cbmZ1bmN0aW9uIGxlZnRQYWQgKHN0ciwgbGVuLCBjaCkge1xuICAvLyBjb252ZXJ0IGBzdHJgIHRvIGBzdHJpbmdgXG4gIHN0ciA9IHN0ciArICcnO1xuICAvLyBgbGVuYCBpcyB0aGUgYHBhZGAncyBsZW5ndGggbm93XG4gIGxlbiA9IGxlbiAtIHN0ci5sZW5ndGg7XG4gIC8vIGRvZXNuJ3QgbmVlZCB0byBwYWRcbiAgaWYgKGxlbiA8PSAwKSByZXR1cm4gc3RyO1xuICAvLyBgY2hgIGRlZmF1bHRzIHRvIGAnICdgXG4gIGlmICghY2ggJiYgY2ggIT09IDApIGNoID0gJyAnO1xuICAvLyBjb252ZXJ0IGBjaGAgdG8gYHN0cmluZ2BcbiAgY2ggPSBjaCArICcnO1xuICAvLyBjYWNoZSBjb21tb24gdXNlIGNhc2VzXG4gIGlmIChjaCA9PT0gJyAnICYmIGxlbiA8IDEwKSByZXR1cm4gY2FjaGVbbGVuXSArIHN0cjtcbiAgLy8gYHBhZGAgc3RhcnRzIHdpdGggYW4gZW1wdHkgc3RyaW5nXG4gIHZhciBwYWQgPSAnJztcbiAgLy8gbG9vcFxuICB3aGlsZSAodHJ1ZSkge1xuICAgIC8vIGFkZCBgY2hgIHRvIGBwYWRgIGlmIGBsZW5gIGlzIG9kZFxuICAgIGlmIChsZW4gJiAxKSBwYWQgKz0gY2g7XG4gICAgLy8gZGV2aWRlIGBsZW5gIGJ5IDIsIGRpdGNoIHRoZSBmcmFjdGlvblxuICAgIGxlbiA+Pj0gMTtcbiAgICAvLyBcImRvdWJsZVwiIHRoZSBgY2hgIHNvIHRoaXMgb3BlcmF0aW9uIGNvdW50IGdyb3dzIGxvZ2FyaXRobWljYWxseSBvbiBgbGVuYFxuICAgIC8vIGVhY2ggdGltZSBgY2hgIGlzIFwiZG91YmxlZFwiLCB0aGUgYGxlbmAgd291bGQgbmVlZCB0byBiZSBcImRvdWJsZWRcIiB0b29cbiAgICAvLyBzaW1pbGFyIHRvIGZpbmRpbmcgYSB2YWx1ZSBpbiBiaW5hcnkgc2VhcmNoIHRyZWUsIGhlbmNlIE8obG9nKG4pKVxuICAgIGlmIChsZW4pIGNoICs9IGNoO1xuICAgIC8vIGBsZW5gIGlzIDAsIGV4aXQgdGhlIGxvb3BcbiAgICBlbHNlIGJyZWFrO1xuICB9XG4gIC8vIHBhZCBgc3RyYCFcbiAgcmV0dXJuIHBhZCArIHN0cjtcbn1cbiIsImNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpXG5cbmNvbnN0IHNlbGYgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuc2VsZi5faXRlbXMgPSBbXVxuc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggPSAtMVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgc2VhcmNoOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2VhcmNoJyksXG4gIGlucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJyksXG4gIGF1dG9jb21wbGV0ZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZScpXG59XG5cbnNlbGYuZ2V0U2VsZWN0ZWRJdGVtID0gZnVuY3Rpb24gKCkge1xuICBpZiAoc2VsZi5nZXRJdGVtcygpID09PSBbXSkgcmV0dXJuXG5cbiAgaWYgKHNlbGYuZ2V0U2VsZWN0ZWRJdGVtSW5kZXgoKSA9PT0gLTEpIHtcbiAgICByZXR1cm4gc2VsZi5nZXRJdGVtcygpWzBdXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHNlbGYuZ2V0SXRlbXMoKVtzZWxmLmdldFNlbGVjdGVkSXRlbUluZGV4KCldXG4gIH1cbn1cblxuc2VsZi5nZXRTZWxlY3RlZEl0ZW1JbmRleCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHNlbGYuX3NlbGVjdGVkSXRlbUluZGV4XG59XG5cbnNlbGYuZ2V0SXRlbXMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBzZWxmLl9pdGVtc1xufVxuXG5zZWxmLnJlbW92ZUFsbEl0ZW1zID0gZnVuY3Rpb24gKCkge1xuICB3aGlsZSAoc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmZpcnN0Q2hpbGQpIHtcbiAgICBzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUucmVtb3ZlQ2hpbGQoc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmZpcnN0Q2hpbGQpXG4gIH1cbiAgc2VsZi5faXRlbXMgPSBbXVxuICBzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleCA9IC0xXG59XG5cbnNlbGYuYWRkSXRlbSA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIGNvbnN0IGxpc3RJdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKVxuICBsaXN0SXRlbS50ZXh0Q29udGVudCA9IGl0ZW0udmFsdWVcbiAgc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmFwcGVuZENoaWxkKGxpc3RJdGVtKVxuICBzZWxmLl9pdGVtcy5wdXNoKGl0ZW0pXG59XG5cbnNlbGYuX21vdmVTZWxlY3RlZCA9IGZ1bmN0aW9uIChzaGlmdCkge1xuICBpZiAoc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggKyBzaGlmdCA+PSBzZWxmLmdldEl0ZW1zKCkubGVuZ3RoKSB7XG4gICAgc2VsZi5fc2VsZWN0ZWRJdGVtSW5kZXggPSAtMVxuICB9IGVsc2UgaWYgKHNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ICsgc2hpZnQgPCAtMSkge1xuICAgIHNlbGYuX3NlbGVjdGVkSXRlbUluZGV4ID0gc2VsZi5nZXRJdGVtcygpLmxlbmd0aCAtIDFcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleCArPSBzaGlmdFxuICB9XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxmLmdldEl0ZW1zKCkubGVuZ3RoOyBpKyspIHtcbiAgICBzZWxmLl9ub2Rlcy5hdXRvY29tcGxldGUuY2hpbGRyZW5baV0uY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKVxuICB9XG4gIGlmIChzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleCA+PSAwKSB7XG4gICAgc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlXG4gICAgICAgIC5jaGlsZHJlbltzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleF0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKVxuICB9XG59XG5cbnNlbGYuX2hhbmRsZUl0ZW1DbGljayA9IGZ1bmN0aW9uIChldmVudCkge1xuICBpZiAoIXNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5jb250YWlucyhldmVudC50YXJnZXQpKSByZXR1cm5cbiAgY29uc3QgaXRlbUluZGV4ID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2ZcbiAgICAgIC5jYWxsKHNlbGYuX25vZGVzLmF1dG9jb21wbGV0ZS5jaGlsZHJlbiwgZXZlbnQudGFyZ2V0KVxuICBzZWxmLl9zZWxlY3RlZEl0ZW1JbmRleCA9IGl0ZW1JbmRleFxuICBzZWxmLmVtaXQoJ3NlbGVjdCcsIHNlbGYuZ2V0U2VsZWN0ZWRJdGVtKCkpXG59XG5cbnNlbGYuX2hhbmRsZUtleWRvd24gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgaWYgKGV2ZW50LmtleSA9PT0gJ0Fycm93RG93bicgfHwgZXZlbnQua2V5ID09PSAnQXJyb3dVcCcpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaWYgKGV2ZW50LmtleSA9PT0gJ0Fycm93RG93bicpIHtcbiAgICAgIHNlbGYuX21vdmVTZWxlY3RlZCgxKVxuICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09PSAnQXJyb3dVcCcpIHtcbiAgICAgIHNlbGYuX21vdmVTZWxlY3RlZCgtMSlcbiAgICB9XG4gIH1cbn1cblxuc2VsZi5fbm9kZXMuYXV0b2NvbXBsZXRlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2VsZi5faGFuZGxlSXRlbUNsaWNrKVxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHNlbGYuX2hhbmRsZUtleWRvd24pXG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwiY29uc3Qgc2VsZiA9IHt9XG5cbnNlbGYuaXNJRSA9IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignTVNJRScpICE9PSAtMSB8fFxuICAgICAgICAgICAgbmF2aWdhdG9yLmFwcFZlcnNpb24uaW5kZXhPZignVHJpZGVudC8nKSA+IDBcblxuaWYgKHNlbGYuaXNJRSkge1xuICBzZWxmLmlucHV0RXZlbnQgPSAndGV4dGlucHV0J1xufSBlbHNlIHtcbiAgc2VsZi5pbnB1dEV2ZW50ID0gJ2lucHV0J1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGZcbiIsIi8qIGdsb2JhbCBVU0VSUyAqL1xuXG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKVxuXG5jb25zdCBzZWxmID0gbmV3IEV2ZW50RW1pdHRlcigpXG5cbnNlbGYuX25vZGVzID0ge1xuICB0b2dnbGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mYXYnKVxufVxuXG5zZWxmLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgbG9jYWxTdG9yYWdlVXNlciA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdmYXYnKSlcbiAgaWYgKGxvY2FsU3RvcmFnZVVzZXIgPT0gbnVsbCkgcmV0dXJuXG5cbiAgY29uc3QgY29ycmVjdGVkVXNlciA9IFVTRVJTLmZpbHRlcih1c2VyID0+XG4gICAgICB1c2VyLnR5cGUgPT09IGxvY2FsU3RvcmFnZVVzZXIudHlwZSAmJlxuICAgICAgdXNlci52YWx1ZSA9PT0gbG9jYWxTdG9yYWdlVXNlci52YWx1ZSlbMF1cbiAgcmV0dXJuIGNvcnJlY3RlZFVzZXJcbn1cblxuc2VsZi5zZXQgPSBmdW5jdGlvbiAodXNlcikge1xuICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2ZhdicsIEpTT04uc3RyaW5naWZ5KHVzZXIpKVxuICBzZWxmLl9ub2Rlcy5pbm5lckhUTUwgPSAnJiN4RTgzODsnXG59XG5cbnNlbGYuZGVsZXRlID0gZnVuY3Rpb24gKCkge1xuICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2ZhdicpXG59XG5cbnNlbGYudXBkYXRlRG9tID0gZnVuY3Rpb24gKGlzRmF2b3JpdGUpIHtcbiAgaWYgKGlzRmF2b3JpdGUpIHtcbiAgICBzZWxmLl9ub2Rlcy50b2dnbGUuaW5uZXJIVE1MID0gJyYjeEU4Mzg7J1xuICB9IGVsc2Uge1xuICAgIHNlbGYuX25vZGVzLnRvZ2dsZS5pbm5lckhUTUwgPSAnJiN4RTgzQSdcbiAgfVxufVxuXG5zZWxmLnVwZGF0ZSA9IGZ1bmN0aW9uIChzZWxlY3RlZFVzZXIpIHtcbiAgY29uc3QgY3VycmVudFVzZXIgPSBzZWxmLmdldCgpXG5cbiAgaWYgKGN1cnJlbnRVc2VyID09IG51bGwpIHtcbiAgICBzZWxmLnVwZGF0ZURvbShmYWxzZSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbnN0IGlzRXF1YWwgPSBjdXJyZW50VXNlci50eXBlID09PSBzZWxlY3RlZFVzZXIudHlwZSAmJlxuICAgICAgICAgICAgICAgICAgY3VycmVudFVzZXIuaW5kZXggPT09IHNlbGVjdGVkVXNlci5pbmRleFxuXG4gIHNlbGYudXBkYXRlRG9tKGlzRXF1YWwpXG59XG5cbnNlbGYudG9nZ2xlID0gZnVuY3Rpb24gKHNlbGVjdGVkVXNlcikge1xuICBjb25zdCBjdXJyZW50VXNlciA9IHNlbGYuZ2V0KClcbiAgY29uc3QgaXNFcXVhbCA9IGN1cnJlbnRVc2VyICE9IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRVc2VyLnR5cGUgPT09IHNlbGVjdGVkVXNlci50eXBlICYmXG4gICAgICAgICAgICAgICAgICBjdXJyZW50VXNlci5pbmRleCA9PT0gc2VsZWN0ZWRVc2VyLmluZGV4XG5cbiAgaWYgKGlzRXF1YWwpIHtcbiAgICBzZWxmLmRlbGV0ZSgpXG4gICAgc2VsZi51cGRhdGVEb20oZmFsc2UpXG4gIH0gZWxzZSB7XG4gICAgc2VsZi5zZXQoc2VsZWN0ZWRVc2VyKVxuICAgIHNlbGYudXBkYXRlRG9tKHRydWUpXG4gIH1cbn1cblxuc2VsZi5faGFuZGxlQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHNlbGYuZW1pdCgnY2xpY2snKVxufVxuXG5zZWxmLl9ub2Rlcy50b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxmLl9oYW5kbGVDbGljaylcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJjb25zdCBicm93c2VyRml4VG9vbGtpdCA9IHJlcXVpcmUoJy4vYnJvd3NlckZpeFRvb2xraXQnKVxuXG5jb25zdCBzZWxmID0ge31cblxuc2VsZi5fbm9kZXMgPSB7XG4gIGlucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJylcbn1cblxuc2VsZi5pc1Nob3duID0gZmFsc2Vcblxuc2VsZi5zaG93ID0gZnVuY3Rpb24gKCkge1xuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ25vLWlucHV0JylcbiAgc2VsZi5pc1Nob3duID0gdHJ1ZVxufVxuXG5zZWxmLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbm8taW5wdXQnKVxuICBzZWxmLmlzU2hvd24gPSBmYWxzZVxufVxuXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKGJyb3dzZXJGaXhUb29sa2l0LmlucHV0RXZlbnQsIHNlbGYuaGlkZSlcblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCJjb25zdCBmcm9udHBhZ2UgPSByZXF1aXJlKCcuL2Zyb250cGFnZScpXG5jb25zdCBzZWFyY2ggPSByZXF1aXJlKCcuL3NlYXJjaCcpXG5jb25zdCBzY2hlZHVsZSA9IHJlcXVpcmUoJy4vc2NoZWR1bGUnKVxuY29uc3Qgd2Vla1NlbGVjdG9yID0gcmVxdWlyZSgnLi93ZWVrU2VsZWN0b3InKVxuY29uc3QgZmF2b3JpdGUgPSByZXF1aXJlKCcuL2Zhdm9yaXRlJylcblxuY29uc3Qgc3RhdGUgPSB7fVxuXG53aW5kb3cuc3RhdGUgPSBzdGF0ZVxud2luZG93LnJlcXVpcmUgPSByZXF1aXJlXG5cbmZyb250cGFnZS5zaG93KClcbndlZWtTZWxlY3Rvci51cGRhdGVDdXJyZW50V2VlaygpXG5cbmlmIChmYXZvcml0ZS5nZXQoKSAhPSBudWxsKSB7XG4gIHN0YXRlLnNlbGVjdGVkSXRlbSA9IGZhdm9yaXRlLmdldCgpXG4gIGZhdm9yaXRlLnVwZGF0ZShzdGF0ZS5zZWxlY3RlZEl0ZW0pXG4gIHNjaGVkdWxlLnZpZXdJdGVtKHdlZWtTZWxlY3Rvci5nZXRTZWxlY3RlZFdlZWsoKSwgc3RhdGUuc2VsZWN0ZWRJdGVtKVxufSBlbHNlIHtcbiAgc2VhcmNoLmZvY3VzKClcbn1cblxuc2VhcmNoLm9uKCdzZWFyY2gnLCBmdW5jdGlvbiAoc2VsZWN0ZWRJdGVtKSB7XG4gIHN0YXRlLnNlbGVjdGVkSXRlbSA9IHNlbGVjdGVkSXRlbVxuICBmYXZvcml0ZS51cGRhdGUoc3RhdGUuc2VsZWN0ZWRJdGVtKVxuICBzY2hlZHVsZS52aWV3SXRlbSh3ZWVrU2VsZWN0b3IuZ2V0U2VsZWN0ZWRXZWVrKCksIHN0YXRlLnNlbGVjdGVkSXRlbSlcbn0pXG5cbndlZWtTZWxlY3Rvci5vbignd2Vla0NoYW5nZWQnLCBmdW5jdGlvbiAobmV3V2Vlaykge1xuICBzY2hlZHVsZS52aWV3SXRlbShuZXdXZWVrLCBzdGF0ZS5zZWxlY3RlZEl0ZW0pXG59KVxuXG5mYXZvcml0ZS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gIGZhdm9yaXRlLnRvZ2dsZShzdGF0ZS5zZWxlY3RlZEl0ZW0pXG59KVxuXG53aW5kb3cud2Vla1NlbGVjdG9yID0gd2Vla1NlbGVjdG9yXG5cbmRvY3VtZW50LmJvZHkuc3R5bGUub3BhY2l0eSA9IDFcbiIsImNvbnN0IGxlZnRQYWQgPSByZXF1aXJlKCdsZWZ0LXBhZCcpXG5jb25zdCBhdXRvY29tcGxldGUgPSByZXF1aXJlKCcuL2F1dG9jb21wbGV0ZScpXG5jb25zdCBzZWFyY2ggPSByZXF1aXJlKCcuL3NlYXJjaCcpXG5cbmNvbnN0IHNlbGYgPSB7fVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgc2NoZWR1bGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzY2hlZHVsZScpXG59XG5cbnNlbGYuX3BhcnNlTWVldGluZ3BvaW50SFRNTCA9IGZ1bmN0aW9uIChodG1sU3RyKSB7XG4gIGNvbnN0IGh0bWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdodG1sJylcbiAgaHRtbC5pbm5lckhUTUwgPSBodG1sU3RyXG4gIGNvbnN0IGNlbnRlck5vZGUgPSBodG1sLnF1ZXJ5U2VsZWN0b3IoJ2NlbnRlcicpXG4gIHJldHVybiBjZW50ZXJOb2RlXG59XG5cbnNlbGYuX2hhbmRsZUxvYWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgY29uc3QgcmVxdWVzdCA9IGV2ZW50LnRhcmdldFxuICBpZiAocmVxdWVzdC5zdGF0dXMgPCAyMDAgfHwgcmVxdWVzdC5zdGF0dXMgPj0gNDAwKSB7XG4gICAgc2VsZi5faGFuZGxlRXJyb3IoZXZlbnQpXG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgZG9jdW1lbnQgPSBzZWxmLl9wYXJzZU1lZXRpbmdwb2ludEhUTUwocmVxdWVzdC5yZXNwb25zZSlcbiAgc2VsZi5fbm9kZXMuc2NoZWR1bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQpXG59XG5cbnNlbGYuX2hhbmRsZUVycm9yID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGNvbnN0IHJlcXVlc3QgPSBldmVudC50YXJnZXRcbiAgY29uc29sZS5lcnJvcihyZXF1ZXN0KVxufVxuXG5zZWxmLl9nZXRVUkxPZlVzZXJzID0gZnVuY3Rpb24gKHdlZWssIHR5cGUsIGluZGV4KSB7XG4gIGNvbnN0IGlkID0gaW5kZXggKyAxXG4gIHJldHVybiBgLy8ke3dpbmRvdy5sb2NhdGlvbi5ob3N0fS9tZWV0aW5ncG9pbnRQcm94eS9Sb29zdGVycy1BTCUyRmRvYyUyRmRhZ3Jvb3N0ZXJzJTJGYCArXG4gICAgICBgJHsod2Vlayl9JTJGJHt0eXBlfSUyRiR7dHlwZX0ke2xlZnRQYWQoaWQsIDUsICcwJyl9Lmh0bWBcbn1cblxuc2VsZi52aWV3SXRlbSA9IGZ1bmN0aW9uICh3ZWVrLCBzZWxlY3RlZFVzZXIpIHtcbiAgY29uc3QgdXJsID0gc2VsZi5fZ2V0VVJMT2ZVc2Vycyh3ZWVrLCBzZWxlY3RlZFVzZXIudHlwZSwgc2VsZWN0ZWRVc2VyLmluZGV4KVxuXG4gIHdoaWxlIChzZWxmLl9ub2Rlcy5zY2hlZHVsZS5maXJzdENoaWxkKSB7XG4gICAgc2VsZi5fbm9kZXMuc2NoZWR1bGUucmVtb3ZlQ2hpbGQoc2VsZi5fbm9kZXMuc2NoZWR1bGUuZmlyc3RDaGlsZClcbiAgfVxuXG4gIGNvbnN0IHJlcXVlc3QgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KClcbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgc2VsZi5faGFuZGxlTG9hZClcbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHNlbGYuX2hhbmRsZUVycm9yKVxuICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSlcbiAgcmVxdWVzdC5zZW5kKClcblxuICBzZWFyY2gudXBkYXRlRG9tKHNlbGVjdGVkVXNlcilcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZWxmXG4iLCIvKiBnbG9iYWwgVVNFUlMgKi9cblxuY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJylcbmNvbnN0IGZ1enp5ID0gcmVxdWlyZSgnZnV6enknKVxuY29uc3QgYXV0b2NvbXBsZXRlID0gcmVxdWlyZSgnLi9hdXRvY29tcGxldGUnKVxuY29uc3QgYnJvd3NlckZpeFRvb2xraXQgPSByZXF1aXJlKCcuL2Jyb3dzZXJGaXhUb29sa2l0JylcblxuY29uc3Qgc2VsZiA9IG5ldyBFdmVudEVtaXR0ZXIoKVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgc2VhcmNoOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2VhcmNoJyksXG4gIGlucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJylcbn1cblxuc2VsZi5zdWJtaXQgPSBmdW5jdGlvbiAoKSB7XG4gIHNlbGYuX25vZGVzLmlucHV0LmJsdXIoKVxuXG4gIGNvbnN0IHNlbGVjdGVkSXRlbSA9IGF1dG9jb21wbGV0ZS5nZXRTZWxlY3RlZEl0ZW0oKVxuXG4gIGNvbnNvbGUubG9nKHNlbGVjdGVkSXRlbSlcblxuICBzZWxmLmVtaXQoJ3NlYXJjaCcsIHNlbGVjdGVkSXRlbSlcbn1cblxuc2VsZi51cGRhdGVEb20gPSBmdW5jdGlvbiAoc2VsZWN0ZWRJdGVtKSB7XG4gIHNlbGYuX25vZGVzLmlucHV0LnZhbHVlID0gc2VsZWN0ZWRJdGVtLnZhbHVlXG4gIGF1dG9jb21wbGV0ZS5yZW1vdmVBbGxJdGVtcygpXG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbm8taW5wdXQnKVxuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3NlYXJjaGVkJylcbn1cblxuc2VsZi5mb2N1cyA9IGZ1bmN0aW9uICgpIHtcbiAgc2VsZi5fbm9kZXMuaW5wdXQuZm9jdXMoKVxufVxuXG5zZWxmLl9oYW5kbGVTdWJtaXQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICBzZWxmLnN1Ym1pdCgpXG59XG5cbnNlbGYuX2NhbGN1bGF0ZSA9IGZ1bmN0aW9uIChzZWFyY2hUZXJtKSB7XG4gIGNvbnN0IGFsbFJlc3VsdHMgPSBmdXp6eS5maWx0ZXIoc2VhcmNoVGVybSwgVVNFUlMsIHtcbiAgICBleHRyYWN0OiBpdGVtID0+IGl0ZW0udmFsdWVcbiAgfSlcbiAgY29uc3QgZmlyc3RSZXN1bHRzID0gYWxsUmVzdWx0cy5zbGljZSgwLCA3KVxuXG4gIGNvbnN0IG9yaWdpbmFsUmVzdWx0cyA9IGZpcnN0UmVzdWx0cy5tYXAocmVzdWx0ID0+IHJlc3VsdC5vcmlnaW5hbClcblxuICByZXR1cm4gb3JpZ2luYWxSZXN1bHRzXG59XG5cbnNlbGYuX2hhbmRsZVRleHRVcGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHJlc3VsdHMgPSBzZWxmLl9jYWxjdWxhdGUoc2VsZi5fbm9kZXMuaW5wdXQudmFsdWUpXG5cbiAgYXV0b2NvbXBsZXRlLnJlbW92ZUFsbEl0ZW1zKClcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgYXV0b2NvbXBsZXRlLmFkZEl0ZW0ocmVzdWx0c1tpXSlcbiAgfVxufVxuXG5zZWxmLl9oYW5kbGVGb2N1cyA9IGZ1bmN0aW9uICgpIHtcbiAgc2VsZi5fbm9kZXMuaW5wdXQuc2VsZWN0KClcbn1cblxuc2VsZi5faGFuZGxlQmx1ciA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gdGhpcyB3aWxsIHJlbW92ZWQgdGhlIHNlbGVjdGlvbiB3aXRob3V0IGRyYXdpbmcgZm9jdXMgb24gaXQgKHNhZmFyaSlcbiAgLy8gdGhpcyB3aWxsIHJlbW92ZWQgc2VsZWN0aW9uIGV2ZW4gd2hlbiBmb2N1c2luZyBhbiBpZnJhbWUgKGNocm9tZSlcbiAgY29uc3Qgb2xkVmFsdWUgPSBzZWxmLl9ub2Rlcy52YWx1ZVxuICBzZWxmLl9ub2Rlcy52YWx1ZSA9ICcnXG4gIHNlbGYuX25vZGVzLnZhbHVlID0gb2xkVmFsdWVcblxuICAvLyB0aGlzIHdpbGwgaGlkZSB0aGUga2V5Ym9hcmQgKGlPUyBzYWZhcmkpXG4gIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpXG59XG5cbmF1dG9jb21wbGV0ZS5vbignc2VsZWN0Jywgc2VsZi5zdWJtaXQpXG5cbnNlbGYuX25vZGVzLnNlYXJjaC5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBzZWxmLl9oYW5kbGVTdWJtaXQpXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHNlbGYuX2hhbmRsZUZvY3VzKVxuc2VsZi5fbm9kZXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHNlbGYuX2hhbmRsZUJsdXIpXG5zZWxmLl9ub2Rlcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKGJyb3dzZXJGaXhUb29sa2l0LmlucHV0RXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2hhbmRsZVRleHRVcGRhdGUpXG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIiwiY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJylcblxuY29uc3Qgc2VsZiA9IG5ldyBFdmVudEVtaXR0ZXIoKVxuXG5zZWxmLl9ub2RlcyA9IHtcbiAgcHJldkJ1dHRvbjogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3dlZWstc2VsZWN0b3IgYnV0dG9uJylbMF0sXG4gIG5leHRCdXR0b246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN3ZWVrLXNlbGVjdG9yIGJ1dHRvbicpWzFdLFxuICBjdXJyZW50V2Vla1RleHQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3ZWVrLXNlbGVjdG9yIC5jdXJyZW50Jylcbn1cblxuc2VsZi5fd2Vla09mZnNldCA9IDBcblxuLy8gY29waWVkIGZyb20gaHR0cDovL3d3dy5tZWV0aW5ncG9pbnRtY28ubmwvUm9vc3RlcnMtQUwvZG9jL2RhZ3Jvb3N0ZXJzL3VudGlzc2NyaXB0cy5qcyxcbi8vIHdlcmUgdXNpbmcgdGhlIHNhbWUgY29kZSBhcyB0aGV5IGRvIHRvIGJlIHN1cmUgdGhhdCB3ZSBhbHdheXMgZ2V0IHRoZSBzYW1lXG4vLyB3ZWVrIG51bWJlci5cbnNlbGYuZ2V0Q3VycmVudFdlZWsgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gIGNvbnN0IGRheU5yID0gKHRhcmdldC5nZXREYXkoKSArIDYpICUgN1xuICB0YXJnZXQuc2V0RGF0ZSh0YXJnZXQuZ2V0RGF0ZSgpIC0gZGF5TnIgKyAzKVxuICBjb25zdCBmaXJzdFRodXJzZGF5ID0gdGFyZ2V0LnZhbHVlT2YoKVxuICB0YXJnZXQuc2V0TW9udGgoMCwgMSlcbiAgaWYgKHRhcmdldC5nZXREYXkoKSAhPT0gNCkge1xuICAgIHRhcmdldC5zZXRNb250aCgwLCAxICsgKCg0IC0gdGFyZ2V0LmdldERheSgpKSArIDcpICUgNylcbiAgfVxuXG4gIHJldHVybiAxICsgTWF0aC5jZWlsKChmaXJzdFRodXJzZGF5IC0gdGFyZ2V0KSAvIDYwNDgwMDAwMClcbn1cblxuc2VsZi5nZXRTZWxlY3RlZFdlZWsgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IG5vdyA9IG5ldyBEYXRlKClcbiAgY29uc3QgdGFyZ2V0RGF0ZSA9IG5ldyBEYXRlKG5vdy5nZXRUaW1lKCkgKyBzZWxmLl93ZWVrT2Zmc2V0ICogNjA0ODAwICogMTAwMClcbiAgcmV0dXJuIHNlbGYuZ2V0Q3VycmVudFdlZWsodGFyZ2V0RGF0ZSlcbn1cblxuc2VsZi51cGRhdGVDdXJyZW50V2VlayA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgc2VsZWN0ZWRXZWVrTnVtYmVyID0gc2VsZi5nZXRTZWxlY3RlZFdlZWsoKVxuICBzZWxmLl9ub2Rlcy5jdXJyZW50V2Vla1RleHQudGV4dENvbnRlbnQgPSBgV2VlayAke3NlbGVjdGVkV2Vla051bWJlcn1gXG4gIGlmIChzZWxmLmdldEN1cnJlbnRXZWVrKG5ldyBEYXRlKCkpICE9PSBzZWxlY3RlZFdlZWtOdW1iZXIpIHtcbiAgICBzZWxmLl9ub2Rlcy5jdXJyZW50V2Vla1RleHQuY2xhc3NMaXN0LmFkZCgnY2hhbmdlZCcpXG4gIH0gZWxzZSB7XG4gICAgc2VsZi5fbm9kZXMuY3VycmVudFdlZWtUZXh0LmNsYXNzTGlzdC5yZW1vdmUoJ2NoYW5nZWQnKVxuICB9XG4gIHNlbGYuZW1pdCgnd2Vla0NoYW5nZWQnLCBzZWxlY3RlZFdlZWtOdW1iZXIpXG59XG5cbnNlbGYuX2hhbmRsZVByZXZCdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgc2VsZi5fd2Vla09mZnNldCAtPSAxXG4gIHNlbGYudXBkYXRlQ3VycmVudFdlZWsoKVxufVxuXG5zZWxmLl9oYW5kbGVOZXh0QnV0dG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHNlbGYuX3dlZWtPZmZzZXQgKz0gMVxuICBzZWxmLnVwZGF0ZUN1cnJlbnRXZWVrKClcbn1cblxuc2VsZi5fbm9kZXMucHJldkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlbGYuX2hhbmRsZVByZXZCdXR0b25DbGljaylcbnNlbGYuX25vZGVzLm5leHRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxmLl9oYW5kbGVOZXh0QnV0dG9uQ2xpY2spXG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZlxuIl19
