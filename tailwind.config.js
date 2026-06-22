/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:   '#2563EB',
        secondary: '#1E40AF',
        silver:    '#CBD5E1',
        dark:      '#020817',
        success:   '#22C55E',
        warning:   '#F59E0B',
        danger:    '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
