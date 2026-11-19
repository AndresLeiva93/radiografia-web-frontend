import React, { useState, useCallback, useMemo, useEffect } from 'react'; 
import { useAuth } from './AuthContext'; 
import Login from './Login'; 

// URL de la API
const RENDER_API_URL = "https://oido-classification-images-api-clone.onrender.com/predict";

// Constantes de Estado
const STEPS = {
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  RESULT: 'result'
};

// ----------------------------------------------------
// ✅ COMPONENTE: Barra de Navegación
// ----------------------------------------------------
const NavbarContent = ({ logout, isLoggedIn }) => (
    <nav className="flex items-center justify-between w-full mb-8 px-6 py-4 bg-white shadow-lg">
        <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-gray-900">
                👂 Otoscop-IA
            </h1>
            <p className="text-xs text-gray-500">
                Versión preliminar - uso clínico responsable por profesionales de la salud.
            </p>
        </div>
        
        {isLoggedIn && (
            <button
                onClick={logout}
                className="text-sm px-4 py-2 bg-red-500 text-white font-medium rounded-lg shadow-md hover:bg-red-600 transition duration-200"
            >
                Cerrar Sesión
            </button>
        )}
        {!isLoggedIn && (
            <span className="text-sm text-indigo-600 font-semibold">Acceso Requerido</span>
        )}
    </nav>
);


