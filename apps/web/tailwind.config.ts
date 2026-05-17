import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      // ── Brand Colors (from Figma) ─────────────────────────────────────────
      colors: {
        // Primary — deep teal (main CTAs, active states, progress)
        primary: {
          50: '#e6f3f1',
          100: '#c0e0db',
          200: '#96ccc4',
          300: '#6cb8ad',
          400: '#4da89b',
          500: '#0E7060', // Main brand teal (#0E7060)
          600: '#0c6355',
          700: '#0a5549',
          800: '#08473d',
          900: '#053428',
        },
        // Success / Ratings / Earnings
        success: {
          DEFAULT: '#34C759',
          light: '#e8f9ed',
        },
        // Neutral text
        neutral: {
          900: '#111111',
          800: '#222222',
          600: '#666666',
          400: '#9CA3AF',
          200: '#E5E7EB',
          100: '#F2F4F7',
          50:  '#F7F9FA',
        },
        // Background
        bg: {
          DEFAULT: '#F5F5F5',
          card: '#FFFFFF',
          input: '#F2F4F7',
        },
        // Warning / Error
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEF2F2',
        },
      },
      // ── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'SF Pro', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        hero:    ['24px', { lineHeight: '32px', fontWeight: '700' }],
        h2:      ['20px', { lineHeight: '28px', fontWeight: '600' }],
        h3:      ['18px', { lineHeight: '26px', fontWeight: '600' }],
        body:    ['15px', { lineHeight: '22px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      // ── Border radius (Figma spec) ────────────────────────────────────────
      borderRadius: {
        pill: '100px',
        card: '16px',
        input: '12px',
        chip:  '8px',
      },
      // ── Animations ────────────────────────────────────────────────────────
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%':      { transform: 'translateX(-5px)' },
          '75%':      { transform: 'translateX(5px)' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up':  'fade-up 0.35s ease-out forwards',
        'fade-in':  'fade-in 0.25s ease-out forwards',
        shake:      'shake 0.3s ease-in-out',
        'slide-up': 'slide-up 0.4s ease-out forwards',
      },
      // ── Box Shadows ───────────────────────────────────────────────────────
      boxShadow: {
        card:  '0 2px 8px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10)',
        input: '0 1px 3px rgba(0,0,0,0.04)',
      },
      // ── Max width for mobile-first layout ─────────────────────────────────
      maxWidth: {
        mobile: '390px',
      },
    },
  },
  plugins: [],
};

export default config;
