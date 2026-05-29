/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0A0F',
        'bg-secondary': '#111118',
        'bg-card': '#1A1A24',
        'bg-border': '#2A2A35',
        'accent-lime': '#A8FF3E',
        'accent-lime-dark': '#7ACC20',
        'accent-lime-muted': '#A8FF3E1A',
        'text-primary': '#FFFFFF',
        'text-secondary': '#8B8B9E',
        'text-muted': '#4A4A5A',
        'status-warning': '#F59E0B',
        'status-danger': '#EF4444',
        'status-success': '#A8FF3E',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      backgroundColor: {
        primary: '#0A0A0F',
        secondary: '#111118',
        card: '#1A1A24',
        border: '#2A2A35',
      },
      textColor: {
        primary: '#FFFFFF',
        secondary: '#8B8B9E',
        muted: '#4A4A5A',
      },
    },
  },
  plugins: [],
};
