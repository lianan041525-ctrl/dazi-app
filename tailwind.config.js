/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF6B35',
          50: '#FFF4EE',
          100: '#FFE4D3',
          500: '#FF6B35',
          600: '#E85A24',
        },
      },
    },
  },
  plugins: [],
};
