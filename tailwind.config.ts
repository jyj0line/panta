import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wh: 'var(--wh)',
        
        background: 'var(--background)',
        powerbackground: 'var(--powerbackground)',
        foreground: 'var(--foreground)',

        sub: 'var(--sub)',
        supersub: 'var(--supersub)',

        em: 'var(--em)',
        powerem: 'var(--powerem)',
        superduperbad: 'var(--superduperbad)',
        superbad: 'var(--superbad)',
        bad: 'var(--bad)',
        powerbad: 'var(--powerbad)'
      },
      flex: {
        '2': '2 2 0%'
      },
      gridTemplateColumns: {
        'slips-grid': 'repeat(auto-fit, minmax(17rem, 1fr))',
        'books-grid': 'repeat(auto-fit, minmax(15rem, auto))'
      }, 
      keyframes: {
        'opacity-loading': {
          '0%, 100%': { opacity: '.5' },
        },
        'text-transparent-loading': {
          '0%, 100%': { color: 'transparent' },
        },
        'opacity-spin-loading': {
          '0%': { 
            opacity: '.5',
            transform: 'rotate(0deg)'
          },
          '100%': {
            opacity: '.5',
            transform: 'rotate(360deg)'
          },
        },
        'spin-centered': {
          '0%': { 
            opacity: '1',
            transform: 'translate(-50%, -50%) rotate(0deg)'
          },
          '100%': {
            opacity: '1',
            transform: 'translate(-50%, -50%) rotate(360deg)'
          },
        },

        'opacity-unmount': {
          "0%": {
            opacity: '1'
          },
          "80%": {
            opacity: '1'
          },
          "100%": {
            opacity: '0',
          }
        },
        'unmount-progressbar': {
          "0%": { width: "100%" },
          "100%": { width: "0%" },
        }
      },
      animation: {
        'opacity-loading': 'opacity-loading 1s linear 1s forwards',
        'text-transparent-loading': 'text-transparent-loading 1s linear 1s forwards',
        'opacity-spin-loading': 'opacity-spin-loading 1s linear 1s infinite',
        'spin-centered': 'spin-centered 1s linear 1s infinite',
        'text-transparent-loading-imm': 'text-transparent-loading 1s linear forwards',
        'spin-centered-imm': 'spin-centered 1s linear infinite',

        'opacity-unmount': 'opacity-unmount 5s linear forwards',
        'unmount-progressbar': 'unmount-progressbar 5s linear forwards'
      },
    },
  },
  plugins: [],
} satisfies Config;