/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cambui-orange': '#F37021',
        'cambui-header': '#E86C1F',
        'header-bg': '#FF8C00', // Approximate orange from image
        'table-header': '#E0E0E0',
        'status-green': '#00A651',
        'status-red': '#ED1C24',
        'row-orange': '#FFCC99',
        'row-gray': '#F2F2F2',
        'total-yellow': '#FFFF00',
        'total-green': '#99CC00',
      }
    },
  },
  plugins: [],
}
