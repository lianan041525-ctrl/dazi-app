/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // v3 品牌色:粉 → 暖橙
        brand: '#FF6B9D',
        brand2: '#FF8C35',
        'accent-purple': '#C026D3',
        'accent-green': '#4ADE80',
        'accent-red': '#F87171',
        bg: '#0A0A18',
        'bg-card': '#13131F',
        'bg-card-2': '#1A1A2E',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'PingFang SC', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'brand-grad': 'linear-gradient(135deg, #FF6B9D, #FF8C35)',
        'brand-grad-3': 'linear-gradient(135deg, #FF6B9D, #C026D3, #FF8C35)',
      },
    },
  },
  plugins: [],
};
