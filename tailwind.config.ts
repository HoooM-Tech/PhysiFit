import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#1f1b5e',
          darker: '#0f0d2e',
        },
        accent: {
          DEFAULT: '#d4a500',
          dark: '#c49500',
          light: '#e6b81f',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        condensed: '-0.01em',
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(currentColor 1.5px, transparent 1.5px)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        sliderEnter: {
          '0%': { opacity: '0', transform: 'scale(1.03)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 600ms ease-out both',
        fadeIn: 'fadeIn 600ms ease-out both',
        sliderEnter: 'sliderEnter 700ms ease-out both',
      },
    },
  },
  plugins: [],
}

export default config
