import { db, ref, onValue, set, update } from './firebase.js';

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

const rootRef = ref(db, '/');

function renderPlayers(listEl, players, team) {
  listEl.innerHTML = '';
  players.forEach((player, i) => {
    const li = document.createElement('li');
    
    // Spiller navn input
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = player.name;
    nameInput.size = 15;
    nameInput.placeholder = 'Spiller navn';
    nameInput.onchange = () => {
      player.name = nameInput.value;
      saveData();
    };
    
    // Mål teller
    const goalsSpan = document.createElement('span');
    goalsSpan.textContent = ` Mål: ${player.goals || 0} `;
    
    // Assist teller
    const assistsSpan = document.createElement('span');
    assistsSpan.textContent = `Assist: ${player.assists || 0} `;
    
    // +mål knapp
    const goalBtn = document.createElement('button');
    goalBtn.textContent = '+ Mål';
    goalBtn.onclick = () => {
      player.goals = (player.goals || 0) + 1;
      data.score[team]++;
      updateScoreUI();
      saveData();
    };
    
    // +assist knapp
    const assistBtn = document.createElement('button');
    assistBtn.textContent = '+ Assist';
    assistBtn.onclick = () => {
      player.assists = (player.assists || 0) + 1;
      updateScoreUI();
      saveData();
    };
    
    // Fjern spiller knapp
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
    data = snapshot.val() || data;
    teamANameInput.value = data.teams.A.name || 'Lag A';
    teamBNameInput.value = data.teams.B.name || 'Lag B';
    updateScoreUI();
    renderPlayers(playersAList, data.teams.A.players, 'A');
    renderPlayers(playersBList, data.teams.B.players, 'B');
  });
}

window.changeScore = function(team, delta) {
  data.score[team] += delta;
  if (data.score[team] < 0) data.score[team] = 0;
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
  if (data.teams.A.players.length >= 20) {
    alert('Maks 20 spillere per lag');
    return;
  }
  data.teams.A.players.push({ name: '', goals: 0, assists: 0 });
  saveData();
  renderPlayers(playersAList, data.teams.A.players, 'A');
};

document.getElementById('addPlayerB').onclick = () => {
  if (data.teams.B.players.length >= 20) {
    alert('Maks 20 spillere per lag');
    return;
  }
  data.teams.B.players.push({ name: '', goals: 0, assists: 0 });
  saveData();
  renderPlayers(playersBList, data.teams.B.players, 'B');
};

loadData();
