// src/RadiographyClassifier.jsx

import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext'; 
import Login from './Login'; 

// 🚨 CORRECCIÓN API: Usamos '/predict' según la configuración del servidor de Render
const RENDER_API_URL = "https://radiografia-ia-api.onrender.com/predict"; 

// Constantes de Estado
const STEPS = {
  UPLOAD: 'upload',
// ... (resto de STEPS)
  PROCESSING: 'processing',
  RESULT: 'result'
};

// Rutas de imágenes de ejemplo
const EXAMPLE_IMAGES = {
// ... (resto de EXAMPLE_IMAGES)
  'Normal': '/images/Normal.jpg', 
  'AOE': '/images/AOE.jpg',
  'AOM': '/images/AOM.jpg',
};

// ----------------------------------------------------
// 🚨 NUEVO COMPONENTE: Barra de Navegación Simple
// ----------------------------------------------------
const NavbarContent = ({ logout, isLoggedIn }) => (
    <nav className="flex items-center justify-between w-full max-w-3xl mb-8 p-4 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-gray-900">
                👂 Oido IA Match
            </h1>
            <p className="text-xs text-gray-500">
                Apoyo al diagnóstico de Otitis.
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
            <span className="text-sm text-indigo-600 font-semibold">Acceso</span>
        )}
    </nav>
);


// Componente principal de la aplicación
const App = () => { // 🚨 Eliminada la prop no utilizada: ClassifierContent
    const { isLoggedIn, logout, token } = useAuth(); // 🚨 Usar el hook de autenticación

    // Si no está logeado, mostrar solo el Login
    if (!isLoggedIn) {
        // 🚨 Mostrar el Navbar de todas formas para el título, pero luego el Login
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-inter">
                <NavbarContent isLoggedIn={isLoggedIn} logout={logout} />
                <Login />
            </div>
        );
    }
    
    // El resto del código solo se ejecuta si el usuario está logeado
    
    // ----------------------------------------------------
    // ESTADO Y LÓGICA DEL CLASIFICADOR
    // ----------------------------------------------------
// ... (Resto del estado y la lógica sin cambios)
    const [step, setStep] = useState(STEPS.UPLOAD);
    const [file, setFile] = useState(null); 
    const [previewUrl, setPreviewUrl] = useState(null); 
    const [classificationResult, setClassificationResult] = useState(null); 
    const [error, setError] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false); 
// ... (Resto del código de lógica)

// ... (El resto de las funciones: resultData, processFile, handleFileChange, handleDrop, handleDragOver, handleDragLeave, classifyImage, handleReset)

    
    // (Renderización de pasos omitida por brevedad, asume que está el código correcto)
// ... (El resto de renderUploadStep, renderProcessingStep, renderResultStep)

    const renderUploadStep = () => (
        // ... (Contenido de renderUploadStep, sin cambios)
    );
    
    const renderProcessingStep = () => (
        // ... (Contenido de renderProcessingStep, sin cambios)
    );

    const renderResultStep = () => {
        // ... (Contenido de renderResultStep, sin cambios)
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
// ... (Contenido de getStepIndicator, sin cambios)
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
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-inter pt-8">
            
            {/* 🚨 Usar el nuevo Navbar */}
            <NavbarContent isLoggedIn={isLoggedIn} logout={logout} /> 

            <main className="w-full max-w-3xl">
                
                {/* 🚨 Eliminado el botón de Cerrar Sesión y el Título Antiguo */}
                <p className="text-center text-gray-600 mb-8">Herramienta de apoyo al diagnóstico rápido para la detección de otitis (media y externa).</p>

                {getStepIndicator()}

                <div className="bg-white rounded-2xl shadow-2xl transition-all duration-500 ease-in-out">
                    {renderCurrentStep()}
                </div>
            </main>
            
            <footer className="mt-8 text-sm text-gray-500">
                Desarrollado con React y Tailwind CSS
            </footer>
        </div>
    );
};

export default App;
