import { useState, useEffect } from 'react';
import { Bell, Clock, LogOut, Trash2, Apple, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useGymStore } from '../../store/useGymStore';
import { useNutritionStore } from '../../store/useNutritionStore';
import { loadPreferences, savePreferences } from '../../lib/preferences';
import { cn, formatTo24Hour, formatTo12Hour } from '../../lib/utils';

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
  const [waterGoal, setWaterGoalState] = useState(8);
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
      loadTodayNutrition(user.id)
      loadBodyweight(user.id)
    }
  }, [user, loadTodayNutrition, loadBodyweight])

  useEffect(() => {
    if (todayLog) {
      setCaloriesGoalState(String(todayLog.caloriesGoal))
      setProteinGoalState(String(todayLog.proteinGoal))
      setWaterGoalState(todayLog.waterGoal)
    }
  }, [todayLog])

  const persistPrefs = (partial: Partial<typeof initialPrefs>) => {
    const next = {
      notificationsEnabled,
      reminderTime,
      ...partial,
    };
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
      useGymStore.setState({
        todayWorkout: null,
        workoutHistory: [],
      });
      await loadGymSplit(user.id);
      setShowResetConfirm(false);
      setResetConfirmText('');
    } catch {
      setResetError('Failed to reset data. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  const handleCloseResetModal = () => {
    setShowResetConfirm(false);
    setResetConfirmText('');
    setResetError(null);
  };

  const handleSaveTime = () => {
    setReminderTime(tempTime);
    persistPrefs({ reminderTime: tempTime });
    setShowTimeInput(false);
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-bg-primary pb-20 page-enter">
      <div className="px-4 py-5">
        <h1 className="text-text-primary text-2xl font-semibold font-display mb-5">Settings</h1>

        <div className="bg-bg-card border border-bg-border rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-accent-lime-muted border border-accent-lime border-opacity-20 flex items-center justify-center">
            <span className="text-accent-lime font-semibold text-base">{userInitials}</span>
          </div>
          <div>
            <p className="text-text-primary font-medium text-sm">{user?.name || 'User'}</p>
            <p className="text-text-secondary text-xs">{user?.email}</p>
          </div>
        </div>

        <p className="text-text-muted text-xs font-medium tracking-widest mb-2 mt-5">PREFERENCES</p>
        <div className="space-y-0 border border-bg-border rounded-2xl overflow-hidden mb-6">
          <div className="bg-bg-card px-4 py-3 flex items-center justify-between border-b border-bg-border">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-text-secondary" />
              <span className="text-text-primary text-sm">Notifications</span>
            </div>
            <button
              onClick={() => {
                const next = !notificationsEnabled;
                setNotificationsEnabled(next);
                persistPrefs({ notificationsEnabled: next });
              }}
              className={cn(
                'w-11 h-6 rounded-full transition-all duration-200 flex items-center',
                notificationsEnabled ? 'bg-accent-lime' : 'bg-bg-border'
              )}
            >
              <div
                className={cn(
                  'w-4.5 h-4.5 rounded-full bg-white transition-all duration-200 ml-0.5',
                  notificationsEnabled && 'ml-5'
                )}
              />
            </button>
          </div>

          <div className="bg-bg-card px-4 py-3">
            {!showTimeInput ? (
              <button
                onClick={() => {
                  setShowTimeInput(true);
                  setTempTime(reminderTime);
                }}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-text-secondary" />
                  <span className="text-text-primary text-sm">Daily Reminder</span>
                </div>
                <span className="text-accent-lime text-xs font-medium group-hover:opacity-80 transition-opacity">
                  {reminderTime}
                </span>
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="time"
                  value={formatTo24Hour(tempTime)}
                  onChange={(e) => setTempTime(formatTo12Hour(e.target.value))}
                  className="w-full bg-bg-primary border border-bg-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-lime transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTimeInput(false)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-bg-primary border border-bg-border text-text-secondary text-xs font-medium hover:border-accent-lime transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTime}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-accent-lime text-black text-xs font-semibold hover:bg-accent-lime-dark transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-text-muted text-xs font-medium tracking-widest mb-2 mt-5">NUTRITION GOALS</p>
        <div className="space-y-0 border border-bg-border rounded-2xl overflow-hidden mb-6">
          <div className="bg-bg-card px-4 py-3 border-b border-bg-border">
            <div className="flex items-center gap-3 mb-2">
              <Apple size={18} className="text-text-secondary" />
              <span className="text-text-primary text-sm font-medium">Daily Targets</span>
            </div>
            <div className="space-y-3 mt-3">
              <div className="flex items-center gap-2">
                <label className="text-text-secondary text-xs w-20">Calories</label>
                <input
                  type="number"
                  value={caloriesGoal}
                  onChange={(e) => setCaloriesGoalState(e.target.value)}
                  className="flex-1 bg-bg-primary border border-bg-border rounded-lg px-3 py-1.5 text-text-primary text-sm focus:outline-none focus:border-accent-lime transition-colors"
                  placeholder="e.g. 1800"
                />
                <span className="text-text-muted text-xs">kcal</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-text-secondary text-xs w-20">Protein</label>
                <input
                  type="number"
                  value={proteinGoal}
                  onChange={(e) => setProteinGoalState(e.target.value)}
                  className="flex-1 bg-bg-primary border border-bg-border rounded-lg px-3 py-1.5 text-text-primary text-sm focus:outline-none focus:border-accent-lime transition-colors"
                  placeholder="e.g. 120"
                />
                <span className="text-text-muted text-xs">g</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-text-secondary text-xs w-20">Water</label>
                <div className="flex-1 flex items-center gap-2">
                  {[4, 6, 8, 10, 12].map((g) => (
                    <button
                      key={g}
                      onClick={() => setWaterGoalState(g)}
                      className={cn(
                        'px-2 py-1 rounded-lg text-xs font-medium transition-colors',
                        waterGoal === g
                          ? 'bg-accent-lime text-black'
                          : 'bg-bg-primary border border-bg-border text-text-secondary hover:border-accent-lime'
                      )}
                    >
                      {g}
                    </button>
                  ))}
                  <span className="text-text-muted text-xs">glasses</span>
                </div>
              </div>
            </div>
            {nutritionSaved && (
              <p className="text-accent-lime text-xs mt-2">Goals saved!</p>
            )}
          </div>
          <div className="bg-bg-card px-4 py-3 flex gap-2">
            <button
              onClick={async () => {
                if (!user) return
                setNutritionSaving(true)
                const cGoal = parseInt(caloriesGoal, 10)
                const pGoal = parseInt(proteinGoal, 10)
                if (!isNaN(cGoal)) setCalorieGoal(cGoal)
                if (!isNaN(pGoal)) setProteinGoalAction(pGoal)
                setWaterGoalAction(waterGoal)
                await saveGoals(user.id)
                setNutritionSaving(false)
                setNutritionSaved(true)
                setTimeout(() => setNutritionSaved(false), 2000)
              }}
              disabled={nutritionSaving}
              className="flex-1 px-3 py-1.5 rounded-lg bg-accent-lime text-black text-xs font-semibold hover:bg-accent-lime-dark transition-colors disabled:opacity-60"
            >
              {nutritionSaving ? 'Saving...' : 'Save Goals'}
            </button>
            <button
              onClick={async () => {
                if (!user) return
                await loadBodyweight(user.id)
                const bw = useNutritionStore.getState().bodyweight
                if (bw && bw > 0) {
                  const suggestedCalories = bw * 30
                  const suggestedProtein = Math.round(bw * 1.6)
                  setCaloriesGoalState(String(suggestedCalories))
                  setProteinGoalState(String(suggestedProtein))
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg-primary border border-bg-border text-text-secondary text-xs font-medium hover:border-accent-lime transition-colors"
            >
              <RefreshCw size={12} />
              Recalculate
            </button>
          </div>
        </div>

        <p className="text-text-muted text-xs font-medium tracking-widest mb-2 mt-5">DATA</p>
        <div className="space-y-0 border border-bg-border rounded-2xl overflow-hidden">
          <button
            onClick={() => void handleLogout()}
            className="w-full bg-bg-card px-4 py-3 flex items-center gap-3 border-b border-bg-border hover:bg-bg-card hover:opacity-80 transition-opacity text-left"
          >
            <LogOut size={18} className="text-text-secondary" />
            <span className="text-text-primary text-sm">Sign Out</span>
          </button>

          <div className="bg-bg-card">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
              >
                <Trash2 size={18} className="text-status-danger" />
                <span className="text-status-danger text-sm">Reset All Data</span>
              </button>
            ) : (
              <div className="px-4 py-3 space-y-3">
                <p className="text-text-secondary text-sm">This will permanently delete all your data. This action cannot be undone.</p>
                <p className="text-text-muted text-xs">Type "RESET" below to confirm:</p>
                <input
                  type="text"
                  placeholder="Type RESET here"
                  value={resetConfirmText}
                  onChange={(e) => {
                    setResetConfirmText(e.target.value);
                    setResetError(null);
                  }}
                  className="w-full bg-bg-primary border border-bg-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-lime transition-colors uppercase"
                  disabled={resetting}
                />
                {resetError && <p className="text-status-danger text-xs">{resetError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleCloseResetModal}
                    disabled={resetting}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-bg-primary border border-bg-border text-text-secondary text-xs font-medium hover:border-accent-lime transition-colors disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void handleResetData()}
                    disabled={resetting || resetConfirmText !== 'RESET'}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-status-danger text-white text-xs font-semibold hover:bg-opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {resetting ? 'Resetting...' : 'Delete All Data'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8 pb-4">
          <p className="text-accent-lime font-semibold font-display text-base">DayLock</p>
          <p className="text-text-muted text-xs mt-2">v1.0.0</p>
          <p className="text-text-muted text-xs">Lock in your daily routine</p>
        </div>
      </div>
    </div>
  );
}
