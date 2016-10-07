/* global importScripts toolbox self */

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

  toolbox.router.get('/', toolbox.fastest)
  toolbox.router.get('/hello', toolbox.fastest)

  toolbox.router.get('/javascripts/bundle.js', toolbox.fastest)
  toolbox.router.get('/stylesheets/*', toolbox.fastest)
  toolbox.router.get('/untisinfo.css', toolbox.fastest)
  toolbox.router.get('/meetingpointProxy/*', toolbox.networkFirst)
})(self)
