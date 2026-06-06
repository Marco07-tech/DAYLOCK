-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  avatar_url text,
  calorie_goal integer not null default 1800,
  protein_goal integer not null default 160,
  water_goal integer not null default 8,
  body_weight numeric(5,1),
  fitness_goal text not null default 'maintenance' check (fitness_goal in ('cutting','bulking','maintenance')),
  gym_level text not null default 'beginner' check (gym_level in ('beginner','experienced')),
  onboarding_completed boolean not null default false,
  created_at timestamptz default now()
);

-- Exercises library
create table exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  name text not null,
  muscle_group text not null,
  is_custom boolean default false,
  created_at timestamptz default now()
);

-- Workout sessions
create table workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  date date not null default current_date,
  duration_minutes integer,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Workout sets
create table workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references workout_sessions on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  exercise_id uuid references exercises on delete set null,
  exercise_name text not null,
  muscle_group text not null default '',
  set_number integer not null default 1,
  weight_kg numeric(6,2),
  reps integer,
  done boolean default false,
  created_at timestamptz default now()
);

-- Weekly split
create table weekly_split (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  day_of_week integer not null check (day_of_week between 0 and 6),
  workout_name text not null default 'Rest',
  is_rest boolean default true,
  unique(user_id, day_of_week)
);

-- Nutrition logs
create table nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  date date not null default current_date,
  calorie_goal integer not null default 1800,
  breakfast_kcal integer default 0,
  lunch_kcal integer default 0,
  dinner_kcal integer default 0,
  snacks_kcal integer default 0,
  protein_goal integer not null default 160,
  breakfast_protein integer default 0,
  lunch_protein integer default 0,
  dinner_protein integer default 0,
  snacks_protein integer default 0,
  water_glasses integer default 0,
  water_goal integer default 8,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- Body weight logs
create table body_weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  weight_kg numeric(5,1) not null,
  logged_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table exercises enable row level security;
alter table workout_sessions enable row level security;
alter table workout_sets enable row level security;
alter table weekly_split enable row level security;
alter table nutrition_logs enable row level security;
alter table body_weight_logs enable row level security;

create policy "users own profiles" on profiles for all using (auth.uid() = id);
create policy "users own exercises" on exercises for all using (auth.uid() = user_id);
create policy "users own sessions" on workout_sessions for all using (auth.uid() = user_id);
create policy "users own sets" on workout_sets for all using (auth.uid() = user_id);
create policy "users own split" on weekly_split for all using (auth.uid() = user_id);
create policy "users own nutrition" on nutrition_logs for all using (auth.uid() = user_id);
create policy "users own weight logs" on body_weight_logs for all using (auth.uid() = user_id);

-- Default exercise library (shared, no user_id)
insert into exercises (name, muscle_group, is_custom) values
  ('Bench Press (Barbell)', 'CHEST', false),
  ('Incline Dumbbell Press', 'CHEST', false),
  ('Cable Crossover', 'CHEST', false),
  ('Decline Bench Press', 'CHEST', false),
  ('Pec Deck Machine', 'CHEST', false),
  ('Pull Ups', 'BACK', false),
  ('Barbell Row', 'BACK', false),
  ('Lat Pulldown', 'BACK', false),
  ('Cable Row', 'BACK', false),
  ('Face Pulls', 'BACK', false),
  ('Squats', 'LEGS', false),
  ('Romanian Deadlift', 'LEGS', false),
  ('Leg Press', 'LEGS', false),
  ('Leg Curl', 'LEGS', false),
  ('Calf Raises', 'LEGS', false),
  ('Overhead Press', 'SHOULDERS', false),
  ('Lateral Raises', 'SHOULDERS', false),
  ('Front Raises', 'SHOULDERS', false),
  ('Bicep Curls', 'ARMS', false),
  ('Tricep Dips', 'ARMS', false),
  ('Hammer Curls', 'ARMS', false),
  ('Skull Crushers', 'ARMS', false),
  ('Plank', 'CORE', false),
  ('Crunches', 'CORE', false),
  ('Deadlift', 'BACK', false);

-- Allow public read of default exercises
create policy "public exercises readable" on exercises for select using (user_id is null or auth.uid() = user_id);
