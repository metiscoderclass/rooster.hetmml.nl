/* global importScripts toolbox self */

// random string: CHfHo0GjMJAoOC

(global => {
  'use strict'

  // Load the sw-toolbox library.
  importScripts('/components/sw-toolbox/sw-toolbox.js')

  // Ensure that our service worker takes control of the page as soon as possible.
  global.addEventListener('install', event => event.waitUntil(global.skipWaiting()))
  global.addEventListener('activate', event => event.waitUntil(global.clients.claim()))

  toolbox.precache([
    '/',
    '/hello',
    '/untisinfo.css',
    '/javascripts/bundle.js',
    '/stylesheets/style.css',
    '/stylesheets/hello.css'
  ])

  toolbox.router.get('/', toolbox.cacheFirst)
  toolbox.router.get('/hello', toolbox.cacheFirst)

  toolbox.router.get('/javascripts/bundle.js', toolbox.cacheFirst)
  toolbox.router.get('/stylesheets/*', toolbox.cacheFirst)
  toolbox.router.get('/untisinfo.css', toolbox.cacheFirst)
  toolbox.router.get('/meetingpointProxy/*', toolbox.networkFirst)
})(self)
