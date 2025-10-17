import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. Importa el CSS global (con las directivas @tailwind)
import './index.css'; 
// 2. Importa tu componente principal (asumimos que exporta como default App)
import App from './RadiographyClassifier.jsx'; 

// Obtener el elemento raíz del HTML
const rootElement = document.getElementById('root');

if (rootElement) {
  // Inicializar y renderizar la aplicación de React
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      {/* El componente App es el componente RadiographyClassifier */}
      <App />
    </React.StrictMode>,
  );
} else {
  console.error('No se encontró el elemento raíz con id="root" en index.html.');
}
