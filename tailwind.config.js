/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#FAF9F7',     // Fundo principal[cite: 17]
          offwhite: '#F1ECE5',  // Cards e seções[cite: 17]
          nude: '#C8B29D',      // Destaques e bordas[cite: 17]
          taupe: '#9A806B',     // Textos secundários[cite: 17]
          gold: '#B08A45',      // Dourado para botões e ações[cite: 17]
          coffee: '#40352E',    // Textos principais e títulos[cite: 17]
        }
      },
    },
  },
  plugins: [],
}