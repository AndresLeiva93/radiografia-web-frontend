import React, { useState, useCallback, useMemo } from 'react';
// Importamos los iconos de lucide-react (asumiendo que están disponibles en el entorno)
import { Upload, Cpu, CheckCircle, RotateCcw, User } from 'lucide-react';

// Nota: La URL de la API se mantiene codificada aquí para el entorno de prueba.
// En un proyecto real, se usaría una variable de entorno.
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
 * Simula la ubicación para futuras funcionalidades de Login/Usuario.
 */
const AuthPlaceholder = () => (
  // El diseño utiliza flexbox y clases de Tailwind para ubicarse en la esquina.
  <div className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition duration-150 cursor-pointer p-2 rounded-lg hover:bg-indigo-50">
    {/* Utilizamos el icono de Usuario como marcador de posición */}
    <User className="w-5 h-5" />
    <span className="font-semibold text-sm hidden sm:inline">Iniciar Sesión / Usuario</span>
  </div>
);

/**
 * Componente de la Barra de Navegación Superior.
 * Contiene el título de la aplicación y el componente de autenticación.
 */
const Navbar = () => (
  // La clase 'fixed top-0' y 'z-10' asegura que la barra permanezca visible arriba.
  <header className="fixed top-0 left-0 w-full bg-white shadow-md z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
      {/* Título Principal y Logo */}
      <div className="flex items-center space-x-3">
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

// Componente para manejar la visualización del estado (barra de progreso)
const StepIndicator = ({ step }) => {
    let currentStep;
    switch (step) {
        case STEPS.UPLOAD: currentStep = 1; break;
        case STEPS.PROCESSING: currentStep = 2; break;
        case STEPS.RESULT: currentStep = 3; break;
        default: currentStep = 1;
    }

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
  // DATOS Y DESCRIPCIONES (para el resultado)
  // ----------------------------------------------------

  const resultData = useMemo(() => ({
    Sano: {
      title: "Diagnóstico: Oído Medio Sano",
      description: "La estructura analizada por el modelo de IA no presenta las anomalías características de la otitis media. Los contornos óseos y las cavidades aéreas se observan dentro de los parámetros esperados. **Nota:** Este resultado es un apoyo diagnóstico y debe ser confirmado por un especialista.",
      color: "text-green-600 bg-green-50 border-green-300",
    },
    'Otitis Media': {
      title: "Diagnóstico: Posible Otitis Media",
      description: "El modelo de IA ha identificado patrones compatibles con la otitis media. Se observan indicios de opacidad o engrosamiento en las cavidades, sugiriendo la presencia de inflamación o líquido. Se recomienda **confirmación inmediata por un médico especialista**.",
      color: "text-red-600 bg-red-50 border-red-300",
    },
  }), []);

  // ----------------------------------------------------
  // MANEJO DE ARCHIVOS (Drag & Drop)
  // ----------------------------------------------------

  const handleFileChange = useCallback((selectedFile) => {
    setError(null);
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      // Crea una URL local para la previsualización
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setStep(STEPS.UPLOAD); // Asegurarse de estar en el paso de subida
    } else {
      setFile(null);
      setPreviewUrl(null);
      setError("Por favor, suba un archivo de imagen válido (JPEG, PNG).");
    }
  }, [previewUrl]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, [handleFileChange]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // ----------------------------------------------------
  // LLAMADA A LA API
  // ----------------------------------------------------

  const classifyImage = useCallback(async () => {
    if (!file) {
      setError("Debe seleccionar una imagen para clasificar.");
      return;
    }

    setStep(STEPS.PROCESSING);
    setError(null);
    setClassificationResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Intentar la conexión con el servidor
      const response = await fetch(RENDER_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setClassificationResult(result);
      setStep(STEPS.RESULT);

    } catch (err) {
      console.error("Error al clasificar la imagen:", err);
      setError(`Ocurrió un error al conectar con el modelo. Detalles: ${err.message}`);
      setStep(STEPS.UPLOAD); // Volver al paso de subida en caso de error
    }
  }, [file]);

  // ----------------------------------------------------
  // MANEJO DEL REINICIO
  // ----------------------------------------------------
  const resetApp = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setStep(STEPS.UPLOAD);
    setFile(null);
    setPreviewUrl(null);
    setClassificationResult(null);
    setError(null);
    setIsDragOver(false);
  }, [previewUrl]);

  // ----------------------------------------------------
  // VISTAS POR PASO
  // ----------------------------------------------------

  const renderUploadStep = () => (
    <div className="flex flex-col items-center">
      <div
        className={`w-full h-64 border-4 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition duration-300 ease-in-out 
          ${isDragOver ? 'border-indigo-500 bg-indigo-50' : file ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white hover:border-indigo-400'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files[0])}
          className="hidden"
        />
        {file ? (
          <p className="text-lg font-semibold text-green-700">Archivo listo: {file.name}</p>
        ) : (
          <>
            <Upload className="w-10 h-10 text-gray-500 mb-2" />
            <p className="text-center text-gray-600 font-medium">
              Arrastra y suelta aquí tu imagen o haz clic para seleccionar.
            </p>
            <p className="text-xs text-gray-500 mt-1">(Formatos: JPG, PNG)</p>
          </>
        )}
      </div>

      {previewUrl && (
        <div className="mt-6 p-4 bg-white rounded-xl shadow-inner w-full max-w-sm">
          <h3 className="text-md font-bold mb-3 text-gray-800 border-b pb-2">Previsualización</h3>
          <img
            src={previewUrl}
            alt="Previsualización de Radiografía"
            className="rounded-lg max-w-full h-auto shadow-lg border border-gray-200"
          />
        </div>
      )}
      
      <button
        onClick={classifyImage}
        disabled={!file || step === STEPS.PROCESSING}
        className={`mt-8 w-full px-6 py-3 rounded-xl text-white font-bold text-lg shadow-lg transform transition duration-150 ease-in-out
          ${file && step !== STEPS.PROCESSING
            ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl active:scale-95'
            : 'bg-gray-400 cursor-not-allowed'}`}
      >
        <Cpu className="inline w-5 h-5 mr-2" />
        Clasificar Imagen
      </button>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="flex flex-col items-center p-10 bg-white rounded-xl shadow-2xl">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-4"></div>
      <p className="text-xl font-semibold text-indigo-700">Analizando la radiografía...</p>
      <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos mientras el modelo procesa la imagen.</p>
    </div>
  );

  const renderResultStep = () => {
    if (!classificationResult || !classificationResult.classification) {
      return (
        <div className="p-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-lg shadow-lg">
          <p className="font-bold">Resultado Inesperado</p>
          <p>No se pudo obtener una clasificación clara del modelo. Intente con otra imagen.</p>
          <button onClick={resetApp} className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition">
            <RotateCcw className="inline w-4 h-4 mr-1" />
            Analizar Otra Imagen
          </button>
        </div>
      );
    }

    const { classification, probability } = classificationResult;
    const data = resultData[classification] || {
      title: "Clasificación Desconocida",
      description: "El modelo retornó una clase no mapeada.",
      color: "text-gray-600 bg-gray-50 border-gray-300",
    };
    const probPercent = (probability * 100).toFixed(2);

    return (
      <div className="flex flex-col items-center">
        <div className={`w-full p-8 rounded-2xl border-4 shadow-xl ${data.color}`}>
          <h2 className={`text-3xl font-extrabold mb-3 ${data.color.split(' ')[0]}`}>
            {data.title}
          </h2>
          <p className="text-md font-medium text-gray-700 mb-4">
            **Confianza del Modelo:** {probPercent}%
          </p>
          <p className={`text-gray-600 border-t pt-4 mt-4 ${data.color.split(' ')[0].replace('text-', 'border-')}`}>
            {data.description}
          </p>
        </div>
        
        {previewUrl && (
            <div className="mt-6 p-4 bg-white rounded-xl shadow-lg w-full max-w-sm">
                <h3 className="text-md font-bold mb-3 text-gray-800 border-b pb-2">Imagen Analizada</h3>
                <img
                    src={previewUrl}
                    alt="Radiografía Clasificada"
                    className="rounded-lg max-w-full h-auto border border-gray-200"
                />
            </div>
        )}

        <button 
          onClick={resetApp} 
          className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition duration-150 ease-in-out active:scale-95"
        >
          <RotateCcw className="inline w-5 h-5 mr-2" />
          Analizar Otra Imagen
        </button>
      </div>
    );
  };

  // ----------------------------------------------------
  // RENDERIZADO PRINCIPAL
  // ----------------------------------------------------

  const renderContent = () => {
    switch (step) {
      case STEPS.UPLOAD:
        return renderUploadStep();
      case STEPS.PROCESSING:
        return renderProcessingStep();
      case STEPS.RESULT:
        return renderResultStep();
      default:
        return renderUploadStep();
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 font-inter pt-20"> {/* Añadimos padding superior para la Navbar fija */}
      <Navbar /> {/* Incluimos la barra de navegación */}
      
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
            {renderContent()}

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
