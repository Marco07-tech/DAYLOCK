-- DayLock: Add ON DELETE CASCADE to all user-data table foreign keys
-- Run this AFTER 001_schema_and_rls.sql in Supabase SQL Editor

-- Adds CASCADE deletes so when a user is removed from auth.users,
-- all their data (tasks, gym splits, workouts, logs) is cleaned up.

DO $$
BEGIN
  -- profiles table (PK is user id)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_id_fkey' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

DO $$
BEGIN
  -- tasks table
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_user_id_fkey' AND table_name = 'tasks'
  ) THEN
    ALTER TABLE public.tasks DROP CONSTRAINT tasks_user_id_fkey;
  END IF;
  ALTER TABLE public.tasks
    ADD CONSTRAINT tasks_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

DO $$
BEGIN
  -- gym_splits table
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'gym_splits_user_id_fkey' AND table_name = 'gym_splits'
  ) THEN
    ALTER TABLE public.gym_splits DROP CONSTRAINT gym_splits_user_id_fkey;
  END IF;
  ALTER TABLE public.gym_splits
    ADD CONSTRAINT gym_splits_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

DO $$
BEGIN
  -- workout_logs table
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'workout_logs_user_id_fkey' AND table_name = 'workout_logs'
  ) THEN
    ALTER TABLE public.workout_logs DROP CONSTRAINT workout_logs_user_id_fkey;
  END IF;
  ALTER TABLE public.workout_logs
    ADD CONSTRAINT workout_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

DO $$
BEGIN
  -- daily_logs table
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'daily_logs_user_id_fkey' AND table_name = 'daily_logs'
  ) THEN
    ALTER TABLE public.daily_logs DROP CONSTRAINT daily_logs_user_id_fkey;
  END IF;
  ALTER TABLE public.daily_logs
    ADD CONSTRAINT daily_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;
