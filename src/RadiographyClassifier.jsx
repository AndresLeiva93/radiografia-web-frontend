import React, { useState, useCallback, useMemo } from 'react';

// =================================================================
// 🚨 CAMBIO 1: Corregir la URL de la API a '/predict' (y no '/classify')
// =================================================================
const RENDER_API_URL = "https://radiografia-ia-api.onrender.com/predict"; 

// Constantes de Estado
const STEPS = {
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  RESULT: 'result'
};

// Componente principal de la aplicación
const App = () => {
  // ----------------------------------------------------
  // ESTADO
  // ----------------------------------------------------
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [file, setFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null); 
  // classificationResult ahora guardará la cadena exacta: 'Normal', 'AOE', o 'AOM'
  const [classificationResult, setClassificationResult] = useState(null); 
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false); 
  
  // ----------------------------------------------------
  // DATOS Y DESCRIPCIONES
  // =================================================================
  // 🚨 CAMBIO 2: Mapeo para las 3 clases (Normal, AOE, AOM)
  // =================================================================
  const resultData = useMemo(() => ({
    'Normal': {
      title: "Diagnóstico: Oído Medio Sano (Normal)",
      description: "La estructura analizada por el modelo de IA no presenta las anomalías características de la otitis media. Los contornos óseos y las cavidades aéreas se observan dentro de los parámetros esperados para un oído saludable. Esto indica una baja probabilidad de patología en la región analizada.",
      color: "green",
      examples: [
        { id: 1, label: 'Estructura Ósea Normal y Definida' },
        { id: 2, label: 'Cavidad Aérea del Oído Despejada' },
        { id: 3, label: 'Ausencia de Opacidades y Fluidos' },
      ],
    },
    'AOE': {
      title: "Diagnóstico: Otitis Externa Aguda (AOE)",
      description: "El modelo de IA detectó patrones que sugieren Otitis Externa Aguda (AOE). Esto podría manifestarse como inflamación o afectación del tejido blando externo. Se necesita confirmación médica para el diagnóstico definitivo y el tratamiento.",
      color: "orange",
      examples: [
        { id: 4, label: 'Indicadores de Inflamación del Conducto Externo' },
        { id: 5, label: 'Irregularidades no asociadas al oído medio' },
        { id: 6, label: 'Revisión prioritaria por especialista (Otorrinolaringólogo).' },
      ],
    },
    'AOM': {
      title: "Diagnóstico: Otitis Media Aguda (AOM)",
      description: "El modelo de IA detectó opacidades, llenado anómalo y/o irregularidades en la cavidad del oído medio, lo cual es altamente indicativo de Otitis Media Aguda (AOM). Se recomienda encarecidamente la revisión y confirmación por un especialista médico (Otorrinolaringólogo).",
      color: "red",
      examples: [
        { id: 7, label: 'Opacidad o Llenado Anormal (Pus/Líquido)' },
        { id: 8, label: 'Engrosamiento de Mucosa y Contornos Irregulares' },
        { id: 9, label: 'Posibles Niveles de Líquido/Aire Detectados' },
      ],
    }
  }), []);

  // ----------------------------------------------------
  // LÓGICA DE MANEJO DE ARCHIVOS (Sin cambios)
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

  // ----------------------------------------------------
  // LÓGICA DE LA API (Clasificación)
  // ----------------------------------------------------

  const classifyImage = useCallback(async () => {
    if (!file) {
      setError("Por favor, sube una imagen primero.");
      return;
    }

    setStep(STEPS.PROCESSING);
    setError(null);

    // =================================================================
    // 🚨 CAMBIO 3: Cambiar la clave del FormData de 'file' a 'image'
    //             Para coincidir con el código de app.py
    // =================================================================
    const formData = new FormData();
    formData.append('image', file, file.name); // Antes era 'file'

    try {
      const response = await fetch(RENDER_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Mejor manejo de errores HTTP para mostrar al usuario
        const errorBody = await response.json().catch(() => ({}));
        const statusText = response.statusText || 'Error Desconocido';
        const apiError = errorBody.error || `Error ${response.status}: ${statusText}`;
        throw new Error(apiError);
      }

      const result = await response.json();
      
      // La API debe devolver la predicción en la clave 'prediccion'
      const classification = result?.prediccion; 

      if (!classification || !resultData[classification]) {
         throw new Error(`Respuesta de API inválida. Clasificación no reconocida: ${classification}`);
      }
      
      // La clave classification ahora es exactamente 'Normal', 'AOE', o 'AOM'
      setClassificationResult(classification);
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
  }, [file, resultData]); // Añadir resultData a la lista de dependencias

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
  // RENDERING (Vistas)
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
    
    // Los colores ahora dependen de la clave 'color' en resultData
    const statusColor = data.color === "green" ? "bg-green-500" : data.color === "red" ? "bg-red-500" : "bg-orange-500";
    const statusRing = data.color === "green" ? "ring-green-300" : data.color === "red" ? "ring-red-300" : "ring-orange-300";
    const detailColor = data.color === "green" ? "text-green-800 bg-green-50 border-green-200" : data.color === "red" ? "text-red-800 bg-red-50 border-red-200" : "text-orange-800 bg-orange-50 border-orange-200";

    return (
      <div className="p-6 space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-900">
            <span className={`${data.color === "green" ? 'text-green-600' : 'text-red-600'}`}>{isHealthy ? "Diagnóstico Confirmado" : "Resultado Inmediato"}</span>
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
                <li key={example.id} className={`flex items-center p-3 rounded-lg shadow-sm border border-gray-200 ${data.color === "green" ? 'bg-green-50' : 'bg-red-50'}`}>
                  <span className={`w-2 h-2 rounded-full mr-3 ${data.color === "green" ? 'bg-green-500' : 'bg-red-500'}`}></span>
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
    return (
        <div className='text-xs font-semibold text-indigo-500 flex justify-center space-x-2 mb-4'>
            <span className={`px-2 py-1 rounded-full ${currentStep >= 1 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}>1. Subir Radiografía</span>
            <span className={`px-2 py-1 rounded-full ${currentStep >= 2 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}>2. Clasificar</span>
            <span className={`px-2 py-1 rounded-full ${currentStep >= 3 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}>3. Resultado IA</span>
        </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-inter">
      
      <main className="w-full max-w-3xl">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">🩺 Clasificador de Imágenes Médicas IA</h1>
        <p className="text-center text-gray-600 mb-8">Herramienta de apoyo al diagnóstico rápido de Otitis Media.</p>

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
