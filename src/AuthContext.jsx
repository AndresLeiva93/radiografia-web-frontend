import React, { createContext, useState, useContext, useEffect } from 'react';

// Crea el Contexto de Autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
    return useContext(AuthContext);
};

// Proveedor del Contexto que envuelve toda la aplicación
export const AuthProvider = ({ children }) => {
    // 1. Inicializar el estado del token
    const [token, setToken] = useState(null); // Empezamos con null
    // 🚨 CAMBIO CLAVE: Añadir un estado de carga inicializado en true
    const [isLoading, setIsLoading] = useState(true);

    // 2. Comprobar si está logeado (existe un token)
    const isLoggedIn = !!token; 

    // 🚨 EFECTO PARA VERIFICAR EL TOKEN EN localStorage
    useEffect(() => {
        // Obtenemos el token del almacenamiento local
        const storedToken = localStorage.getItem('authToken');
        // Lo establecemos en el estado
        setToken(storedToken);
        // Marcamos que la carga inicial ha terminado
        setIsLoading(false);
    }, []); // Se ejecuta solo una vez al montar

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
        logout,
        // 🚨 Añadir el estado de carga
        isLoading 
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
