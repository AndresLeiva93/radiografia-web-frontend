import React, { useState, useCallback, useMemo } from 'react';
// Importamos los iconos necesarios para la barra de navegación y los pasos
import { Upload, Cpu, CheckCircle, User } from 'lucide-react'; 

// Nota: La URL de la API se mantiene codificada aquí para el entorno de prueba.
const RENDER_API_URL = "https://radiografia-ia-api.onrender.com/classify";

// Constantes de Estado
const STEPS = {
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  RESULT: 'result'
};

// ----------------------------------------------------
// COMPONENTES DE ESTRUCTURA Y DISEÑO
// ----------------------------------------------------

/**
 * Componente Placeholder para el área de Autenticación.
 */
const AuthPlaceholder = () => (
  <div className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition duration-150 cursor-pointer p-2 rounded-lg hover:bg-indigo-50">
    <User className="w-5 h-5" />
    <span className="font-semibold text-sm hidden sm:inline">Iniciar Sesión / Usuario</span>
  </div>
);

/**
 * Componente de la Barra de Navegación Superior (Navbar).
 */
const Navbar = () => (
  // Navbar fijo y con sombra para destacar
  <header className="fixed top-0 left-0 w-full bg-white shadow-lg z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
      {/* Título Principal y Logo */}
      <div className="flex items-center space-x-3">
        {/* Usamos el icono CPU de Lucide para el logo */}
        <Cpu className="w-7 h-7 text-indigo-600" /> 
        <h1 className="text-xl font-extrabold text-gray-900 hidden sm:block">
          Clasificador de Radiografías IA
        </h1>
        <h1 className="text-xl font-extrabold text-gray-900 sm:hidden">
          Clasificador IA
        </h1>
      </div>
      
      {/* Marcador de Posición de Autenticación */}
      <AuthPlaceholder />
    </div>
  </header>
);

// ----------------------------------------------------
// LÓGICA DE LA APLICACIÓN
// ----------------------------------------------------

