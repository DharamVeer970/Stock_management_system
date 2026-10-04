/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        ink: {
          950: '#05060f',
          900: '#0a0b1a',
          800: '#11132a',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'brand': 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 50%, #22d3ee 100%)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(139,92,246,.35), 0 8px 40px -8px rgba(139,92,246,.55)',
        'glow-cyan': '0 0 0 1px rgba(34,211,238,.35), 0 8px 40px -8px rgba(34,211,238,.5)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(40px, -30px) scale(1.08)' },
          '66%': { transform: 'translate(-30px, 20px) scale(.95)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        blink: {
          '0%, 50%': { opacity: 1 },
          '51%, 100%': { opacity: 0 },
        },
      },
      animation: {
        float: 'float 18s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
        'fade-up': 'fade-up .5s ease-out both',
        blink: 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
}

