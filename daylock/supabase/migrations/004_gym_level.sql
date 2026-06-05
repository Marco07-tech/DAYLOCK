-- Add gym_level column to profiles table
-- Values: 'beginner' | 'experienced' | null

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gym_level TEXT;
