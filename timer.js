let timerInterval = null;
let remainingSeconds = 0;

function updateTimerDisplay() {
  const el = document.getElementById('timerDisplay');
  if (el) {
    const m = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
    const s = String(remainingSeconds % 60).padStart(2, '0');
    el.textContent = `${m}:${s}`;
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

export function setTimerSeconds(seconds) {
  remainingSeconds = seconds;
  updateTimerDisplay();
}
