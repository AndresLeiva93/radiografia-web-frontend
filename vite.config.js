import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configuración clave para solucionar problemas de rutas en Vercel
  // Asegura que Vite genere rutas absolutas, lo que es necesario para 
  // que los archivos JS se carguen correctamente desde el dominio de Vercel.
  base: '/', 
  build: {
    // Vite por defecto apunta a la carpeta 'dist', esto solo lo confirma
    outDir: 'dist', 
  }
});
