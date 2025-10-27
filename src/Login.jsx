import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext'; 
import Login from './Login'; 

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

// ----------------------------------------------------
// NUEVO COMPONENTE: Barra de Navegación Simple
// ----------------------------------------------------
const NavbarContent = ({ logout, isLoggedIn }) => (
    <nav className="flex items-center justify-between w-full max-w-3xl mb-8 p-4 bg-white rounded-xl shadow-lg">
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
            // Mensaje o logo simple para cuando no está logeado
            <span className="text-sm text-indigo-600 font-semibold">Acceso Requerido</span>
        )}
    </nav>
);


// Componente principal de la aplicación
const App = () => {
    const { isLoggedIn, logout, token } = useAuth(); 

    // Si no está logeado, mostrar el Navbar y luego el Login
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-inter">
                <NavbarContent isLoggedIn={isLoggedIn} logout={logout} />
                <Login />
            </div>
        );
    }
    
    // ----------------------------------------------------
    // ESTADO Y LÓGICA DEL CLASIFICADOR (Solo si está logeado)
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

            if (err.message
