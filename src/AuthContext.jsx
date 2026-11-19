// src/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const isLoggedIn = !!token;

    useEffect(() => {
        // Limpia cualquier sesión vieja que haya quedado en localStorage
        localStorage.removeItem('authToken');

        const storedToken = sessionStorage.getItem('authToken');
        setToken(storedToken);
        setIsLoading(false);
    }, []);

    const login = (simulatedToken) => {
        sessionStorage.setItem('authToken', simulatedToken);
        setToken(simulatedToken);
    };

    const logout = () => {
        sessionStorage.removeItem('authToken');
        setToken(null);
    };

    const value = {
        isLoggedIn,
        token,
        login,
        logout,
        isLoading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
