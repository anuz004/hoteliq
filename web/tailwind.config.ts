import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0c1118',
        panel: '#111a23',
        slateSoft: '#1a2530',
        champagne: '#d4b07d',
        amberSoft: '#f5d29d',
        mint: '#8ee0c0',
        rose: '#f29d9d',
        navy: '#0b1321',
      },
      boxShadow: {
        soft: '0 12px 30px rgba(8, 15, 25, 0.22)',
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
