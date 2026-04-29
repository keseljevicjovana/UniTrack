/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'uni-brown': '#4A3628',
        'uni-beige': '#F5F2ED',
        'uni-gold': '#BEB7AD',
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        unitrack: {
          "primary": "#4A3628",          /* Braon */
          "primary-content": "#F5F2ED",  /* Bež tekst na braon pozadini */
          "base-100": "#F5F2ED",         /* Bež pozadina cijele stranice */
          "base-content": "#4A3628",     /* Braon tekst na bež pozadini */
          "secondary": "#BEB7AD",
          "accent": "#38291F",
        },
      },
    ],
  },
}