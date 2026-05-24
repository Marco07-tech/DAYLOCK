/* ========== CONSTANTS ========== */
const QUOTES = ["Pain is temporary. Pride is forever.", "The only bad workout is the one that didn't happen.", "Discipline is doing what needs to be done.", "Sweat is just fat crying.", "Champions are made on hard days.", "Your body achieves what your mind believes."];
const WEEKLY_LABELS = ['M','T','W','T','F','S','S'];
const TODAY_IDX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
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
const PLAN_DEFAULT = [
  {day:'Mon', type:'Push', exs:[{n:'Bench Press',s:4,r:8,w:60,d:false},{n:'Incline DB Press',s:3,r:10,w:24,d:false},{n:'Overhead Press',s:3,r:8,w:40,d:false},{n:'Tricep Dips',s:3,r:12,w:0,d:false},{n:'Lateral Raises',s:3,r:15,w:8,d:false}]},
  {day:'Tue', type:'Pull', exs:[{n:'Deadlift',s:4,r:6,w:100,d:false},{n:'Pull-ups',s:4,r:8,w:0,d:false},{n:'Barbell Rows',s:3,r:10,w:60,d:false},{n:'Face Pulls',s:3,r:15,w:15,d:false},{n:'Bicep Curls',s:3,r:12,w:12,d:false}]},
  {day:'Wed', type:'Legs', exs:[{n:'Squats',s:4,r:8,w:80,d:false},{n:'Romanian DL',s:3,r:10,w:70,d:false},{n:'Leg Press',s:3,r:12,w:120,d:false},{n:'Leg Curls',s:3,r:15,w:30,d:false},{n:'Calf Raises',s:4,r:20,w:40,d:false}]},
  {day:'Thu', type:'Rest', exs:[]},
  {day:'Fri', type:'Push', exs:[{n:'Bench Press',s:4,r:8,w:62,d:false},{n:'Incline DB Press',s:3,r:10,w:26,d:false},{n:'Overhead Press',s:3,r:8,w:42,d:false},{n:'Tricep Pushdown',s:3,r:12,w:20,d:false}]},
  {day:'Sat', type:'Pull', exs:[{n:'Deadlift',s:4,r:5,w:105,d:false},{n:'Pull-ups',s:4,r:10,w:0,d:false},{n:'T-Bar Rows',s:3,r:10,w:50,d:false},{n:'Hammer Curls',s:3,r:12,w:12,d:false}]},
  {day:'Sun', type:'Rest', exs:[]}
];

/* ========== STATE VARIABLES ========== */
let PLAN = JSON.parse(JSON.stringify(PLAN_DEFAULT));
let pedSteps = 0;
let pedGoal = 10000;
let selectedDay = null;
let workoutActive = false;
let workoutStartTime = null;
let workoutTimerInterval = null;
let currentTheme = 'dark';
let selectedGoal = null;
let userProfile = { name:'', age:20, height:175, weight:70, gender:'male', goal:'maintain', activityLevel:'moderate' };

/* ========== LOCALSTORAGE FUNCTIONS ========== */
function loadFromStorage() {
  const planData = localStorage.getItem('forge_plan');
  if (planData) PLAN = JSON.parse(planData);
  
  pedSteps = parseInt(localStorage.getItem('forge_steps')) || 0;
  pedGoal = parseInt(localStorage.getItem('forge_goal')) || 10000;
  
  workoutActive = localStorage.getItem('forge_workout_active') === 'true';
  
  const profileData = localStorage.getItem('forge_profile');
  if (profileData) userProfile = JSON.parse(profileData);
}

function savePlanToStorage() {
  localStorage.setItem('forge_plan', JSON.stringify(PLAN));
}

function savePedStepsToStorage() {
  localStorage.setItem('forge_steps', pedSteps.toString());
}

function savePedGoalToStorage() {
  localStorage.setItem('forge_goal', pedGoal.toString());
}

function saveWorkoutActiveToStorage() {
  localStorage.setItem('forge_workout_active', workoutActive.toString());
}

function saveProfileToStorage() {
  localStorage.setItem('forge_profile', JSON.stringify(userProfile));
}

function loadProfileFromStorage() {
  const profileData = localStorage.getItem('forge_profile');
  if (profileData) userProfile = JSON.parse(profileData);
  return userProfile;
}

function getNutritionLog() {
  const today = new Date().toISOString().split('T')[0];
  const log = localStorage.getItem('forge_nutrition_' + today);
  return log ? JSON.parse(log) : [];
}

function saveNutritionLog(log) {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('forge_nutrition_' + today, JSON.stringify(log));
}

function getWaterIntake() {
  const today = new Date().toISOString().split('T')[0];
  const water = localStorage.getItem('forge_water_' + today);
  return water ? JSON.parse(water) : Array(8).fill(false);
}

