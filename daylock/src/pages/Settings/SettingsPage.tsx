import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useGymStore } from '../../store/useGymStore';
import { useNutritionStore } from '../../store/useNutritionStore';
import { loadPreferences, savePreferences } from '../../lib/preferences';
import { formatTo24Hour, formatTo12Hour } from '../../lib/utils';

export function SettingsPage() {
  const initialPrefs = loadPreferences();
  const [notificationsEnabled, setNotificationsEnabled] = useState(initialPrefs.notificationsEnabled);
  const [reminderTime, setReminderTime] = useState(initialPrefs.reminderTime);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [tempTime, setTempTime] = useState(reminderTime);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetConfirmText, setResetConfirmText] = useState('');

  const [caloriesGoal, setCaloriesGoalState] = useState('');
  const [proteinGoal, setProteinGoalState] = useState('');
  const [waterGoalState, setWaterGoalState] = useState(8);
  const [nutritionSaving, setNutritionSaving] = useState(false);
  const [nutritionSaved, setNutritionSaved] = useState(false);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const resetAllUserData = useTaskStore((state) => state.resetAllUserData);
  const loadGymSplit = useGymStore((state) => state.loadGymSplit);
  const todayLog = useNutritionStore((state) => state.todayLog);
  const loadTodayNutrition = useNutritionStore((state) => state.loadTodayNutrition);
  const loadBodyweight = useNutritionStore((state) => state.loadBodyweight);
  const setCalorieGoal = useNutritionStore((state) => state.setCalorieGoal);
  const setProteinGoalAction = useNutritionStore((state) => state.setProteinGoal);
  const setWaterGoalAction = useNutritionStore((state) => state.setWaterGoal);
  const saveGoals = useNutritionStore((state) => state.saveGoals);

  useEffect(() => {
    if (user) {
      loadTodayNutrition(user.id);
      loadBodyweight(user.id);
    }
  }, [user, loadTodayNutrition, loadBodyweight]);

  useEffect(() => {
    if (todayLog) {
      setCaloriesGoalState(String(todayLog.caloriesGoal));
      setProteinGoalState(String(todayLog.proteinGoal));
      setWaterGoalState(todayLog.waterGoal);
    }
  }, [todayLog]);

  const persistPrefs = (partial: Partial<typeof initialPrefs>) => {
    const next = { notificationsEnabled, reminderTime, ...partial };
    savePreferences(next);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleResetData = async () => {
    if (!user) return;
    setResetting(true);
    setResetError(null);
    try {
      await resetAllUserData(user.id);
      useGymStore.setState({ todayWorkout: null, workoutHistory: [] });
      await loadGymSplit(user.id);
      setShowResetConfirm(false);
      setResetConfirmText('');
    } catch {
      setResetError('Failed to reset data. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  const handleSaveTime = () => {
    setReminderTime(tempTime);
    persistPrefs({ reminderTime: tempTime });
    setShowTimeInput(false);
  };

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <div className="bg-background min-h-screen pb-32">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm max-w-md mx-auto">
        <div className="flex items-center justify-between px-container-padding py-4">
          <h1 className="font-headline-md text-headline-md text-primary">DayLock</h1>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-label-md text-label-md">
            {userInitials}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-container-padding space-y-stack-gap-lg">
        <h2 className="font-display-lg-mobile text-display-lg-mobile text-on-surface">Settings</h2>

        {/* Profile Card */}
        <div className="bg-surface-container-low rounded-xl p-6 card-shadow flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-headline-sm text-headline-sm">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-headline-sm text-headline-sm text-on-surface truncate">{user?.name || 'User'}</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant truncate">{user?.email}</p>
          </div>
          <button className="flex items-center gap-1 text-primary font-label-md text-label-md hover:opacity-70 transition-opacity">
            Edit Profile
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        {/* Section: YOUR GOALS */}
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4 px-2">YOUR GOALS</p>
          <div className="bg-surface-container-low rounded-xl card-shadow overflow-hidden">
            {/* Nutrition Goals */}
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 mb-1">
                <span className="material-symbols-outlined text-outline">egg_alt</span>
                <span className="font-label-md text-label-md text-on-surface">Nutrition Targets</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-label-sm text-label-sm text-on-surface-variant w-20">Calories</span>
                  <input
                    type="number"
                    value={caloriesGoal}
                    onChange={(e) => setCaloriesGoalState(e.target.value)}
                    className="flex-1 bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 1800"
                  />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">kcal</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-label-sm text-label-sm text-on-surface-variant w-20">Protein</span>
                  <input
                    type="number"
                    value={proteinGoal}
                    onChange={(e) => setProteinGoalState(e.target.value)}
                    className="flex-1 bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 120"
                  />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">g</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-label-sm text-label-sm text-on-surface-variant w-20">Water</span>
                  <div className="flex-1 flex items-center gap-2">
                    {[4, 6, 8, 10, 12].map((g) => (
                      <button
                        key={g}
                        onClick={() => setWaterGoalState(g)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                          waterGoalState === g
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:border-primary'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                    <span className="font-label-sm text-label-sm text-on-surface-variant">glasses</span>
                  </div>
                </div>
              </div>
              {nutritionSaved && <p className="font-label-sm text-label-sm text-primary">Goals saved!</p>}
            </div>
            <div className="h-px bg-[#E5E4E0] mx-6" />
            <div className="p-5 flex gap-3">
              <button
                onClick={() => {
                  (async () => {
                    if (!user) return;
                    setNutritionSaving(true);
                    try {
                      const cGoal = parseInt(caloriesGoal, 10);
                      const pGoal = parseInt(proteinGoal, 10);
                      if (!isNaN(cGoal)) setCalorieGoal(cGoal);
                      if (!isNaN(pGoal)) setProteinGoalAction(pGoal);
                      setWaterGoalAction(waterGoalState);
                      await saveGoals(user.id);
                      setNutritionSaved(true);
                      setTimeout(() => setNutritionSaved(false), 2000);
                    } catch (err) {
                      if (import.meta.env.DEV) console.error('Failed to save goals:', err);
                    } finally {
                      setNutritionSaving(false);
                    }
                  })();
                }}
                disabled={nutritionSaving}
                className="flex-1 px-4 py-3 rounded-xl bg-primary text-on-primary font-label-md hover:bg-primary-container transition-colors disabled:opacity-60"
              >
                {nutritionSaving ? 'Saving...' : 'Save Goals'}
              </button>
              <button
                onClick={() => {
                  (async () => {
                    if (!user) return;
                    try {
                      await loadBodyweight(user.id);
                    } catch (err) {
                      if (import.meta.env.DEV) console.error('Failed to load bodyweight:', err);
                    }
                    const bw = useNutritionStore.getState().bodyweight;
                    if (bw && bw > 0) {
                      const suggestedCalories = bw * 30;
                      const suggestedProtein = Math.round(bw * 1.6);
                      setCaloriesGoalState(String(suggestedCalories));
                      setProteinGoalState(String(suggestedProtein));
                    }
                  })();
                }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-label-sm hover:border-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Recalculate
              </button>
            </div>
          </div>
        </div>

        {/* Section: NOTIFICATIONS */}
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4 px-2">NOTIFICATIONS</p>
          <div className="bg-surface-container-low rounded-xl card-shadow overflow-hidden">
            {/* Notifications toggle */}
            <div className="flex items-center justify-between p-5 hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-outline">notifications</span>
                <span className="font-body-md text-body-md text-on-surface">Notifications</span>
              </div>
              <div
                className="relative w-12 h-6 cursor-pointer"
                onClick={() => {
                  const next = !notificationsEnabled;
                  setNotificationsEnabled(next);
                  persistPrefs({ notificationsEnabled: next });
                }}
              >
                <div className={`absolute inset-0 rounded-full transition-colors duration-200 ${notificationsEnabled ? 'bg-primary' : 'bg-surface-variant'}`} />
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>
            <div className="h-px bg-[#E5E4E0] mx-6" />
            {/* Daily Reminder */}
            <div className="p-5 hover:bg-surface-container transition-colors">
              {!showTimeInput ? (
                <button
                  onClick={() => { setShowTimeInput(true); setTempTime(reminderTime); }}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-outline">schedule</span>
                    <span className="font-body-md text-body-md text-on-surface">Daily Reminder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md text-on-surface-variant">{reminderTime}</span>
                    <span className="material-symbols-outlined text-outline-variant text-[16px]">chevron_right</span>
                  </div>
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="time"
                    value={formatTo24Hour(tempTime)}
                    onChange={(e) => setTempTime(formatTo12Hour(e.target.value))}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowTimeInput(false)}
                      className="flex-1 px-3 py-2 rounded-lg border border-outline-variant text-on-surface font-label-sm hover:bg-surface-container transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveTime}
                      className="flex-1 px-3 py-2 rounded-lg bg-primary text-on-primary font-label-sm hover:bg-primary-container transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section: APP */}
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4 px-2">APP</p>
          <div className="bg-surface-container-low rounded-xl card-shadow overflow-hidden">
            <div className="flex items-center justify-between p-5 hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-outline">info</span>
                <div>
                  <span className="font-body-md text-body-md text-on-surface">Version</span>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">v1.0.0</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
            </div>
            <div className="h-px bg-[#E5E4E0] mx-6" />
            <div className="flex items-center justify-between p-5 hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-outline">terminal</span>
                <div>
                  <span className="font-body-md text-body-md text-on-surface">Dev Mode</span>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Build {import.meta.env.MODE}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
            </div>
          </div>
        </div>

        {/* Section: ACCOUNT */}
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4 px-2">ACCOUNT</p>
          <div className="bg-surface-container-low rounded-xl card-shadow overflow-hidden">
            {/* Reset Data */}
            <div className="p-5">
              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full flex items-center gap-4 hover:opacity-70 transition-opacity text-left"
                >
                  <span className="material-symbols-outlined text-error">delete_forever</span>
                  <span className="font-body-md text-body-md text-error">Reset All Data</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="font-body-md text-body-md text-on-surface-variant">This will permanently delete all your data. This action cannot be undone.</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Type "RESET" below to confirm:</p>
                  <input
                    type="text"
                    placeholder="Type RESET here"
                    value={resetConfirmText}
                    onChange={(e) => { setResetConfirmText(e.target.value); setResetError(null); }}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors uppercase"
                    disabled={resetting}
                  />
                  {resetError && <p className="font-label-sm text-label-sm text-error">{resetError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowResetConfirm(false); setResetConfirmText(''); setResetError(null); }}
                      disabled={resetting}
                      className="flex-1 px-3 py-2 rounded-lg border border-outline-variant text-on-surface font-label-sm hover:bg-surface-container transition-colors disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => void handleResetData()}
                      disabled={resetting || resetConfirmText !== 'RESET'}
                      className="flex-1 px-3 py-2 rounded-lg bg-error text-on-error font-label-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {resetting ? 'Resetting...' : 'Delete All Data'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sign Out - centered text */}
        <div className="text-center py-4">
          <button
            onClick={() => void handleLogout()}
            className="font-label-md text-label-md text-error hover:opacity-80 transition-opacity"
          >
            Sign Out
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="font-headline-sm text-headline-sm text-primary">DayLock</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">Lock in your daily routine</p>
        </div>
      </div>
    </div>
  );
}
