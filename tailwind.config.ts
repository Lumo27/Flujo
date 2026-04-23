import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0b1220',
        surface: '#111827',
        'surface-2': '#1a2435',
        border: '#1f2937',
        text: '#e5e7eb',
        muted: '#9ca3af',
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          soft: 'rgba(59, 130, 246, 0.12)',
        },
        // Violeta: solo análisis / proyección. No usar en acciones o navegación.
        analytics: {
          DEFAULT: '#8b5cf6',
          soft: 'rgba(139, 92, 246, 0.12)',
        },
        income: {
          DEFAULT: '#22c55e',
          soft: 'rgba(34, 197, 94, 0.12)',
        },
        expense: {
          DEFAULT: '#ef4444',
          soft: 'rgba(239, 68, 68, 0.12)',
        },
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.2rem',
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.03) inset, 0 4px 16px -8px rgba(0,0,0,0.5)',
        'card-lg': '0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 32px -8px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
} satisfies Config;
