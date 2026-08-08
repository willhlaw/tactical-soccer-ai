/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pitch: {
          light: '#2e7d32',
          DEFAULT: '#1b5e20',
          dark: '#0e3a13',
          grass: '#388e3c',
          line: 'rgba(255, 255, 255, 0.75)',
        },
        navy: {
          900: '#0b132b',
          800: '#1c2541',
          700: '#3a506b',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
