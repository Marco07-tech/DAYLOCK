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

// INDIAN FOODS DATABASE
const INDIAN_FOODS = [
  {name:"Roti (1 piece)", cal:71, protein:3, carbs:15, fat:0.4},
  {name:"Dal (1 cup)", cal:198, protein:13, carbs:33, fat:0.8},
  {name:"Paneer (100g)", cal:265, protein:18, carbs:3, fat:20},
  {name:"Rice (1 cup cooked)", cal:206, protein:4, carbs:45, fat:0.4},
  {name:"Chicken Breast (100g)", cal:165, protein:31, carbs:0, fat:3.6},
  {name:"Eggs (1 whole)", cal:68, protein:6, carbs:0.6, fat:4.8},
  {name:"Dahi (100g)", cal:61, protein:3.5, carbs:4.7, fat:3.3},
  {name:"Soya Chunks (100g dry)", cal:345, protein:52, carbs:33, fat:0.5},
  {name:"Aloo Sabzi (1 cup)", cal:150, protein:3, carbs:28, fat:4},
  {name:"Rajma (1 cup)", cal:225, protein:15, carbs:40, fat:1},
  {name:"Oats (100g dry)", cal:389, protein:17, carbs:66, fat:7},
  {name:"Banana (1 medium)", cal:89, protein:1, carbs:23, fat:0.3},
  {name:"Milk (1 cup 250ml)", cal:150, protein:8, carbs:12, fat:8},
  {name:"Peanut Butter (1 tbsp)", cal:94, protein:4, carbs:3, fat:8},
  {name:"Whey Protein (1 scoop 30g)", cal:120, protein:24, carbs:3, fat:2}
];

const DAY_TYPES = ['Push', 'Pull', 'Legs'];

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
    
    // Load theme
    currentTheme = getTheme();
    
    // Load profile
    loadProfileFromStorage();
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
// HAPTIC FEEDBACK HELPER
// ============================================================================

function haptic(type) {
  if (!navigator.vibrate) return;
  if (type === 'light') navigator.vibrate(10);
  if (type === 'medium') navigator.vibrate(25);
  if (type === 'heavy') navigator.vibrate([30, 10, 30]);
  if (type === 'success') navigator.vibrate([10, 50, 10]);
}

// ============================================================================
// TOAST NOTIFICATION HELPER
// ============================================================================

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--surface);
      border: 1px solid var(--accent);
      color: var(--accent);
      padding: 10px 16px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 200;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
      font-family: var(--mono);
      letter-spacing: 0.5px;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => {
    toast.style.opacity = '0';
  }, 2000);
}

// ============================================================================
// PROFILE & TDEE HELPERS
// ============================================================================

function calculateTDEE(profile) {
  const { age, height, weight, gender, activityLevel } = profile;
  
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  const activityMultipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very_active': 1.9
  };
  
  const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);
  let recommendedCal = tdee;
  
  if (profile.goal === 'cut') {
    recommendedCal = Math.round(tdee - 500);
  } else if (profile.goal === 'bulk') {
    recommendedCal = Math.round(tdee + 300);
  } else {
    recommendedCal = Math.round(tdee);
  }
  
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    recommended: recommendedCal
  };
}