function saveWaterIntake(water) {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('forge_water_' + today, JSON.stringify(water));
}

function getWorkoutHistory() {
  const history = localStorage.getItem('forge_history');
  return history ? JSON.parse(history) : [];
}

function saveWorkoutHistory(history) {
  localStorage.setItem('forge_history', JSON.stringify(history));
}

function saveWorkoutSession(sessionData) {
  const history = getWorkoutHistory();
  history.push(sessionData);
  saveWorkoutHistory(history);
}

/* ========== AUTH FLOW ========== */
async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('auth-error');
  if (!email || !password) {
    errEl.textContent = '❌ Enter email and password';
    errEl.style.display = 'block';
    return;
  }
  btn.textContent = 'LOGGING IN...';
  btn.disabled = true;
  errEl.style.display = 'none';
  try {
    const data = await forgeAPI.login(email, password);
    if (data.error) throw new Error(data.error);
    onAuthSuccess();
    showToast('✅ Welcome back!');
  } catch(err) {
    errEl.textContent = '❌ ' + (err.message || 'Login failed');
    errEl.style.display = 'block';
  } finally {
    btn.textContent = 'LOGIN';
    btn.disabled = false;
  }
}

async function handleSignup() {
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  const btn = document.getElementById('signup-btn');
  const errEl = document.getElementById('auth-error');
  if (!email || !password || !confirm) {
    errEl.textContent = '❌ All fields required';
    errEl.style.display = 'block';
    return;
  }
  if (password !== confirm) {
    errEl.textContent = '❌ Passwords do not match';
    errEl.style.display = 'block';
    return;
  }
  if (password.length < 6) {
    errEl.textContent = '❌ Password must be 6+ characters';
    errEl.style.display = 'block';
    return;
  }
  btn.textContent = 'CREATING...';
  btn.disabled = true;
  errEl.style.display = 'none';
  try {
    const data = await forgeAPI.signup(email, password);
    if (data.error) throw new Error(data.error);
    onAuthSuccess();
    showToast('✅ Account created!');
  } catch(err) {
    errEl.textContent = '❌ ' + (err.message || 'Signup failed');
    errEl.style.display = 'block';
  } finally {
    btn.textContent = 'SIGNUP';
    btn.disabled = false;
  }
}

function onAuthSuccess() {
  document.getElementById('auth-modal').style.display = 'none';
  loadFromStorage();
  
  const onboardingDone = localStorage.getItem('forge_onboarding_done');
  if (!onboardingDone) {
    document.getElementById('forge-root').style.display = 'block';
    initApp();
    document.getElementById('onboarding-modal').style.display = 'flex';
  } else {
    document.getElementById('forge-root').style.display = 'block';
    initApp();
  }
}

async function handleLogout() {
  localStorage.removeItem('forge_token');
  localStorage.removeItem('forge_user');
  forgeAPI.token = null;
  try { await forgeAPI.logout(); } catch(e) {}
  document.getElementById('forge-root').style.display = 'none';
  document.getElementById('auth-modal').style.display = 'flex';
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('auth-error').style.display = 'none';
  showToast('✅ Logged out!');
}

function activateOfflineMode() {
  localStorage.setItem('forge_token', 'offline_mode');
  forgeAPI.token = 'offline_mode';
  onAuthSuccess();
  showToast('🔓 Offline mode');
}

function switchAuthForm() {
  const lf = document.getElementById('login-form');
  const sf = document.getElementById('signup-form');
  const errEl = document.getElementById('auth-error');
  errEl.style.display = 'none';
  if (lf.style.display === 'none') {
    lf.style.display = 'block';
    sf.style.display = 'none';
  } else {
    lf.style.display = 'none';
    sf.style.display = 'block';
  }
}

function loginWithGoogle() {
  forgeAPI.signInWithGoogle();
}

/* ========== ONBOARDING FUNCTIONS ========== */
function obNext(step) {
  const errEl = document.getElementById('ob-error');
  errEl.style.display = 'none';
  if (step === 1) {
    const name = document.getElementById('ob-name').value.trim();
    if (!name) {
      errEl.textContent = 'Enter your name';
      errEl.style.display = 'block';
      return;
    }
    userProfile.name = name;
    document.getElementById('ob-screen-1').style.display = 'none';
    document.getElementById('ob-screen-2').style.display = 'block';
    obUpdateSteps(2);
  } else if (step === 2) {
    const age = parseInt(document.getElementById('ob-age').value);
    const height = parseInt(document.getElementById('ob-height').value);
    const weight = parseInt(document.getElementById('ob-weight').value);
    if (!age || !height || !weight) {
      errEl.textContent = 'Fill all fields';
      errEl.style.display = 'block';
      return;
    }
    userProfile.age = age;
    userProfile.height = height;
    userProfile.weight = weight;
    document.getElementById('ob-screen-2').style.display = 'none';
    document.getElementById('ob-screen-3').style.display = 'block';
    obUpdateSteps(3);
  }
}

