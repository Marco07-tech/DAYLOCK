// ============================================================================
// FORGE FITNESS API CLIENT
// ============================================================================

const API_BASE_URL = window.FORGE_API_URL || 'http://localhost:5001/api';

class ForgeAPI {
  constructor() {
    this.token = localStorage.getItem('forge_token');
  }

  // ============================================================================
  // AUTH
  // ============================================================================

  async signup(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      this.token = data.session?.access_token;
      localStorage.setItem('forge_token', this.token);
    }
    return data;
  }

  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      this.token = data.session?.access_token;
      localStorage.setItem('forge_token', this.token);
    }
    return data;
  }

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    localStorage.removeItem('forge_token');
    this.token = null;
    return await response.json();
  }

  async signInWithGoogle() {
    // Supabase OAuth redirect URL
    const SUPABASE_PROJECT = 'bwrvghpfcmpqutvhgaut'; // Replace with your project ID
    const redirectUrl = `${window.location.origin}/`;
    
    const googleAuthUrl = `https://${SUPABASE_PROJECT}.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
    
    // Redirect to Supabase OAuth
    window.location.href = googleAuthUrl;
  }

  // Handle OAuth callback
  async handleOAuthCallback() {
    const fragment = window.location.hash;
    if (fragment) {
      const params = new URLSearchParams(fragment.substring(1));
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        this.token = accessToken;
        localStorage.setItem('forge_token', this.token);
        window.location.hash = ''; // Clear hash
        return { success: true, token: accessToken };
      }
    }
    return { success: false };
  }

  // ============================================================================
  // PROFILE
  // ============================================================================

  async getProfile() {
    if (this.token === 'offline_mode') {
      return { offline: true, username: 'Offline User', display_name: 'Offline Mode' };
    }
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: this.getHeaders(),
    });
    return await response.json();
  }

  async updateProfile(username, display_name) {
    if (this.token === 'offline_mode') {
      return { success: true, offline: true };
    }
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ username, display_name }),
    });
    return await response.json();
  }

  // ============================================================================
  // WORKOUTS
  // ============================================================================

  async getWorkouts() {
    if (this.token === 'offline_mode') {
      return { offline: true, workouts: [] };
    }
    const response = await fetch(`${API_BASE_URL}/workouts`, {
      headers: this.getHeaders(),
    });
    return await response.json();
  }

  async createWorkout(day, workout_type, exercises) {
    if (this.token === 'offline_mode') {
      return { success: true, offline: true };
    }
    const response = await fetch(`${API_BASE_URL}/workouts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ day, workout_type, exercises }),
    });
    return await response.json();
  }

  async updateWorkout(id, day, workout_type) {
    const response = await fetch(`${API_BASE_URL}/workouts/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ day, workout_type }),
    });
    return await response.json();
  }

  async deleteWorkout(id) {
    const response = await fetch(`${API_BASE_URL}/workouts/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return await response.json();
  }

  // ============================================================================
  // NUTRITION
  // ============================================================================

  async getNutrition() {
    if (this.token === 'offline_mode') {
      return { offline: true, nutrition: [] };
    }
    const response = await fetch(`${API_BASE_URL}/nutrition`, {
      headers: this.getHeaders(),
    });
    return await response.json();
  }

  async logNutrition(food_name, calories, protein, carbs, fat) {
    if (this.token === 'offline_mode') {
      return { success: true, offline: true };
    }
    const response = await fetch(`${API_BASE_URL}/nutrition`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ food_name, calories, protein, carbs, fat }),
    });
    return await response.json();
  }

  async deleteNutrition(id) {
    const response = await fetch(`${API_BASE_URL}/nutrition/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return await response.json();
  }

  // ============================================================================
  // PEDOMETER
  // ============================================================================

  async getPedometer() {
    if (this.token === 'offline_mode') {
      return { offline: true, pedometer: [] };
    }
    const response = await fetch(`${API_BASE_URL}/pedometer`, {
      headers: this.getHeaders(),
    });
    return await response.json();
  }

  async logSteps(steps) {
    if (this.token === 'offline_mode') {
      return { success: true, offline: true };
    }
    const response = await fetch(`${API_BASE_URL}/pedometer`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ steps }),
    });
    return await response.json();
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
    };
  }

  isAuthenticated() {
    return !!this.token;
  }
}

const forgeAPI = new ForgeAPI();