function saveProfileToStorage() {
  try {
    localStorage.setItem('forge_profile', JSON.stringify(userProfile));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
}

function loadProfileFromStorage() {
  try {
    const saved = localStorage.getItem('forge_profile');
    if (saved) {
      userProfile = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading profile:', e);
  }
}

// ============================================================================
// NUTRITION HELPERS
// ============================================================================

function getTodayNutritionDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function getNutritionLog() {
  const date = getTodayNutritionDate();
  const key = `forge_nutrition_${date}`;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function saveNutritionLog(items) {
  const date = getTodayNutritionDate();
  const key = `forge_nutrition_${date}`;
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving nutrition log:', e);
  }
}

function calculateMacros(items) {
  let cals = 0, protein = 0, carbs = 0, fat = 0;
  items.forEach(item => {
    cals += item.cal * item.qty;
    protein += item.protein * item.qty;
    carbs += item.carbs * item.qty;
    fat += item.fat * item.qty;
  });
  return { cals: Math.round(cals), protein: Math.round(protein * 10) / 10, carbs: Math.round(carbs * 10) / 10, fat: Math.round(fat * 10) / 10 };
}

// ============================================================================
// WATER TRACKER HELPERS
// ============================================================================

function getWaterIntake() {
  const date = getTodayNutritionDate();
  const key = `forge_water_${date}`;
  try {
    return parseInt(localStorage.getItem(key)) || 0;
  } catch (e) {
    return 0;
  }
}

function saveWaterIntake(count) {
  const date = getTodayNutritionDate();
  const key = `forge_water_${date}`;
  try {
    localStorage.setItem(key, count.toString());
  } catch (e) {
    console.error('Error saving water intake:', e);
  }
}

// ============================================================================
// WORKOUT HISTORY HELPERS
// ============================================================================

function getWorkoutHistory() {
  try {
    const saved = localStorage.getItem('forge_history');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function saveWorkoutHistory(history) {
  try {
    localStorage.setItem('forge_history', JSON.stringify(history));
  } catch (e) {
    console.error('Error saving workout history:', e);
  }
}

function saveWorkoutSession(dayType, duration, exercises) {
  const history = getWorkoutHistory();
  const session = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    dayType: dayType,
    duration: duration,
    exercises: exercises
  };
  history.push(session);
  saveWorkoutHistory(history);
  return session;
}

// ============================================================================
// REMINDER HELPERS
// ============================================================================

function saveReminderSettings(settings) {
  try {
    localStorage.setItem('forge_reminder', JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving reminder settings:', e);
  }
}

function getReminderSettings() {
  try {
    const saved = localStorage.getItem('forge_reminder');
    return saved ? JSON.parse(saved) : { enabled: false, time: '18:00' };
  } catch (e) {
    return { enabled: false, time: '18:00' };
  }
}

// ============================================================================
// THEME HELPERS
// ============================================================================

function saveTheme(theme) {
  localStorage.setItem('forge_theme', theme);
  applyTheme(theme);
}

function getTheme() {
  return localStorage.getItem('forge_theme') || 'dark';
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.style.setProperty('--bg', '#f5f5f5');
    root.style.setProperty('--surface', '#ffffff');
    root.style.setProperty('--surface2', '#ebebeb');
    root.style.setProperty('--border', '#e0e0e0');
    root.style.setProperty('--border2', '#d0d0d0');
    root.style.setProperty('--text', '#111111');
    root.style.setProperty('--muted', '#888888');
    root.style.setProperty('--muted2', '#666666');
  } else {
    root.style.setProperty('--bg', '#0b0b0b');
    root.style.setProperty('--surface', '#141414');
    root.style.setProperty('--surface2', '#1c1c1c');
    root.style.setProperty('--border', '#252525');
    root.style.setProperty('--border2', '#2e2e2e');
    root.style.setProperty('--text', '#f0f0f0');
    root.style.setProperty('--muted', '#606060');
    root.style.setProperty('--muted2', '#888');
  }
}

// ============================================================================
// OFFLINE INDICATOR
// ============================================================================

function initOfflineIndicator() {
  let indicator = document.getElementById('offline-banner');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'offline-banner';
    indicator.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 24px;
      background: var(--red);
      color: white;
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      letter-spacing: 1px;
      z-index: 102;
      font-family: var(--mono);
      font-weight: 700;
    `;
    document.body.insertBefore(indicator, document.body.firstChild);
  }
  
  function updateOnlineStatus() {
    if (!navigator.onLine) {
      indicator.style.display = 'flex';
      indicator.textContent = 'OFFLINE MODE';
    } else {
      indicator.style.display = 'none';
    }
  }
  
  updateOnlineStatus();
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
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
let workoutStartTime = null;
let workoutTimerInterval = null;
let currentTheme = 'dark';
let userProfile = {
  name: '',
  age: 25,
  height: 175,
  weight: 75,
  gender: 'male',
  goal: 'maintain',
  activityLevel: 'moderate'
};

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
  ['dash', 'plan', 'ped', 'history', 'nutrition', 'profile'].forEach(t => {
    const screen = document.getElementById('screen-' + t);
    const tabBtn = document.getElementById('tab-' + t);
    if (screen) screen.classList.remove('active');
    if (tabBtn) tabBtn.classList.remove('active');
  });
  const screenEl = document.getElementById('screen-' + tab);
  const tabBtn = document.getElementById('tab-' + tab);
  if (screenEl) screenEl.classList.add('active');
  if (tabBtn) tabBtn.classList.add('active');
  haptic('light');
  
  // Rebuild screens when switching
  if (tab === 'nutrition') buildNutritionScreen();
  if (tab === 'history') buildHistoryScreen();
  if (tab === 'profile') buildProfileScreen();
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
// WORKOUT TOGGLE & TIMER
// ============================================================================

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateWorkoutTimer() {
  if (!workoutStartTime) return;
  const elapsed = Math.floor((Date.now() - workoutStartTime) / 1000);
  const timerEl = document.getElementById('workout-timer');
  if (timerEl) {
    timerEl.textContent = formatTime(elapsed);
  }
}

function toggleWorkout() {
  const selectedDayIdx = selectedDay !== null ? selectedDay : 0;
  const dayPlan = PLAN[selectedDayIdx];
  
  if (!workoutActive) {
    // START WORKOUT
    haptic('heavy');
    workoutActive = true;
    workoutStartTime = Date.now();
    saveWorkoutActiveToStorage();
    
    // Start timer
    const timerEl = document.getElementById('workout-timer');
    if (timerEl) timerEl.style.display = 'block';
    if (workoutTimerInterval) clearInterval(workoutTimerInterval);
    workoutTimerInterval = setInterval(updateWorkoutTimer, 1000);
    updateWorkoutTimer();
    
    const btn = document.getElementById('start-btn');
    const icon = document.getElementById('start-icon');
    const text = document.getElementById('start-text');
    if (btn) {
      btn.classList.add('active');
      if (icon) icon.outerHTML = '<div id="start-icon" class="dot-pulse"></div>';
      if (text) text.textContent = 'END WORKOUT';
    }
  } else {
    // END WORKOUT
    haptic('success');
    workoutActive = false;
    const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
    workoutStartTime = null;
    if (workoutTimerInterval) clearInterval(workoutTimerInterval);
    saveWorkoutActiveToStorage();
    
    // Hide timer
    const timerEl = document.getElementById('workout-timer');
    if (timerEl) timerEl.style.display = 'none';
    
    // Save workout session to history
    const exercises = dayPlan.exs.map(ex => ({
      name: ex.n,
      sets: ex.s,
      reps: ex.r,
      weight: ex.w,
      completed: ex.d
    }));
    saveWorkoutSession(dayPlan.type, duration, exercises);
    
    const btn = document.getElementById('start-btn');
    const icon = document.getElementById('start-icon');
    const text = document.getElementById('start-text');
    if (btn) {
      btn.classList.remove('active');
      if (icon) icon.outerHTML = '<span id="start-icon">▶</span>';
      if (text) text.textContent = 'START WORKOUT';
    }
    
    showToast('✓ Workout saved to history!');
  }
}

// ============================================================================
// WATER TRACKER UI
// ============================================================================

function buildWaterTracker() {
  const container = document.getElementById('water-tracker-container');
  if (!container) return;
  
  const intake = getWaterIntake();
  let html = '<div style="display:flex;gap:8px;margin-bottom:12px;">';
  for (let i = 0; i < 8; i++) {
    const filled = i < intake;
    html += `<div class="water-drop${filled ? ' filled' : ''}" onclick="toggleWater(${i})" style="cursor:pointer;font-size:24px;">${filled ? '💧' : '💧'}</div>`;
  }
  html += '</div>';
  html += `<div style="font-size:11px;color:var(--muted);letter-spacing:0.5px;">${intake} / 8 glasses</div>`;
  if (intake === 8) {
    html += `<div style="font-size:10px;color:var(--accent);margin-top:6px;letter-spacing:0.5px;">✓ HYDRATION GOAL MET!</div>`;
  }
  container.innerHTML = html;
}

function toggleWater(index) {
  let intake = getWaterIntake();
  if (index < intake) {
    // Toggle off
    intake = index;
  } else {
    // Toggle on
    intake = index + 1;
  }
  intake = Math.max(0, Math.min(8, intake));
  saveWaterIntake(intake);
  haptic('light');
  if (intake === 8) haptic('success');
  buildWaterTracker();
}

// ============================================================================
// NUTRITION SCREEN UI
// ============================================================================

function buildNutritionScreen() {
  const container = document.getElementById('nutrition-content');
  if (!container) return;
  
  const logTab = document.getElementById('nutrition-log-tab');
  const summaryTab = document.getElementById('nutrition-summary-tab');
  const logContent = document.getElementById('nutrition-log-content');
  const summaryContent = document.getElementById('nutrition-summary-content');
  
  // Ensure tabs and content exist
  if (!logTab || !summaryTab) return;
  
  logTab.classList.add('active');
  summaryTab.classList.remove('active');
  logContent.classList.add('active');
  summaryContent.classList.remove('active');
  
  buildNutritionLog();
}

function buildNutritionLog() {
  const logContent = document.getElementById('nutrition-log-content');
  if (!logContent) return;
  
  const items = getNutritionLog();
  const macros = calculateMacros(items);
  const tdee = userProfile && calculateTDEE(userProfile).recommended || 2000;
  const proteinGoal = Math.round(userProfile.weight * 2.2);
  
  let html = `
    <div style="margin-bottom:12px;">
      <input type="text" id="food-search" placeholder="Search foods..." style="width:100%;padding:10px;background:var(--bg);border:1px solid var(--border);color:var(--text);font-family:var(--mono);font-size:11px;outline:none;box-sizing:border-box;" />
    </div>
    <div id="food-list" style="margin-bottom:16px;">
  `;
  
  const searchVal = document.getElementById('food-search')?.value.toLowerCase() || '';
  const filtered = INDIAN_FOODS.filter(f => f.name.toLowerCase().includes(searchVal));
  
  filtered.forEach((food, idx) => {
    html += `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px;background:var(--surface);border:1px solid var(--border);margin-bottom:6px;border-radius:2px;">
      <div style="flex:1;font-size:10px;">
        <div style="color:var(--text);margin-bottom:2px;">${food.name}</div>
        <div style="color:var(--muted);font-size:9px;">P:${food.protein}g C:${food.carbs}g F:${food.fat}g</div>
      </div>
      <button style="background:var(--accent);color:#0b0b0b;border:none;padding:6px 10px;font-size:12px;cursor:pointer;font-family:var(--mono);font-weight:700;" onclick="addFoodItem(${idx})" onmousedown="haptic('medium')">+</button>
    </div>`;
  });
  
  html += '</div><div class="divider"></div><div style="margin:12px 0;"><div style="font-size:11px;color:var(--muted);letter-spacing:1px;margin-bottom:8px;">TODAY\'S LOG</div>';
  
  items.forEach((item, idx) => {
    html += `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px;background:var(--surface2);border:1px solid var(--border);margin-bottom:4px;">
      <div style="flex:1;font-size:10px;">${item.name} x${item.qty}</div>
      <div style="display:flex;gap:4px;align-items:center;">
        <button style="background:var(--bg);border:1px solid var(--border);color:var(--text);width:24px;height:24px;cursor:pointer;font-family:var(--mono);font-size:10px;" onclick="changeFoodQty(${idx},-1)">−</button>
        <button style="background:var(--red);color:white;border:none;width:24px;height:24px;cursor:pointer;font-family:var(--mono);font-size:10px;" onclick="removeFoodItem(${idx})">×</button>
      </div>
    </div>`;
  });
  
  html += `</div><div class="divider"></div><div style="margin:12px 0;">
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
      <div style="background:var(--surface);border:1px solid var(--border);padding:10px;text-align:center;border-radius:2px;">
        <div style="font-size:9px;color:var(--muted);letter-spacing:1px;margin-bottom:4px;">CALORIES</div>
        <div style="font-size:18px;font-weight:900;color:var(--accent);font-family:var(--display);">${macros.cals}</div>
        <div style="font-size:8px;color:var(--muted2);">/ ${tdee} kcal</div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--border);padding:10px;text-align:center;border-radius:2px;">
        <div style="font-size:9px;color:var(--muted);letter-spacing:1px;margin-bottom:4px;">PROTEIN</div>
        <div style="font-size:18px;font-weight:900;color:var(--accent);font-family:var(--display);">${macros.protein}g</div>
        <div style="font-size:8px;color:var(--muted2);">/ ${proteinGoal}g</div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--border);padding:10px;text-align:center;border-radius:2px;">
        <div style="font-size:9px;color:var(--muted);letter-spacing:1px;margin-bottom:4px;">CARBS</div>
        <div style="font-size:18px;font-weight:900;color:var(--accent);font-family:var(--display);">${macros.carbs}g</div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--border);padding:10px;text-align:center;border-radius:2px;">
        <div style="font-size:9px;color:var(--muted);letter-spacing:1px;margin-bottom:4px;">FAT</div>
        <div style="font-size:18px;font-weight:900;color:var(--accent);font-family:var(--display);">${macros.fat}g</div>
      </div>
    </div>
  </div>`;
  
  document.getElementById('nutrition-log-content').innerHTML = html;
  
  // Attach search listener
  setTimeout(() => {
    const search = document.getElementById('food-search');
    if (search) {
      search.addEventListener('input', buildNutritionLog);
    }
  }, 0);
}

function buildNutritionSummary() {
  const summaryContent = document.getElementById('nutrition-summary-content');
  if (!summaryContent) return;
  
  const items = getNutritionLog();
  const macros = calculateMacros(items);
  const profile = userProfile;
  const tdee = calculateTDEE(profile);
  const proteinGoal = Math.round(profile.weight * 2.2);
  
  let html = `
    <div style="margin-bottom:16px;">
      <div style="font-size:11px;color:var(--muted);letter-spacing:1px;margin-bottom:12px;">MACRO TARGETS</div>
      <div style="display:grid;gap:12px;">
        <div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:10px;">Calories</span>
            <span style="font-size:10px;color:var(--accent);">${macros.cals} / ${tdee.recommended}</span>
          </div>
          <div style="height:8px;background:var(--surface2);border:1px solid var(--border);overflow:hidden;">
            <div style="height:100%;background:var(--accent);width:${Math.min(100, (macros.cals / tdee.recommended) * 100)}%;"></div>
          </div>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:10px;">Protein</span>
            <span style="font-size:10px;color:var(--accent);">${macros.protein}g / ${proteinGoal}g</span>
          </div>
          <div style="height:8px;background:var(--surface2);border:1px solid var(--border);overflow:hidden;">
            <div style="height:100%;background:var(--accent);width:${Math.min(100, (macros.protein / proteinGoal) * 100)}%;"></div>
          </div>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:10px;">Carbs</span>
            <span style="font-size:10px;color:var(--accent);">${macros.carbs}g</span>
          </div>
          <div style="height:8px;background:var(--surface2);border:1px solid var(--border);overflow:hidden;">
            <div style="height:100%;background:var(--accent);width:${Math.min(100, (macros.carbs / (tdee.recommended * 0.45)) * 100)}%;"></div>
          </div>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:10px;">Fat</span>
            <span style="font-size:10px;color:var(--accent);">${macros.fat}g</span>
          </div>
          <div style="height:8px;background:var(--surface2);border:1px solid var(--border);overflow:hidden;">
            <div style="height:100%;background:var(--accent);width:${Math.min(100, (macros.fat / (tdee.recommended * 0.25)) * 100)}%;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  summaryContent.innerHTML = html;
}

