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

    // Función para Iniciar Sesión (simulada por ahora)
    const login = (simulatedToken) => {
        localStorage.setItem('authToken', simulatedToken);
        setToken(simulatedToken);
    };

    // Función para Cerrar Sesión
    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
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
