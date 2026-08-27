/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        farm: {
          50: '#f6fbf4',
          100: '#e8f4e2',
          600: '#4f8d3d',
          700: '#3f7331',
          900: '#1e3420',
        },
        soil: {
          100: '#f4eee6',
          700: '#77563b',
        },
      },
      boxShadow: {
        soft: '0 24px 80px rgba(31, 45, 28, 0.16)',
      },
    },
  },
  plugins: [],
};
