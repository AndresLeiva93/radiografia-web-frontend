import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const AuthScreen = () => {
    // Estado para alternar entre Login (true) y Registro (false)
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
        setIsLoginView(!isLoginView);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            // ----------------------------------------------------
            // Lógica de REGISTRO (Simulada)
            // ----------------------------------------------------
            if (!isLoginView) {
                if (password !== confirmPassword) {
                    throw new Error("Las contraseñas no coinciden.");
                }
                if (password.length < 6) {
                    throw new Error("La contraseña debe tener al menos 6 caracteres.");
                }
                
                // Simular llamada a API /register
                await new Promise(resolve => setTimeout(resolve, 1500)); 
                
                if (email && password) {
                    // Si el registro 'falla' por algún motivo simulado
                    if (email.includes('error')) {
                         throw new Error("El usuario ya está registrado.");
                    }

                    // Registro 'exitoso'
                    setSuccessMessage("¡Registro exitoso! Por favor, inicia sesión.");
                    setIsLoginView(true); // Cambiar a vista de Login automáticamente
                } else {
                    throw new Error("Faltan campos obligatorios.");
                }
            } 
            // ----------------------------------------------------
            // Lógica de LOGIN (Simulada)
            // ----------------------------------------------------
            else {
                // Simular llamada a API /login
                await new Promise(resolve => setTimeout(resolve, 1500)); 

                if (email && password) {
                    // Simulamos que cualquier valor inicia sesión
                    const simulatedToken = 'fake-jwt-token-for-user-' + email.substring(0, 3); 
                    login(simulatedToken); // Almacena el token y logea
                } else {
                    throw new Error("Por favor, ingresa tu email y contraseña.");
                }
            }
        } catch (err) {
            setError(err.message || `Error al intentar ${isLoginView ? 'iniciar sesión' : 'registrarte'}.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-3xl p-4"> 
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-2xl">
                <p className="text-center text-gray-500 mb-8">{isLoginView ? "Acceso de Usuarios Autorizados" : "Registro de Nuevo Usuario"}</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="usuario@dominio.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    
                    {/* Campo de confirmación solo para Registro */}
                    {!isLoginView && (
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

                {/* Botón para alternar vistas */}
                <div className="mt-6 text-center">
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
