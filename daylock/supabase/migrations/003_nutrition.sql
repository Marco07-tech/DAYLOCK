-- DayLock nutrition tracking schema
-- Run after 001_schema_and_rls.sql and 002_cascade_fixes.sql

-- Add bodyweight to profiles for auto-suggest calculations
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bodyweight integer;

-- Nutrition log table — one row per user per day
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  calories_goal integer NOT NULL DEFAULT 1800,
  breakfast_kcal integer NOT NULL DEFAULT 0,
  lunch_kcal integer NOT NULL DEFAULT 0,
  dinner_kcal integer NOT NULL DEFAULT 0,
  snacks_kcal integer NOT NULL DEFAULT 0,
  protein_goal integer NOT NULL DEFAULT 120,
  breakfast_protein integer NOT NULL DEFAULT 0,
  lunch_protein integer NOT NULL DEFAULT 0,
  dinner_protein integer NOT NULL DEFAULT 0,
  snacks_protein integer NOT NULL DEFAULT 0,
  water_glasses integer NOT NULL DEFAULT 0,
  water_goal integer NOT NULL DEFAULT 8,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS nutrition_logs_user_date_idx
  ON public.nutrition_logs (user_id, date);

ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nutrition_logs_select_own" ON public.nutrition_logs;
CREATE POLICY "nutrition_logs_select_own"
  ON public.nutrition_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "nutrition_logs_insert_own" ON public.nutrition_logs;
CREATE POLICY "nutrition_logs_insert_own"
  ON public.nutrition_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "nutrition_logs_update_own" ON public.nutrition_logs;
CREATE POLICY "nutrition_logs_update_own"
  ON public.nutrition_logs FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "nutrition_logs_delete_own" ON public.nutrition_logs;
CREATE POLICY "nutrition_logs_delete_own"
  ON public.nutrition_logs FOR DELETE
  USING (auth.uid() = user_id);
