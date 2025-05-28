import { db, ref, onValue } from './firebase.js';

const scoreAEl = document.getElementById('scoreA');
const scoreBEl = document.getElementById('scoreB');
const teamANameEl = document.getElementById('teamAName');
const teamBNameEl = document.getElementById('teamBName');
const playersAEl = document.getElementById('playersA');
const playersBEl = document.getElementById('playersB');

const rootRef = ref(db, '/');

onValue(rootRef, (snapshot) => {
  const data = snapshot.val() || {};
  const score = data.score || { A: 0, B: 0 };
  const teams = data.teams || {
    A: { name: 'Lag A', players: [] },
    B: { name: 'Lag B', players: [] }
  };

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
});
