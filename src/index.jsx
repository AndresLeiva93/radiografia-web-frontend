import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. Importa el CSS global (asume que existe index.css con las directivas de Tailwind)
import './index.css'; 
// 2. Importa tu componente principal
import App from './RadiographyClassifier.jsx'; 
// 3. Importa el Proveedor de Autenticación
import { AuthProvider } from './AuthContext.jsx'; 

// Obtener el elemento raíz del HTML (asumiendo que hay un <div id="root"></div>)
const rootElement = document.getElementById('root');

if (rootElement) {
  // Inicializar y renderizar la aplicación de React
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      {/* ENVOLVER LA APLICACIÓN CON EL PROVEEDOR DE AUTENTICACIÓN */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>,
  );
} else {
  console.error('No se encontró el elemento raíz con id="root" en el DOM.');
}
```eof