function addFoodItem(idx) {
  const food = INDIAN_FOODS[idx];
  const items = getNutritionLog();
  const existing = items.findIndex(i => i.name === food.name);
  if (existing >= 0) {
    items[existing].qty += 1;
  } else {
    items.push({...food, qty: 1});
  }
  saveNutritionLog(items);
  buildNutritionLog();
}

function removeFoodItem(idx) {
  const items = getNutritionLog();
  items.splice(idx, 1);
  saveNutritionLog(items);
  buildNutritionLog();
}

function changeFoodQty(idx, delta) {
  const items = getNutritionLog();
  items[idx].qty = Math.max(1, items[idx].qty + delta);
  saveNutritionLog(items);
  buildNutritionLog();
}

// ============================================================================
// HISTORY SCREEN UI
// ============================================================================

function buildHistoryScreen() {
  const container = document.getElementById('history-content');
  if (!container) return;
  
  const history = getWorkoutHistory();
  if (history.length === 0) {
    container.innerHTML = `<div class="empty"><div class="empty-icon">📭</div><span>No workouts logged yet. Start your first session.</span></div>`;
    return;
  }
  
  // Group by date
  const grouped = {};
  history.forEach(session => {
    const date = new Date(session.date).toLocaleDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(session);
  });
  
  let html = `<button class="btn-export" onclick="exportWorkoutCSV()" onmousedown="haptic('medium')" style="width:100%;margin-bottom:12px;padding:10px;background:transparent;border:2px solid var(--accent);color:var(--accent);font-family:var(--display);font-size:11px;font-weight:700;cursor:pointer;letter-spacing:1px;">EXPORT CSV</button>`;
  
  // Newest first
  Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0])).forEach(([date, sessions]) => {
    sessions.forEach((session, sidx) => {
      const mins = Math.floor(session.duration / 60);
      const completed = session.exercises.filter(e => e.completed).length;
      html += `<div class="history-card" onclick="toggleHistoryCard(this)" style="background:var(--surface);border:1px solid var(--border);padding:12px;margin-bottom:8px;cursor:pointer;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="font-size:10px;color:var(--muted);">${date}</div>
          <div class="day-badge" style="background:var(--accent-dim);color:var(--accent);padding:4px 8px;border-radius:2px;font-size:9px;letter-spacing:0.5px;">${session.dayType}</div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text);">
          <span>${mins} min</span>
          <span>${completed}/${session.exercises.length} exercises</span>
        </div>
        <div class="history-details" style="display:none;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
          ${session.exercises.map(ex => `
            <div style="font-size:9px;padding:6px 0;border-bottom:1px solid var(--border2);display:flex;justify-content:space-between;">
              <span>${ex.name}</span>
              <span style="color:var(--muted);">${ex.sets}×${ex.reps}@${ex.weight}kg</span>
            </div>
          `).join('')}
        </div>
      </div>`;
    });
  });
  
  container.innerHTML = html;
}

