/** @type {import('tailwindcss').Config} */
module.exports = {
  // --- ADD THIS LINE ---
  darkMode: 'class',
  // --- END ADD ---
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'), // Ensure this plugin is listed
  ],
}