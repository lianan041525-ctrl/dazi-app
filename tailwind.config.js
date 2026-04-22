/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#FF5E78', 50: '#FFE8ED', 100: '#FFD1DA', 600: '#E8395A', 900: '#7A1A2E' },
        accent: { purple: '#6C5CE7', green: '#06D6A0', amber: '#FFD93D' },
        bg: { DEFAULT: '#0F0B1E', surface: 'rgba(255,255,255,0.04)' },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
