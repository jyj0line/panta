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
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        sub: 'var(--sub)',
        supersub: 'var(--supersub)',

        em: 'var(--em)'
      },
      gridTemplateColumns: {
        'card-grid': 'repeat(auto-fit, minmax(18rem, auto))',
      }
    },
  },
  plugins: [],
} satisfies Config;
