import { db, ref, onValue, get } from './firebase.js';

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

// Hent alle hendelser (arkiv + liveEvents) for keeperstatistikk
async function showKeeperStats() {
  // Hent arkiverte hendelser
  const archiveSnap = await get(ref(db, '/archive'));
  let allEvents = [];
  if (archiveSnap.exists()) {
    Object.values(archiveSnap.val()).forEach(arr => allEvents = allEvents.concat(arr));
  }
  // Hent liveEvents
  const liveSnap = await get(ref(db, '/liveEvents'));
  if (liveSnap.exists()) {
    allEvents = allEvents.concat(liveSnap.val());
  }

  // Beregn keeperstatistikk
  const keeperStats = {};
  (allEvents || []).forEach(ev => {
    if (typeof ev !== 'object' || !ev.text) return;
    // Redning
    const saveMatch = ev.text.match(/^Save (.+)$/);
    if (saveMatch) {
      const keeper = saveMatch[1];
      keeperStats[keeper] = keeperStats[keeper] || { saves: 0, goalsAgainst: 0 };
      keeperStats[keeper].saves += 1;
    }
    // Innslupne mål
    const goalMatch = ev.text.match(/^Goal (.+)$/);
    if (goalMatch) {
      const keeper = goalMatch[1];
      keeperStats[keeper] = keeperStats[keeper] || { saves: 0, goalsAgainst: 0 };
      keeperStats[keeper].goalsAgainst += 1;
    }
  });

  // Kalkuler redningsprosent
  Object.keys(keeperStats).forEach(name => {
    const s = keeperStats[name];
    const shots = s.saves + s.goalsAgainst;
    s.savePct = shots > 0 ? Math.round((s.saves / shots) * 100) : 0;
  });

  // Vis keeperstatistikk hvis det finnes
  if (Object.keys(keeperStats).length > 0) {
    statsView.innerHTML += `
      <h3>Keeperstatistikk</h3>
      <table>
        <tr><th>Navn</th><th>Redninger</th><th>Innslupne</th><th>Rednings%</th></tr>
        ${Object.entries(keeperStats).map(([name, s]) =>
          `<tr><td>${name}</td><td>${s.saves}</td><td>${s.goalsAgainst}</td><td>${s.savePct}%</td></tr>`
        ).join('')}
      </table>
    `;
  }
}

// Kjør funksjonen etter at siden har lastet
showKeeperStats();
