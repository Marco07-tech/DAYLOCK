import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useGymStore } from '../../store/useGymStore';
import { getGreeting, formatDate } from '../../lib/utils';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { BlockerBanner } from './components/BlockerBanner';
import { StatsRow } from './components/StatsRow';
import { TaskList } from './components/TaskList';
import { AddTaskSheet } from '../AddTask/AddTaskSheet';

export function DashboardPage() {
  const [showAddTask, setShowAddTask] = useState(false);
  const user = useAuthStore((state) => state.user);
  const getTodayTasks = useTaskStore((state) => state.getTodayTasks);
  const getCompletionPercent = useTaskStore((state) => state.getCompletionPercent);
  const initTodayWorkout = useGymStore((state) => state.initTodayWorkout);

  useEffect(() => {
    // Initialize today's tasks and check for gym
    if (!user) return
    const todayTasks = getTodayTasks()
    const hasGymTask = todayTasks.some((t) => t.type === 'gym')

    if (hasGymTask) {
      initTodayWorkout(user.id)
    }
  }, [user, getTodayTasks, initTodayWorkout]);

  const completionPercent = getCompletionPercent();

  return (
    <div className="min-h-screen bg-bg-primary pb-20 page-enter">
      {/* Header Section */}
      <div className="px-4 py-5 mb-4">
        <h1 className="font-display font-semibold text-2xl text-white">
          {getGreeting()}{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="text-text-secondary text-xs mt-1">{formatDate()}</p>
      </div>

      {/* Main Content */}
      <div className="px-4 space-y-3">
        {/* Blocker Banner */}
        <BlockerBanner />

        {/* Progress Bar */}
        <ProgressBar percent={completionPercent} />

        {/* Stats Row */}
        <StatsRow />

        {/* Today's Routine Label */}
        <div className="pt-1">
          <h2 className="font-display font-semibold text-lg text-white mb-3 mt-5">
            Today's Routine
          </h2>
        </div>

        {/* Task List */}
        <TaskList />
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowAddTask(true)}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-accent-lime text-black flex items-center justify-center shadow-lg hover:shadow-2xl transition-shadow duration-200 active:scale-95 z-40"
        title="Add new task"
      >
        <Plus size={24} className="font-bold" />
      </button>

      {/* Add Task Sheet */}
      <AddTaskSheet open={showAddTask} onClose={() => setShowAddTask(false)} />
    </div>
  );
}
