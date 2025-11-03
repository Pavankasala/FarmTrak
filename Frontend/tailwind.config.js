export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,css}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',      // Extra small phones
        'sm': '640px',      // Small tablets
        'md': '768px',      // Medium tablets
        'lg': '1024px',     // Laptops
        'xl': '1280px',     // Desktops
        '2xl': '1536px',    // Large desktops
        '3xl': '1920px',    // Ultra-wide
      },
      colors: {
        light: {
          bg: '#f8fafc',
          card: '#ffffff',
          text: '#0f172a',
          subtext: '#64748b',
          border: '#e2e8f0',
          primary: '#4f46e5',
          primaryHover: '#4338ca',
        },
        dark: {
          bg: '#0f172a',
          card: '#1e293b',
          text: '#f1f5f9',
          subtext: '#94a3b8',
          border: '#334155',
          primary: '#6366f1',
          primaryHover: '#818cf8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      maxWidth: {
        'xs': '20rem',
        '8xl': '88rem',
        '9xl': '96rem',
      }
    },
  },
  plugins: [],
};