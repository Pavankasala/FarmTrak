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
        // 🌞 Light Mode
        light: {
          bg: '#ffffff',
          text: '#111827',
          subtext: '#4B5563',
          muted: '#6B7280',
          primary: '#4F46E5',
          primaryHover: '#6366F1',
        },
        // 🌙 Dark Mode
        dark: {
          bg: '#111827',
          text: '#ffffff',
          subtext: '#D1D5DB',
          dim: '#9CA3AF',
          card: 'rgba(255,255,255,0.05)', // white/5
          primary: '#6366F1',
          primaryHover: '#818CF8',
        },
        // Fallback colors for legacy usage like bg-white
        white: '#ffffff',
        black: '#000000',
      },
    },
  },
  plugins: [],
};
