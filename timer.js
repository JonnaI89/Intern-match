// timer.js

let timerInterval = null;
let remainingSeconds = 0;

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
    } else {
      stopTimer();
    }
  }, 1000);
}

export function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

export function resetTimer() {
  stopTimer();
  remainingSeconds = 0;
  updateTimerDisplay();
}

export function setTimerSeconds(seconds) {
  remainingSeconds = seconds;
  updateTimerDisplay();
}
