const self = {}

self.isIE = navigator.userAgent.indexOf('MSIE') !== -1 ||
            navigator.appVersion.indexOf('Trident/') > 0

if (self.isIE) {
  self.inputEvent = 'textinput'
} else {
  self.inputEvent = 'input'
}

module.exports = self
