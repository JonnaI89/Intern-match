// index.js
import { db, ref, onValue } from './firebase.js';

const teamAName = document.getElementById('teamAName');
const teamBName = document.getElementById('teamBName');
const scoreA = document.getElementById('scoreA');
const scoreB = document.getElementById('scoreB');
const playersA = document.getElementById('playersA');
const playersB = document.getElementById('playersB');
const liveEvents = document.getElementById('liveEvents');
const periodView = document.getElementById('periodView');
const timerDisplay = document.getElementById('timerDisplay');

const rootRef = ref(db, '/');

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

onValue(rootRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  teamAName.textContent = data.teams?.A?.name || 'Lag A';
  teamBName.textContent = data.teams?.B?.name || 'Lag B';
  scoreA.textContent = data.score?.A ?? 0;
  scoreB.textContent = data.score?.B ?? 0;

  // Players
  playersA.innerHTML = (data.teams?.A?.players || []).map(p => `<li>${p.name || ''}</li>`).join('');
  playersB.innerHTML = (data.teams?.B?.players || []).map(p => `<li>${p.name || ''}</li>`).join('');

  // Live events
  if (data.liveEvents) {
    liveEvents.innerHTML = data.liveEvents.map(ev => `<div>${ev}</div>`).join('');
  }

  // Period
  periodView.textContent = data.period || 1;

  // Timer
  timerDisplay.textContent = formatTime(data.timer?.seconds || 0);
});
