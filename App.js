// ============================================================================
// CONSTANTS & STATE
// ============================================================================

const QUOTES = [
  "Pain is temporary. Pride is forever.",
  "The only bad workout is the one that didn't happen.",
  "Discipline is doing what needs to be done.",
  "Sweat is just fat crying.",
  "Champions are made on hard days.",
  "Your body achieves what your mind believes."
];

const WEEKLY = [45, 60, 30, 75, 50, 90, 40];
const WEEKLY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const TODAY_IDX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
const PED_WEEKLY = [8234, 9456, 7123, 10234, 8901, 6543, 7432];

const PLAN_DEFAULT = [
  {
    day: 'Mon', type: 'Push', exs: [
      { n: 'Bench Press', s: 4, r: 8, w: 135, d: false },
      { n: 'Incline DB Press', s: 3, r: 10, w: 40, d: false },
      { n: 'Overhead Press', s: 3, r: 8, w: 95, d: false },
      { n: 'Tricep Dips', s: 3, r: 12, w: 0, d: false },
      { n: 'Lateral Raises', s: 3, r: 15, w: 15, d: false }
    ]
  },
  {
    day: 'Tue', type: 'Pull', exs: [
      { n: 'Deadlift', s: 4, r: 6, w: 225, d: false },
      { n: 'Pull-ups', s: 4, r: 8, w: 0, d: false },
      { n: 'Barbell Rows', s: 3, r: 10, w: 135, d: false },
      { n: 'Face Pulls', s: 3, r: 15, w: 30, d: false },
      { n: 'Bicep Curls', s: 3, r: 12, w: 25, d: false }
    ]
  },
  {
    day: 'Wed', type: 'Legs', exs: [
      { n: 'Squats', s: 4, r: 8, w: 185, d: false },
      { n: 'Romanian DL', s: 3, r: 10, w: 155, d: false },
      { n: 'Leg Press', s: 3, r: 12, w: 320, d: false },
      { n: 'Leg Curls', s: 3, r: 15, w: 70, d: false },
      { n: 'Calf Raises', s: 4, r: 20, w: 90, d: false }
    ]
  },
  { day: 'Thu', type: 'Rest', exs: [] },
  {
    day: 'Fri', type: 'Push', exs: [
      { n: 'Bench Press', s: 4, r: 8, w: 140, d: false },
      { n: 'Incline DB Press', s: 3, r: 10, w: 45, d: false },
      { n: 'Overhead Press', s: 3, r: 8, w: 100, d: false },
      { n: 'Tricep Pushdown', s: 3, r: 12, w: 50, d: false }
    ]
  },
  {
    day: 'Sat', type: 'Pull', exs: [
      { n: 'Deadlift', s: 4, r: 5, w: 235, d: false },
      { n: 'Pull-ups', s: 4, r: 10, w: 0, d: false },
      { n: 'T-Bar Rows', s: 3, r: 10, w: 120, d: false },
      { n: 'Hammer Curls', s: 3, r: 12, w: 25, d: false }
    ]
  },
  { day: 'Sun', type: 'Rest', exs: [] }
];

// ============================================================================
// localStorage HELPERS
// ============================================================================

function loadFromStorage() {
  try {
    // Load PLAN with exercise states
    const savedPlan = localStorage.getItem('forge_plan');
    if (savedPlan) {
      const parsed = JSON.parse(savedPlan);
      PLAN = parsed;
    } else {
      PLAN = JSON.parse(JSON.stringify(PLAN_DEFAULT));
    }

    // Load pedometer data
    pedSteps = parseInt(localStorage.getItem('forge_steps')) || 7432;
    pedGoal = parseInt(localStorage.getItem('forge_goal')) || 10000;

    // Load workout active state
    workoutActive = localStorage.getItem('forge_workout_active') === 'true';
  } catch (e) {
    console.error('Error loading from localStorage:', e);
    PLAN = JSON.parse(JSON.stringify(PLAN_DEFAULT));
    pedSteps = 7432;
    pedGoal = 10000;
    workoutActive = false;
  }
}

function savePlanToStorage() {
  try {
    localStorage.setItem('forge_plan', JSON.stringify(PLAN));
  } catch (e) {
    console.error('Error saving plan to localStorage:', e);
  }
}

function savePedStepsToStorage() {
  try {
    localStorage.setItem('forge_steps', pedSteps.toString());
  } catch (e) {
    console.error('Error saving steps to localStorage:', e);
  }
}

