import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useNutritionStore } from '../../store/useNutritionStore';
import { useGymStore } from '../../store/useGymStore';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';
import { AddTaskSheet } from '../AddTask/AddTaskSheet';
import { EditTaskModal } from './components/EditTaskModal';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getBarColor(current: number, goal: number): string {
  if (goal === 0) return 'bg-surface-variant'
  const ratio = current / goal
  if (ratio > 1) return 'bg-error'
  if (ratio > 0.9) return 'bg-yellow-500'
  return 'bg-primary'
}

type ToastType = {
  message: string;
  variant?: 'success' | 'error';
  action?: () => void;
  actionLabel?: string;
};

type HabitMenuState = {
  taskId: string;
  x: number;
  y: number;
} | null;

function SkeletonHabit() {
  return (
    <div className="flex items-center justify-between py-2 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-surface-container-high" />
        <div>
          <div className="h-3 w-28 rounded-full bg-surface-container-high mb-2" />
          <div className="h-2.5 w-16 rounded-full bg-surface-container-high" />
        </div>
      </div>
      <div className="w-6 h-6 rounded-full bg-surface-container-high" />
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [showAddTask, setShowAddTask] = useState(false);
  const [toast, setToast] = useState<ToastType | null>(null);
  const [toastExiting, setToastExiting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [habitMenu, setHabitMenu] = useState<HabitMenuState>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [justChecked, setJustChecked] = useState<string | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const user = useAuthStore((state) => state.user);
  const getTodayTasks = useTaskStore((state) => state.getTodayTasks);
  const todayLog = useTaskStore((state) => state.todayLog);
  const toggleTaskDone = useTaskStore((state) => state.toggleTaskDone);
  const removeTask = useTaskStore((state) => state.removeTask);
  const streaks = useTaskStore((state) => state.streaks);
  const tasks = useTaskStore((state) => state.tasks);
  const initTodayWorkout = useGymStore((state) => state.initTodayWorkout);
  const todayNutritionLog = useNutritionStore((state) => state.todayLog);
  const getTotalKcal = useNutritionStore((state) => state.getTotalKcal);
  const getTotalProtein = useNutritionStore((state) => state.getTotalProtein);

  useEffect(() => {
    if (!user) return;
    const todayTasks = getTodayTasks();
    const hasGymTask = todayTasks.some((t) => t.type === 'gym');
    if (hasGymTask) {
      initTodayWorkout(user.id);
    }
  }, [user, getTodayTasks, initTodayWorkout]);

  useEffect(() => {
    if (tasks.length > 0) {
      setIsLoading(false);
    }
  }, [tasks]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const dismissToast = (immediate = false) => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    if (immediate) {
      setToastExiting(false);
      setToast(null);
      return;
    }
    setToastExiting(true);
    exitTimerRef.current = setTimeout(() => {
      setToastExiting(false);
      setToast(null);
    }, 300);
  };

  const handleToast = (
    message: string,
    variant: 'success' | 'error' = 'success',
    action?: () => void,
    actionLabel?: string
  ) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setToast({ message, variant, action, actionLabel });
    setToastExiting(false);
    const duration = action ? 3000 : 2200;
    undoTimerRef.current = window.setTimeout(() => dismissToast(), duration);
  };

  const todayTasks = getTodayTasks();
  const completedCount = todayTasks.filter((t) => todayLog[t.id]).length;
  const totalCount = todayTasks.length;
  const totalKcal = getTotalKcal();
  const totalProtein = getTotalProtein();
  const kcalGoal = todayNutritionLog?.caloriesGoal ?? 0;
  const proteinGoal = todayNutritionLog?.proteinGoal ?? 0;
  const waterGlasses = todayNutritionLog?.waterGlasses ?? 0;
  const waterGoal = todayNutritionLog?.waterGoal ?? 8;

  const gymTask = todayTasks.find((t) => t.type === 'gym');

  const handleToggle = async (taskId: string, isDone: boolean, streak: number) => {
    if (!user) return;
    const isCompletion = !isDone;

    setJustChecked(taskId);
    setTimeout(() => setJustChecked(null), 600);

    try {
      await toggleTaskDone(taskId, user.id);
      if (isCompletion) {
        handleToast(
          'Habit completed ✓',
          'success',
          async () => {
            const todayStr = new Date().toISOString().split('T')[0];
            useTaskStore.setState((s) => ({
              todayLog: { ...s.todayLog, [taskId]: false },
              streaks: { ...s.streaks, [taskId]: streak },
              tasks: s.tasks.map((t) =>
                t.id === taskId ? { ...t, streak } : t
              ),
            }));
            await supabase
              .from('task_completions')
              .upsert(
                { user_id: user.id, task_id: taskId, date: todayStr, completed: false },
                { onConflict: 'user_id,task_id,date' }
              );
            await supabase
              .from('tasks')
              .update({ streak })
              .eq('id', taskId)
              .eq('user_id', user.id);
          },
          'UNDO'
        );
      }
    } catch {
      handleToast('Failed to update habit', 'error');
    }
  };

  const handleDelete = async () => {
    if (!user || !showDeleteConfirm || deleting) return;
    setDeleting(true);
    const success = await removeTask(showDeleteConfirm, user.id);
    setDeleting(false);
    setShowDeleteConfirm(null);
    if (success) {
      handleToast('Habit deleted', 'success');
    } else {
      handleToast('Failed to delete habit', 'error');
    }
  };

  const todayStr = formatDate().toUpperCase();

  return (
    <div className="bg-background min-h-screen pb-32">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm max-w-md mx-auto">
        <div className="flex items-center justify-between px-container-padding py-4">
          <div className="w-10 h-10 rounded-full ring-2 ring-primary/10 flex items-center justify-center bg-primary/10 text-primary overflow-hidden">
            {user?.name ? (
              <span className="font-label-md text-label-md text-primary">
                {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">person</span>
            )}
          </div>
          <button className="text-primary p-1">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-md mx-auto pt-24 px-container-padding space-y-stack-gap-lg animate-in">
        {/* Greeting Section */}
        <div className="space-y-3">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest opacity-60">
            {todayStr}
          </p>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface font-semibold">
            {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm">
            {completedCount}/{totalCount} habits done
          </span>
        </div>

        {/* Daily Rituals Card */}
        <div className="bg-surface-container-low p-6 rounded-[24px] card-shadow space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Daily Rituals</h2>
            <button onClick={() => setShowAddTask(true)} className="opacity-40 text-on-surface hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>

          {isLoading && tasks.length === 0 ? (
            <div className="space-y-4">
              <SkeletonHabit />
              <SkeletonHabit />
              <SkeletonHabit />
            </div>
          ) : todayTasks.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-3">add_task</span>
              <p className="font-body-md text-body-md text-on-surface-variant">No habits yet</p>
              <button
                onClick={() => setShowAddTask(true)}
                className="mt-3 font-label-md text-label-md text-primary hover:underline"
              >
                Create your first habit
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {todayTasks.map((task, index) => {
                const isDone = todayLog[task.id] || false;
                const streak = streaks[task.id] ?? task.streak ?? 0;

                return (
                  <div
                    key={task.id}
                    className="relative animate-in"
                    style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer transition-all duration-300"
                      onClick={() => {
                        setHabitMenu(null);
                        handleToggle(task.id, isDone, streak);
                      }}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 transition-all duration-200 ${
                          isDone ? 'bg-primary/10 text-primary' : 'bg-surface-variant text-on-surface-variant'
                        }`}>
                          <span
                            className="material-symbols-outlined text-[22px]"
                            style={isDone ? { fontVariationSettings: "'FILL' 1" } : undefined}
                          >
                            {task.type === 'gym' ? 'fitness_center' :
                             task.type === 'study' ? 'menu_book' :
                             task.type === 'water' ? 'water_drop' :
                             task.type === 'sleep' ? 'bedtime' :
                             task.type === 'cardio' ? 'directions_run' :
                             task.type === 'steps' ? 'directions_walk' :
                             'star'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className={`font-label-md text-label-md text-on-surface truncate transition-all duration-200 ${
                            isDone ? 'line-through opacity-50' : ''
                          }`}>
                            {task.name}
                          </p>
                          <p className={`font-label-sm text-label-sm transition-all duration-200 ${
                            isDone ? 'text-primary' : 'text-on-surface-variant opacity-60'
                          }`}>
                            {isDone ? `${streak}d streak` : 'Ready to start'}
                          </p>
                        </div>
                      </div>
                      <button
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isDone
                            ? 'bg-primary border-primary scale-110'
                            : 'border-outline-variant hover:border-primary'
                        } ${justChecked === task.id ? 'scale-125' : ''}`}
                      >
                        {isDone && (
                          <span className="material-symbols-outlined text-white text-[14px] animate-in">
                            check
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Three-dot menu */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setHabitMenu(habitMenu?.taskId === task.id ? null : { taskId: task.id, x: e.clientX, y: e.clientY });
                      }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-3 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                    </button>

                    {/* Context menu */}
                    {habitMenu?.taskId === task.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setHabitMenu(null)} />
                        <div
                          className="absolute right-0 top-8 z-20 w-40 overflow-hidden rounded-xl bg-surface-container-low shadow-sheet border border-surface-variant"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setHabitMenu(null);
                              setEditingTask(task);
                              setShowEditModal(true);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-on-surface transition-colors hover:bg-surface-container"
                          >
                            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">edit</span>
                            Edit Habit
                          </button>
                          <button
                            onClick={() => {
                              setHabitMenu(null);
                              setShowDeleteConfirm(task.id);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-error transition-colors hover:bg-error-container"
                          >
                            <span className="material-symbols-outlined text-[16px] text-error">delete</span>
                            Delete Habit
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Nutrition Card */}
        <button
          onClick={() => navigate('/gym?s=nutrition')}
          className="w-full bg-surface-container-low p-6 rounded-[24px] card-shadow space-y-4 text-left"
        >
          <div className="flex items-center justify-between">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">NUTRITION</p>
            {kcalGoal > 0 && (
              <p className="font-label-sm text-label-sm text-primary">{Math.round((totalKcal / kcalGoal) * 100)}% Goal</p>
            )}
          </div>
          {kcalGoal > 0 ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="font-body-md text-body-md text-on-surface">Calories</span>
                <span className="font-label-md text-label-md text-primary">{totalKcal.toLocaleString()} / {kcalGoal.toLocaleString()} kcal</span>
              </div>
              <div className="h-1.5 bg-background rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getBarColor(totalKcal, kcalGoal)}`}
                  style={{ width: `${Math.min((totalKcal / kcalGoal) * 100, 100)}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Protein</p>
                  <p className="font-headline-sm text-headline-sm text-on-surface">{totalProtein}g</p>
                  <div className="h-1 bg-background rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full ${getBarColor(totalProtein, proteinGoal)}`}
                      style={{ width: `${Math.min((totalProtein / proteinGoal) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Water</p>
                  <p className="font-headline-sm text-headline-sm text-on-surface">{waterGlasses}/{waterGoal}</p>
                  <div className="h-1 bg-background rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full ${getBarColor(waterGlasses, waterGoal)}`}
                      style={{ width: `${Math.min((waterGlasses / waterGoal) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="font-body-md text-body-md text-on-surface-variant">Set up nutrition goals to start tracking</p>
          )}
        </button>

        {/* Gym Card */}
        {gymTask && (
          <button
            onClick={() => navigate('/gym')}
            className="relative overflow-hidden bg-primary p-6 rounded-[24px] card-shadow text-left w-full"
          >
            <span className="material-symbols-outlined absolute top-4 right-4 text-[120px] text-on-primary/20 pointer-events-none leading-none">
              fitness_center
            </span>
            <p className="font-label-md text-label-md text-on-primary/70 uppercase tracking-wider mb-2">TODAY'S FOCUS</p>
            <p className="font-headline-md text-headline-md text-on-primary mb-4">{gymTask.name}</p>
            <span className="inline-flex items-center gap-2 bg-on-primary text-primary px-6 py-3 rounded-full font-label-md shadow-lg active:scale-95 transition-all">
              Start Workout
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </span>
          </button>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 pointer-events-none transition-opacity duration-300 ${toastExiting ? 'opacity-0' : 'opacity-100'}`}>
          <div
            className={`rounded-2xl px-4 py-3 shadow-sheet flex items-center justify-between pointer-events-auto ${
              toast.variant === 'success'
                ? 'bg-primary text-on-primary'
                : 'bg-error-container text-on-error-container'
            }`}
          >
            <p className="font-label-md text-label-md">{toast.message}</p>
            {toast.action && toast.actionLabel && (
              <button
                onClick={() => {
                  if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
                  toast.action?.();
                  dismissToast(true);
                }}
                className="ml-4 font-label-sm text-label-sm underline hover:opacity-70 transition-opacity active:scale-95 whitespace-nowrap"
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(26,26,26,0.4)] backdrop-blur-[4px] px-4 pb-4 sm:items-center sm:pb-0">
          <div className="w-full max-w-sm bg-surface-container-low rounded-[24px] p-6 shadow-sheet space-y-4">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Delete habit?</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              This will permanently remove this habit from your routine.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deleting}
                className="px-4 py-3 rounded-xl border border-outline-variant text-on-surface font-label-md hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-3 rounded-xl bg-error text-on-error font-label-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      <EditTaskModal
        open={showEditModal}
        task={editingTask}
        onClose={() => { setShowEditModal(false); setEditingTask(null); }}
        onToast={handleToast}
      />

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddTask(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg hover:shadow-2xl transition-all active:scale-95 z-40"
        title="Add new habit"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>

      {/* Add Task Sheet */}
      <AddTaskSheet open={showAddTask} onClose={() => setShowAddTask(false)} />
    </div>
  );
}
