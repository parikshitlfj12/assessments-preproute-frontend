/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef1fe',
          100: '#e0e5fd',
          200: '#c6cffb',
          300: '#a3b0f7',
          400: '#7d8cf1',
          500: '#5b6ee8',
          600: '#4c58d8',
          700: '#3f47bd',
          800: '#353c99',
          900: '#30377a',
        },
        accent: {
          blue: '#2f6bff',
        },
        ink: {
          900: '#1f2430',
          700: '#3a4152',
          500: '#6b7280',
          400: '#98a1b3',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f6f8fc',
          border: '#e9edf5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 4px 16px rgba(16, 24, 40, 0.06)',
        soft: '0 2px 8px rgba(16, 24, 40, 0.06)',
        pop: '0 8px 30px rgba(16, 24, 40, 0.12)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.15s ease-out',
      },
    },
  },
  plugins: [],
};
