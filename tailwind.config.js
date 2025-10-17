/** @type {import('tailwindcss').Config} */
module.exports = {
  // CRUCIAL: Aquí le decimos a Tailwind dónde buscar las clases (archivos JSX/JS/TS/TSX)
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Configuraciones personalizadas para tu aplicación
      fontFamily: {
        // Usar 'Inter' para consistencia con el HTML
        inter: ['Inter', 'sans-serif'], 
      }
    },
  },
  plugins: [],
}
