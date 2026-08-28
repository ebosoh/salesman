/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#B91C1C',
          'red-dark': '#991B1B',
          'red-light': '#FEE2E2',
          blue: '#172554',
          'blue-dark': '#0F172A',
          'blue-light': '#EFF6FF',
          'blue-muted': '#1E3A8A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8FAFC',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      minHeight: {
        touch: '48px',
      },
      minWidth: {
        touch: '48px',
      }
    },
  },
  plugins: [],
}
