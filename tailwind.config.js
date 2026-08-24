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
          blue: 'var(--color-accent-blue)',
          border: 'var(--color-border)',
        },

        // Muted Sky & Sage Theme Specific Tokens
        'eps-light': {
          bg: '#F8FAFC',        // Ice White
          card: '#FFFFFF',      // Pure White
          primary: '#0F172A',   // Deep Navy
          muted: '#64748B',     // Slate Blue Gray
          cta: '#84A98C',       // Sage Green
          'cta-hover': '#6B8E73', // Darker Sage
          blue: '#3B82F6',      // Soft Dusty Blue
          border: '#E2E8F0',    // Subtle Gray
        },
        'eps-dark': {
          bg: '#1A1A1A',        // Deep Charcoal
          card: '#262626',      // Muted Slate Gray
          primary: '#F8FAFC',   // Off-White Cream
          muted: '#A1A1AA',     // Soft Ash Gray
          cta: '#9DC89F',       // Adapted Soft Sage
          'cta-hover': '#84A98C', // Sage Green
          blue: '#3B82F6',      // Soft Dusty Blue
          border: '#3F3F46',    // Dark Slate Gray
        },

        // Shorthand Brand Colors
        'sage': {
          DEFAULT: '#84A98C',
          hover: '#6B8E73',
          soft: '#9DC89F',
          dark: '#1B2E20',
          light: '#E8F3E9',
        },
        'dusty-blue': {
          DEFAULT: '#3B82F6',
          light: '#EFF6FF',
          dark: '#1E3A8A',
        },
        'deep-navy': '#0F172A',
        'deep-charcoal': '#1A1A1A',
        'slate-card': '#262626',
        'ash-gray': '#A1A1AA',
        'ice-white': '#F8FAFC',
        'coral': {
          DEFAULT: '#E28B75',
          hover: '#D9775E',
          light: '#FDEEE9',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-hover)',
        'glow-sage': '0 0 25px -3px rgba(157, 200, 159, 0.4)',
        'glow-sage-light': '0 0 20px -3px rgba(132, 169, 140, 0.35)',
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
