import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0B0B12',
        surface: '#14141F',
        'surface-2': '#1C1C2B',
        border: '#262636',
        text: '#E8E8F0',
        muted: '#8A8AA3',
        primary: {
          DEFAULT: '#7C5CFF',
          hover: '#8F74FF',
          soft: 'rgba(124, 92, 255, 0.12)',
        },
        income: {
          DEFAULT: '#22C55E',
          soft: 'rgba(34, 197, 94, 0.12)',
        },
        expense: {
          DEFAULT: '#EF4444',
          soft: 'rgba(239, 68, 68, 0.12)',
        },
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.2rem',
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
} satisfies Config;
