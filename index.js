import { db, ref, onValue } from './firebase.js';

const teamANameEl = document.getElementById('teamAName');
const teamBNameEl = document.getElementById('teamBName');
const scoreAEl = document.getElementById('scoreA');
const scoreBEl = document.getElementById('scoreB');
const playersAList = document.getElementById('playersA');
const playersBList = document.getElementById('playersB');
const timerDisplay = document.createElement('div');

// Legg til timer-display i toppen (kan justeres i HTML om ønskelig)
document.body.insertBefore(timerDisplay, document.querySelector('.scoreboard'));

let data = {
  score: { A: 0, B: 0 },
  teams: {
    A: { name: 'Lag A', players: [] },
    B: { name: 'Lag B', players: [] }
  },
  timer: {
    seconds: 0,
    running: false,
    lastUpdate: 0
  }
};

const rootRef = ref(db, '/');

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function updateTimerUI() {
  timerDisplay.textContent = `Tid: ${formatTime(data.timer.seconds)}`;
}

function updateUI() {
  teamANameEl.textContent = data.teams.A.name || 'Lag A';
  teamBNameEl.textContent = data.teams.B.name || 'Lag B';
  scoreAEl.textContent = data.score.A;
  scoreBEl.textContent = data.score.B;

  playersAList.innerHTML = '';
  (data.teams.A.players || []).forEach(player => {
    const li = document.createElement('li');
    li.textContent = `${player.name || '-'} (Mål: ${player.goals || 0}, Assist: ${player.assists || 0})`;
    playersAList.appendChild(li);
  });

  playersBList.innerHTML = '';
  (data.teams.B.players || []).forEach(player => {
    const li = document.createElement('li');
    li.textContent = `${player.name || '-'} (Mål: ${player.goals || 0}, Assist: ${player.assists || 0})`;
    playersBList.appendChild(li);
  });

  updateTimerUI();
}

let timerInterval = null;

function startTimerInterval() {
  if (timerInterval) return; // allerede startet

  timerInterval = setInterval(() => {
    if (data.timer.running) {
      // Kalkuler økning i tid basert på siste oppdatering for å unngå drifting
      const now = Date.now();
      const elapsed = Math.floor((now - data.timer.lastUpdate) / 1000);
      if (elapsed > 0) {
        data.timer.seconds += elapsed;
        data.timer.lastUpdate = now;
        updateTimerUI();
      }
    }
  }, 500);
}

function stopTimerInterval() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Lytt til data fra Firebase
onValue(rootRef, (snapshot) => {
  const val = snapshot.val();
  if (!val) return;

  data = val;

  // Hvis timer.lastUpdate ikke finnes, sett den til nå
  if (!data.timer) {
    data.timer = { seconds: 0, running: false, lastUpdate: Date.now() };
  } else if (!data.timer.lastUpdate) {
    data.timer.lastUpdate = Date.now();
  }

  updateUI();
  startTimerInterval();
});

