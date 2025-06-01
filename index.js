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
const messageBar = document.getElementById('messageBar');
let timer = { secondsLeft: 0, originalLimit: 0, running: false };

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimerUI() {
  timerDisplay.textContent = formatTime(timer.secondsLeft);
}

const rootRef = ref(db, '/');

const heading = document.querySelector('h1');
onValue(rootRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) return;
  if (heading && data.title !== undefined) {
    heading.textContent = data.title;
  }

  teamAName.textContent = data.teams?.A?.name || 'Lag A';
  teamBName.textContent = data.teams?.B?.name || 'Lag B';
  scoreA.textContent = data.score?.A ?? 0;
  scoreB.textContent = data.score?.B ?? 0;

  playersA.innerHTML = (data.teams?.A?.players || []).map(p => `<li>${p.name || ''}</li>`).join('');
  playersB.innerHTML = (data.teams?.B?.players || []).map(p => `<li>${p.name || ''}</li>`).join('');

  if (data.liveEvents) {
    liveEvents.innerHTML = data.liveEvents.map(ev => `<div>${ev}</div>`).join('');
  }

  // Period
  periodView.textContent = data.period || 1;

  // Timer
  timer.secondsLeft = data.timer?.secondsLeft ?? 0;
  timer.originalLimit = data.timer?.originalLimit ?? 0;
  timer.running = data.timer?.running ?? false;
  if (typeof data.timer === 'object') {
    timerDisplay.textContent = formatTime(data.timer.secondsElapsed || 0);
  }

  if (messageBar) {
    messageBar.textContent = data.message || '';
  }
});

let timerInterval = null;

function startViewTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timer.secondsLeft > 0 && timer.running) {
      timer.secondsLeft--;
      updateTimerUI();
    }
    if (timer.secondsLeft <= 0 || !timer.running) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }, 1000);
}

function stopViewTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}
