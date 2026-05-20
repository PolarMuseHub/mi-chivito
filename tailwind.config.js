/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        sage: {
          50: '#F5F7F5',
          100: '#E8EBE8',
          200: '#D1D8D1',
          300: '#A9B5A9',
          400: '#7D8D7D',
          500: '#6B7B6E',
          600: '#5A6A5D',
          700: '#4A574C',
          800: '#3A453C',
          900: '#2A332B',
        },
        cream: {
          50: '#FDFCFB',
          100: '#F9F6F3',
          200: '#F5F1ED',
          300: '#EDE6DE',
          400: '#E0D5C7',
          500: '#D4C4B0',
          600: '#C1A888',
          700: '#A88C66',
          800: '#8A704F',
          900: '#6D593E',
        },
        coral: {
          50: '#FEF5F3',
          100: '#FDE8E4',
          200: '#FBD1C9',
          300: '#F9B5A8',
          400: '#F68E7A',
          500: '#F37059',
          600: '#E6543A',
          700: '#C8402A',
          800: '#A53424',
          900: '#872B20',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};