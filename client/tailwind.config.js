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
        'figmints': {
          primary: '#e55d4d',
          'primary-dark': '#d14a3a',
          'primary-light': '#f06a5a',
        },
        'coral': '#e55d4d',
      },
    },
  },
  plugins: [],
}