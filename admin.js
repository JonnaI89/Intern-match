import { db, ref, onValue, set } from './firebase.js';
import { initTimer, startTimer, stopTimer, resetTimer, setTimerSeconds } from './timer.js';

const teamANameInput = document.getElementById('teamANameInput');
const teamBNameInput = document.getElementById('teamBNameInput');
const playersAList = document.getElementById('playersAList');
const playersBList = document.getElementById('playersBList');
const scoreAEl = document.getElementById('scoreA');
const scoreBEl = document.getElementById('scoreB');

let data = {
  score: { A: 0, B: 0 },
  teams: {
    A: { name: 'Lag A', players: [] },
    B: { name: 'Lag B', players: [] }
  }
};

teamANameInput.disabled = true;
teamBNameInput.disabled = true;

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

    const goalBtn = document.createElement('button');
    goalBtn.textContent = '+ Mål';
    goalBtn.onclick = () => {
      player.goals = (player.goals || 0) + 1;
      data.score[team]++;
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
    li.appendChild(document.createTextNode(` Mål: ${player.goals || 0}, Assist: ${player.assists || 0} `));
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
    data = val || data;

    if (!Array.isArray(data.teams.A.players)) data.teams.A.players = [];
    if (!Array.isArray(data.teams.B.players)) data.teams.B.players = [];

    teamANameInput.value = data.teams.A.name;
    teamBNameInput.value = data.teams.B.name;

    updateScoreUI();
    renderPlayers(playersAList, data.teams.A.players, 'A');
    renderPlayers(playersBList, data.teams.B.players, 'B');

    teamANameInput.disabled = false;
    teamBNameInput.disabled = false;

    initTimer();
  });
}

window.changeScore = function (team, delta) {
  data.score[team] = Math.max(0, data.score[team] + delta);
  updateScoreUI();
  saveData();
};

teamANameInput.onchange = () => {
  data.teams.A.name = teamANameInput.value;
  saveData();
};

teamBNameInput.onchange = () => {
  data.teams.B.name = teamBNameInput.value;
  saveData();
};

document.getElementById('addPlayerA').onclick = () => {
  if (data.teams.A.players.length >= 20) return alert('Maks 20 spillere');
  data.teams.A.players.push({ name: '', goals: 0, assists: 0 });
  saveData();
  renderPlayers(playersAList, data.teams.A.players, 'A');
};

document.getElementById('addPlayerB').onclick = () => {
  if (data.teams.B.players.length >= 20) return alert('Maks 20 spillere');
  data.teams.B.players.push({ name: '', goals: 0, assists: 0 });
  saveData();
  renderPlayers(playersBList, data.teams.B.players, 'B');
};

// Timerkontroller
document.getElementById('startTimerBtn').addEventListener('click', startTimer);
document.getElementById('stopTimerBtn').addEventListener('click', stopTimer);
document.getElementById('resetTimerBtn').addEventListener('click', resetTimer);
document.getElementById('setTimerBtn').addEventListener('click', () => {
  const val = parseInt(document.getElementById('setTimerInput').value);
  if (!isNaN(val) && val >= 0) {
    setTimerSeconds(val);
  }
});

loadData();

