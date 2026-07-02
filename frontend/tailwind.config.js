/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#080b12',
        panel: '#101522',
        line: '#222a3a',
        accent: '#7c5cff',
        cyan: '#22d3ee',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        glow: '0 0 50px rgba(124, 92, 255, 0.16)',
      },
    },
  },
  plugins: [],
}
