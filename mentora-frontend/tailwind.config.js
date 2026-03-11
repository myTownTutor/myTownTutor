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
        primary: '#0a66c2',
        'primary-dark': '#0c539b',
        'primary-light': '#e8f0fe',
        'linkedin-bg': '#f3f2ef',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