function obBack(step) {
  document.getElementById('ob-error').style.display = 'none';
  if (step === 2) {
    document.getElementById('ob-screen-2').style.display = 'none';
    document.getElementById('ob-screen-1').style.display = 'block';
    obUpdateSteps(1);
  } else if (step === 3) {
    document.getElementById('ob-screen-3').style.display = 'none';
    document.getElementById('ob-screen-2').style.display = 'block';
    obUpdateSteps(2);
  }
}

function obUpdateSteps(current) {
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById('ob-step-' + i);
    if (el) el.classList.toggle('active', i <= current);
  }
}

function selectGoal(goal) {
  selectedGoal = goal;
  ['cut','maintain','bulk'].forEach(g => {
    const el = document.getElementById('ob-goal-' + g);
    if (el) el.classList.toggle('selected', g === goal);
  });
}

function obFinish() {
  if (!selectedGoal) {
    document.getElementById('ob-error').textContent = 'Select a goal';
    document.getElementById('ob-error').style.display = 'block';
    return;
  }
  userProfile.goal = selectedGoal;
  userProfile.gender = 'male';
  userProfile.activityLevel = 'moderate';
  saveProfileToStorage();
  localStorage.setItem('forge_onboarding_done', 'true');
  document.getElementById('onboarding-modal').style.display = 'none';
  showToast('💪 Welcome to FORGE!');
}

/* ========== UTILITY FUNCTIONS ========== */
function haptic(type) {
  if (navigator.vibrate) {
    if (type === 'light') navigator.vibrate(10);
    else if (type === 'medium') navigator.vibrate(25);
    else if (type === 'heavy') navigator.vibrate(50);
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.opacity = '1';
  haptic('light');
  setTimeout(() => {
    toast.style.opacity = '0';
  }, 2000);
}

function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('forge_theme', theme);
  updateThemeToggleButton();
}

function toggleTheme() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

function updateThemeToggleButton() {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
  }
}

/* ========== CHART BUILDING ========== */
function buildBarChart(containerId, data, labels, highlightIdx) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  if (!data || data.length === 0) return;
  
  const maxVal = Math.max(...data, 1);
  
  for (let i = 0; i < data.length; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'bar-wrap';
    
    const bar = document.createElement('div');
    bar.className = 'bar';
    if (i === highlightIdx) bar.classList.add('today');
    else if (data[i] === 0) bar.classList.add('dim');
    const barHeight = (data[i] / maxVal) * 100;
    bar.style.height = barHeight + '%';
    
    const lbl = document.createElement('div');
    lbl.className = 'bar-lbl';
    lbl.textContent = labels[i] || '';
    
    wrap.appendChild(bar);
    wrap.appendChild(lbl);
    container.appendChild(wrap);
  }
}

function buildStreakDots() {
  const history = getWorkoutHistory();
  const dots = [];
  for (let i = 0; i < 30; i++) {
    dots.push(false);
  }
  history.forEach(session => {
    const date = new Date(session.date);
    const today = new Date();
    const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    if (diff < 30) dots[29 - diff] = true;
  });
  
  const container = document.getElementById('streak-dots');
  if (!container) return;
  container.innerHTML = '';
  dots.forEach(active => {
    const dot = document.createElement('div');
    dot.className = 'streak-dot' + (active ? '' : ' off');
    container.appendChild(dot);
  });
}

/* ========== PLAN/WORKOUT FUNCTIONS ========== */
function buildWeekGrid() {
  const container = document.getElementById('week-grid');
  if (!container) return;
  container.innerHTML = '';
  
  PLAN.forEach((dayPlan, dayIdx) => {
    const btn = document.createElement('button');
    btn.className = 'day-btn';
    if (dayIdx === selectedDay) btn.classList.add('active');
    if (dayPlan.type === 'Rest') btn.classList.add('rest');
    
    btn.onclick = () => selectDay(dayIdx);
    
    const dayName = document.createElement('div');
    dayName.className = 'day-name';
    dayName.textContent = dayPlan.day;
    
    const dayType = document.createElement('div');
    dayType.className = 'day-type';
    dayType.textContent = dayPlan.type === 'Rest' ? 'REST' : dayPlan.type.substring(0,3).toUpperCase();
    
    const dayCount = document.createElement('div');
    dayCount.className = 'day-count';
    dayCount.textContent = dayPlan.exs.length + 'ex';
    
    btn.appendChild(dayName);
    btn.appendChild(dayType);
    btn.appendChild(dayCount);
    container.appendChild(btn);
  });
}