function savePedGoalToStorage() {
  try {
    localStorage.setItem('forge_goal', pedGoal.toString());
  } catch (e) {
    console.error('Error saving goal to localStorage:', e);
  }
}

function saveWorkoutActiveToStorage() {
  try {
    localStorage.setItem('forge_workout_active', workoutActive.toString());
  } catch (e) {
    console.error('Error saving workout active to localStorage:', e);
  }
}

// ============================================================================
// STATE VARIABLES
// ============================================================================

let PLAN = JSON.parse(JSON.stringify(PLAN_DEFAULT));
let pedSteps = 7432;
let pedGoal = 10000;
let selectedDay = null;
let workoutActive = false;
let newExName = '';

// ============================================================================
// UI BUILDERS
// ============================================================================

function buildBarChart(containerId, data, labels, highlightIdx) {
  const el = document.getElementById(containerId);
  const max = Math.max(...data);
  el.innerHTML = data.map((v, i) => {
    const h = Math.round((v / max) * 72);
    const isHigh = i === highlightIdx;
    const isDim = v === 0;
    return `<div class="bar-wrap">
      <div class="bar${isHigh ? ' today' : isDim ? ' dim' : ''}" style="height:${h}px"></div>
      <span class="bar-lbl">${labels[i]}</span>
    </div>`;
  }).join('');
}

function buildStreakDots() {
  const el = document.getElementById('streak-dots');
  el.innerHTML = Array.from({ length: 12 }, (_, i) => `<div class="streak-dot${i >= 10 ? ' off' : ''}"></div>`).join('');
}

function buildWeekGrid() {
  const el = document.getElementById('week-grid');
  el.innerHTML = PLAN.map((d, i) => `
    <div class="day-btn${d.type === 'Rest' ? ' rest' : ''}${selectedDay === i ? ' active' : ''}" onclick="selectDay(${i})">
      <span class="day-name">${d.day.slice(0, 2).toUpperCase()}</span>
      <span class="day-type">${d.type}</span>
      <span class="day-count">${d.exs.length > 0 ? d.exs.length + 'ex' : '—'}</span>
    </div>`).join('');
}

function buildExPanel() {
  const el = document.getElementById('exercise-panel');
  if (selectedDay === null) {
    el.innerHTML = '';
    return;
  }
  const day = PLAN[selectedDay];
  if (day.type === 'Rest') {
    el.innerHTML = `<div class="exercise-panel"><div class="empty"><div class="empty-icon">😴</div><span>Rest day. Recovery is part of training.</span></div></div>`;
    return;
  }
  const exRows = day.exs.map((ex, i) => `
    <div class="ex-row">
      <div class="ex-check${ex.d ? ' checked' : ''}" onclick="toggleEx(${selectedDay},${i})">${ex.d ? '✓' : ''}</div>
      <div class="ex-info">
        <div class="ex-name${ex.d ? ' done' : ''}">${ex.n}</div>
        <div class="ex-sets">${ex.s} sets × ${ex.r} reps</div>
      </div>
      <div class="weight-wrap">
        <input type="number" value="${ex.w || ''}" placeholder="0" onchange="setWeight(${selectedDay},${i},this.value)" />
        <span class="weight-lbl">kg</span>
      </div>
    </div>`).join('');
  const done = day.exs.filter(e => e.d).length;
  el.innerHTML = `<div class="exercise-panel">
    <div class="ex-header">${day.day} — ${day.type} <span style="font-size:12px;color:var(--muted);font-weight:400">(${done}/${day.exs.length})</span></div>
    ${exRows}
    <div class="add-row">
      <input id="new-ex-input" placeholder="Add exercise..." onkeydown="if(event.key==='Enter')addEx(${selectedDay})" />
      <button class="add-btn" onclick="addEx(${selectedDay})">+</button>
    </div>
  </div>`;
}

// ============================================================================
// TAB & DAY NAVIGATION
// ============================================================================

function selectDay(i) {
  selectedDay = selectedDay === i ? null : i;
  buildWeekGrid();
  buildExPanel();
}

function switchTab(tab) {
  ['dash', 'plan', 'ped'].forEach(t => {
    document.getElementById('screen-' + t).classList.remove('active');
    document.getElementById('tab-' + t).classList.remove('active');
  });
  document.getElementById('screen-' + tab).classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
}

// ============================================================================
// EXERCISE FUNCTIONS
// ============================================================================

function toggleEx(di, ei) {
  PLAN[di].exs[ei].d = !PLAN[di].exs[ei].d;
  savePlanToStorage();
  buildWeekGrid();
  buildExPanel();
}

