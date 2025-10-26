import React, { useState, useCallback, useMemo, createContext, useContext, useEffect } from 'react';
import { LogIn, LogOut, Upload, Loader, CheckCircle, X, Menu, Aperture } from 'lucide-react'; 

// ----------------------------------------------------
// 1. LÓGICA DE AUTENTICACIÓN Y CONTEXTO
// ----------------------------------------------------

// Contexto de Autenticación
const AuthContext = createContext();

// Hook para usar la autenticación
const useAuth = () => useContext(AuthContext);

// Proveedor de Autenticación (Simulación de sesión)
const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(null); 
    const [userName, setUserName] = useState('Médico de Prueba'); // Nombre de usuario de prueba

    useEffect(() => {
        const storedToken = 'fake-jwt-token-12345';
        if (storedToken) {
            setIsLoggedIn(true);
            setToken(storedToken);
        }
    }, []);

    const login = (password) => {
        if (password === "medico123") { // Contraseña de prueba
            const newToken = 'fake-jwt-token-' + Math.random().toString(36).substring(2, 15);
            setToken(newToken);
            setIsLoggedIn(true);
            setUserName('Dr(a). Usuario');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsLoggedIn(false);
        setToken(null);
        setUserName(null);
    };

    const value = { isLoggedIn, login, logout, token, userName };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Componente de Login (Integrado - Ahora como un card centrado)
const Login = () => {
    const { login } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        if (login(password)) {
            // Login exitoso
        } else {
            setError("Contraseña incorrecta. Contraseña de prueba: medico123");
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center border-t-4 border-indigo-600">
            <LogIn className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Requerido</h2>
            <p className="text-gray-500 mb-6">Introduce la contraseña para acceder a la herramienta IA.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    required
                />
                {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
                <button
                    type="submit"
                    className="w-full px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300"
                >
                    Iniciar Sesión
                </button>
            </form>
        </div>
    );
};


// ----------------------------------------------------
// 2. NAVBAR (Nuevo componente)
// ----------------------------------------------------
const Navbar = ({ isLoggedIn, logout, userName }) => {
    return (
        <header className="sticky top-0 z-10 bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                {/* Logo y Título */}
                <div className="flex items-center space-x-2">
                    <Aperture className="w-6 h-6 text-indigo-600" />
                    <h1 className="text-xl font-bold text-gray-900">Oido IA Match</h1>
                </div>

                {/* Autenticación y Botones */}
                {isLoggedIn ? (
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-600 hidden sm:inline">Hola, {userName}</span>
                        <button
                            onClick={logout}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg shadow-md hover:bg-red-600 transition duration-200"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Cerrar Sesión</span>
                        </button>
                    </div>
                ) : (
                    <div className="text-sm font-medium text-gray-500">
                        Inicia sesión para usar la herramienta.
                    </div>
                )}
            </div>
        </header>
    );
};


// ----------------------------------------------------
// 3. COMPONENTE DEL CLASIFICADOR (Lógica principal)
// ----------------------------------------------------
const RENDER_API_URL = "https://radiografia-ia-api.onrender.com/predict"; 

// Constantes de Estado
const STEPS = {
    UPLOAD: 'upload',
    PROCESSING: 'processing',
    RESULT: 'result'
};

// Rutas de imágenes de ejemplo
const EXAMPLE_IMAGES = {
    'Normal': '/images/Normal.jpg', 
    'AOE': '/images/AOE.jpg',
    'AOM': '/images/AOM.jpg',
};

// Componente que contiene toda la lógica y UI del clasificador
const ClassifierUI = () => {
    const { token, logout } = useAuth(); // Necesita token y logout

    // ESTADO Y LÓGICA DEL CLASIFICADOR
    const [step, setStep] = useState(STEPS.UPLOAD);
    const [file, setFile] = useState(null); 
    const [previewUrl, setPreviewUrl] = useState(null); 
    const [classificationResult, setClassificationResult] = useState(null); 
    const [error, setError] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false); 

    const resultData = useMemo(() => ({
        'Normal': {
            title: "Diagnóstico: Oído Medio Sano (Normal)",
            description: "La estructura analizada por el modelo de IA no presenta las anomalías características de la otitis. Los contornos óseos y las cavidades aéreas se observan dentro de los parámetros esperados. Esto indica una baja probabilidad de patología en la región analizada.",
            color: "green",
        },
        'AOE': {
            title: "Diagnóstico: Otitis Externa Aguda (AOE)",
            description: "El modelo de IA detectó patrones que sugieren Otitis Externa Aguda (AOE). Esto podría manifestarse como inflamación o afectación del tejido blando externo. Se necesita confirmación médica para el diagnóstico definitivo y el tratamiento.",
            color: "orange",
        },
        'AOM': {
            title: "Diagnóstico: Otitis Media Aguda (AOM)",
            description: "El modelo de IA detectó opacidades y/o irregularidades en la cavidad del oído medio, lo cual es altamente indicativo de Otitis Media Aguda (AOM). Se recomienda la revisión y confirmación por un especialista médico.",
            color: "red",
        }
    }), []);
    
    const processFile = (selectedFile) => {
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            if (previewUrl) URL.revokeObjectURL(previewUrl); 
            
            setFile(selectedFile);
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
            const response = await fetch(RENDER_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` 
                },
                body: formData,
            });

            if (response.status === 401) {
                throw new Error("Sesión expirada o no autorizada. Por favor, vuelve a iniciar sesión.");
            }
            if (!response.ok) {
                const statusText = response.statusText || 'Error Desconocido';
                throw new Error(`Error HTTP: ${response.status}. ${statusText}`);
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
            
            let displayError = `Error: ${err.message}. Verifica el formato de la API.`;

            if (err.message.includes("401")) {
                 displayError = "⚠️ Tu sesión ha expirado o no estás autorizado. Por favor, inicia sesión de nuevo.";
                 logout(); 
            } else if (err.message.includes("Error HTTP: 404")) {
                 displayError = "⚠️ Error HTTP 404: La URL de la API es incorrecta. Confirma que la ruta del servidor de Render es la correcta (debe ser /predict).";
            } else if (err.message.includes("Error HTTP: 50") || err.message.includes("failed to fetch")) {
                 displayError = "⚠️ Falló la conexión. La causa más probable es un error de red/servidor (Render). Inténtalo de nuevo en 30 segundos.";
            }

            setError(displayError);
            setStep(STEPS.UPLOAD); 
            setClassificationResult(null);
        }
    }, [file, resultData, token, logout]);

    const handleReset = () => {
        setStep(STEPS.UPLOAD);
        setFile(null);
        setClassificationResult(null);
        setError(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };
    
    // FUNCIONES DE RENDERIZADO
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
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <span className='text-sm sm:text-base'>Haz clic para seleccionar o arrastra una imagen aquí (JPG/PNG)</span>
                    <input id="file-upload" type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleFileChange} />
                </label>
                )}
            </div>

            {error && (
                <p className="text-sm font-medium text-red-700 bg-red-100 p-3 rounded-xl w-full text-center border border-red-300 shadow-sm">
                {error}
                </p>
            )}

            {file && (
                <button
                onClick={classifyImage}
                className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-[1.02] disabled:opacity-50"
                >
                🚀 Paso 2: Clasificar Imagen
                </button>
            )}
        </div>
    );
    
    const renderProcessingStep = () => (
        <div className="flex flex-col items-center justify-center p-8 space-y-6">
            <Loader className="animate-spin h-10 w-10 text-indigo-600" />
            <h2 className="text-xl font-bold text-indigo-800">Analizando con Inteligencia Artificial...</h2>
            <p className="text-gray-600">Esto puede tomar unos segundos.</p>
        </div>
    );

    const renderResultStep = () => {
        if (!classificationResult) return renderUploadStep();

        const data = resultData[classificationResult];
        const isHealthy = classificationResult === 'Normal';
        const classificationText = classificationResult.toUpperCase();
        
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
                    <p className="text-sm font-medium">{data.description}</p>
                    <p className="mt-2 text-xs font-semibold text-gray-600">
                        {isHealthy ? "" : "⚠️ ESTA HERRAMIENTA ES SÓLO DE APOYO. SE REQUIERE CONFIRMACIÓN MÉDICA."}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col items-center space-y-3">
                        <h3 className="text-lg font-semibold text-indigo-700 border-b border-indigo-200 w-full text-center pb-1">Imagen Clasificada:</h3>
                        <img
                        src={previewUrl}
                        alt="Imagen Clasificada"
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
                                        className="w-1/4 max-w-[100px] h-auto object-cover rounded-md border-2 border-gray-100 mr-4"
                                    />
                                    <p className="text-base font-bold text-gray-800">{key}</p>
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
                <span className={`px-2 py-1 rounded-full ${currentStep >= 1 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}>1. Subir Imagen</span>
                <span className={`px-2 py-1 rounded-full ${currentStep >= 2 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}>2. Clasificar</span>
                <span className={`px-2 py-1 rounded-full ${currentStep >= 3 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}>3. Resultado IA</span>
            </div>
        );
    };


    return (
        <>
            <p className="text-center text-gray-600 mb-8 text-lg hidden sm:block">Herramienta de apoyo al diagnóstico rápido para la detección de otitis.</p>
            {getStepIndicator()}
            <div className="bg-white rounded-2xl shadow-2xl transition-all duration-500 ease-in-out">
                {renderCurrentStep()}
            </div>
        </>
    );
};


// ----------------------------------------------------
// 4. ESTRUCTURA PRINCIPAL DE LA PÁGINA
// ----------------------------------------------------
const MainApplication = () => {
    const { isLoggedIn, logout, userName } = useAuth();
    
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-inter">
            {/* Navbar - Siempre visible */}
            <Navbar isLoggedIn={isLoggedIn} logout={logout} userName={userName} />

            {/* Contenido principal condicional */}
            <main className="flex-grow flex flex-col items-center p-4">
                <div className="w-full max-w-3xl flex-grow flex flex-col items-center pt-8">
                    {isLoggedIn ? (
                        <ClassifierUI />
                    ) : (
                        // Centrar el Login en la pantalla
                        <div className="flex-grow flex items-center justify-center w-full">
                            <Login />
                        </div>
                    )}
                </div>
            </main>
            
            <footer className="py-4 text-sm text-gray-500 text-center border-t border-gray-200">
                Desarrollado con React y Tailwind CSS para apoyo diagnóstico.
            </footer>
        </div>
    );
}


// ----------------------------------------------------
// 5. COMPONENTE RAÍZ
// ----------------------------------------------------
const App = () => (
    <AuthProvider>
        <MainApplication />
    </AuthProvider>
);

export default App;
