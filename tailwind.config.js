/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
module.exports = {
  content: ['./public/**/*.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {    screens: {
    'xs': '420px',
    'xs-sm': '450px',
    'xs-sm2': '565px',
    'md-lg': '900px',
    ...defaultTheme.screens,
  },
    extend: {},
  },
  plugins: [],
}
