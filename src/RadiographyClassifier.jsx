import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext'; 
import Login from './Login'; 

// URL de la API
const RENDER_API_URL = "https://radiografia-ia-api.onrender.com/predict"; 

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
                👂 Oido IA Match
            </h1>
            <p className="text-xs text-gray-500">
                Herramienta de apoyo al diagnóstico rápido.
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
    const { isLoggedIn, logout, token } = useAuth(); 

    // ----------------------------------------------------
    // VISTA DE LOGIN (NO AUTENTICADO)
    // ----------------------------------------------------
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
    
    // ----------------------------------------------------
    // ESTADO Y LÓGICA DEL CLASIFICADOR (AUTENTICADO)
    // ----------------------------------------------------
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
            description: "El modelo de IA detectó patrones que sugieren Otitis Externa Aguda (AOE). Se necesita confirmación médica para el diagnóstico definitivo y el tratamiento.",
            color: "orange",
        },
        'AOM': {
            title: "Diagnóstico: Otitis Media Aguda (AOM)",
            description: "El modelo de IA detectó opacidades y/o irregularidades en la cavidad del oído medio, lo cual es altamente indicativo de Otitis Media Aguda (AOM). Se recomienda la revisión y confirmación por un especialista médico.",
            color: "red",
        }
    }), []);

    // ✅ LÓGICA DINÁMICA: Carga dinámica de imágenes de ejemplo desde /public/images/
    const dynamicExampleImages = useMemo(() => {
        // Usa import.meta.glob para cargar todas las imágenes .jpg en /public/images/
        const modules = import.meta.glob('/public/images/*.jpg', { eager: true, as: 'url' });
        const images = {};

        for (const path in modules) {
            const fileNameWithExt = path.split('/').pop();
            // El nombre de la clase es el nombre del archivo sin extensión
            const className = fileNameWithExt.split('.')[0].replace(/_/g, ' '); 
            
            images[className] = modules[path];
        }
        return images;
    }, []);
    // ----------------------------------------------------
    
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
    // FUNCIONES DE RENDERIZADO DE PASOS
    // ----------------------------------------------------
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
        const isHealthy = classificationResult === 'Normal';
        const classificationText = classificationResult.toUpperCase();
        
        // Configuración de colores dinámica
        const statusColor = data.color === "green" ? "bg-green-500" : data.color === "red" ? "bg-red-500" : "bg-orange-500";
        const statusRing = data.color === "green" ? "ring-green-300" : data.color === "red" ? "ring-red-300" : "ring-orange-300";

        return (
            <div className="p-6 space-y-8">
                <div className="text-center">
                    <h2 className="text-2xl font-extrab
