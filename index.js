// index.js
import { db, ref, onValue } from './firebase.js';

const scoreAEl = document.getElementById('scoreA');
const scoreBEl = document.getElementById('scoreB');
const teamANameEl = document.getElementById('teamAName');
const teamBNameEl = document.getElementById('teamBName');
const playersAEl = document.getElementById('playersA');
const playersBEl = document.getElementById('playersB');
const periodView = document.getElementById('periodView');

// Opprett og legg til timer-element øverst på siden
const timerEl = document.createElement('div');
timerEl.style.fontSize = '1.5em';
timerEl.style.marginBottom = '1em';
document.getElementById('timerContainer').appendChild(timerEl);

const rootRef = ref(db, '/');

let timerData = {
  seconds: 0,
  running: false,
  lastUpdate: 0
};

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function updateTimerUI() {
  timerEl.textContent = `Tid: ${formatTime(timerData.seconds)}`;
}

// Oppdater timerData.seconds basert på tid som har gått siden sist oppdatering
function updateTimerFromNow() {
  if (timerData.running && timerData.lastUpdate) {
    const now = Date.now();
    const elapsedSec = Math.floor((now - timerData.lastUpdate) / 1000);
    if (elapsedSec > 0) {
      timerData.seconds += elapsedSec;
      timerData.lastUpdate = now;
    }
  }
  updateTimerUI();
}

// Kjør oppdatering jevnlig (hver 0.5 sekund)
setInterval(() => {
  updateTimerFromNow();
}, 500);

onValue(rootRef, (snapshot) => {
  const data = snapshot.val() || {};
  const score = data.score || { A: 0, B: 0 };
  const teams = data.teams || {
    A: { name: 'Lag A', players: [] },
    B: { name: 'Lag B', players: [] }
  };

  // Hent timer-data fra Firebase, med fallback
  timerData = data.timer || { seconds: 0, running: false, lastUpdate: Date.now() };

  // Hvis lastUpdate ikke finnes, sett til nå
  if (!timerData.lastUpdate) {
    timerData.lastUpdate = Date.now();
  }

  scoreAEl.textContent = score.A;
  scoreBEl.textContent = score.B;
  teamANameEl.textContent = teams.A.name || 'Lag A';
  teamBNameEl.textContent = teams.B.name || 'Lag B';

  playersAEl.innerHTML = '';
  playersBEl.innerHTML = '';

  for (const player of teams.A.players || []) {
    const li = document.createElement('li');
    li.textContent = `${player.name} - Mål: ${player.goals || 0}, Assist: ${player.assists || 0}`;
    playersAEl.appendChild(li);
  }

  for (const player of teams.B.players || []) {
    const li = document.createElement('li');
    li.textContent = `${player.name} - Mål: ${player.goals || 0}, Assist: ${player.assists || 0}`;
    playersBEl.appendChild(li);
  }

  // Update period view
  periodView.textContent = data.period || 1;

  updateTimerUI();
});
