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
          primary: '#4f46e5', // Original Indigo
          primaryHover: '#4338ca', // Original Indigo Hover
        },
        // Dark Theme
        dark: {
          bg: '#0f172a', // slate-900
          card: '#1e293b', // slate-800
          text: '#f1f5f9', // slate-100
          subtext: '#94a3b8', // slate-400
          border: '#334155', // slate-700
          primary: '#6366f1', // Original Lighter Indigo
          primaryHover: '#818cf8', // Original Lighter Indigo Hover
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};