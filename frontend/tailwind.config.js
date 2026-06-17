/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8eccff',
          400: '#59aeff',
          500: '#338bff',
          600: '#1a6af5',
          700: '#1355e1',
          800: '#1646b6',
          900: '#183d8f',
          950: '#132757',
        },
      },
    },
  },
  plugins: [],
}
