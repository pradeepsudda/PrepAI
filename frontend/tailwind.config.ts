import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
 
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a5f',
        },
        surface: {
          DEFAULT: '#0a0c14',
          card:    '#111420',
          raised:  '#181b28',
          border:  '#242840',
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in':      'fadeIn 0.4s ease forwards',
        'slide-up':     'slideUp 0.4s ease forwards',
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'wave':         'wave 1.4s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                      to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        wave:    { '0%,100%': { transform: 'scaleY(0.5)' }, '50%': { transform: 'scaleY(1.5)' } },
      },
    },
  },
  plugins: [forms],
} satisfies Config