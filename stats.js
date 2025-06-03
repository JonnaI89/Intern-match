import { db, ref, onValue } from './firebase.js';

const statsView = document.getElementById('statsView');

onValue(ref(db, '/stats'), (snapshot) => {
  const stats = snapshot.val();
  if (!stats) {
    statsView.innerHTML = "<p>Ingen statistikk funnet.</p>";
    return;
  }
  const players = Object.entries(stats)
    .map(([name, s]) => ({ name, ...s }))
    .sort((a, b) => b.points - a.points);

  statsView.innerHTML = `
    <table>
      <tr><th>Navn</th><th>Mål</th><th>Assist</th><th>Poeng</th></tr>
      ${players.map(p => `<tr><td>${p.name}</td><td>${p.goals}</td><td>${p.assists}</td><td>${p.points}</td></tr>`).join('')}
    </table>
  `;
});
