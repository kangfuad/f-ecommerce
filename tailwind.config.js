/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Theme Tokens (Driven by CSS Variables)
        theme: {
          page: 'var(--color-bg-page)',
          card: 'var(--color-bg-card)',
          'card-hover': 'var(--color-bg-card-hover)',
          primary: 'var(--color-text-primary)',
          muted: 'var(--color-text-muted)',
          cta: 'var(--color-cta)',
          'cta-hover': 'var(--color-cta-hover)',
          'cta-text': 'var(--color-cta-text)',
          terracotta: 'var(--color-accent-terracotta)',
          border: 'var(--color-border)',
        },

        // Warm Espresso & Forest Sage Palette
        'espresso': {
          DEFAULT: '#1C1917',
          dark: '#141211',
          card: '#1F1C1B',
          stone: '#2E2A28',
        },
        'forest': {
          DEFAULT: '#3D634C',
          hover: '#2F4D3B',
          glow: '#82A78F',
          soft: '#A3C4AF',
        },
        'sage': {
          DEFAULT: '#3D634C',
          hover: '#2F4D3B',
          soft: '#82A78F',
          dark: '#141211',
          light: '#F4F7F4',
        },
        'terracotta': {
          DEFAULT: '#C88A58',
          hover: '#B57745',
          soft: '#E09F67',
          light: '#FDF6F0',
        },
        'coral': {
          DEFAULT: '#C88A58',
          hover: '#B57745',
          light: '#FDF6F0',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        display: ['"Playfair Display"', 'ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', 'monospace'],
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-hover)',
        'glow-sage': '0 0 25px -3px rgba(130, 167, 143, 0.35)',
        'glow-sage-light': '0 0 20px -3px rgba(61, 99, 76, 0.25)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-left': 'slideLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
