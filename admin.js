
import { db, ref, onValue, set } from './firebase.js';

const scoreAEl = document.getElementById('scoreA');
const scoreBEl = document.getElementById('scoreB');

const scoreRef = ref(db, 'score');

let scores = { A: 0, B: 0 };

onValue(scoreRef, (snapshot) => {
  scores = snapshot.val() || { A: 0, B: 0 };
  updateUI();
});

window.updateScore = function(team, delta) {
  scores[team] += delta;
  set(scoreRef, scores);
  updateUI();
};

function updateUI() {
  scoreAEl.textContent = scores.A;
  scoreBEl.textContent = scores.B;
}
