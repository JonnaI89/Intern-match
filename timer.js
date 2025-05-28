const timerDisplay = document.getElementById('timerDisplay');

function updateTimerDisplay(seconds) {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = (seconds % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${min}:${sec}`;
}
