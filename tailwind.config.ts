import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#DC2626',
          'red-dark': '#991B1B',
          'red-light': '#EF4444',
          gold: '#F59E0B',
          'gold-light': '#FCD34D',
          'gold-dark': '#D97706',
          dark: '#0A0A0A',
          'dark-card': '#111111',
          'dark-border': '#1F1F1F',
          'dark-muted': '#2A2A2A',
          'dark-hover': '#1A1A1A',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'Arial Black', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'countdown-tick': 'countdown-tick 1s ease-in-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
        'efu-mark': 'efu-mark 0.7s cubic-bezier(.16,1,.3,1) both',
        'efu-pulse': 'efu-pulse 3s ease-in-out infinite',
        'efu-wordmark': 'efu-wordmark 0.7s cubic-bezier(.16,1,.3,1) 0.15s both',
        'efu-wordmark-delay': 'efu-wordmark 0.7s cubic-bezier(.16,1,.3,1) 0.35s both',
        'efu-spotlight': 'efu-spotlight 8s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'scale-in': 'scale-in 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(220,38,38,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(220,38,38,0.8), 0 0 80px rgba(220,38,38,0.3)' },
        },
        'countdown-tick': {
          '0%': { transform: 'scale(1.1)', color: '#F59E0B' },
          '100%': { transform: 'scale(1)', color: 'inherit' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'efu-mark': {
          '0%': { transform: 'scale(0.6) rotate(-12deg)', opacity: '0' },
          '60%': { transform: 'scale(1.08) rotate(2deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0)', opacity: '1' },
        },
        'efu-pulse': {
          '0%, 100%': { boxShadow: 'inset 0 0 0 1px rgba(245,158,11,0.4)' },
          '50%': { boxShadow: 'inset 0 0 0 2px rgba(245,158,11,0.9), 0 0 18px rgba(245,158,11,0.45)' },
        },
        'efu-wordmark': {
          '0%': { transform: 'translateY(14px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'efu-spotlight': {
          '0%, 100%': { transform: 'translate(-10%, -5%) scale(1)' },
          '50%': { transform: 'translate(10%, 5%) scale(1.1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
