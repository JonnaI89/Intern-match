// timer.js

let timerInterval = null;
let remainingSeconds = 0;
let onTimerUpdate = null;  // Callback for å sende oppdateringer ut

function updateTimerDisplay() {
  const timerDisplay = document.getElementById('timerDisplay');
  if (timerDisplay) {
    const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
    const seconds = String(remainingSeconds % 60).padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
  }
}

export function initTimer() {
  updateTimerDisplay();
}

export function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateTimerDisplay();
      if (onTimerUpdate) onTimerUpdate(remainingSeconds, true, Date.now());
    } else {
      stopTimer();
    }
  }, 1000);
  if (onTimerUpdate) onTimerUpdate(remainingSeconds, true, Date.now());
}

export function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  if (onTimerUpdate) onTimerUpdate(remainingSeconds, false, Date.now());
}

export function resetTimer() {
  stopTimer();
  remainingSeconds = 0;
  updateTimerDisplay();
  if (onTimerUpdate) onTimerUpdate(remainingSeconds, false, Date.now());
}

export function setTimerSeconds(seconds) {
  remainingSeconds = seconds;
  updateTimerDisplay();
  if (onTimerUpdate) onTimerUpdate(remainingSeconds, false, Date.now());
}

export function registerTimerUpdateCallback(callback) {
  onTimerUpdate = callback;
}
