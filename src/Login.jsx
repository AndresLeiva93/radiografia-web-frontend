import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Lista de usuarios autorizados (simulada para el MVP)
const AUTHORIZED_USERS = [
    { email: 'demo@demo.cl', password: 'demo123' },
    { email: 'tnascimento@miuandes.cl', password: 'tnascimento123' },
    { email: 'tom.opazo@profesor.duoc.cl', password: 'tom.opazo123' },
    { email: 'fel.navarroc@duocuc.cl', password: 'fel.navarroc123' },
    { email: 'j.dillarza@profesor.duoc.cl', password: 'j.dillarza123' },
    { email: 'sacastillo2@miuandes.cl', password: 'sacastillo2123' },
    { email: 'mcpinilla@miuandes.cl', password: 'mcpinilla123' },
    { email: 'nlvergara@miuandes.cl', password: 'nlvergara123' },
    { email: 'vcardona@miuandes.cl', password: 'vcardona123' },
    { email: 'pmgarcia@miuandes.cl', password: 'pmgarcia123' },
    { email: 'mconstanzabeltranm@gmail.com', password: 'mconstanzabeltranm123' }
];

const AuthScreen = () => {
    // Estado para alternar entre Login (true) y Registro (false)
    const [isLoginView, setIsLoginView] = useState(true);

    // Estados del formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Estados de la interfaz
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const { login } = useAuth();

    // Lee parámetros del QR en la URL (?email=...&pass=...) al cargar la vista
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const qrEmail = params.get('email');
        const qrPassword = params.get('pass');

        if (qrEmail || qrPassword) {
            setIsLoginView(true);
            if (qrEmail) setEmail(qrEmail);
            if (qrPassword) setPassword(qrPassword);

            // Limpia los query params de la barra de direcciones tras leerlos
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

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

                await new Promise(resolve => setTimeout(resolve, 1500));

                if (email && password) {
                    if (AUTHORIZED_USERS.some(u => u.email === email)) {
                        throw new Error("El usuario ya está registrado.");
                    }

                    setSuccessMessage("¡Registro exitoso! Por favor, inicia sesión. NOTA: Este email solo es válido si está en la lista de usuarios autorizados.");
                    setIsLoginView(true);
                } else {
                    throw new Error("Faltan campos obligatorios.");
                }
            }
            // ----------------------------------------------------
            // Lógica de LOGIN (Simulada y VALIDADA)
            // ----------------------------------------------------
            else {
                if (!email || !password) {
                    throw new Error("Por favor, ingresa tu email y contraseña.");
                }

                const user = AUTHORIZED_USERS.find(
                    u => u.email === email.trim() && u.password === password
                );

                if (!user) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    throw new Error("Credenciales inválidas. Email o contraseña incorrectos.");
                }

                await new Promise(resolve => setTimeout(resolve, 1500));

                const simulatedToken = 'fake-jwt-token-for-user-' + user.email.substring(0, user.email.indexOf('@'));
                login(simulatedToken);
            }
        } catch (err) {
            setError(err.message || `Error al intentar ${isLoginView ? 'iniciar sesión' : 'registrarte'}.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full p-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-2xl">
                <h1 className="text-2xl font-bold text-center text-indigo-700 mb-2">Acceso Autorizado</h1>
                <p className="text-center text-gray-500 mb-8">
                    {isLoginView ? "Ingresa tus credenciales autorizadas" : "Registro (Solo con fines de prueba)"}
                </p>

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
                                ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                        >
                            {loading ? 'Procesando...' : (isLoginView ? 'Iniciar Sesión' : 'Registrarse')}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={handleToggleView}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        {isLoginView ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
