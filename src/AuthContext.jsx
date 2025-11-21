import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null); 
    // 🚨 Nuevo estado de carga: Inicializado en true
    const [isLoading, setIsLoading] = useState(true);

    const isLoggedIn = !!token; 

    // ✅ EFECTO PARA VERIFICAR EL TOKEN DE FORMA ASÍNCRONA
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        setToken(storedToken);
        // Marca que la carga inicial terminó SÓLO después de leer localStorage
        setIsLoading(false); 
    }, []); 

    const login = (simulatedToken) => {
        localStorage.setItem('authToken', simulatedToken);
        setToken(simulatedToken);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
    };

    const value = {
        isLoggedIn,
        token,
        login,
        logout,
        // 🚨 Exportar isLoading
        isLoading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
