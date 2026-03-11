/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    borderRadius: {
      'none': '0',
      'sm': '3px',
      DEFAULT: '4px',
      'md': '5px',
      'lg': '6px',
      'xl': '8px',
      '2xl': '10px',
      '3xl': '12px',
      'full': '9999px',
    },
    extend: {
      colors: {
        primary: '#16a34a',
        'primary-dark': '#15803d',
        'primary-light': '#dcfce7',
        'linkedin-bg': '#f0fdf4',
        secondary: '#e9f7ef',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
