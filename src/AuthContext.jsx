import React, { createContext, useState, useContext, useEffect } from 'react';

// Crea el Contexto de Autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
    return useContext(AuthContext);
};

// Proveedor del Contexto que envuelve toda la aplicación
export const AuthProvider = ({ children }) => {
    // 1. Inicializar el estado del token desde el almacenamiento local (persistencia)
    const [token, setToken] = useState(localStorage.getItem('authToken'));

    // 2. Comprobar si está logeado (existe un token)
    const isLoggedIn = !!token; 

    // Función para Iniciar Sesión (guarda el token y actualiza el estado)
    const login = (simulatedToken) => {
        // En un caso real, la API devuelve el token.
        // Aquí lo almacenamos y actualizamos el estado.
        localStorage.setItem('authToken', simulatedToken);
        setToken(simulatedToken);
        console.log('Usuario autenticado con token simulado.');
    };

    // Función para Cerrar Sesión
    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        console.log('Sesión cerrada.');
    };

    // Objeto con el estado y las funciones que se proveerán al resto de la app
    const value = {
        isLoggedIn,
        token,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```eof

### 2. Archivo Raíz de React (`index.jsx`)

```react:Punto de Entrada de la Aplicación:index.jsx
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