function buildExPanel() {
  const container = document.getElementById('exercise-panel');
  if (!container || selectedDay === null) return;
  
  const dayPlan = PLAN[selectedDay];
  container.innerHTML = '';
  
  const title = document.createElement('div');
  title.style.cssText = 'font-family:var(--display);font-size:14px;font-weight:700;margin-bottom:12px;text-transform:uppercase;';
  title.textContent = dayPlan.day + ' - ' + dayPlan.type;
  container.appendChild(title);
  
  dayPlan.exs.forEach((ex, ei) => {
    const row = document.createElement('div');
    row.className = 'ex-row';
    
    const check = document.createElement('div');
    check.className = 'ex-check' + (ex.d ? ' checked' : '');
    check.textContent = ex.d ? '✓' : '';
    check.onclick = () => toggleEx(selectedDay, ei);
    
    const info = document.createElement('div');
    info.style.flex = '1';
    
    const name = document.createElement('div');
    name.className = 'ex-name' + (ex.d ? ' done' : '');
    name.textContent = ex.n;
    
    const sets = document.createElement('div');
    sets.className = 'ex-sets';
    sets.textContent = ex.s + ' × ' + ex.r;
    
    info.appendChild(name);
    info.appendChild(sets);
    
    const wrap = document.createElement('div');
    wrap.className = 'weight-wrap';
    
    const input = document.createElement('input');
    input.type = 'number';
    input.value = ex.w;
    input.onchange = (e) => setWeight(selectedDay, ei, parseFloat(e.target.value) || 0);
    
    const lbl = document.createElement('div');
    lbl.className = 'weight-lbl';
    lbl.textContent = 'kg';
    
    wrap.appendChild(input);
    wrap.appendChild(lbl);
    
    row.appendChild(check);
    row.appendChild(info);
    row.appendChild(wrap);
    container.appendChild(row);
  });
  
  const addBtn = document.createElement('button');
  addBtn.className = 'btn-primary';
  addBtn.style.marginTop = '12px';
  addBtn.textContent = '+ ADD EXERCISE';
  addBtn.onclick = () => addEx(selectedDay);
  container.appendChild(addBtn);
}

function selectDay(i) {
  selectedDay = i;
  buildWeekGrid();
  buildExPanel();
}

function toggleEx(di, ei) {
  PLAN[di].exs[ei].d = !PLAN[di].exs[ei].d;
  savePlanToStorage();
  buildExPanel();
  haptic('medium');
}

function setWeight(di, ei, v) {
  PLAN[di].exs[ei].w = v;
  savePlanToStorage();
  haptic('light');
}

function addEx(di) {
  PLAN[di].exs.push({n:'New Exercise',s:3,r:10,w:0,d:false});
  savePlanToStorage();
  buildExPanel();
}

/* ========== PEDOMETER FUNCTIONS ========== */
function buildPedScreen() {
  updatePedRing();
  const stepsData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const history = getWorkoutHistory();
    const daySteps = Math.floor(Math.random() * 12000) + 2000;
    stepsData.push(daySteps);
  }
  buildBarChart('ped-chart', stepsData, WEEKLY_LABELS, TODAY_IDX);
}

function updatePedRing() {
  const pct = Math.min(100, (pedSteps / pedGoal) * 100);
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (circumference * pct / 100);
  
  const ring = document.getElementById('ring-fill');
  if (ring) ring.style.strokeDashoffset = offset;
  
  const pctEl = document.getElementById('ped-pct');
  if (pctEl) pctEl.textContent = Math.round(pct) + '%';
  
  const stepsEl = document.getElementById('ped-steps');
  if (stepsEl) stepsEl.textContent = pedSteps.toLocaleString();
  
  const distEl = document.getElementById('ped-dist');
  if (distEl) distEl.textContent = (pedSteps * 0.0008).toFixed(2);
  
  const calEl = document.getElementById('ped-cal');
  if (calEl) calEl.textContent = Math.round(pedSteps * 0.04);
  
  const minEl = document.getElementById('ped-min');
  if (minEl) minEl.textContent = Math.round(pedSteps / 100);
}

function addSteps(n) {
  pedSteps += n;
  savePedStepsToStorage();
  updatePedRing();
  haptic('medium');
  showToast('➕ ' + n + ' steps added');
}

function updateGoal() {
  const input = document.getElementById('goal-input');
  if (input && input.value) {
    pedGoal = parseInt(input.value);
    savePedGoalToStorage();
    updatePedRing();
  }
}

