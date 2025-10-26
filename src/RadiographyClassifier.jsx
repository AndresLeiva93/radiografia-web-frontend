import React, { useState, useCallback, useMemo } from 'react';
// 🚨 Importamos el hook de autenticación real de AuthContext.jsx
import { useAuth } from './AuthContext.jsx'; 

// --- CLASIFICADOR DE RADIOGRAFÍA (CONSTANTES) ---
const RENDER_API_URL = "https://radiografia-ia-api.onrender.com/predict"; 

const STEPS = {
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  RESULT: 'result'
};

// Rutas de imágenes de ejemplo (Usamos placeholders)
const EXAMPLE_IMAGES = {
  'Normal': 'https://placehold.co/100x100/A0FFA0/000000?text=Normal',
  'AOE': 'https://placehold.co/100x100/FFA07A/000000?text=AOE',
  'AOM': 'https://placehold.co/100x100/FF6347/000000?text=AOM',
};


// ----------------------------------------------------
// COMPONENTE DE AUTENTICACIÓN (AuthForm)
// ----------------------------------------------------
const AuthForm = () => { 
    // Usamos el hook de autenticación para obtener la función `login`
    const { login } = useAuth();

    const [isLoginView, setIsLoginView] = useState(true); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
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
            // Lógica de REGISTRO (Simulada)
            if (!isLoginView) {
                if (password !== confirmPassword) {
                    throw new Error("Las contraseñas no coinciden.");
                }
                if (password.length < 6) {
                    throw new Error("La contraseña debe tener al menos 6 caracteres.");
                }
                
                await new Promise(resolve => setTimeout(resolve, 1500)); 
                
                if (email && password) {
                    // Simulación de error si el email contiene 'error'
                    if (email.includes('error')) {
                        throw new Error("El usuario ya está registrado.");
                    }
                    setSuccessMessage("¡Registro exitoso! Por favor, inicia sesión.");
                    setIsLoginView(true); // Cambiar a vista de Login automáticamente
                } else {
                    throw new Error("Faltan campos obligatorios.");
                }
            } 
            // Lógica de LOGIN (Simulada)
            else {
                await new Promise(resolve => setTimeout(resolve, 1500)); 
                
                // 🚨 CREDENCIALES SIMULADAS
                if (email === 'admin@test.com' && password === '123456') {
                    const simulatedToken = 'fake-jwt-token-for-user-admin'; 
                    login(simulatedToken); // Llama a la función `login` del AuthContext
                } else {
                    throw new Error("Credenciales incorrectas. Usa: admin@test.com / 123456");
                }
            }
        } catch (err) {
            setError(err.message || `Error al intentar ${isLoginView ? 'iniciar sesión' : 'registrarte'}.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-inter">
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-2xl">
                <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">
                    👂 Oido IA Match
                </h2>
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
                            placeholder="admin@test.com"
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
                            placeholder="123456"
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


// ----------------------------------------------------
// COMPONENTE PRINCIPAL (App)
// ----------------------------------------------------
const App = () => {
    // 1. ESTADO DE AUTENTICACIÓN REAL
    const { isLoggedIn, token, logout } = useAuth();
    
    // 2. ESTADO Y LÓGICA DEL CLASIFICADOR
    const [step, setStep] = useState(STEPS.UPLOAD);
    const [file, setFile] = useState(null); 
    const [previewUrl, setPreviewUrl] = useState(null); 
    const [classificationResult, setClassificationResult] = useState(null); 
    const [error, setError] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false); 

    const resultData = useMemo(() => ({
        'Normal': {
            title: "Diagnóstico: Oído Medio Sano (Normal)",
            description: "La estructura analizada por el modelo de IA no presenta las anomalías características de la otitis. Esto indica una baja probabilidad de patología en la región analizada.",
            color: "green",
        },
        'AOE': {
            title: "Diagnóstico: Otitis Externa Aguda (AOE)",
            description: "El modelo de IA detectó patrones que sugieren Otitis Externa Aguda (AOE). Se necesita confirmación médica para el diagnóstico definitivo y el tratamiento.",
            color: "orange",
        },
        'AOM': {
            title: "Diagnóstico: Otitis Media Aguda (AOM)",
            description: "El modelo de IA detectó opacidades y/o irregularidades, altamente indicativo de Otitis Media Aguda (AOM). Se recomienda la revisión y confirmación por un especialista médico.",
            color: "red",
        }
    }), []);

    // Función de RESET (limpia el estado del clasificador)
    const handleReset = useCallback(() => {
        setStep(STEPS.UPLOAD);
        setFile(null);
        setClassificationResult(null);
        setError(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    }, [previewUrl]);

    // Función de LOGOUT (Establece el token a null y resetea la app)
    const handleLogout = useCallback(() => {
        logout(); // Llama a la función del AuthContext
        handleReset(); // Resetea el estado de la aplicación
    }, [logout, handleReset]);
    
    const processFile = (selectedFile) => {
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setError(null);
        } else {
            setError("Tipo de archivo no válido. Por favor, sube una imagen (JPG/PNG).");
            setFile(null);
            setPreviewUrl(null);
        }
    };

    const handleFileChange = (e) => {
        processFile(e.target.files[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length) {
          processFile(files[0]);
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    const handleDragLeave = () => {
        setIsDragOver(false);
    };


    const classifyImage = useCallback(async () => {
        if (!file) {
          setError("Por favor, sube una imagen primero.");
          return;
        }

        setStep(STEPS.PROCESSING);
        setError(null);

        const formData = new FormData();
        formData.append('image', file, file.name); 

        try {
            const MAX_RETRIES = 3;
            let lastError = null;
            let response = null;

            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                try {
                    response = await fetch(RENDER_API_URL, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}` 
                        },
                        body: formData,
                    });

                    if (response.ok) {
                        break; 
                    } else if (response.status === 401) {
                        throw new Error("Sesión expirada o no autorizada (Código 401).");
                    } else if (attempt === MAX_RETRIES - 1) {
                        throw new Error(`Fallo en la conexión después de ${MAX_RETRIES} intentos. Estado: ${response.status}`);
                    }
                } catch (err) {
                    lastError = err;
                    if (err.message.includes("401")) throw err; 
                    console.warn(`Intento ${attempt + 1} fallido. Reintentando en ${Math.pow(2, attempt)}s...`);
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
            
            if (!response || !response.ok) {
                throw new Error(lastError ? lastError.message : "Error de red desconocido.");
            }
            
            const result = await response.json();
            const classification = result?.prediccion; 

            if (!classification || !resultData[classification]) {
                throw new Error(`Respuesta de API inválida. Clasificación no reconocida: ${classification}`);
            }
            
            setClassificationResult(classification);
            setStep(STEPS.RESULT);

        } catch (err) {
            console.error("Error en la clasificación:", err);
            
            let displayError = `Error: ${err.message}.`;

            if (err.message.includes("401")) {
                 displayError = "⚠️ Tu sesión ha expirado o no estás autorizado. Por favor, reinicia la sesión.";
                 handleLogout(); // Forzar logout si el token falla
            } else if (err.message.includes("Error HTTP: 404")) {
                 displayError = "⚠️ Error HTTP 404: La URL de la API es incorrecta. Confirma la ruta del servidor de Render.";
            } else if (err.message.includes("Fallo en la conexión") || err.message.includes("failed to fetch")) {
                displayError = "⚠️ Falló la conexión. El servidor de IA podría estar inactivo o inaccesible.";
            }

            setError(displayError);
            setStep(STEPS.UPLOAD); 
            setClassificationResult(null);
        }
    }, [file, resultData, token, handleLogout]); 

    
    // ----------------------------------------------------
    // RENDERIZADO CONDICIONAL Y UI
    // ----------------------------------------------------
    
    // MOSTRAR LOGIN/REGISTRO SI NO ESTÁ CONECTADO
    if (!isLoggedIn) {
        // En lugar de devolver AuthForm simple, devolvemos el componente con la lógica de login
        return <AuthForm />;
    }
    
    // --- Lógica de Renderización (Clasificador) ---

    const renderUploadStep = () => (
        <div className="flex flex-col items-center p-6 space-y-4">
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition-colors duration-200 
            ${isDragOver ? 'border-indigo-600 bg-indigo-100' : 'border-indigo-400 bg-indigo-50'}
            `}
          >
            {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Radiografía Previa" 
              className="h-full w-auto max-h-44 object-contain rounded-lg shadow-lg"
            />
            ) : (
            <label htmlFor="file-upload" className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-semibold transition duration-150 ease-in-out text-center px-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className='text-sm sm:text-base'>Haz clic para seleccionar o arrastra una imagen aquí (JPG/PNG)</span>
              <input id="file-upload" type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleFileChange} />
            </label>
            )}
          </div>
    
          {error && (
            <p className="text-sm font-medium text-red-600 bg-red-100 p-3 rounded-xl w-full text-center border border-red-300 shadow-sm">
            {error}
            </p>
          )}
    
          {file && (
            <button
              onClick={classifyImage}
              className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-[1.02] disabled:opacity-50"
            >
            🚀 Paso 2: Clasificar Radiografía
            </button>
          )}

          {/* Bloque de imágenes de ejemplo */}
          {!file && (
              <div className="text-sm text-gray-500 w-full pt-2">
                <h3 className="font-semibold text-gray-700 mb-2">Imágenes de Ejemplo:</h3>
                <div className="flex justify-between space-x-2">
                    {Object.keys(EXAMPLE_IMAGES).map(key => (
                        <button 
                            key={key} 
                            onClick={() => {
                                const mockFile = new File([], `${key}.png`, { type: 'image/png' });
                                processFile(mockFile);
                                setPreviewUrl(EXAMPLE_IMAGES[key]); 
                            }}
                            className="flex flex-col items-center p-2 border border-gray-300 rounded-lg hover:bg-gray-200 transition duration-150 w-1/3 text-xs"
                        >
                            <img 
                                src={EXAMPLE_IMAGES[key]} 
                                alt={key} 
                                className="w-10 h-10 object-contain rounded-md mb-1"
                            />
                            <span className="font-medium text-gray-700">{key}</span>
                        </button>
                    ))}
                </div>
              </div>
          )}
        </div>
      );
    
    const renderProcessingStep = () => (
        <div className="flex flex-col items-center justify-center p-8 space-y-6">
          <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.93 8.93 0 0115 19H5M20 9V4M4 12a8 8 0 018-8v0a8 8 0 018 8v0a8 8 0 01-8 8v0a8 8 0 01-8-8z" />
          </svg>
          <h2 className="text-xl font-bold text-indigo-800">Analizando con Inteligencia Artificial...</h2>
          <p className="text-gray-600">Esto puede tomar unos segundos.</p>
        </div>
    );

    const renderResultStep = () => {
        if (!classificationResult) return renderUploadStep();

        const data = resultData[classificationResult];
        const classificationText = classificationResult.toUpperCase();
        const isHealthy = classificationResult === 'Normal';
        
        // Configuración de colores dinámica
        const statusColor = data.color === "green" ? "bg-green-500" : data.color === "red" ? "bg-red-500" : "bg-orange-500";
        const statusRing = data.color === "green" ? "ring-green-300" : data.color === "red" ? "ring-red-300" : "ring-orange-300";
        const detailColor = data.color === "green" ? "text-green-800 bg-green-50 border-green-200" : data.color === "red" ? "text-red-800 bg-red-50 border-red-200" : "text-orange-800 bg-orange-50 border-orange-200";

        return (
            <div className="p-6 space-y-8">
                <div className="text-center">
                    <h2 className="text-2xl font-extrabold text-gray-900">
                        <span className={`${data.color === "green" ? 'text-green-600' : data.color === "red" ? 'text-red-600' : 'text-orange-600'}`}>{isHealthy ? "Diagnóstico Confirmado" : "Resultado Inmediato"}</span>
                    </h2>
                    
                    <div className={`mt-4 inline-block px-6 py-2 text-xl font-black text-white rounded-full shadow-xl ${statusColor} ring-4 ${statusRing}`}>
                        {classificationText}
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mt-2">{data.title}</h3>
                </div>

                <div className={`p-4 rounded-xl border-l-4 border-r-4 ${detailColor} shadow-md`}>
                    <p className="text-sm">{data.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col items-center space-y-3">
                        <h3 className="text-lg font-semibold text-indigo-700 border-b border-indigo-200 w-full text-center pb-1">Radiografía del Paciente:</h3>
                        <img
                        src={previewUrl}
                        alt="Radiografía Clasificada"
                        className="w-full max-w-xs h-auto object-contain rounded-xl shadow-2xl border-4 border-indigo-400"
                        />
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-indigo-700 border-b border-indigo-200 w-full text-center pb-1">Ejemplos de Clasificación:</h3>
                        
                        <div className="flex flex-col space-y-2"> 
                            {Object.keys(EXAMPLE_IMAGES).map((key) => (
                                <div key={key} className="flex flex-row items-center p-1 rounded-lg border border-gray-200 bg-white shadow-sm w-full">
                                    <img 
                                        src={EXAMPLE_IMAGES[key]} 
                                        alt={`Ejemplo de ${key}`} 
                                        className="w-1/3 max-w-[100px] h-auto object-cover rounded-md border-2 border-gray-100 mr-4"
                                    />
                                    <p className="mt-1 text-sm font-medium text-gray-700">{key}</p>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                <button
                    onClick={handleReset}
                    className="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.01]"
                >
                    Reiniciar Clasificación
                </button>
            </div>
        );
    };

    const renderCurrentStep = () => {
        switch (step) {
          case STEPS.PROCESSING:
            return renderProcessingStep();
          case STEPS.RESULT:
            return renderResultStep();
          case STEPS.UPLOAD:
          default:
            return renderUploadStep();
        }
    };

    const getStepIndicator = () => {
        let currentStep;
        switch (step) {
            case STEPS.UPLOAD: currentStep = 1; break;
            case STEPS.PROCESSING: currentStep = 2; break;
            case STEPS.RESULT: currentStep = 3; break;
            default: currentStep = 1;
        }
        return (
            <div className='text-xs font-semibold text-indigo-500 flex justify-center space-x-2 mb-4'>
                <span className={`px-2 py-1 rounded-full ${currentStep >= 1 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}>1. Subir Radiografía</span>
                <span className={`px-2 py-1 rounded-full ${currentStep >= 2 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}>2. Clasificar</span>
                <span className={`px-2 py-1 rounded-full ${currentStep >= 3 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}>3. Resultado IA</span>
            </div>
        );
    };


    return (
        <div className="min-h-screen bg-gray-100 font-inter">
            
            <nav className="bg-white shadow-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Título / Logo */}
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-extrabold text-gray-900">
                                👂 Oido IA Match
                            </h1>
                        </div>
                        {/* Botón de Logout que llama a la función corregida */}
                        <button
                            onClick={handleLogout}
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

export default App;
