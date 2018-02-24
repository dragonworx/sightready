import Metronome from './metronome';

// Create an SVG renderer and attach it to the DIV element named "boo".
var vf = new Vex.Flow.Factory({renderer: {elementId: 'score'}});
var score = vf.EasyScore();
var system = vf.System();

const label = document.getElementById('label');

system.addStave({
  voices: [score.voice(score.notes('(C4 E4 G4)/q, E4, F4, G4'))]
//  voices: [score.voice(score.notes('C#5/q, B4, A4, G#4'))]
//  voices: [
//    score.voice(
//      score.notes('C#5/q, B4')
//        .concat(score.beam(score.notes('A4/8, E4, C4, D4')))
//    )
//  ]
}).addClef('treble').addTimeSignature('4/4');

vf.draw();

const staveNotes = $('.vf-stavenote');
let currentNote = null;

function highlight (note) {
  if (currentNote) {
    currentNote.find('path').attr('stroke', 'black').attr('fill', 'black');
  }
  note.find('path').attr('stroke', 'red').attr('fill', 'red');
  currentNote = note;
}

const metronome = new Metronome();
metronome.on('pulse', pulse => {
  const i = Math.floor(pulse.complete * staveNotes.length);
//  label.innerHTML = i;
  highlight(staveNotes.eq(i));

});
metronome.init();
metronome.start();

label.innerHTML = '2';