/* ========== NUTRITION FUNCTIONS ========== */
function buildWaterTracker() {
  const water = getWaterIntake();
  const container = document.getElementById('water-tracker-container');
  if (!container) return;
  
  container.innerHTML = '';
  water.forEach((filled, i) => {
    const drop = document.createElement('div');
    drop.className = 'water-drop' + (filled ? ' filled' : '');
    drop.textContent = '💧';
    drop.onclick = () => toggleWater(i);
    container.appendChild(drop);
  });
}

function toggleWater(index) {
  const water = getWaterIntake();
  water[index] = !water[index];
  saveWaterIntake(water);
  buildWaterTracker();
  haptic('light');
}

function buildNutritionScreen(tab = 'log') {
  const logContent = document.getElementById('nutrition-log-content');
  const summaryContent = document.getElementById('nutrition-summary-content');
  const logTab = document.getElementById('nutrition-tab-log');
  const summaryTab = document.getElementById('nutrition-tab-summary');
  
  if (tab === 'log') {
    if (logContent) logContent.style.display = 'block';
    if (summaryContent) summaryContent.style.display = 'none';
    if (logTab) {
      logTab.style.borderBottomColor = 'var(--accent)';
      logTab.style.color = 'var(--accent)';
    }
    if (summaryTab) {
      summaryTab.style.borderBottomColor = 'transparent';
      summaryTab.style.color = 'var(--muted)';
    }
    buildNutritionLog();
  } else {
    if (logContent) logContent.style.display = 'none';
    if (summaryContent) summaryContent.style.display = 'block';
    if (logTab) {
      logTab.style.borderBottomColor = 'transparent';
      logTab.style.color = 'var(--muted)';
    }
    if (summaryTab) {
      summaryTab.style.borderBottomColor = 'var(--accent)';
      summaryTab.style.color = 'var(--accent)';
    }
    buildNutritionSummary();
  }
}

function buildNutritionLog() {
  const log = getNutritionLog();
  const container = document.getElementById('nutrition-log-content');
  if (!container) return;
  
  container.innerHTML = '';
  
  const title = document.createElement('div');
  title.style.cssText = 'font-family:var(--display);font-size:12px;color:var(--muted);margin-bottom:12px;letter-spacing:1px;';
  title.textContent = 'TODAY\'S LOG';
  container.appendChild(title);
  
  if (log.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'text-align:center;padding:20px;color:var(--muted);font-size:12px;';
    empty.textContent = 'No foods logged yet';
    container.appendChild(empty);
  } else {
    log.forEach((item, idx) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'food-item';
      
      const info = document.createElement('div');
      info.style.flex = '1';
      const name = document.createElement('div');
      name.style.cssText = 'font-size:12px;color:var(--text);';
      name.textContent = item.name + ' × ' + item.qty;
      const cals = document.createElement('div');
      cals.style.cssText = 'font-size:10px;color:var(--muted);margin-top:2px;';
      cals.textContent = Math.round(item.cal * item.qty) + ' cal';
      info.appendChild(name);
      info.appendChild(cals);
      
      const removeBtn = document.createElement('button');
      removeBtn.style.cssText = 'background:rgba(240,91,91,0.15);border:1px solid rgba(240,91,91,0.3);color:var(--red);width:24px;height:24px;border-radius:6px;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
      removeBtn.textContent = '−';
      removeBtn.onclick = () => removeFoodItem(idx);
      
      itemEl.appendChild(info);
      itemEl.appendChild(removeBtn);
      container.appendChild(itemEl);
    });
  }
  
  const addSection = document.createElement('div');
  addSection.style.marginTop = '16px';
  
  const sectionTitle = document.createElement('div');
  sectionTitle.style.cssText = 'font-family:var(--display);font-size:12px;color:var(--muted);margin-bottom:12px;letter-spacing:1px;';
  sectionTitle.textContent = 'ADD FOOD';
  addSection.appendChild(sectionTitle);
  
  INDIAN_FOODS.forEach((food, idx) => {
    const btn = document.createElement('button');
    btn.className = 'food-item';
    btn.style.justifyContent = 'space-between';
    btn.style.cursor = 'pointer';
    btn.style.border = 'none';
    btn.style.padding = '10px 12px';
    
    const nameEl = document.createElement('span');
    nameEl.style.cssText = 'text-align:left;color:var(--text);font-size:12px;';
    nameEl.textContent = food.name;
    
    const addBtn = document.createElement('span');
    addBtn.className = 'food-add-btn';
    addBtn.textContent = '+';
    
    btn.appendChild(nameEl);
    btn.appendChild(addBtn);
    btn.onclick = () => addFoodItem(idx);
    addSection.appendChild(btn);
  });
  
  container.appendChild(addSection);
}

