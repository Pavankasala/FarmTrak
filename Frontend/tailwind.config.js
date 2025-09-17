// tailwind.config.js
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,css}',
  ],
  theme: {
    extend: {
      colors: {
        // Light Theme
        light: {
          bg: '#f8fafc', // slate-50
          card: '#ffffff', // white
          text: '#0f172a', // slate-900
          subtext: '#64748b', // slate-500
          border: '#e2e8f0', // slate-200
          primary: '#16a34a', // green-600
          primaryHover: '#15803d', // green-700
        },
        // Dark Theme
        dark: {
          bg: '#0f172a', // slate-900
          card: '#1e293b', // slate-800
          text: '#f1f5f9', // slate-100
          subtext: '#94a3b8', // slate-400
          border: '#334155', // slate-700
          primary: '#22c55e', // green-500
          primaryHover: '#4ade80', // green-400
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};