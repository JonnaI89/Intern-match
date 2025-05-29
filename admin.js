// admin.js
import { db, ref, onValue, set, update } from './firebase.js';

// HTML elements
const teamANameInput = document.getElementById('teamANameInput');
const teamBNameInput = document.getElementById('teamBNameInput');
const playersAList = document.getElementById('playersAList');
const playersBList = document.getElementById('playersBList');
const scoreAEl = document.getElementById('scoreA');
const scoreBEl = document.getElementById('scoreB');
const periodDisplay = document.getElementById('periodDisplay');
const periodMinus = document.getElementById('periodMinus');
const periodPlus = document.getElementById('periodPlus');
const timerDisplay = document.getElementById('timerDisplay');
const timerStart = document.getElementById('timerStart');
const timerPause = document.getElementById('timerPause');
const timerReset = document.getElementById('timerReset');

let data = {
  period: 1,
  score: { A: 0, B: 0 },
  teams: {
    A: { name: 'Lag A', players: [] },
    B: { name: 'Lag B', players: [] }
  },
  liveEvents: []
};

const rootRef = ref(db, '/');

function renderPlayers(listEl, players, team) {
  listEl.innerHTML = '';
  players.forEach((player, i) => {
    const li = document.createElement('li');

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = player.name || '';
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
      saveData();
      renderPlayers(listEl, players, team);
    };

    const goalMinusBtn = document.createElement('button');
    goalMinusBtn.textContent = '− Mål';
    goalMinusBtn.onclick = () => {
      player.goals = Math.max(0, (player.goals || 0) - 1);
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

    const statsDiv = document.createElement('div');
    statsDiv.className = 'player-controls';
    statsDiv.appendChild(goalsSpan);
    statsDiv.appendChild(goalBtn);
    statsDiv.appendChild(goalMinusBtn);
    statsDiv.appendChild(assistsSpan);
    statsDiv.appendChild(assistBtn);
    statsDiv.appendChild(removeBtn);

    li.appendChild(statsDiv);

    listEl.appendChild(li);
  });
}

function updateScoreUI() {
  scoreAEl.textContent = data.score.A;
  scoreBEl.textContent = data.score.B;
}

function updatePeriodUI() {
  periodDisplay.textContent = data.period || 1;
}

function saveData() {
  set(rootRef, data);
}

function loadData() {
  onValue(rootRef, (snapshot) => {
    const val = snapshot.val();

    if (!val || !val.teams || !val.teams.A || !val.teams.B) {
      data = {
        period: 1,
        score: { A: 0, B: 0 },
        teams: {
          A: { name: 'Lag A', players: [] },
          B: { name: 'Lag B', players: [] }
        },
        liveEvents: []
      };
      saveData();
    } else {
      data = val;

      if (!Array.isArray(data.teams.A.players)) data.teams.A.players = [];
      if (!Array.isArray(data.teams.B.players)) data.teams.B.players = [];
      if (!data.period) data.period = 1;
      if (!Array.isArray(data.liveEvents)) data.liveEvents = [];
    }

    teamANameInput.value = data.teams.A.name || 'Lag A';
    teamBNameInput.value = data.teams.B.name || 'Lag B';

    updateScoreUI();
    updatePeriodUI();
    renderPlayers(playersAList, data.teams.A.players, 'A');
    renderPlayers(playersBList, data.teams.B.players, 'B');

    teamANameInput.disabled = false;
    teamBNameInput.disabled = false;

    updateGoalFormDropdowns();
    renderLiveEvents();
  });
}

function changeScore(team, delta) {
  data.score[team] += delta;
  if (data.score[team] < 0) data.score[team] = 0;
  updateScoreUI();
  saveData();
}

// Timer functions
let timerInterval = null;
let timer = { running: false, seconds: 0 };

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimerUI() {
  timerDisplay.textContent = formatTime(timer.seconds);
}

function saveTimer() {
  update(ref(db, '/'), { timer });
}

