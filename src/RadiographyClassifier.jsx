import React, { useState, useCallback, useMemo, createContext, useContext, useEffect } from 'react';

// ==========================================================
// 1. LÓGICA DE AUTENTICACIÓN (AuthContext.jsx consolidado)
// ==========================================================

// Usamos Firestore para el almacenamiento persistente de sesión en lugar de localStorage
// Esto simula que el usuario está "loggeado" si el token global existe
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Creamos un token simple basado en el token inicial si existe
const defaultToken = initialAuthToken ? `mock_auth_token_${initialAuthToken.substring(0, 10)}` : null;

const AuthContext = createContext();

const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
    // Inicializar el token con el token global (simulación de sesión persistente en Canvas)
    const [token, setToken] = useState(defaultToken);

    // En un entorno real, aquí se usaría Firebase Authentication para iniciar sesión
    // y obtener el token real. Para este ejemplo, simulamos el proceso.

    // 2. Comprobar si está logeado (existe un token)
    const isLoggedIn = !!token; 

    // Función para Iniciar Sesión (simulada)
    // En un entorno real, esta función haría una llamada a la API de login.
    const login = (simulatedToken) => {
        setToken(simulatedToken);
        // Nota: En un entorno de React real, usarías localStorage o un sistema de estado más robusto.
    };

    // FUNCIÓN CORREGIDA: Simplemente limpia el token
    const logout = () => {
        setToken(null);
    };

    const value = {
        isLoggedIn,
        token,
        login,
        logout
    };

    // Nota: El Proveedor debe envolver la lógica del App
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


// ==========================================================
// 2. COMPONENTE DE AUTENTICACIÓN (Login.jsx consolidado)
// ==========================================================
const AuthForm = ({ login }) => { 
    // Estado para alternar entre Login (true) y Registro (false)
    const [isLoginView, setIsLoginView] = useState(true); 
    
    // Estados del formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // --- SIMULACIÓN DE LOGIN/REGISTRO ---
        // Generamos un token simulado para la sesión
        const simulatedToken = `user_session_${Date.now()}`;
        
        // Llamamos a la función login del contexto para establecer la sesión
        login(simulatedToken); 
        
        // Limpiamos los campos (Opcional)
        setEmail('');
        setPassword('');
    };

    const toggleView = () => {
        setIsLoginView(!isLoginView);
    };

    const title = isLoginView ? 'Iniciar Sesión' : 'Registrarse';
    const buttonText = isLoginView ? 'Entrar' : 'Crear Cuenta';
    const toggleText = isLoginView ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión';

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-8 transition-all duration-300">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-extrabold text-indigo-700">👂 Oido IA Match</h1>
                    <h2 className="text-xl mt-2 text-gray-700">{title}</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="Correo Electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        />
                    </div>
                    <div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        />
                    </div>
                    
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
                        >
                            {buttonText}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        onClick={toggleView}
                        type="button"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition duration-150"
                    >
                        {toggleText}
                    </button>
                </div>
            </div>
        </div>
    );
};


// ==========================================================
// 3. CLASIFICADOR (RadiographyClassifier.jsx consolidado)
// ==========================================================

const RENDER_API_URL = "https://radiografia-ia-api.onrender.com/predict"; 

// Constantes de Estado
const STEPS = {
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  RESULT: 'result'
};

// Rutas de imágenes de ejemplo (Usamos placeholders ya que los archivos locales no funcionan)
const EXAMPLE_IMAGES = {
  'Normal': 'https://placehold.co/100x100/A0FFA0/000000?text=Normal',
  'AOE': 'https://placehold.co/100x100/FFA07A/000000?text=AOE',
  'AOM': 'https://placehold.co/100x100/FF6347/000000?text=AOM',
};