function setWeight(di, ei, v) {
  PLAN[di].exs[ei].w = parseInt(v) || 0;
  savePlanToStorage();
}

function addEx(di) {
  const inp = document.getElementById('new-ex-input');
  const name = inp ? inp.value.trim() : '';
  if (!name) return;
  PLAN[di].exs.push({ n: name, s: 3, r: 10, w: 0, d: false });
  savePlanToStorage();
  buildWeekGrid();
  buildExPanel();
}

// ============================================================================
// PEDOMETER FUNCTIONS
// ============================================================================

function updatePedRing() {
  const pct = Math.min(pedSteps / pedGoal, 1);
  const circ = 2 * Math.PI * 85;
  const offset = circ - pct * circ;
  document.getElementById('ring-fill').style.strokeDasharray = circ;
  document.getElementById('ring-fill').style.strokeDashoffset = offset;
  document.getElementById('ped-steps').textContent = pedSteps.toLocaleString();
  document.getElementById('ped-pct').textContent = Math.round(pct * 100) + '%';
  document.getElementById('ped-dist').textContent = (pedSteps * 0.000762).toFixed(2);
  document.getElementById('ped-cal').textContent = Math.round(pedSteps * 0.04);
  document.getElementById('ped-min').textContent = Math.round(pedSteps / 100);
}

function addSteps(n) {
  pedSteps += n;
  savePedStepsToStorage();
  updatePedRing();
  buildBarChart('ped-chart', [...PED_WEEKLY.slice(0, -1), pedSteps], WEEKLY_LABELS, TODAY_IDX);
}

function updateGoal() {
  pedGoal = parseInt(document.getElementById('goal-input').value) || 10000;
  savePedGoalToStorage();
  updatePedRing();
}

// ============================================================================
// WORKOUT TOGGLE
// ============================================================================

function toggleWorkout() {
  workoutActive = !workoutActive;
  saveWorkoutActiveToStorage();
  const btn = document.getElementById('start-btn');
  const icon = document.getElementById('start-icon');
  const text = document.getElementById('start-text');
  if (workoutActive) {
    btn.classList.add('active');
    icon.outerHTML = '<div id="start-icon" class="dot-pulse"></div>';
    text.textContent = 'WORKOUT IN PROGRESS';
  } else {
    btn.classList.remove('active');
    document.getElementById('start-icon').outerHTML = '<span id="start-icon">▶</span>';
    text.textContent = 'START WORKOUT';
  }
}

// ============================================================================
// PWA INSTALL PROMPT
// ============================================================================

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallBanner();
});

function showInstallBanner() {
  // Don't show if already in standalone mode (installed PWA)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return;
  }

  // Check if dismissal was saved to localStorage
  if (localStorage.getItem('forge_install_dismissed') === 'true') {
    return;
  }

  const banner = document.getElementById('install-banner');
  banner.classList.add('show');
}

document.getElementById('install-btn')?.addEventListener('click', async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response to the install prompt: ${outcome}`);

  deferredPrompt = null;
  hideInstallBanner();
});

document.getElementById('dismiss-btn')?.addEventListener('click', () => {
  localStorage.setItem('forge_install_dismissed', 'true');
  hideInstallBanner();
});

function hideInstallBanner() {
  const banner = document.getElementById('install-banner');
  banner.classList.remove('show');
}

// ============================================================================
// SERVICE WORKER REGISTRATION
// ============================================================================

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.error('Service Worker registration failed:', err);
    });
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Load persisted state
  loadFromStorage();

  // Register service worker
  registerServiceWorker();

  // Set random quote
  document.getElementById('dash-quote').textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  // Build initial UI
  buildBarChart('weekly-chart', WEEKLY, WEEKLY_LABELS, TODAY_IDX);
  buildStreakDots();
  buildWeekGrid();
  updatePedRing();
  buildBarChart('ped-chart', PED_WEEKLY, WEEKLY_LABELS, TODAY_IDX);

  // Restore workout button state
  if (workoutActive) {
    const btn = document.getElementById('start-btn');
    const icon = document.getElementById('start-icon');
    const text = document.getElementById('start-text');
    btn.classList.add('active');
    icon.outerHTML = '<div id="start-icon" class="dot-pulse"></div>';
    text.textContent = 'WORKOUT IN PROGRESS';
  }

  // Try to show install banner
  showInstallBanner();
});

// Handle app coming to foreground from standalone mode
document.addEventListener('resume', () => {
  // Reload data if needed
  loadFromStorage();
});
