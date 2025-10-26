import React, { useState, useCallback, useMemo } from 'react';
// Nota: La URL de la API se mantiene codificada aquí para el entorno de prueba.
// En un proyecto real, se usaría una variable de entorno.
const RENDER_API_URL = "https://radiografia-ia-api.onrender.com/predict"; // URL corregida a /predict

// Constantes de Estado
const STEPS = {
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  RESULT: 'result'
};

// Componente principal de la aplicación, exportado como 'App' para ser usado en index.jsx
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
  // DATOS Y DESCRIPCIONES
  // ----------------------------------------------------
  
  const resultData = useMemo(() => ({
    Sano: {
      title: "Diagnóstico: Oído Medio Sano",
      description: "La estructura analizada por el modelo de IA no presenta las anomalías características de la otitis media. Los contornos óseos y las cavidades aéreas se observan dentro de los parámetros esperados.",
      color: "text-green-600",
      icon: "✅"
    },
    'Otitis Media': {
      title: "Diagnóstico: Otitis Media Detectada",
      description: "El modelo de IA ha detectado opacificación o anomalías en el oído medio, indicativas de posible otitis media. Se recomienda la revisión por un especialista.",
      color: "text-red-600",
      icon: "⚠️"
    },
  }), []);

  // ----------------------------------------------------
  // MANEJADORES DE EVENTOS
  // ----------------------------------------------------
  
  const handleFile = useCallback((selectedFile) => {
    // 1. Validar que el archivo sea una imagen
    if (!selectedFile || !selectedFile.type.startsWith('image/')) {
        setError("Solo se permiten archivos de imagen (JPEG, PNG).");
        return;
    }
    // 2. Limpiar errores y actualizar estados
    setError(null);
    setFile(selectedFile);
    
    // 3. Crear URL de previsualización
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl); // Limpia la URL anterior
    }
    const newPreviewUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(newPreviewUrl);
    
    // 4. Cambiar al paso de UPLOAD (por si venía de RESULT)
    setStep(STEPS.UPLOAD);
  }, [previewUrl]);

  const handleFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    handleFile(selectedFile);
  }, [handleFile]);
  
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
    const selectedFile = event.dataTransfer.files[0];
    handleFile(selectedFile);
  }, [handleFile]);

  const handleSubmit = useCallback(async () => {
    if (!file) {
      setError("Por favor, sube una radiografía antes de clasificar.");
      return;
    }

    setStep(STEPS.PROCESSING);
    setError(null);
    setClassificationResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(RENDER_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.statusText}`);
      }

      const data = await response.json();

      // Mapeo del resultado para mostrar el título y descripción correctos
      const resultKey = data.classification === 'Normal' ? 'Sano' : 'Otitis Media';
      
      setClassificationResult({
        ...resultData[resultKey],
        rawClassification: data.classification,
        probability: (data.probability * 100).toFixed(2),
      });
      
      setStep(STEPS.RESULT);

    } catch (err) {
      console.error("Error al procesar la imagen:", err);
      setError("Hubo un error al conectar con el modelo IA. Inténtalo de nuevo.");
      setStep(STEPS.UPLOAD); // Volver al inicio en caso de fallo
    }
  }, [file, resultData]);
  
  const handleReset = () => {
    // Limpiar todos los estados y volver al inicio
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
  // COMPONENTES DE VISTA
  // ----------------------------------------------------

  // 1. Vista de Subida (Paso 1)
  const UploadView = () => (
    <div 
        className={`border-4 border-dashed p-10 text-center transition-colors duration-200 rounded-xl ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
    >
        <p className="text-gray-600 mb-4">Arrastra y suelta aquí tu radiografía (JPEG o PNG)</p>
        <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150 shadow-md inline-block">
            Seleccionar Archivo
            <input 
                type="file" 
                accept="image/jpeg,image/png" 
                className="hidden" 
                onChange={handleFileChange}
            />
        </label>
        {file && (
            <div className="mt-4 text-sm text-gray-700">
                Archivo seleccionado: <span className="font-semibold">{file.name}</span>
            </div>
        )}
    </div>
  );

  // 2. Vista de Procesamiento (Paso 2)
  const ProcessingView = () => (
    <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
        <p className="text-lg font-medium text-gray-700">Analizando la imagen...</p>
        <p className="text-sm text-gray-500 mt-1">Esto puede tardar unos segundos mientras el modelo procesa los datos.</p>
    </div>
  );
  
  // 3. Vista de Resultado (Paso 3)
  const ResultView = () => {
    if (!classificationResult) return null;

    const { title, description, color, icon, probability } = classificationResult;

    return (
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Encabezado del resultado */}
        <div className={`p-6 ${color.replace('text', 'bg')} bg-opacity-10`}>
          <h2 className={`text-2xl font-bold ${color} flex items-center`}>
            {icon} <span className="ml-3">{title}</span>
          </h2>
          <p className="mt-2 text-gray-700">{description}</p>
        </div>
        
        {/* Detalle y Probabilidad */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-gray-700">Probabilidad del Modelo:</span>
            <span className={`text-xl font-extrabold ${color}`}>{probability}%</span>
          </div>
          
          <p className="text-sm text-gray-500 italic">
            *Nota: Este resultado es una ayuda diagnóstica y debe ser confirmado por un médico especialista.
          </p>
          
          <button 
            onClick={handleReset} 
            className="w-full mt-6 py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg transition duration-150 shadow-lg"
          >
            Nueva Clasificación
          </button>
        </div>
      </div>
    );
  };
  
  // 4. Componente de Progreso de Pasos
  const StepsProgress = () => {
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
        <p className="text-center text-gray-600 mb-8">Herramienta de apoyo al diagnóstico rápido de otitis media mediante análisis de imágenes radiográficas.</p>
        
        {/* Barra de progreso */}
        <StepsProgress />
        
        {/* Mensaje de Error (si existe) */}
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-2">{error}</span>
            </div>
        )}

        <div className="bg-white p-8 rounded-xl shadow-xl">
          
          {/* VISTA 1: SUBIDA / PREVIEW */}
          {step === STEPS.UPLOAD && (
            <>
                {previewUrl && (
                    <div className="mb-6 flex flex-col items-center">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Radiografía Lista para Clasificar:</h2>
                        <img 
                            src={previewUrl} 
                            alt="Previsualización de Radiografía" 
                            className="max-w-full max-h-96 object-contain rounded-lg shadow-md border-2 border-gray-200"
                        />
                    </div>
                )}
                
                {/* Si no hay archivo, muestra el área de drop. Si hay archivo, solo el botón Clasificar. */}
                {!file && <UploadView />}
                
                <div className='flex justify-center space-x-4 mt-6'>
                    {file && (
                        <>
                            <button
                                onClick={handleSubmit}
                                className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition duration-150 shadow-lg"
                            >
                                Clasificar con IA
                            </button>
                            <button
                                onClick={handleReset}
                                className="py-3 px-6 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg transition duration-150 shadow-lg"
                            >
                                Cancelar
                            </button>
                        </>
                    )}
                </div>
            </>
          )}

          {/* VISTA 2: PROCESAMIENTO */}
          {step === STEPS.PROCESSING && <ProcessingView />}

          {/* VISTA 3: RESULTADO */}
          {step === STEPS.RESULT && <ResultView />}

        </div>
      </main>
      
      {/* Footer / Aviso Legal */}
      <footer className="mt-10 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Plataforma de Clasificación IA. Uso exclusivamente con fines de apoyo diagnóstico.
      </footer>
    </div>
  );
};

export default App;