function startTimer() {
  if (timer.running) return;
  timer.running = true;
  saveTimer();
  timerInterval = setInterval(() => {
    timer.seconds++;
    updateTimerUI();
    saveTimer();
  }, 1000);
}

function pauseTimer() {
  timer.running = false;
  saveTimer();
  clearInterval(timerInterval);
}

function resetTimer() {
  timer.seconds = 0;
  updateTimerUI();
  saveTimer();
}

// Period buttons
periodMinus.onclick = () => {
  let period = parseInt(periodDisplay.textContent, 10) || 1;
  period = Math.max(1, period - 1);
  periodDisplay.textContent = period;
  update(ref(db, '/'), { period });
};
periodPlus.onclick = () => {
  let period = parseInt(periodDisplay.textContent, 10) || 1;
  period = period + 1;
  periodDisplay.textContent = period;
  update(ref(db, '/'), { period });
};

// Timer buttons
timerStart.onclick = () => startTimer();
timerPause.onclick = () => pauseTimer();
timerReset.onclick = () => resetTimer();

// Name changes
teamANameInput.onchange = () => {
  data.teams.A.name = teamANameInput.value;
  saveData();
};
teamBNameInput.onchange = () => {
  data.teams.B.name = teamBNameInput.value;
  saveData();
};

// Add players
document.getElementById('addPlayerA').onclick = () => {
  if (data.teams.A.players.length >= 20) {
    alert('Maks 20 spillere per lag');
    return;
  }
  data.teams.A.players.push({ name: '', goals: 0, assists: 0 });
  saveData();
  renderPlayers(playersAList, data.teams.A.players, 'A');
  updateGoalFormDropdowns();
};

document.getElementById('addPlayerB').onclick = () => {
  if (data.teams.B.players.length >= 20) {
    alert('Maks 20 spillere per lag');
    return;
  }
  data.teams.B.players.push({ name: '', goals: 0, assists: 0 });
  saveData();
  renderPlayers(playersBList, data.teams.B.players, 'B');
  updateGoalFormDropdowns();
};

// Score buttons
document.getElementById('scoreAPlus').addEventListener('click', () => changeScore('A', 1));
document.getElementById('scoreAMinus').addEventListener('click', () => changeScore('A', -1));
document.getElementById('scoreBPlus').addEventListener('click', () => changeScore('B', 1));
document.getElementById('scoreBMinus').addEventListener('click', () => changeScore('B', -1));

// Goal form dropdowns
const teamSelect = document.getElementById('teamSelect');
const scorerSelect = document.getElementById('scorerSelect');
const assistSelect = document.getElementById('assistSelect');
function updateGoalFormDropdowns() {
  const team = teamSelect.value;
  const players = team === "A" ? data.teams.A.players : data.teams.B.players;
  scorerSelect.innerHTML = players.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
  assistSelect.innerHTML = `<option value="">Ingen</option>` + players.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
}
teamSelect.addEventListener('change', updateGoalFormDropdowns);

// Live events
const liveEventsDiv = document.getElementById('liveEvents');
function renderLiveEvents() {
  liveEventsDiv.innerHTML = (data.liveEvents || []).map(ev => `<div>${ev}</div>`).join('');
}

// Handle goal form
document.getElementById('goalForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const team = teamSelect.value;
  const scorer = scorerSelect.value;
  const assist = assistSelect.value;
  // Get current time (mm:ss)
  const now = new Date();
  const time = now.toLocaleTimeString([], {minute: '2-digit', second: '2-digit'});
  // Update score
  data.score[team] = (data.score[team] || 0) + 1;
  // Add event to live view
  const eventText = `${time} Goal ${scorer}${assist ? ' Assist ' + assist : ''}`;
  data.liveEvents = [eventText, ...(data.liveEvents || [])].slice(0, 30); // keep last 30 events
  saveData();
  updateScoreUI();
  renderLiveEvents();
});

loadData();
