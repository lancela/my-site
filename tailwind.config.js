/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{html,js}",
    "./src/layouts/**/*.html",
    "./src/js/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}