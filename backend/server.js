import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(express.json());

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// MIDDLEWARE: AUTH TOKEN VERIFICATION
// ============================================================================

async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = data.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

// ============================================================================
// ROUTES
// ============================================================================

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FORGE Backend is running' });
});

// ============================================================================
// AUTH ROUTES
// ============================================================================

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { data, error } = await supabase.auth.signUpWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'User created successfully', user: data.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: 'Login successful',
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', verifyToken, async (req, res) => {
  try {
    await supabase.auth.signOut();
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// PROFILE ROUTES
// ============================================================================

app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profile', verifyToken, async (req, res) => {
  try {
    const { username, display_name } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: req.user.id,
        username,
        display_name,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Profile updated', profile: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// WORKOUT ROUTES
// ============================================================================

app.get('/api/workouts', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*, exercises(*)')
      .eq('user_id', req.user.id)
      .order('date', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workouts', verifyToken, async (req, res) => {
  try {
    const { day, workout_type, exercises } = req.body;

    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: req.user.id,
        day,
        workout_type,
      })
      .select()
      .single();

    if (workoutError) {
      return res.status(400).json({ error: workoutError.message });
    }

    // Insert exercises
    if (exercises && exercises.length > 0) {
      const exercisesWithWorkoutId = exercises.map(ex => ({
        ...ex,
        workout_id: workoutData.id,
      }));

      const { error: exError } = await supabase
        .from('exercises')
        .insert(exercisesWithWorkoutId);

      if (exError) {
        return res.status(400).json({ error: exError.message });
      }
    }

    res.status(201).json({ message: 'Workout created', workout: workoutData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/workouts/:id', verifyToken, async (req, res) => {
  try {
    const { day, workout_type } = req.body;

    const { data, error } = await supabase
      .from('workouts')
      .update({ day, workout_type })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Workout updated', workout: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/workouts/:id', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Workout deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// NUTRITION ROUTES
// ============================================================================

app.get('/api/nutrition', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .order('log_date', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/nutrition', verifyToken, async (req, res) => {
  try {
    const { food_name, calories, protein, carbs, fat } = req.body;

    const { data, error } = await supabase
      .from('nutrition_logs')
      .insert({
        user_id: req.user.id,
        food_name,
        calories,
        protein,
        carbs,
        fat,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Nutrition logged', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/nutrition/:id', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('nutrition_logs')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Nutrition entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// PEDOMETER ROUTES
// ============================================================================

app.get('/api/pedometer', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pedometer_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .order('log_date', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pedometer', verifyToken, async (req, res) => {
  try {
    const { steps } = req.body;

    const { data, error } = await supabase
      .from('pedometer_logs')
      .insert({
        user_id: req.user.id,
        steps,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Steps logged', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 FORGE Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