function buildNutritionSummary() {
  const log = getNutritionLog();
  const container = document.getElementById('nutrition-summary-content');
  if (!container) return;
  
  let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
  log.forEach(item => {
    totalCal += item.cal * item.qty;
    totalProtein += item.protein * item.qty;
    totalCarbs += item.carbs * item.qty;
    totalFat += item.fat * item.qty;
  });
  
  const tdee = calculateTDEE(userProfile);
  
  container.innerHTML = '';
  
  const card = document.createElement('div');
  card.className = 'card';
  
  const title = document.createElement('div');
  title.className = 'card-title';
  title.textContent = 'TODAY\'S SUMMARY';
  card.appendChild(title);
  
  const calorieSection = document.createElement('div');
  calorieSection.style.marginBottom = '20px';
  const calLabel = document.createElement('div');
  calLabel.style.cssText = 'display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:8px;';
  calLabel.innerHTML = `<span>Calories</span><span>${Math.round(totalCal)} / ${tdee} cal</span>`;
  calorieSection.appendChild(calLabel);
  
  const calBar = document.createElement('div');
  calBar.style.cssText = 'height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;';
  const calFill = document.createElement('div');
  calFill.style.cssText = 'height:100%;background:var(--accent-grad);width:' + Math.min(100, (totalCal/tdee)*100) + '%;';
  calBar.appendChild(calFill);
  calorieSection.appendChild(calBar);
  card.appendChild(calorieSection);
  
  const macroTitle = document.createElement('div');
  macroTitle.style.cssText = 'font-family:var(--display);font-size:10px;color:var(--muted);letter-spacing:1px;margin-bottom:12px;margin-top:16px;';
  macroTitle.textContent = 'MACROS';
  card.appendChild(macroTitle);
  
  const macros = [
    {label:'Protein',val:Math.round(totalProtein),color:'#7C6EF5'},
    {label:'Carbs',val:Math.round(totalCarbs),color:'#5B8AF0'},
    {label:'Fat',val:Math.round(totalFat),color:'#F05B5B'}
  ];
  
  macros.forEach(macro => {
    const wrap = document.createElement('div');
    wrap.style.marginBottom = '12px';
    const label = document.createElement('div');
    label.style.cssText = 'display:flex;justify-content:space-between;font-size:10px;color:var(--muted);margin-bottom:4px;';
    label.innerHTML = `<span>${macro.label}</span><span>${macro.val}g</span>`;
    wrap.appendChild(label);
    
    const bar = document.createElement('div');
    bar.style.cssText = 'height:4px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden;';
    const fill = document.createElement('div');
    fill.style.cssText = `height:100%;background:${macro.color};width:50%;`;
    bar.appendChild(fill);
    wrap.appendChild(bar);
    card.appendChild(wrap);
  });
  
  container.appendChild(card);
}

function addFoodItem(idx) {
  const food = INDIAN_FOODS[idx];
  const log = getNutritionLog();
  const existing = log.find(f => f.name === food.name);
  if (existing) {
    existing.qty += 1;
  } else {
    log.push({...food, qty:1});
  }
  saveNutritionLog(log);
  buildNutritionLog();
  buildNutritionSummary();
  haptic('light');
}

function removeFoodItem(idx) {
  const log = getNutritionLog();
  log.splice(idx, 1);
  saveNutritionLog(log);
  buildNutritionLog();
  buildNutritionSummary();
  haptic('light');
}

function changeFoodQty(idx, delta) {
  const log = getNutritionLog();
  if (log[idx]) {
    log[idx].qty = Math.max(1, log[idx].qty + delta);
    saveNutritionLog(log);
    buildNutritionLog();
  }
}

/* ========== HISTORY FUNCTIONS ========== */
function buildHistoryScreen() {
  const history = getWorkoutHistory();
  const container = document.getElementById('history-content');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (history.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'text-align:center;padding:40px 20px;color:var(--muted);font-size:12px;';
    empty.textContent = 'No workouts logged yet. Start training!';
    container.appendChild(empty);
    return;
  }
  
  history.reverse().slice(0, 20).forEach(session => {
    const card = document.createElement('div');
    card.className = 'history-card';
    
    const date = document.createElement('div');
    date.className = 'history-date';
    date.textContent = new Date(session.date).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
    
    const type = document.createElement('div');
    type.className = 'history-type';
    type.textContent = session.type || 'Workout';
    
    const details = document.createElement('div');
    details.style.cssText = 'font-size:11px;color:var(--muted);line-height:1.6;';
    details.innerHTML = `
      <div>Duration: ${formatTime(session.duration)}</div>
      <div>Exercises: ${session.exCount || 0}</div>
      ${session.notes ? '<div>' + session.notes + '</div>' : ''}
    `;
    
    card.appendChild(date);
    card.appendChild(type);
    card.appendChild(details);
    container.appendChild(card);
  });
}

