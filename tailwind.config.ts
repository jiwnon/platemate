import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#f9d7ad',
          300: '#f5b978',
          400: '#f09242',
          500: '#ec751c',
          600: '#dd5b12',
          700: '#b74411',
          800: '#923616',
          900: '#762f15',
          950: '#401509',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Noto Sans KR', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