function toggleHistoryCard(el) {
  const details = el.querySelector('.history-details');
  if (details) {
    details.style.display = details.style.display === 'none' ? 'block' : 'none';
  }
}

function exportWorkoutCSV() {
  const history = getWorkoutHistory();
  if (history.length === 0) {
    showToast('No data to export');
    return;
  }
  
  let csv = 'Date,Day Type,Duration (min),Exercises Completed,Total Volume\n';
  history.forEach(session => {
    const date = new Date(session.date).toLocaleDateString();
    const mins = Math.floor(session.duration / 60);
    const completed = session.exercises.filter(e => e.completed).length;
    const totalVolume = session.exercises.reduce((sum, e) => sum + (e.sets * e.reps * (e.weight || 0)), 0);
    csv += `"${date}","${session.dayType}",${mins},${completed}/${session.exercises.length},${totalVolume}\n`;
  });
  
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `forge-history-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('✓ CSV exported');
}

// ============================================================================
// PROFILE SCREEN UI
// ============================================================================

function buildProfileScreen() {
  const container = document.getElementById('profile-content');
  if (!container) return;
  
  const profile = userProfile;
  const tdee = calculateTDEE(profile);
  const proteinGoal = Math.round(profile.weight * 2.2);
  
  let html = `
    <div style="margin-bottom:16px;">
      <div style="font-size:11px;color:var(--muted);letter-spacing:1px;margin-bottom:8px;">PERSONAL INFO</div>
      
      <div style="margin-bottom:10px;">
        <label style="font-size:9px;color:var(--muted);display:block;margin-bottom:4px;">NAME</label>
        <input type="text" id="profile-name" value="${profile.name}" onchange="updateProfileField('name', this.value)" style="width:100%;padding:8px;background:var(--bg);border:1px solid var(--border);color:var(--text);font-family:var(--mono);font-size:11px;outline:none;box-sizing:border-box;" />
      </div>
      
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
        <div>
          <label style="font-size:9px;color:var(--muted);display:block;margin-bottom:4px;">AGE</label>
          <input type="number" id="profile-age" value="${profile.age}" onchange="updateProfileField('age', parseInt(this.value))" style="width:100%;padding:8px;background:var(--bg);border:1px solid var(--border);color:var(--text);font-family:var(--mono);font-size:11px;outline:none;box-sizing:border-box;" />
        </div>
        <div>
          <label style="font-size:9px;color:var(--muted);display:block;margin-bottom:4px;">HEIGHT (CM)</label>
          <input type="number" id="profile-height" value="${profile.height}" onchange="updateProfileField('height', parseInt(this.value))" style="width:100%;padding:8px;background:var(--bg);border:1px solid var(--border);color:var(--text);font-family:var(--mono);font-size:11px;outline:none;box-sizing:border-box;" />
        </div>
      </div>
      
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
        <div>
          <label style="font-size:9px;color:var(--muted);display:block;margin-bottom:4px;">WEIGHT (KG)</label>
          <input type="number" id="profile-weight" value="${profile.weight}" step="0.1" onchange="updateProfileField('weight', parseFloat(this.value))" style="width:100%;padding:8px;background:var(--bg);border:1px solid var(--border);color:var(--text);font-family:var(--mono);font-size:11px;outline:none;box-sizing:border-box;" />
        </div>
        <div>
          <label style="font-size:9px;color:var(--muted);display:block;margin-bottom:4px;">GENDER</label>
          <div style="display:flex;gap:6px;">
            <button class="gender-btn${profile.gender === 'male' ? ' active' : ''}" onclick="updateProfileField('gender', 'male')">♂ MALE</button>
            <button class="gender-btn${profile.gender === 'female' ? ' active' : ''}" onclick="updateProfileField('gender', 'female')">♀ FEMALE</button>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom:10px;">
        <label style="font-size:9px;color:var(--muted);display:block;margin-bottom:4px;">GOAL</label>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
          <button class="goal-btn${profile.goal === 'cut' ? ' active' : ''}" onclick="updateProfileField('goal', 'cut')">CUT</button>
          <button class="goal-btn${profile.goal === 'maintain' ? ' active' : ''}" onclick="updateProfileField('goal', 'maintain')">MAINTAIN</button>
          <button class="goal-btn${profile.goal === 'bulk' ? ' active' : ''}" onclick="updateProfileField('goal', 'bulk')">BULK</button>
        </div>
      </div>
      
      <div style="margin-bottom:16px;">
        <label style="font-size:9px;color:var(--muted);display:block;margin-bottom:4px;">ACTIVITY LEVEL</label>
        <select id="profile-activity" onchange="updateProfileField('activityLevel', this.value)" style="width:100%;padding:8px;background:var(--bg);border:1px solid var(--border);color:var(--text);font-family:var(--mono);font-size:11px;outline:none;box-sizing:border-box;">
          <option value="sedentary" ${profile.activityLevel === 'sedentary' ? 'selected' : ''}>Sedentary</option>
          <option value="light" ${profile.activityLevel === 'light' ? 'selected' : ''}>Light</option>
          <option value="moderate" ${profile.activityLevel === 'moderate' ? 'selected' : ''}>Moderate</option>
          <option value="active" ${profile.activityLevel === 'active' ? 'selected' : ''}>Active</option>
          <option value="very_active" ${profile.activityLevel === 'very_active' ? 'selected' : ''}>Very Active</option>
        </select>
      </div>
    </div>
    
    <div class="divider"></div>
    
    <div style="margin-bottom:16px;">
      <div style="font-size:11px;color:var(--muted);letter-spacing:1px;margin-bottom:12px;">TDEE CALCULATOR</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
        <div style="background:var(--surface);border:1px solid var(--border);padding:10px;text-align:center;border-radius:2px;">
          <div style="font-size:9px;color:var(--muted);letter-spacing:0.5px;margin-bottom:4px;">BMR</div>
          <div style="font-size:20px;font-weight:900;color:var(--accent);font-family:var(--display);">${tdee.bmr}</div>
          <div style="font-size:8px;color:var(--muted2);">kcal/day</div>
        </div>
        <div style="background:var(--surface);border:1px solid var(--border);padding:10px;text-align:center;border-radius:2px;">
          <div style="font-size:9px;color:var(--muted);letter-spacing:0.5px;margin-bottom:4px;">TDEE</div>
          <div style="font-size:20px;font-weight:900;color:var(--accent);font-family:var(--display);">${tdee.tdee}</div>
          <div style="font-size:8px;color:var(--muted2);">kcal/day</div>
        </div>
        <div style="background:var(--surface);border:1px solid var(--border);padding:10px;text-align:center;border-radius:2px;">
          <div style="font-size:9px;color:var(--muted);letter-spacing:0.5px;margin-bottom:4px;">GOAL</div>
          <div style="font-size:20px;font-weight:900;color:var(--accent);font-family:var(--display);">${tdee.recommended}</div>
          <div style="font-size:8px;color:var(--muted2);">kcal/day</div>
        </div>
      </div>
    </div>
    
    <div class="divider"></div>
    
    <div style="margin-bottom:16px;">
      <div style="font-size:11px;color:var(--muted);letter-spacing:1px;margin-bottom:8px;">MACRO GOALS</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:var(--surface);border:1px solid var(--border);padding:10px;text-align:center;border-radius:2px;">
          <div style="font-size:9px;color:var(--muted);letter-spacing:0.5px;">PROTEIN</div>
          <div style="font-size:18px;font-weight:900;color:var(--accent);font-family:var(--display);">${proteinGoal}g</div>
          <div style="font-size:8px;color:var(--muted2);">${Math.round(proteinGoal * 4)} kcal</div>
        </div>
        <div style="background:var(--surface);border:1px solid var(--border);padding:10px;text-align:center;border-radius:2px;">
          <div style="font-size:9px;color:var(--muted);letter-spacing:0.5px;">CARBS + FAT</div>
          <div style="font-size:18px;font-weight:900;color:var(--accent);font-family:var(--display);">${Math.round(tdee.recommended - proteinGoal * 4)}g</div>
          <div style="font-size:8px;color:var(--muted2);">remaining</div>
        </div>
      </div>
    </div>
    
    <div class="divider"></div>
    
    <div style="margin-bottom:16px;">
      <div style="font-size:11px;color:var(--muted);letter-spacing:1px;margin-bottom:8px;">REMINDERS</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <label style="font-size:10px;color:var(--text);">Workout Reminder</label>
        <input type="checkbox" id="reminder-toggle" onchange="toggleReminder()" style="width:20px;height:20px;cursor:pointer;" />
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <label style="font-size:9px;color:var(--muted);">Time:</label>
        <input type="time" id="reminder-time" value="18:00" onchange="updateReminderTime(this.value)" style="padding:6px;background:var(--bg);border:1px solid var(--border);color:var(--text);font-family:var(--mono);font-size:10px;outline:none;" />
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Load reminder settings
  setTimeout(() => {
    const settings = getReminderSettings();
    const toggle = document.getElementById('reminder-toggle');
    const timeInput = document.getElementById('reminder-time');
    if (toggle) toggle.checked = settings.enabled;
    if (timeInput) timeInput.value = settings.time;
  }, 0);
}

