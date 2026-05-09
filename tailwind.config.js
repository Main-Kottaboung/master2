/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts,scss}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem'
      }
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)']
      },
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0f766e',
          700: '#115e59',
          800: '#134e4a',
          900: '#042f2e'
        },
        ink: {
          DEFAULT: '#0f172a',
          muted: '#475569'
        },
        surface: {
          DEFAULT: '#f8fafc',
          elevated: '#ffffff'
        }
      },
      boxShadow: {
        soft: '0 24px 60px -28px rgba(15, 23, 42, 0.28)',
        glow: '0 0 0 1px rgba(15, 118, 110, 0.08), 0 20px 45px -20px rgba(15, 118, 110, 0.35)'
      },
      backgroundImage: {
        'mesh-light':
          'radial-gradient(circle at top left, rgba(20, 184, 166, 0.16), transparent 28%), radial-gradient(circle at top right, rgba(15, 118, 110, 0.12), transparent 24%)'
      },
      borderRadius: {
        xl2: '1.5rem',
        xl3: '1.75rem'
      }
    }
  },
  plugins: []
};