/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
module.exports = {
  content: ['./public/**/*.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {    screens: {
    'xs': '375px',
    'md-lg': '900px',
    ...defaultTheme.screens,
  },
    extend: {},
  },
  plugins: [],
}