/* ========== PROFILE FUNCTIONS ========== */
function buildProfileScreen() {
  const emailEl = document.getElementById('user-email');
  const usernameEl = document.getElementById('user-username');
  
  const token = localStorage.getItem('forge_token');
  if (emailEl) emailEl.textContent = token === 'offline_mode' ? 'OFFLINE MODE' : 'user@example.com';
  if (usernameEl) usernameEl.textContent = userProfile.name || 'Not set';
  
  document.getElementById('profile-age').value = userProfile.age;
  document.getElementById('profile-height').value = userProfile.height;
  document.getElementById('profile-weight').value = userProfile.weight;
  document.getElementById('profile-gender').value = userProfile.gender;
  document.getElementById('profile-goal').value = userProfile.goal;
  document.getElementById('profile-activity').value = userProfile.activityLevel;
}

function saveProfileChanges() {
  const newUsername = document.getElementById('new-username').value.trim();
  if (newUsername) {
    userProfile.name = newUsername;
    document.getElementById('new-username').value = '';
  }
  
  userProfile.age = parseInt(document.getElementById('profile-age').value) || 20;
  userProfile.height = parseInt(document.getElementById('profile-height').value) || 175;
  userProfile.weight = parseInt(document.getElementById('profile-weight').value) || 70;
  userProfile.gender = document.getElementById('profile-gender').value;
  userProfile.goal = document.getElementById('profile-goal').value;
  userProfile.activityLevel = document.getElementById('profile-activity').value;
  
  saveProfileToStorage();
  buildProfileScreen();
  showToast('✅ Profile saved');
}

function calculateTDEE(profile) {
  let bmr;
  if (profile.gender === 'male') {
    bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
  } else {
    bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
  }
  
  const activityMultipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'veryactive': 1.9
  };
  
  const tdee = bmr * (activityMultipliers[profile.activityLevel] || 1.55);
  
  if (profile.goal === 'cut') return Math.round(tdee - 500);
  if (profile.goal === 'bulk') return Math.round(tdee + 500);
  return Math.round(tdee);
}

/* ========== DASHBOARD FUNCTIONS ========== */
function updateDashboardStats() {
  const log = getNutritionLog();
  let calories = 0;
  log.forEach(item => {
    calories += item.cal * item.qty;
  });
  
  const caloriesEl = document.getElementById('dash-calories');
  if (caloriesEl) caloriesEl.textContent = Math.round(calories);
  
  const history = getWorkoutHistory();
  let activeMinutes = 0;
  const today = new Date().toISOString().split('T')[0];
  history.forEach(session => {
    if (session.date.startsWith(today)) {
      activeMinutes += session.duration / 60;
    }
  });
  
  const activeEl = document.getElementById('dash-active');
  if (activeEl) activeEl.textContent = Math.round(activeMinutes);
  
  const stepsEl = document.getElementById('dash-steps');
  if (stepsEl) stepsEl.textContent = pedSteps.toLocaleString();
  
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    const hasWorkout = history.some(s => s.date.startsWith(dateStr));
    if (hasWorkout) streak++;
    else break;
  }
  
  const streakEl = document.getElementById('dash-streak');
  if (streakEl) streakEl.textContent = streak;
}

/* ========== TAB SWITCHING ========== */
function switchTab(tab) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => s.classList.remove('active'));
  
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(b => b.classList.remove('active'));
  
  const screen = document.getElementById('screen-' + tab);
  if (screen) {
    screen.classList.add('active');
    
    if (tab === 'dash') updateDashboardStats();
    if (tab === 'plan') buildWeekGrid();
    if (tab === 'ped') buildPedScreen();
    if (tab === 'history') buildHistoryScreen();
    if (tab === 'nutrition') buildNutritionScreen('log');
    if (tab === 'profile') buildProfileScreen();
  }
  
  const btn = document.getElementById('tab-' + tab);
  if (btn) btn.classList.add('active');
  
  haptic('light');
}

/* ========== WORKOUT TIMER ========== */
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
  }
  return `${mins}:${secs.toString().padStart(2,'0')}`;
}

function updateWorkoutTimer() {
  if (!workoutActive || !workoutStartTime) return;
  
  const now = Date.now();
  const elapsed = Math.floor((now - workoutStartTime) / 1000);
  
  const timerEl = document.querySelector('.workout-timer');
  if (timerEl) {
    timerEl.textContent = formatTime(elapsed);
  }
}

