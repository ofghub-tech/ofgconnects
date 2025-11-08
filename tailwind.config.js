/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // --- ADD THIS FONTFAMILY SECTION ---
      fontFamily: {
        // This makes 'Inter' the default sans-serif font for your app
        sans: ['Inter', 'sans-serif'],
        // This creates a new utility class: 'font-telugu'
        telugu: ['Noto Sans Telugu', 'sans-serif'],
      },
      // --- END OF SECTION TO ADD ---
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}