// Componente principal de la aplicación
const RadiographyClassifier = () => {
    // 🚨 USO DEL HOOK CORREGIDO: Obtenemos logout y token del contexto
    const { logout, token } = useAuth();
    
    // Estados de la aplicación
    const [currentStep, setCurrentStep] = useState(STEPS.UPLOAD);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [apiResponse, setApiResponse] = useState(null);
    const [error, setError] = useState(null);

    // Manejar la carga de archivos
    const handleFileChange = useCallback((event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setError(null);
        } else {
            setFile(null);
            setPreviewUrl('');
            setError("Por favor, sube un archivo de imagen válido (JPEG, PNG).");
        }
    }, []);

    // Enviar a la API
    const handleUpload = useCallback(async () => {
        if (!file) {
            setError("Debes seleccionar una imagen para clasificar.");
            return;
        }

        setCurrentStep(STEPS.PROCESSING);
        setError(null);
        setApiResponse(null);

        const formData = new FormData();
        formData.append('image', file);

        try {
            // Nota: El header de Authorization con el token simulado
            const response = await fetch(RENDER_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                // Manejo de errores basado en el estado HTTP
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error de servidor: ${response.status}`);
            }

            const data = await response.json();
            setApiResponse(data);
            setCurrentStep(STEPS.RESULT);

        } catch (err) {
            console.error("Error al clasificar la imagen:", err);
            setError(`Fallo en la comunicación con la IA. Mensaje: ${err.message || 'Error desconocido'}`);
            setCurrentStep(STEPS.UPLOAD); 
        }

    }, [file, token]);
    
    // Reiniciar proceso
    const handleReset = useCallback(() => {
        setFile(null);
        setPreviewUrl('');
        setApiResponse(null);
        setError(null);
        setCurrentStep(STEPS.UPLOAD);
    }, []);

    // Renderizado del Indicador de Paso
    const getStepIndicator = useMemo(() => () => {
        const steps = [
            { key: STEPS.UPLOAD, label: '1. Cargar Imagen' },
            { key: STEPS.PROCESSING, label: '2. Procesando IA' },
            { key: STEPS.RESULT, label: '3. Resultado' },
        ];

        return (
            <div className="flex justify-between items-center w-full max-w-sm mb-8">
                {steps.map((step, index) => (
                    <React.Fragment key={step.key}>
                        <div 
                            className={`flex flex-col items-center transition-opacity duration-300 ${step.key === currentStep ? 'opacity-100' : 'opacity-50'}`}
                        >
                            <div 
                                className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white transition-all duration-300 ${
                                    index <= steps.findIndex(s => s.key === currentStep) 
                                        ? 'bg-indigo-600 shadow-md' 
                                        : 'bg-gray-300'
                                }`}
                            >
                                {index + 1}
                            </div>
                            <span className="text-xs mt-1 text-center text-gray-700">{step.label}</span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                                index < steps.findIndex(s => s.key === currentStep) 
                                    ? 'bg-indigo-400' 
                                    : 'bg-gray-300'
                            }`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    }, [currentStep]);

    // Componente de Carga de Archivo (Paso 1)
    const renderUploadStep = () => (
        <div className="p-8 space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 text-center">Clasificador de Otitis</h3>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            
            <div className="border-4 border-dashed border-gray-300 p-8 rounded-xl flex flex-col items-center justify-center transition duration-300 hover:border-indigo-400 cursor-pointer">
                <input 
                    type="file" 
                    id="image-upload" 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />
                <label htmlFor="image-upload" className="flex flex-col items-center cursor-pointer">
                    <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    <p className="mt-2 text-lg font-medium text-gray-600">
                        Arrastra o haz click para subir una imagen de oído
                    </p>
                    <p className="text-sm text-gray-400">(JPEG, PNG)</p>
                </label>
            </div>

            {previewUrl && (
                <div className="flex flex-col items-center space-y-4">
                    <h4 className="text-md font-medium text-gray-700">Imagen Seleccionada:</h4>
                    <img src={previewUrl} alt="Previsualización" className="max-w-xs max-h-40 rounded-lg shadow-lg border border-gray-200" />
                    <button
                        onClick={handleUpload}
                        className="flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-xl text-base font-semibold text-white bg-green-500 hover:bg-green-600 transition duration-200 w-full md:w-auto"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Clasificar con IA
                    </button>
                </div>
            )}
        </div>
    );

    // Componente de Procesamiento (Paso 2)
    const renderProcessingStep = () => (
        <div className="p-12 flex flex-col items-center justify-center">
            <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg font-medium text-gray-700">Analizando la imagen, por favor espera...</p>
            <p className="text-sm text-gray-500 mt-1">Esto puede tardar unos segundos.</p>
        </div>
    );

    // Componente de Resultado (Paso 3)
    const renderResultStep = () => {
        if (!apiResponse) return null;

        const sortedResults = Object.entries(apiResponse.predictions)
            .sort(([, probA], [, probB]) => probB - probA);

        const bestResult = sortedResults[0];

        return (
            <div className="p-8 space-y-8">
                <h3 className="text-2xl font-bold text-center text-green-600">¡Clasificación Completa!</h3>
                
                <div className="flex flex-col md:flex-row md:space-x-8 items-start">
                    {/* Imagen de Previsualización */}
                    <div className="w-full md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Imagen Analizada:</h4>
                        <img src={previewUrl} alt="Previsualización" className="max-w-full h-auto rounded-lg shadow-xl border-4 border-gray-100" />
                    </div>

                    {/* Resultados de la IA */}
                    <div className="w-full md:w-2/3">
                        <h4 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Probabilidades de Diagnóstico:</h4>
                        
                        {/* Resultado Principal */}
                        <div className={`p-4 rounded-xl shadow-lg mb-4 ${bestResult[0] === 'Normal' ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} border-l-4`}>
                            <h5 className="text-xl font-extrabold text-gray-900 flex items-center">
                                <span className="mr-3 text-2xl">{bestResult[0] === 'Normal' ? '✅' : '⚠️'}</span>
                                Clasificación más probable: {bestResult[0]}
                            </h5>
                            <p className="text-4xl font-bold mt-2">
                                {(bestResult[1] * 100).toFixed(2)}%
                            </p>
                        </div>
                        
                        {/* Otras Probabilidades */}
                        <div className="space-y-3">
                            {sortedResults.map(([label, probability]) => (
                                <div key={label} className="flex items-center">
                                    <span className="w-16 font-medium text-gray-700">{label}:</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                                        <div 
                                            className={`h-3 rounded-full transition-all duration-500 ${label === bestResult[0] ? 'bg-indigo-500' : 'bg-gray-400'}`} 
                                            style={{ width: `${(probability * 100).toFixed(2)}%` }}
                                        ></div>
                                    </div>
                                    <span className="ml-3 text-sm font-semibold text-gray-800 w-12 text-right">
                                        {(probability * 100).toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Botón de reinicio */}
                <div className="flex justify-center pt-4 border-t mt-6">
                    <button
                        onClick={handleReset}
                        className="flex items-center px-6 py-3 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition duration-200"
                    >
                        Nueva Clasificación
                    </button>
                </div>
            </div>
        );
    };

    // Renderiza el paso actual
    const renderCurrentStep = () => {
        switch (currentStep) {
            case STEPS.UPLOAD:
                return renderUploadStep();
            case STEPS.PROCESSING:
                return renderProcessingStep();
            case STEPS.RESULT:
                return renderResultStep();
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex flex-col items-center">
            
            <nav className="w-full bg-white shadow-lg sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Título / Logo */}
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-extrabold text-gray-900">
                                👂 Oido IA Match
                            </h1>
                        </div>
                        {/* Botón de Logout que llama a la función corregida */}
                        <button
                            onClick={logout} // <--- ESTO AHORA FUNCIONA
                            className="text-sm px-4 py-2 bg-red-500 text-white font-medium rounded-lg shadow-md hover:bg-red-600 transition duration-200"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </nav>
            
            <main className="w-full max-w-3xl mx-auto p-4 flex flex-col items-center">
                
                <p className="text-center text-gray-600 mb-8 mt-4">Herramienta de apoyo al diagnóstico rápido para la detección de otitis (media y externa).</p>

                {getStepIndicator()}

                <div className="bg-white rounded-2xl shadow-2xl transition-all duration-500 ease-in-out w-full">
                    {renderCurrentStep()}
                </div>
            </main>
            
            <footer className="mt-8 text-sm text-gray-500 text-center w-full pb-4">
                Desarrollado con React y Tailwind CSS
            </footer>
        </div>
    );
};


// ==========================================================
// 4. COMPONENTE PRINCIPAL (Reemplaza index.jsx)
// ==========================================================
// El componente principal que se exporta y usa el proveedor de autenticación.
const App = () => {
    // Aquí el Provider puede usar el estado del token
    const { isLoggedIn, login } = useAuth();
    
    if (!isLoggedIn) {
        // CORRECCIÓN: Si no está logeado, mostramos el formulario de autenticación
        return <AuthForm login={login} />;
    }

    // Si está logeado, mostramos la aplicación principal (Clasificador)
    return <RadiographyClassifier />;
};


// Exportamos App envuelto en AuthProvider para que RadiographyClassifier y AuthForm
// puedan usar el contexto de autenticación.
const RootApp = () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);

export default RootApp;