function toggleWorkout() {
  workoutActive = !workoutActive;
  saveWorkoutActiveToStorage();
  
  const btn = document.getElementById('start-btn');
  if (workoutActive) {
    workoutStartTime = Date.now();
    if (btn) btn.classList.add('active');
    if (workoutTimerInterval) clearInterval(workoutTimerInterval);
    workoutTimerInterval = setInterval(updateWorkoutTimer, 1000);
    showToast('💪 Workout started!');
    haptic('heavy');
  } else {
    if (btn) btn.classList.remove('active');
    if (workoutTimerInterval) clearInterval(workoutTimerInterval);
    
    const elapsed = Math.floor((Date.now() - workoutStartTime) / 1000);
    const session = {
      date: new Date().toISOString(),
      duration: elapsed,
      type: PLAN[TODAY_IDX].type,
      exCount: PLAN[TODAY_IDX].exs.length,
      notes: ''
    };
    saveWorkoutSession(session);
    
    showToast('✅ Workout saved!');
    haptic('medium');
  }
  
  buildWeekGrid();
}

/* ========== DATA MANAGEMENT ========== */
async function syncAllData() {
  showToast('🔄 Syncing...');
  try {
    if (forgeAPI.token && forgeAPI.token !== 'offline_mode') {
      await forgeAPI.sync({plan: PLAN, steps: pedSteps, profile: userProfile});
    }
    showToast('✅ Data synced');
  } catch(e) {
    showToast('⚠️ Sync failed');
  }
}

function exportData() {
  const data = {
    profile: userProfile,
    plan: PLAN,
    steps: pedSteps,
    goal: pedGoal,
    history: getWorkoutHistory(),
    nutrition: getNutritionLog()
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'forge_data_' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  showToast('📥 Data exported');
}

function clearLocalData() {
  const confirm_clear = confirm('Clear all data? This cannot be undone.');
  if (confirm_clear) {
    localStorage.clear();
    showToast('🗑️ All data cleared');
    handleLogout();
  }
}

/* ========== INITIALIZATION ========== */
function initApp() {
  loadProfileFromStorage();
  updateDashboardStats();
  
  const hour = new Date().getHours();
  let greeting = 'GM';
  if (hour >= 12 && hour < 18) greeting = 'GA';
  if (hour >= 18) greeting = 'GN';
  
  const greetingEl = document.querySelector('.greeting');
  if (greetingEl) {
    greetingEl.textContent = greeting + ', ' + (userProfile.name || 'FORGER') + '!';
  }
  
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  const quoteEl = document.getElementById('dash-quote');
  if (quoteEl) quoteEl.textContent = '"' + quote + '"';
  
  buildBarChart('weekly-chart', [45, 60, 75, 30, 90, 60, 0], WEEKLY_LABELS, TODAY_IDX);
  buildWaterTracker();
  buildStreakDots();
  
  selectedDay = TODAY_IDX;
  
  if (workoutActive) {
    const btn = document.getElementById('start-btn');
    if (btn) btn.classList.add('active');
    if (workoutTimerInterval) clearInterval(workoutTimerInterval);
    workoutTimerInterval = setInterval(updateWorkoutTimer, 1000);
  }
  
  // Initialize all screens
  buildWeekGrid();
  buildExPanel();
  buildPedScreen();
  buildHistoryScreen();
  buildNutritionScreen('log');
  buildProfileScreen();
  // Ensure the active screen is shown correctly
  switchTab('dash');
}

/* ========== DOM CONTENT LOADED ========== */
document.addEventListener('DOMContentLoaded', async () => {
  // Handle OAuth callback
  const oauthResult = await forgeAPI.handleOAuthCallback();
  if (oauthResult.success) {
    onAuthSuccess();
    showToast('✅ Google login successful!');
    return;
  }

  currentTheme = localStorage.getItem('forge_theme') || 'dark';
  applyTheme(currentTheme);

  document.getElementById('login-btn').addEventListener('click', handleLogin);
  document.getElementById('signup-btn').addEventListener('click', handleSignup);
  document.getElementById('google-login-btn').addEventListener('click', loginWithGoogle);
  document.getElementById('google-signup-btn').addEventListener('click', loginWithGoogle);
  
  const skipLogin = document.getElementById('skip-auth-btn-login');
  const skipSignup = document.getElementById('skip-auth-btn-signup');
  if (skipLogin) skipLogin.addEventListener('click', activateOfflineMode);
  if (skipSignup) skipSignup.addEventListener('click', activateOfflineMode);
  
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  // Attach tab button listeners (ensure switching works even if inline onclick fails)
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (!btn.id) return;
    if (btn.id.startsWith('tab-')) {
      btn.addEventListener('click', (e) => {
        const tab = btn.id.replace('tab-', '');
        switchTab(tab);
      });
    }
  });

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

  if (forgeAPI.isAuthenticated()) {
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('forge-root').style.display = 'block';
    loadFromStorage();
    initApp();
    // ensure UI is synchronized
    switchTab('dash');
  }
});
