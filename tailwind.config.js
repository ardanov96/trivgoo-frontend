/** @type {import('tailwindcss').Config} */
export default {
  // Scan semua file yang pakai Tailwind class
  content: [
    './index.html',
    './**/*.{js,ts,jsx,tsx}',
    // Exclude node_modules dan dist
    '!./node_modules/**',
    '!./dist/**',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['Nunito', 'sans-serif'],
        serif: ['Rubik', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#fef5f3',
          100: '#fde8e4',
          200: '#fbd1ca',
          300: '#f7aea1',
          400: '#f18169',
          500: '#e6654d',
          600: '#E05845',
          700: '#c34134',
          800: '#a23830',
          900: '#85322e',
        },
        accent: {
          500: '#f97316',
          600: '#ea580c',
        },
      },
      boxShadow: {
        soft: '0 10px 40px -10px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
