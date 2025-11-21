import React, { createContext, useState, useContext, useEffect } from 'react';

// Crea el Contexto de Autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
    return useContext(AuthContext);
};

// Proveedor del Contexto que envuelve toda la aplicación
export const AuthProvider = ({ children }) => {
    // 1. Inicializar el token a null y agregar un estado de carga
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // <-- NUEVO

    // 2. Usar useEffect para leer el token de localStorage SÓLO después del montaje
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            setToken(storedToken);
        }
        setIsLoading(false); // La carga inicial ha terminado
    }, []); 

    // 3. Comprobar si está logeado (se recalcula en cada render)
    const isLoggedIn = !!token; 

    // Función para Iniciar Sesión
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
        logout,
        isLoading, // <-- EXPORTAR EL ESTADO DE CARGA
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
