/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blush-pink': '#FFB3C6',
        'lavender': '#E6E6FA',
        'mint-green': '#C1F4CD',
        'beige': '#F5F5DC',
        'soft-pink': '#FFE4E1',
        'light-lavender': '#F0F0FF',
        'sage': '#BCEAD5',
        'cream': '#FFFDD0',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
