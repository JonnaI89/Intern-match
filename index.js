
import { db, ref, onValue } from './firebase.js';

const scoreAEl = document.getElementById('scoreA');
const scoreBEl = document.getElementById('scoreB');

const scoreRef = ref(db, 'score');

onValue(scoreRef, (snapshot) => {
  const data = snapshot.val() || { A: 0, B: 0 };
  scoreAEl.textContent = data.A;
  scoreBEl.textContent = data.B;
});
