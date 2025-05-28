import { db, ref, onValue, set } from './firebase.js';

// --- Elementer for lag, spillere og score ---
const teamANameInput = document.getElementById('teamANameInput');
const teamBNameInput = document.getElementById('teamBNameInput');
const playersAList = document.getElementById('playersAList');
const playersBList = document.getElementById('playersBList');
const scoreAEl = document.getElementById('scoreA');
const scoreBEl = document.getElementById('scoreB');

// --- Elementer for timer ---
const timerDisplay = document.getElementById('timerDisplay');
const periodInput = document.getElementById('periodInput');
const startBtn = document.getElementById('startTimerBtn');
const stopBtn = document.getElementById('stopTimerBtn');
const resetBtn = document.getElementById('resetTimerBtn');

// --- Firebase refs ---
const rootRef = ref(db, '/');
const timerRef = ref(db, 'timer');

// --- Data state ---
let data = {
  score: { A: 0, B: 0 },
  teams: {
    A: { name: 'Lag A', players: [] },
    B: { name: 'Lag B', players: [] }
  }
};

let elapsedSeconds = 0;
let periodMinutes = parseInt(periodInput.value) || 10;
let timerRunning = false;
let timerInterval = null;

// --- Funksjoner for spillere og lag ---

function renderPlayers(listEl, players, team) {
  if (!Array.isArray(players)) players = [];
  listEl.innerHTML = '';
  players.forEach((player, i) => {
    const li = document.createElement('li');

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = player.name || '';
    nameInput.size = 15;
    nameInput.placeholder = 'Spiller navn';
    nameInput.onchange = () => {
      player.name = nameInput.value;
      saveData();
    };

    const goalsSpan = document.createElement('span');
    goalsSpan.textContent = ` Mål: ${player.goals || 0} `;

    const assistsSpan = document.createElement('span');
    assistsSpan.textContent = ` Assist: ${player.assists || 0} `;

    const goalBtn = document.createElement('button');
    goalBtn.textContent = '+ Mål';
    goalBtn.onclick = () => {
      player.goals = (player.goals || 0) + 1;
      data.score[team]++;
      updateScoreUI();
      saveData();
      renderPlayers(listEl, players, team);
    };

    const assistBtn = document.createElement('button');
    assistBtn.textContent = '+ Assist';
    assistBtn.onclick = () => {
      player.assists = (player.assists || 0) + 1;
      saveData();
      renderPlayers(listEl, players, team);
    };

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.onclick = () => {
      players.splice(i, 1);
      saveData();
      renderPlayers(listEl, players, team);
    };

    li.appendChild(nameInput);
    li.appendChild(goalsSpan);
    li.appendChild(assistsSpan);
    li.appendChild(goalBtn);
    li.appendChild(assistBtn);
    li.appendChild(removeBtn);

    listEl.appendChild(li);
  });
}

function updateScoreUI() {
  scoreAEl.textContent = data.score.A;
  scoreBEl.textContent = data.score.B;
}

function saveData() {
  set(rootRef, data);
}

function loadData() {
  onValue(rootRef, (snapshot) => {
    const val = snapshot.val();

    if (!val || !val.teams || !val.teams.A || !val.teams.B) {
      data = {
        score: { A: 0, B: 0 },
        teams: {
          A: { name: 'Lag A', players: [] },
          B: { name: 'Lag B', players: [] }
        }
      };
      saveData();
    } else {
      data = val;
    }

    teamANameInput.value = data.teams.A.name || 'Lag A';
    teamBNameInput.value = data.teams.B.name || 'Lag B';
    updateScoreUI();
    renderPlayers(playersAList, data.teams.A.players, 'A');
    renderPlayers(playersBList, data.teams.B.players, 'B');
  });
}

// --- Timer funksjoner ---

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateTimerUI() {
  timerDisplay.textContent = formatTime(elapsedSeconds);
}

function saveTimerData() {
  set(timerRef, {
    elapsedSeconds,
    periodMinutes,
    timerRunning
  });
}

function tick() {
  elapsedSeconds++;
  if (elapsedSeconds >= periodMinutes * 60) {
    stopTimer();
    alert('Perioden er over!');
  }
  updateTimerUI();
  saveTimerData();
}

function startTimer() {
  if (timerRunning) return;
  periodMinutes = parseInt(periodInput.value) || 10;
  timerRunning = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  periodInput.disabled = true;

  timerInterval = setInterval(tick, 1000);
  saveTimerData();
}

function stopTimer() {
  if (!timerRunning) return;
  timerRunning = false;
  clearInterval(timerInterval);
  timerInterval = null;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  periodInput.disabled = false;

  saveTimerData();
}

function resetTimer() {
  stopTimer();
  elapsedSeconds = 0;
  updateTimerUI();
  saveTimerData();
}

// --- Event listeners ---

teamANameInput.onchange = () => {
  if (!data.teams) data.teams = {};
  if (!data.teams.A) data.teams.A = {};
  data.teams.A.name = teamANameInput.value;
  saveData();
};

teamBNameInput.onchange = () => {
  if (!data.teams) data.teams = {};
  if (!data.teams.B) data.teams.B = {};
  data.teams.B.name = teamBNameInput.value;
  saveData();
};

document.getElementById('addPlayerA').onclick = () => {
  if (!data.teams) data.teams = {};
  if (!data.teams.A) data.teams.A = { players: [] };
  if (!Array.isArray(data.teams.A.players)) data.teams.A.players = [];
  if (data.teams.A.players.length >= 20) {
    alert('Maks 20 spillere per lag');
    return;
  }
  data.teams.A.players.push({ name: '', goals: 0, assists: 0 });
  saveData();
  renderPlayers(playersAList, data.teams.A.players, 'A');
};

document.getElementById('addPlayerB').onclick = () => {
  if (!data.teams) data.teams = {};
  if (!data.teams.B) data.teams.B = { players: [] };
  if (!Array.isArray(data.teams.B.players)) data.teams.B.players = [];
  if (data.teams.B.players.length >= 20) {
    alert('Maks 20 spillere per lag');
    return;
  }
  data.teams.B.players.push({ name: '', goals: 0, assists: 0 });
  saveData();
  renderPlayers(playersBList, data.teams.B.players, 'B');
};

// Timer knapper
startBtn.onclick = startTimer;
stopBtn.onclick = stopTimer;
resetBtn.onclick = resetTimer;

// Lytt på timer-data i Firebase for synkronisering
onValue(timerRef, (snapshot) => {
  const tdata = snapshot.val();
  if (!tdata) return;

  elapsedSeconds = tdata.elapsedSeconds || 0;
  periodMinutes = tdata.periodMinutes || 10;
  timerRunning = tdata.timerRunning || false;

  updateTimerUI();

  startBtn.disabled = timerRunning;
  stopBtn.disabled = !timerRunning;
  periodInput.disabled = timerRunning;

  if (timerRunning && !timerInterval) {
    timerInterval = setInterval(tick, 1000);
  }
  if (!timerRunning && timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
});

// Last inn lag og spillere + score
loadData();
