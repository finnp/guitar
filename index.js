var parsedDiv = document.querySelector('#parsed')

document.addEventListener('paste', function(e){
    if(e.clipboardData.types.indexOf('text/plain') > -1){
        var rawTab = e.clipboardData.getData('text/plain')
        load(rawTab)
        e.preventDefault()
    }
})

var currentSong
var currentIndex = 0

function load(rawTab) {
  var parsed = parseTab(rawTab)
  var intervals = toIntervals(parsed)

  parsedDiv.innerHTML = intervals.map(function (interval, i) {
    return '<span style="transition: font-size 0.1s;" id="interval-' + i + '">' + interval.join('').split('').reverse().join('').replace(/-/g, '|') + '</span>'
  }).reverse().join('<br>')

  document.querySelector('#interval-0').scrollIntoView(true)

  var notes = toNotes(intervals)

  currentSong = notes.filter(function (interval) {
    return interval.length > 0
  })
  currentIndex = 0
}

document.addEventListener('keydown', function (event) {
  if(event.keyCode !== 32) return
  event.preventDefault()


  if(!currentSong) return
  if(!currentSong[currentIndex]) currentIndex = 0
  console.log(currentSong[currentIndex].join('-'))
  currentSong[currentIndex].forEach(function (note) {
    playNote(0, note, 0.49)
  })
  var currentElement = document.querySelector('#interval-' + currentIndex)
  currentElement.style['color'] = 'red'
  currentElement.style.fontSize = '150px'

  var scrollElement = document.querySelector('#interval-' + (currentIndex + 4))
  if(scrollElement) scrollElement.scrollIntoView(true)
  if(currentIndex > 0) {
    var lastElement = document.querySelector('#interval-' + (currentIndex - 1))
    lastElement.style['color'] = 'black'
    lastElement.style.fontSize = '100px'
  }
  currentIndex++
})


function parseTab(tab) {

  var lines = tab
    .split('\n')
    .filter(function (line) {
      return line.trim()
    })

  for (var i = 0; i < 6; i++) {
    for (var j = i + 6; j < lines.length; j += 6) {
      lines[i] += lines[j]
    }
  }

  lines = lines.slice(0, 6)

  var notes = lines.map(function (line) {
      return line.replace(/[^0-9-|\/h]+/g, '')
    })

  return notes
}

function toIntervals(lines) {
  var intervals = []

  for (var i = 1; i < lines[0].length; i += 2) {
    if (lines[0][i] !== '|') {
      var chord = [
        lines[0][i],
        lines[1][i],
        lines[2][i],
        lines[3][i],
        lines[4][i],
        lines[5][i]
      ]
      if(chord.join('') !== '------') intervals.push(chord)
    }
  }
  return intervals
}

function toNotes(intervals) {


  var baseNotes = [
   0,
   5,
   10,
   15,
   19,
   24
  ].reverse()

  intervals = intervals.map(function (strings) {
    var notes = []
    for (var i = 0; i < 6; i++) {
      if(strings[i] && Number(strings[i]) >= 0) {
        notes.push(baseNotes[i] + Number(strings[i]))
      }
    }
    return notes
  })
  return intervals
}

function play(parsed) {
  for (var i = 0; i < parsed.length; i++) {
    parsed[i].forEach(function (note) {
      playNote(i / 2, note, 0.49)
    })
  }
}

var audioContext = new AudioContext()
var amp = audioContext.createGain()
amp.gain.value = 0.5
amp.connect(audioContext.destination)

function playNote(delay, pitch, duration) {
  var startTime = audioContext.currentTime + delay
  var endTime = startTime + duration


  var oscillator = audioContext.createOscillator()
  oscillator.connect(amp)

  oscillator.type = 'square'
  oscillator.frequency.value = 82.4
  oscillator.detune.value = pitch * 100

  oscillator.start(startTime)
  oscillator.stop(endTime)
}
