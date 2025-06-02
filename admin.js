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
const timerMinutesInput = document.getElementById('timerMinutesInput');
const timerSetBtn = document.getElementById('timerSetBtn');
const titleInput = document.getElementById('titleInput');

let data = {
  period: 1,
  score: { A: 0, B: 0 },
  teams: {
    A: { name: 'Lag A', players: [] },
    B: { name: 'Lag B', players: [] }
  },
  liveEvents: [],
  title: 'INTERN MATCH LIVE'
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

// Timer functions
let timerInterval = null;
let timer = { running: false, secondsElapsed: 0, originalLimit: 0 }; // Change secondsLeft to secondsElapsed
let lastRunningState = null;
let ignoreNextTimerUpdate = false;

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimerUI() {
  timerDisplay.textContent = formatTime(timer.secondsElapsed);
}

function saveTimer() {
  update(ref(db, '/'), { timer });
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  if (timer.secondsElapsed >= timer.originalLimit) return;
  timer.running = true;
  lastRunningState = true;
  saveTimer();
  timerInterval = setInterval(() => {
    if (timer.secondsElapsed < timer.originalLimit) {
      timer.secondsElapsed++;
      updateTimerUI();
      saveTimer();
      if (timer.secondsElapsed === timer.originalLimit) {
        pauseTimer();
      }
    }
  }, 1000);
}

function pauseTimer() {
  timer.running = false;
  lastRunningState = false;
  saveTimer();
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTimer() {
  timer.running = false;
  timer.secondsElapsed = 0;
  updateTimerUI();
  saveTimer();
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Set timer in MINUTES (input is minutes)
timerSetBtn.onclick = () => {
  const mins = parseInt(timerMinutesInput.value, 10) || 0;
  timer.originalLimit = mins * 60;
  timer.secondsElapsed = 0;
  updateTimerUI();
  saveTimer();
  pauseTimer();
};

timerStart.onclick = () => {
  ignoreNextTimerUpdate = true;
  startTimer();
};
timerPause.onclick = () => {
  ignoreNextTimerUpdate = true;
  pauseTimer();
};
timerReset.onclick = () => {
  ignoreNextTimerUpdate = true;
  resetTimer();
};

onValue(ref(db, '/'), (snapshot) => {
  const dbData = snapshot.val();
  if (!dbData) return;
  periodDisplay.textContent = dbData.period || 1;
  if (typeof dbData.timer === 'object') {
    timer.secondsElapsed = dbData.timer.secondsElapsed ?? timer.secondsElapsed;
    timer.originalLimit = dbData.timer.originalLimit ?? timer.originalLimit;
    updateTimerUI();

    // Only start/stop timer if running state changed
    if (dbData.timer.running !== lastRunningState) {
      lastRunningState = dbData.timer.running;
      if (ignoreNextTimerUpdate) {
        ignoreNextTimerUpdate = false;
        return; // Don't call startTimer or pauseTimer if we just triggered this change
      }
      if (dbData.timer.running) {
        startTimer();
      } else {
        pauseTimer();
      }
    }
  }
});

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

function changeScore(team, delta) {
  data.score[team] += delta;
  if (data.score[team] < 0) data.score[team] = 0;
  updateScoreUI();
  saveData();
}

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
  liveEventsDiv.innerHTML = (data.liveEvents || []).map(ev => {
    if (typeof ev === 'object' && ev !== null) {
      return `<div>Periode ${ev.period}: ${ev.time} ${ev.text}</div>`;
    } else if (typeof ev === 'string') {
      return `<div>${ev}</div>`;
    } else {
      return '';
    }
  }).join('');
}

// Handle goal form
document.getElementById('goalForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const team = teamSelect.value;
  const scorer = scorerSelect.value;
  const assist = assistSelect.value;

  // Use the visible clock as timestamp (what admin sees)
  const time = timerDisplay.textContent;

  data.score[team] = (data.score[team] || 0) + 1;

  const event = {
    period: data.period,
    time: time,
    text: `Goal ${scorer}${assist ? ' Assist ' + assist : ''}`
  };
  data.liveEvents = data.liveEvents || [];
  data.liveEvents.push(event);
  saveData();
  updateScoreUI();
  renderLiveEvents();
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('resetLiveEventsBtn').onclick = () => {
    data.liveEvents = [];
    saveData();
    renderLiveEvents();
  };
});

// Period controls
periodMinus.onclick = () => {
  data.period = Math.max(1, (data.period || 1) - 1);
  updatePeriodUI();
  saveData();
};

periodPlus.onclick = () => {
  data.period = (data.period || 1) + 1;
  updatePeriodUI();
  saveData();
};

onValue(ref(db, '/'), (snapshot) => {
  const dbData = snapshot.val();
  if (!dbData) return;
  if (titleInput && dbData.title !== undefined) {
    titleInput.value = dbData.title;
  }
  // Add this to always render the latest live events
  data.liveEvents = dbData.liveEvents || [];
  renderLiveEvents();
});
if (titleInput) {
  titleInput.addEventListener('input', () => {
    data.title = titleInput.value;
    saveData();
  });
}

document.getElementById('updateStatsBtn').onclick = function() {
  // Calculate stats from liveEvents
  const stats = {};
  (data.liveEvents || []).forEach(ev => {
    if (typeof ev !== 'object' || !ev.text) return;
    const goalMatch = ev.text.match(/^Goal ([^ ]+)/);
    const assistMatch = ev.text.match(/Assist ([^ ]+)/);

    if (goalMatch) {
      const scorer = goalMatch[1];
      stats[scorer] = stats[scorer] || { goals: 0, assists: 0, points: 0 };
      stats[scorer].goals += 1;
      stats[scorer].points += 1;
    }
    if (assistMatch) {
      const assist = assistMatch[1];
      stats[assist] = stats[assist] || { goals: 0, assists: 0, points: 0 };
      stats[assist].assists += 1;
      stats[assist].points += 1;
    }
  });

  // Save stats to Firebase
  set(ref(db, '/stats'), stats)
    .then(() => alert('Statistikk oppdatert!'))
    .catch(err => alert('Feil ved oppdatering av statistikk: ' + err));
};
