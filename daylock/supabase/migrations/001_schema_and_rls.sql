-- DayLock schema additions and Row Level Security
-- Run in Supabase SQL Editor or via Supabase CLI

-- Profiles: goal column for onboarding
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS goal text;

-- Per-day task completion (replaces using tasks.done for daily state)
CREATE TABLE IF NOT EXISTS public.task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  date date NOT NULL,
  completed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, task_id, date)
);

CREATE INDEX IF NOT EXISTS task_completions_user_date_idx
  ON public.task_completions (user_id, date);

ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "task_completions_select_own" ON public.task_completions;
CREATE POLICY "task_completions_select_own"
  ON public.task_completions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "task_completions_insert_own" ON public.task_completions;
CREATE POLICY "task_completions_insert_own"
  ON public.task_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "task_completions_update_own" ON public.task_completions;
CREATE POLICY "task_completions_update_own"
  ON public.task_completions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "task_completions_delete_own" ON public.task_completions;
CREATE POLICY "task_completions_delete_own"
  ON public.task_completions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS for core tables (idempotent — skip if policies already exist with same effect)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tasks_select_own" ON public.tasks;
CREATE POLICY "tasks_select_own" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "tasks_insert_own" ON public.tasks;
CREATE POLICY "tasks_insert_own" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "tasks_update_own" ON public.tasks;
CREATE POLICY "tasks_update_own" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "tasks_delete_own" ON public.tasks;
CREATE POLICY "tasks_delete_own" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.gym_splits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gym_splits_select_own" ON public.gym_splits;
CREATE POLICY "gym_splits_select_own" ON public.gym_splits FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "gym_splits_insert_own" ON public.gym_splits;
CREATE POLICY "gym_splits_insert_own" ON public.gym_splits FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "gym_splits_update_own" ON public.gym_splits;
CREATE POLICY "gym_splits_update_own" ON public.gym_splits FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "gym_splits_delete_own" ON public.gym_splits;
CREATE POLICY "gym_splits_delete_own" ON public.gym_splits FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workout_logs_select_own" ON public.workout_logs;
CREATE POLICY "workout_logs_select_own" ON public.workout_logs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "workout_logs_insert_own" ON public.workout_logs;
CREATE POLICY "workout_logs_insert_own" ON public.workout_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "workout_logs_update_own" ON public.workout_logs;
CREATE POLICY "workout_logs_update_own" ON public.workout_logs FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "workout_logs_delete_own" ON public.workout_logs;
CREATE POLICY "workout_logs_delete_own" ON public.workout_logs FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "daily_logs_select_own" ON public.daily_logs;
CREATE POLICY "daily_logs_select_own" ON public.daily_logs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "daily_logs_insert_own" ON public.daily_logs;
CREATE POLICY "daily_logs_insert_own" ON public.daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "daily_logs_update_own" ON public.daily_logs;
CREATE POLICY "daily_logs_update_own" ON public.daily_logs FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "daily_logs_delete_own" ON public.daily_logs;
CREATE POLICY "daily_logs_delete_own" ON public.daily_logs FOR DELETE USING (auth.uid() = user_id);
