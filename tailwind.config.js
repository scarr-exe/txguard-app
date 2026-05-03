/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        solflare: {
          bg: '#08080f',
          card: '#0f0f1c',
          border: '#1e1e35',
          surface: '#13131f',
          hover: '#1a1a2e',
          orange: '#ff6b2b',
          'orange-dim': '#cc4f18',
          'orange-glow': 'rgba(255,107,43,0.15)',
          purple: '#8b5cf6',
          'purple-dim': '#6d28d9',
          blue: '#3b82f6',
          text: '#e2e8f0',
          muted: '#8892a4',
          dim: '#4a5568',
          green: '#10b981',
          'green-dim': '#065f46',
          red: '#ef4444',
          'red-dim': '#7f1d1d',
          yellow: '#f59e0b',
          'yellow-dim': '#78350f',
        }
      },
      backgroundImage: {
        'gradient-solflare': 'linear-gradient(135deg, #ff6b2b 0%, #8b5cf6 100%)',
        'gradient-card': 'linear-gradient(180deg, #0f0f1c 0%, #0a0a14 100%)',
      },
      boxShadow: {
        'orange-glow': '0 0 30px rgba(255,107,43,0.2)',
        'purple-glow': '0 0 30px rgba(139,92,246,0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 2s linear infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      }
    },
  },
  plugins: [],
}
