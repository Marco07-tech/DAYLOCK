-- FORGE 2.0 Supabase Database Setup
-- Run these SQL commands in Supabase SQL Editor

-- ============================================================================
-- 1. CREATE USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. CREATE RLS POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 4. CREATE WORKOUTS TABLE (Optional - for storing user workouts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INT,
  calories_burned INT,
  exercises_count INT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on workouts
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Users can only view their own workouts
CREATE POLICY "Users can view their own workouts"
  ON public.workouts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own workouts
CREATE POLICY "Users can insert their own workouts"
  ON public.workouts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own workouts
CREATE POLICY "Users can update their own workouts"
  ON public.workouts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own workouts
CREATE POLICY "Users can delete their own workouts"
  ON public.workouts
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. CREATE NUTRITION TABLE (Optional - for storing nutrition data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.nutrition (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  calories INT DEFAULT 0,
  protein INT DEFAULT 0,
  carbs INT DEFAULT 0,
  fat INT DEFAULT 0,
  water_ml INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on nutrition
ALTER TABLE public.nutrition ENABLE ROW LEVEL SECURITY;

-- Users can view their own nutrition data
CREATE POLICY "Users can view their own nutrition"
  ON public.nutrition
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own nutrition data
CREATE POLICY "Users can insert nutrition"
  ON public.nutrition
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own nutrition data
CREATE POLICY "Users can update nutrition"
  ON public.nutrition
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. CREATE FUNCTION TO UPDATE UPDATED_AT TIMESTAMP
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to workouts table
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to nutrition table
CREATE TRIGGER update_nutrition_updated_at
  BEFORE UPDATE ON public.nutrition
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Your Supabase database is now ready for FORGE 2.0
-- Tables created: users, workouts, nutrition
-- Row Level Security (RLS) is enabled for all tables
-- Auto-update timestamps are configured
