// src/Login.jsx

import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const AuthScreen = () => {
    // Estado para alternar entre Login (true) y Registro (false)
// ... (Resto del estado y lógica sin cambios)
    const [isLoginView, setIsLoginView] = useState(true); 
    
    // Estados del formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Solo para Registro
    
    // Estados de la interfaz
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
    const { login } = useAuth();

    const handleToggleView = () => {
// ... (Resto de handleToggleView sin cambios)
        setIsLoginView(!isLoginView);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async (e) => {
// ... (Resto de handleSubmit sin cambios)
    };

    return (
        // 🚨 Eliminado 'min-h-screen justify-center' para que encaje mejor con el Navbar
        <div className="flex flex-col items-center w-full max-w-3xl p-4"> 
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-2xl">
                {/* 🚨 ELIMINADO: Título H2 y Párrafo, ahora están en el Navbar
                <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">
                    👂 Oido IA Match
                </h2>
                */}
                <p className="text-center text-gray-500 mb-8">{isLoginView ? "Acceso de Usuarios Autorizados" : "Registro de Nuevo Usuario"}</p>

                <form onSubmit={handleSubmit} className="space-y-6">
// ... (Resto del formulario y botones sin cambios)
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
// ... (Input de email)
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
// ... (Input de password)
                    </div>
                    
                    {/* 🚨 Campo de confirmación solo para Registro */}
                    {!isLoginView && (
// ... (Input de confirmación de contraseña)
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    )}

                    {error && (
                        <p className="text-sm font-medium text-red-600 bg-red-100 p-3 rounded-md text-center">
                            {error}
                        </p>
                    )}
                    
                    {successMessage && (
                        <p className="text-sm font-medium text-green-700 bg-green-100 p-3 rounded-md text-center">
                            {successMessage}
                        </p>
                    )}

                    <div>
                        <button
                            type="submit"
// ... (Botón de submit)
                            disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-200 
                                ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}
                            `}
                        >
                            {loading 
                                ? (isLoginView ? 'Iniciando Sesión...' : 'Registrando...') 
                                : (isLoginView ? 'Iniciar Sesión' : 'Registrarse Ahora')
                            }
                        </button>
                    </div>
                </form>

                {/* 🚨 Botón para alternar vistas */}
                <div className="mt-6 text-center">
// ... (Botón para alternar vistas)
                    <button
                        onClick={handleToggleView}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition duration-150"
                    >
                        {isLoginView 
                            ? '¿No tienes cuenta? Regístrate aquí' 
                            : '¿Ya tienes una cuenta? Inicia Sesión'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