function updateProfileField(field, value) {
  userProfile[field] = value;
  saveProfileToStorage();
  buildProfileScreen();
  buildNutritionSummary();
  haptic('light');
}

function toggleReminder() {
  const toggle = document.getElementById('reminder-toggle');
  const settings = getReminderSettings();
  settings.enabled = toggle.checked;
  saveReminderSettings(settings);
  if (settings.enabled && 'Notification' in window) {
    Notification.requestPermission();
  }
  haptic('light');
}

function updateReminderTime(time) {
  const settings = getReminderSettings();
  settings.time = time;
  saveReminderSettings(settings);
  haptic('light');
}

// ============================================================================
// NOTIFICATION & REMINDER CHECKER
// ============================================================================

function checkReminders() {
  const settings = getReminderSettings();
  if (!settings.enabled || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  
  const history = getWorkoutHistory();
  const today = getTodayNutritionDate();
  const todayWorkout = history.find(session => session.date.includes(today));
  
  if (todayWorkout) return; // Already worked out
  
  const [hour, min] = settings.time.split(':').map(Number);
  const now = new Date();
  if (now.getHours() === hour && now.getMinutes() === min) {
    new Notification('FORGE 💪', {
      body: 'Aaj workout nahi kiya abhi tak! Time to FORGE.',
      icon: '/icons/icon-192.png'
    });
  }
}

// ============================================================================
// THEME TOGGLE
// ============================================================================

function toggleTheme() {
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  currentTheme = newTheme;
  saveTheme(newTheme);
  haptic('light');
  updateThemeToggleButton();
}

function updateThemeToggleButton() {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.textContent = currentTheme === 'dark' ? '☀' : '🌙';
  }
}

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
  
  // Apply saved theme
  applyTheme(currentTheme);
  updateThemeToggleButton();
  
  // Initialize offline indicator
  initOfflineIndicator();

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
  buildWaterTracker();

  // Restore workout button state
  if (workoutActive) {
    const btn = document.getElementById('start-btn');
    const icon = document.getElementById('start-icon');
    const text = document.getElementById('start-text');
    if (btn) {
      btn.classList.add('active');
      if (icon) icon.outerHTML = '<div id="start-icon" class="dot-pulse"></div>';
      if (text) text.textContent = 'END WORKOUT';
    }
    // Restart timer
    const timerEl = document.getElementById('workout-timer');
    if (timerEl) timerEl.style.display = 'block';
    if (workoutTimerInterval) clearInterval(workoutTimerInterval);
    workoutTimerInterval = setInterval(updateWorkoutTimer, 1000);
  }

  // Try to show install banner
  showInstallBanner();
  
  // Add transition to root
  document.getElementById('forge-root').style.transition = 'background 0.3s, color 0.3s';
  
  // Check reminders every minute
  setInterval(checkReminders, 60000);
});

// Handle app coming to foreground from standalone mode
document.addEventListener('resume', () => {
  // Reload data if needed
  loadFromStorage();
});
