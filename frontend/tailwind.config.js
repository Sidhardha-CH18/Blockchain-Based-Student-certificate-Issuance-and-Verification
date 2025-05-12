/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
      },
      colors: {
        primary: {
          light: '#e0f2fe',
          DEFAULT: '#7dd3fc',
          dark: '#0369a1', // Now accessible as from-primary-dark
        },
        accent: {
          light: '#fce7f3',
          DEFAULT: '#f9a8d4',
          dark: '#be185d', // Now accessible as from-accent-dark
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
    },
  },
  corePlugins: {
    backgroundClip: true, // ← Crucial for bg-clip-text
  },
  plugins: [],
}