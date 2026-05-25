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
        },
      },
    },
  },
  plugins: [],
}

export default config