// Componente principal de la aplicación
const App = () => {
    // ----------------------------------------------------
    // 🚨 HOOKS EN LA PARTE SUPERIOR (Regla de Hooks)
    // ----------------------------------------------------
    const { isLoggedIn, logout, token, isLoading } = useAuth(); 

    // ESTADO PARA LA LECTURA DE ARCHIVOS .TXT
    const PLACEHOLDER_DESC = "Cargando descripción...";
    const [desc_Normal, setDesc_Normal] = useState(PLACEHOLDER_DESC);
    const [desc_AOE, setDesc_AOE] = useState(PLACEHOLDER_DESC);
    const [desc_AOM, setDesc_AOM] = useState(PLACEHOLDER_DESC);
    const [desc_NoNormal, setDesc_NoNormal] = useState(PLACEHOLDER_DESC);
    
    // Mapeo para facilitar el fetch de archivos .TXT
    const CLASSIFICATION_MAP = useMemo(() => ({
        'Normal': { setter: setDesc_Normal },
        'AOE': { setter: setDesc_AOE },
        'AOM': { setter: setDesc_AOM },
        'NoNormal': { setter: setDesc_NoNormal },
    }), []);
    
    // ESTADO DEL CLASIFICADOR
    const [step, setStep] = useState(STEPS.UPLOAD);
    const [file, setFile] = useState(null); 
    const [previewUrl, setPreviewUrl] = useState(null); 
    const [classificationResult, setClassificationResult] = useState(null); 
    const [error, setError] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false); 


    // 🚨 EFECTO PARA CARGAR LAS DESCRIPCIONES DE LOS ARCHIVOS .TXT
    useEffect(() => {
        const fetchDescriptions = async () => {
            const DEFAULT_NOT_FOUND_MESSAGE = "No se encuentra descripción. Verifica si los archivos .txt están en la carpeta 'public/descripcion/'.";

            for (const key in CLASSIFICATION_MAP) {
                const { setter } = CLASSIFICATION_MAP[key];
                
                try {
                    // ✅ CORRECCIÓN DE RUTA: Ahora busca en /descripcion/<nombre_archivo>.txt
                    const response = await fetch(`/descripcion/${key}.txt`); 
                    
                    if (response.ok) {
                        const text = await response.text();
                        setter(text.trim()); // Establece la descripción del archivo
                    } else {
                        setter(DEFAULT_NOT_FOUND_MESSAGE); 
                    }
                } catch (error) {
                    setter(DEFAULT_NOT_FOUND_MESSAGE);
                }
            }
        };

        fetchDescriptions();
    }, [CLASSIFICATION_MAP]); 


    // useMemo AHORA USA LAS DESCRIPCIONES DE LOS ESTADOS (desc_...)
    const resultData = useMemo(() => ({
        'Normal': {
            title: "Diagnóstico: Oído Medio Sano (Normal)",
            description: desc_Normal, // ✅ Usa el contenido cargado del archivo .txt
            color: "green",
        },
        'AOE': {
            title: "Diagnóstico: Otitis Externa Aguda (AOE)",
            description: desc_AOE, // ✅ Usa el contenido cargado del archivo .txt
            color: "orange",
        },
        'AOM': {
            title: "Diagnóstico: Otitis Media Aguda (AOM)",
            description: desc_AOM, // ✅ Usa el contenido cargado del archivo .txt
            color: "red",
        },
        'NoNormal': {
            title: "Diagnóstico: Otitis Media",
            description: desc_NoNormal, // ✅ Usa el contenido cargado del archivo .txt
            color: "red",
        }
    }), [desc_Normal, desc_AOE, desc_AOM, desc_NoNormal]);
    
    // LÓGICA DINÁMICA: Carga dinámica de imágenes de ejemplo desde /public/images/
    const dynamicExampleImages = useMemo(() => {
        // Asegúrate de que las imágenes de ejemplo siguen en /public/images/
        const modules = import.meta.glob('/public/images/*.jpg', { eager: true, as: 'url' });
        const images = {};

        for (const path in modules) {
            const fileNameWithExt = path.split('/').pop();
            const className = fileNameWithExt.split('.')[0].replace(/_/g, ' '); 
            images[className] = modules[path];
        }
        return images;
    }, []);
    
    const processFile = (selectedFile) => {
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setError(null);
        } else {
            setError("Tipo de archivo no válido. Por favor, sube una imagen (JPG/PNG).");
            setFile(null);
            setPreviewUrl(null);
        }
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
                //headers: {
                //    'Authorization': `Bearer ${token}` 
                //},
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
            } else if (err.message.includes("Error HTTP: 404")) {
                 displayError = "⚠️ Error HTTP 404: La URL de la API es incorrecta. Confirma que la ruta del servidor de Render es la correcta (debe ser /predict).";
            } else if (err.message.includes("Error HTTP: 50") || err.message.includes("failed to fetch")) {
                displayError = "⚠️ Falló la conexión. La causa más probable es un error de red/servidor. Inténtalo de nuevo en 30 segundos.";
            }

            setError(displayError);
            setStep(STEPS.UPLOAD); 
            setClassificationResult(null);
        }
    }, [file, resultData, token]);
    
    // --- LÓGICA AUXILIAR Y HANDLERS ---
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

    // ----------------------------------------------------
    // 🚨 VISTAS CONDICIONALES
    // ----------------------------------------------------
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center font-inter">
                <svg className="animate-spin h-8 w-8 text-indigo-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-lg font-medium text-gray-700">Cargando sesión y descripciones...</p>
            </div>
        );
    }
    
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center font-inter">
                <NavbarContent isLoggedIn={isLoggedIn} logout={logout} />
                <div className="flex flex-col items-center justify-center flex-grow w-full">
                    <Login />
                </div>
            </div>
        );
    }
    
    // --- FUNCIONES DE RENDERIZADO DE PASOS (SIN CAMBIOS) ---
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
        
        // Formato para el resultado principal (ej: NO NORMAL)
        const classificationText = classificationResult === 'NoNormal' 
            ? 'NO NORMAL' 
            : classificationResult.toUpperCase(); 
        
        // Configuración de colores dinámica
        const statusColor = data.color === "green" ? "bg-green-500" : data.color === "red" ? "bg-red-500" : "bg-orange-500";
        const statusRing = data.color === "green" ? "ring-green-300" : data.color === "red" ? "ring-red-300" : "ring-orange-300";

        return (
            <div className="p-6 space-y-8">
                <div className="text-center">
                    <h2 className="text-2xl font-extrabold text-gray-900">
                        {/* Título de Resultado */}
                        <span className={`${data.color === "green" ? 'text-green-600' : data.color === "red" ? 'text-red-600' : 'text-orange-600'}`}>{data.title}</span>
                    </h2>
                    
                    <div className={`mt-4 inline-block px-6 py-2 text-xl font-black text-white rounded-full shadow-xl ${statusColor} ring-4 ${statusRing}`}>
                        {classificationText}
                    </div>

                    {/* ✅ RENDERIZADO DE LA DESCRIPCIÓN (Asignada dinámicamente) */}
                    <p className="mt-4 text-gray-700 text-sm md:text-base border-t border-b border-gray-200 py-3 px-2 mx-auto max-w-xl text-justify">
                        {data.description}
                    </p>
                    {/* ------------------------------------------- */}
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col items-center space-y-3">
                        {/* Título de Imagen */}
                        <h3 className="text-lg font-semibold text-indigo-700 border-b border-indigo-200 w-full text-center pb-1">Imagen:</h3>
                        <img
                        src={previewUrl}
                        alt="Radiografía Clasificada"
                        className="w-full max-w-xs h-auto object-contain rounded-xl shadow-2xl border-4 border-indigo-400"
                        />
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-indigo-700 border-b border-indigo-200 w-full text-center pb-1">Ejemplos de Clasificación:</h3>
                        
                        {/* ✅ RENDERIZADO DINÁMICO de imágenes de ejemplo */}
                        <div className="grid grid-cols-2 gap-2"> 
                            {Object.keys(dynamicExampleImages).map((key) => {
                                // 1. Formatear la clave: Reemplazar 'NoNormal' por 'NO NORMAL' y pasar a mayúsculas.
                                const displayKey = key.replace('NoNormal', 'NO NORMAL').toUpperCase();

                                return (
                                    <div key={key} className="flex flex-col items-center p-1 rounded-lg border border-gray-200 bg-white shadow-sm w-full">
                                        <div className="flex w-full items-center justify-center pt-1">
                                            <p className="text-center text-xs font-bold text-gray-800" title={displayKey}>{displayKey}</p> 
                                        </div>
                                        <div className="w-full p-2"> 
                                            <img 
                                                src={dynamicExampleImages[key]} 
                                                alt={`Ejemplo de ${key}`} 
                                                className="w-full h-auto object-cover rounded-md border-2 border-gray-100" 
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* ------------------------------------------- */}

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
                <span className={`px-2 py-1 rounded-full ${currentStep >= 1 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}>1. Subir Otoscopía</span>
                <span className={`px-2 py-1 rounded-full ${currentStep >= 2 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}>2. Clasificar</span>
                <span className={`px-2 py-1 rounded-full ${currentStep >= 3 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}>3. Resultado IA</span>
            </div>
        );
    };


    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-inter pt-0">
            
            <NavbarContent isLoggedIn={isLoggedIn} logout={logout} /> 

            <main className="w-full max-w-3xl"> 
                
                <p className="text-center text-gray-600 mb-8">Herramienta de apoyo al diagnóstico rápido para la detección de otitis (media y externa).</p>

                {getStepIndicator()}

                <div className="bg-white rounded-2xl shadow-2xl transition-all duration-500 ease-in-out">
                    {renderCurrentStep()}
                </div>
            </main>
            
            <footer className="mt-8 text-sm text-gray-500">
                
            </footer>
        </div>
    );
}; 

export default App;
