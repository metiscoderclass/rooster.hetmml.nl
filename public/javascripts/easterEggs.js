const sinterklaas = function () {
  console.log('sinterklaas easter egg activated')
  const searchNode = document.querySelector('#search')
  const inputNode = searchNode.querySelector('input[type="search"]')
  const autocompleteNode = document.querySelector('.autocomplete')
  let autocomplete = false
  const lyrics = [
    [
      {woord: 'Hoor ', time: 0},
      {woord: 'wie ', time: 0.3},
      {woord: 'klopt ', time: 0.6},
      {woord: 'daar ', time: 0.9},
      {woord: 'kind', time: 1.2},
      {woord: '\'ren', time: 1.5}
    ],
    [
      {woord: 'Hoor ', time: 1.8},
      {woord: 'wie ', time: 2.1},
      {woord: 'klopt ', time: 2.5},
      {woord: 'daar ', time: 2.8},
      {woord: 'kind', time: 3.1},
      {woord: '\'ren', time: 3.4}
    ],
    [
      {woord: 'Hoor ', time: 3.7},
      {woord: 'wie ', time: 4},
      {woord: 'tikt ', time: 4.3},
      {woord: 'daar ', time: 4.6},
      {woord: 'zacht', time: 4.8},
      {woord: 'jes ', time: 5.3},
      {woord: 'tegen ', time: 5.5},
      {woord: '\'t ', time: 6.1},
      {woord: 'raam ', time: 6.2}
    ]
  ]

  const originalValue = inputNode.value

  inputNode.value = ''
  inputNode.placeholder = ''

  lyrics.forEach((row, rowIndex) => {
    row.forEach((word, wordIndex) => {
      setTimeout(function () {
        if (wordIndex === 0) inputNode.placeholder = ''
        inputNode.placeholder += word.woord
      }, word.time * 1000)
      if (lyrics.length === rowIndex + 1 &&
          lyrics[rowIndex].length === wordIndex + 1) {
        setTimeout(function () {
          if (inputNode.value === '') {
            inputNode.value = originalValue
          }
          inputNode.placeholder = 'Zoeken'
          autocomplete = true
        }, word.time * 1000 + 1000)
      }
    })
  })

  inputNode.addEventListener('focus', function () {
    if (!autocomplete) return

    autocompleteNode.innerHTML = ''

    const autocompleteLyrics = [
      `'t Is een vreemd'ling zeker,`,
      `die verdwaalt is zeker.`,
      `'k Zal eens even vragen naar zijn naam:`
    ]

    autocompleteLyrics.forEach(row => {
      const resultNode = document.createElement('li')
      resultNode.innerHTML = row
      autocompleteNode.appendChild(resultNode)
    })
  })

  inputNode.addEventListener('input', function () {
    if (!autocomplete) return
    if (inputNode.value.toLowerCase() === 'sint nicolaas' ||
        inputNode.value.toLowerCase() === 'sintnicolaas' ||
        inputNode.value.toLowerCase() === 'sint nikolaas' ||
        inputNode.value.toLowerCase() === 'sintnikolaas') {
      inputNode.value = ''
      window.location.href = 'https://www.youtube-nocookie.com/embed/jsOiKJ3kKXM?start=30'
    }
  })
}

module.exports = { sinterklaas }
