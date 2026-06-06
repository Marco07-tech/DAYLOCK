export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#12131b',
        surface: '#12131b',
        'surface-container-low': '#1a1b23',
        'surface-container': '#1e1f27',
        'surface-container-high': '#282932',
        'surface-variant': '#33343d',
        'on-surface': '#e2e1ed',
        'on-surface-variant': '#c4c5d7',
        'outline': '#8e90a0',
        'outline-variant': '#444654',
        'primary': '#b9c3ff',
        'on-primary': '#00228a',
        'primary-container': '#6e88ff',
        'tertiary-container': '#e1721e',
        'ff-accent': '#4F6EF7',
        'ff-surface': '#161616',
        'ff-border': '#2A2A2A',
        'ff-muted': '#888888',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-sm': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '600' }],
        'data-mono': ['14px', { lineHeight: '1', fontWeight: '500' }],
      },
      spacing: {
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      },
      borderRadius: {
        DEFAULT: '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'full': '9999px',
      }
    }
  },
  plugins: []
}
