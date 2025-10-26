import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // 🚨 SIMULACIÓN DE LLAMADA A LA API DE LOGIN 🚨
        // **********************************************
        // En un proyecto real, aquí harías un fetch a tu API de Render /login
        // con el email y password, y recibirías un JWT real.
        // Por ahora, simulamos una respuesta con un token falso.
        
        try {
            // Simular tiempo de carga de la API
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            // Simular verificación: Cualquier valor en ambos campos funciona
            if (email && password) {
                // Generamos un token simulado para la sesión
                const simulatedToken = 'fake-jwt-token-for-user-' + email.substring(0, 3); 
                
                login(simulatedToken); // Almacena el token y logea
            } else {
                throw new Error("Por favor, ingresa tu email y contraseña.");
            }
        } catch (err) {
            setError(err.message || 'Error al intentar iniciar sesión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-2xl">
                <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">
                    👂 Oido IA Match
                </h2>
                <p className="text-center text-gray-500 mb-8">Acceso de Usuarios Autorizados</p>

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

                    {error && (
                        <p className="text-sm font-medium text-red-600 bg-red-100 p-3 rounded-md text-center">
                            {error}
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
                            {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
