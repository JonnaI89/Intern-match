// admin.js
import { db, ref, onValue, set } from './firebase.js';
import { initTimer, startTimer, stopTimer, resetTimer, setTimerSeconds, registerTimerUpdateCallback } from './timer.js';

// HTML-elementer
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
    statsDiv.appendChild(goalMinusBtn); // Add minus button here
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

      // Sørg for at players alltid er array
      if (!Array.isArray(data.teams.A.players)) data.teams.A.players = [];
      if (!Array.isArray(data.teams.B.players)) data.teams.B.players = [];
    }

    teamANameInput.value = data.teams.A.name || 'Lag A';
    teamBNameInput.value = data.teams.B.name || 'Lag B';

    updateScoreUI();
    renderPlayers(playersAList, data.teams.A.players, 'A');
    renderPlayers(playersBList, data.teams.B.players, 'B');

    teamANameInput.disabled = false;
    teamBNameInput.disabled = false;

    initTimer();
  });
}

function changeScore(team, delta) {
  data.score[team] += delta;
  if (data.score[team] < 0) data.score[team] = 0;
  updateScoreUI();
  saveData();
}

// Navn-endringer
teamANameInput.onchange = () => {
  data.teams.A.name = teamANameInput.value;
  saveData();
};
teamBNameInput.onchange = () => {
  data.teams.B.name = teamBNameInput.value;
  saveData();
};

// Legg til spillere
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

// Poeng-knapper
document.getElementById('scoreAPlus').addEventListener('click', () => changeScore('A', 1));
document.getElementById('scoreAMinus').addEventListener('click', () => changeScore('A', -1));
document.getElementById('scoreBPlus').addEventListener('click', () => changeScore('B', 1));
document.getElementById('scoreBMinus').addEventListener('click', () => changeScore('B', -1));

// Funksjon for å skrive timerstatus til Firebase
function updateTimerInFirebase(seconds, running, lastUpdate) {
  // Les eksisterende data først for å ikke overskrive score og teams
  onValue(rootRef, (snapshot) => {
    const currentData = snapshot.val() || {};
    const newData = {
      ...currentData,
      timer: {
        seconds,
        running,
        lastUpdate
      }
    };
    set(rootRef, newData);
  }, { onlyOnce: true });
}

// Registrer callback til timeren
registerTimerUpdateCallback(updateTimerInFirebase);

// Timer-knapper
document.getElementById('startTimerBtn')?.addEventListener('click', () => startTimer());
document.getElementById('stopTimerBtn')?.addEventListener('click', () => stopTimer());
document.getElementById('resetTimerBtn')?.addEventListener('click', () => resetTimer());
document.getElementById('setTimerBtn')?.addEventListener('click', () => {
  const val = parseInt(document.getElementById('setTimerInput')?.value, 10);
  if (!isNaN(val) && val >= 0) {
    setTimerSeconds(val);
  }
});

loadData();
