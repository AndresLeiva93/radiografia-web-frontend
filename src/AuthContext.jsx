import React, { createContext, useState, useContext, useEffect } from 'react';

// Crea el Contexto de Autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto
// Este hook será importado en RadiographyClassifier.jsx
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
