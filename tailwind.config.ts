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
        foreground: 'var(--foreground)',

        sub: 'var(--sub)',
        supersub: 'var(--supersub)',

        em: 'var(--em)',
        powerem: 'var(--powerem)',
        bad: 'var(--bad)',
        powerbad: 'var(--powerbad)'
      },
      gridTemplateColumns: {
        'card-grid': 'repeat(auto-fit, minmax(18rem, auto))',
      },
      keyframes: {
        success: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.1) ' },
          '20%, 60%': { transform: 'rotate(5deg)' },
          '40%, 80%': { transform: 'rotate(-5deg)' },
        },
        message: {
          "0%": { maxHeight: "100rem", opacity: "1" },
          "80%": { opacity: "1" },
          "99%": { maxHeight: "100rem" },
          "100%": { maxHeight: "0px", opacity: "0" },
        },
        message_progressbar: {
          "0%": { maxHeight: "100rem" },
          "100%": { maxHeight: "0px" },
        },
      },
      animation: {
        success: 'success 0.5s ease-in 1',
        message: "message 5s linear forwards",
        message_progressbar: "message_progressbar 5s linear forwards"
      },
    },
  },
  plugins: [],
} satisfies Config;