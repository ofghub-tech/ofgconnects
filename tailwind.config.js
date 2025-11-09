/** @type {import('tailwindcss').Config} */
module.exports = {
  // --- (FIX 1) ADD THIS LINE ---
  darkMode: 'class', 
  // --- END FIX ---
  
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        telugu: ['Noto Sans Telugu', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}