// Componente principal de la aplicación, exportado como 'App'
const App = () => {
  // ----------------------------------------------------
  // ESTADO
  // ----------------------------------------------------
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [file, setFile] = useState(null); // Archivo subido por el usuario
  const [previewUrl, setPreviewUrl] = useState(null); // URL de la imagen para previsualización
  const [classificationResult, setClassificationResult] = useState(null); // Resultado de la IA
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false); 

  // ----------------------------------------------------
  // DATOS Y DESCRIPCIONES (¡Mantenidos igual!)
  // ----------------------------------------------------
  
  const resultData = useMemo(() => ({
    Sano: {
      title: "Diagnóstico: Oído Medio Sano",
      description: "La estructura analizada por el modelo de IA no presenta las anomalías características de la otitis media. Los contornos óseos y las cavidades aéreas se observan dentro de los parámetros esperados para un oído saludable. Esto indica una baja probabilidad de patología en la región analizada.",
      color: "green",
      examples: [
        { id: 1, label: 'Estructura Ósea Normal y Definida' },
        { id: 2, label: 'Cavidad Aérea del Oído Despejada' },
        { id: 3, label: 'Ausencia de Opacidades y Fluidos' },
      ],
    },
    Enfermo: {
      title: "Diagnóstico: Indicativo de Otitis Media",
      description: "El modelo de IA detectó opacidades, llenado anómalo y/o irregularidades en la cavidad del oído medio, lo cual es altamente indicativo de un proceso inflamatorio o infeccioso (otitis media). Se recomienda encarecidamente la revisión y confirmación por un especialista médico (Otorrinolaringólogo).",
      color: "red",
      examples: [
        { id: 4, label: 'Opacidad o Llenado Anormal (Pus/Líquido)' },
        { id: 5, label: 'Engrosamiento de Mucosa y Contornos Irregulares' },
        { id: 6, label: 'Posibles Niveles de Líquido/Aire Detectados' },
      ],
    }
  }), []);

  // ----------------------------------------------------
  // LÓGICA DE MANEJO DE ARCHIVOS (¡Mantenida igual!)
  // ----------------------------------------------------

  const processFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        // RevokeObjectUrl para liberar memoria si ya había una previa
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

  // ----------------------------------------------------
  // LÓGICA DE LA API (Clasificación) (¡Mantenida igual!)
  // ----------------------------------------------------

  const classifyImage = useCallback(async () => {
    if (!file) {
      setError("Por favor, sube una imagen primero.");
      return;
    }

    setStep(STEPS.PROCESSING);
    setError(null);

    const formData = new FormData();
    formData.append('file', file, file.name);

    try {
      const response = await fetch(RENDER_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      // La API debe devolver la clasificación en la clave 'classification'
      const classification = result?.classification; 

      if (!classification) {
         throw new Error("Respuesta de API inválida: No se encontró la clave 'classification'.");
      }
      
      const normalizedClassification = classification.toLowerCase().includes('sano') ? 'Sano' : 'Enfermo';

      setClassificationResult(normalizedClassification);
      setStep(STEPS.RESULT);

    } catch (err) {
      console.error("Error en la clasificación:", err);
      
      let displayError = `Error: ${err.message}. Verifica el formato de la API.`;

      if (err.message.includes("Error HTTP: 50") || err.message.includes("failed to fetch")) {
        displayError = "⚠️ Falló la conexión. La causa más probable es un error de red/servidor (CORS o 'Arranque en Frío'). Inténtalo de nuevo en 30 segundos.";
      }

      setError(displayError);
      setStep(STEPS.UPLOAD); 
      setClassificationResult(null);
    }
  }, [file]);

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
  // RENDERING (Vistas) (¡Mantenidas igual, con iconos ajustados!)
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
            {/* Reemplazamos el SVG genérico por el icono Upload de Lucide */}
            <Upload className="w-8 h-8 mx-auto mb-2" /> 
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
      <Cpu className="animate-spin h-10 w-10 text-indigo-600" /> {/* Usamos CPU para el spinner */}
      <h2 className="text-xl font-bold text-indigo-800">Analizando con Inteligencia Artificial...</h2>
      <p className="text-gray-600">Esto puede tomar unos segundos. Por favor, espera.</p>
    </div>
  );

  const renderResultStep = () => {
    if (!classificationResult) return renderUploadStep();

    const data = resultData[classificationResult];
    const isHealthy = classificationResult === 'Sano';
    const classificationText = classificationResult.toUpperCase();
    
    const statusColor = isHealthy ? "bg-green-500" : "bg-red-500";
    const statusRing = isHealthy ? "ring-green-300" : "ring-red-300";
    const detailColor = isHealthy ? "text-green-800 bg-green-50 border-green-200" : "text-red-800 bg-red-50 border-red-200";

    return (
      <div className="p-6 space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-900">
            <span className={`${isHealthy ? 'text-green-600' : 'text-red-600'}`}>{isHealthy ? "Diagnóstico Confirmado" : "Resultado Inmediato"}</span>
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
            <h3 className="text-lg font-semibold text-indigo-700 border-b border-indigo-200 w-full text-center pb-1">Hallazgos Clave de la IA:</h3>
            <ul className="space-y-2">
              {data.examples.map((example) => (
                <li key={example.id} className={`flex items-center p-3 rounded-lg shadow-sm border border-gray-200 ${isHealthy ? 'bg-green-50' : 'bg-red-50'}`}>
                  <span className={`w-2 h-2 rounded-full mr-3 ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <p className="text-sm font-medium text-gray-700">{example.label}</p>
                </li>
              ))}
            </ul>
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

    // Usamos los iconos de Lucide en el indicador de pasos
    const stepItems = [
        { id: 1, name: 'Subir Radiografía', icon: Upload },
        { id: 2, name: 'Clasificar', icon: Cpu },
        { id: 3, name: 'Resultado IA', icon: CheckCircle },
    ];

    return (
        <div className='flex justify-center space-x-4 mb-8 w-full max-w-lg mx-auto'>
            {stepItems.map((item) => {
                const isActive = item.id === currentStep;
                const isCompleted = item.id < currentStep;
                const Icon = item.icon;

                return (
                    <div key={item.id} className="flex flex-col items-center flex-1">
                        <div className={`p-3 rounded-full transition duration-300 ease-in-out shadow-lg 
                            ${isCompleted ? 'bg-indigo-600 text-white' : isActive ? 'bg-indigo-500 text-white transform scale-105' : 'bg-gray-200 text-gray-600'}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <span className={`mt-2 text-center text-xs font-semibold whitespace-nowrap 
                            ${isCompleted ? 'text-indigo-600' : isActive ? 'text-indigo-500' : 'text-gray-500'}`}>
                            {item.name}
                        </span>
                    </div>
                );
            })}
        </div>
    );
  };


  return (
    // IMPORTANTE: Agregamos pt-20 (padding-top: 5rem) para desplazar el contenido principal hacia abajo
    // y evitar que sea cubierto por la barra de navegación fija (Navbar).
    <div className="min-h-screen bg-gray-100 font-inter pt-20"> 
      <Navbar /> {/* Incluimos la barra de navegación fija */}
      
      <main className="w-full max-w-4xl mx-auto px-4 py-8">
        
        {/* Encabezado y Descanso Visual */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Diagnóstico Asistido por Inteligencia Artificial</h2>
          <p className="text-lg text-gray-600">Herramienta de apoyo para la clasificación rápida de radiografías de oído medio.</p>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl transition duration-300">
            {/* Indicador de Paso */}
            <StepIndicator step={step} />

            {/* Contenido Principal por Paso */}
            {renderCurrentStep()}

            {/* Mensaje de Error */}
            {error && (
              <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg font-medium shadow-md">
                <p>Error: {error}</p>
              </div>
            )}
        </div>
      </main>
      
      {/* Pie de página simple */}
      <footer className="w-full text-center py-4 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Sistema de Clasificación IA. Herramienta de apoyo diagnóstico.
      </footer>
    </div>
  );
};

export default App;
