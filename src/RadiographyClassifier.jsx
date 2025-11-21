import React, { useState, useMemo } from 'react';
import { Note, Image, FileText, XCircle, RefreshCw } from 'lucide-react';

/**
 * DATOS SIMULADOS: Representa lo que un servidor/API devolvería al escanear
 * la "carpeta Public" y leer los archivos .txt y .jpg/.png asociados a una clasificación.
 */
const SIMULATED_DIAGNOSIS_DATA = {
  // CLASIFICACIÓN 1: Completa
  'NONNORMAL': {
    descriptionText: "Inflamación grave del oído medio (Otitis Media), con posible perforación del tímpano. Se observa tejido granulado y restos de efusión. Se requiere atención médica inmediata para prevenir la pérdida auditiva.",
    mainImageUrl: "https://placehold.co/400x400/228B22/FFFFFF?text=IMAGEN+PRINCIPAL+NONNORMAL",
    examples: [
      { name: "AOE", imageUrl: "https://placehold.co/200x200/CD5C5C/FFFFFF?text=AOE+.jpg" }, 
      { name: "AOM", imageUrl: "https://placehold.co/200x200/F08080/FFFFFF?text=AOM+.jpg" }, 
      { name: "Normal", imageUrl: "https://placehold.co/200x200/90EE90/000000?text=Normal+.jpg" },
      { name: "Otitis", imageUrl: "https://placehold.co/200x200/ADD8E6/000000?text=Otitis+.png" },
    ]
  },

  // CLASIFICACIÓN 2: Incompleta 
  'NORMAL': {
    descriptionText: "El tímpano se observa sano, translúcido y con reflejo luminoso claro. Los huesos del oído medio (martillo, yunque) son visibles. No hay signos de inflamación, infección o efusión. Estado saludable.",
    mainImageUrl: "https://placehold.co/400x400/4682B4/FFFFFF?text=IMAGEN+PRINCIPAL+NORMAL",
    examples: [
      { name: "Sano", imageUrl: "https://placehold.co/200x200/87CEFA/000000?text=Sano+.png" },
      { name: "Tímpano", imageUrl: "https://placehold.co/200x200/B0E0E6/000000?text=Timpano+.jpg" },
    ]
  },

  // CLASIFICACIÓN 3: Faltante de descripción
  'ERROR_CLASIFICACION': {
    descriptionText: null, 
    mainImageUrl: "https://placehold.co/400x400/FFA07A/FFFFFF?text=IMAGEN+PRINCIPAL+ERROR",
    examples: [
      { name: "Desconocido 1", imageUrl: "https://placehold.co/200x200/F08080/FFFFFF?text=Desconocido1+.jpg" },
    ]
  }
};

const App = () => {
  // Estado para simular el resultado de la clasificación del modelo
  const [classificationResult, setClassificationResult] = useState('NONNORMAL');

  // useMemo para obtener los datos relevantes basados en el resultado de la clasificación
  const currentData = useMemo(() => {
    return SIMULATED_DIAGNOSIS_DATA[classificationResult] || { 
      descriptionText: "No hay datos disponibles para esta clasificación.", 
      mainImageUrl: "https://placehold.co/400x400/808080/FFFFFF?text=SIN+DATOS", 
      examples: [] 
    };
  }, [classificationResult]);

  // Manejador para cambiar la clasificación simulada
  const handleSimulateChange = (newClassification) => {
    setClassificationResult(newClassification);
  };
  
  // Componente de utilidad para mostrar imágenes con un fallback en caso de error
  const ImageWithFallback = ({ src, alt }) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
      if (!hasError) {
        setImageSrc(https://placehold.co/200x200/808080/FFFFFF?text=Error+en+Imagen);
        setHasError(true);
      }
    };

    return (
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover rounded-lg"
        onError={handleError}
      />
    );
  };


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans antialiased">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">
          Resultado del Diagnóstico Automatizado
        </h1>
        <p className="text-lg text-gray-500 mt-2">
          Carga dinámica de datos y ejemplos visuales.
        </p>
      </header>

      {/* Selector de Clasificación Simulado (Botones de prueba) */}
      <div className="mb-8 p-4 bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <RefreshCw className="w-5 h-5 mr-2 text-indigo-500" />
          Simular Resultado del Modelo
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          {Object.keys(SIMULATED_DIAGNOSIS_DATA).map(key => (
            <button
              key={key}
              onClick={() => handleSimulateChange(key)}
              className={`px-4 py-2 text-sm font-bold rounded-full transition-all duration-200 shadow-md ${
                classificationResult === key
                  ? 'bg-indigo-600 text-white shadow-indigo-400/50 scale-105'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              Clasificación: {key}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-2xl">
        {/* Resultado Principal */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Resultado
          </h2>
          <span className="inline-block px-6 py-2 text-3xl font-extrabold text-white bg-red-500 rounded-full shadow-xl shadow-red-300/60 uppercase tracking-wider">
            {classificationResult}
          </span>
        </div>

        {/* Sección de Descripción y Visualización (Grid de 3 Columnas) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna de Descripción (Lee el archivo .txt simulado) */}
          <div className="lg:col-span-1 border-r border-gray-200 pr-6">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-500" />
              Descripción del Diagnóstico:
            </h3>
            <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 min-h-[150px]">
              {currentData.descriptionText ? (
                // Muestra la descripción si el archivo .txt existe
                <p className="text-gray-800 whitespace-pre-wrap">
                  {currentData.descriptionText}
                </p>
              ) : (
                // Muestra el mensaje de error si el archivo .txt no se encontró
                <div className="text-red-500 font-semibold flex items-center justify-center h-full text-center">
                  <XCircle className="w-5 h-5 mr-2" />
                  {`Falta cargar el archivo de descripción: '${classificationResult}.txt'`}
                </div>
              )}
            </div>
          </div>

          {/* Columna de Imagen Principal */}
          <div className="lg:col-span-1 flex flex-col items-center">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
              <Image className="w-5 h-5 mr-2 text-indigo-500" />
              Imagen Principal:
            </h3>
            <div className="w-full max-w-xs aspect-square p-1 border-4 border-indigo-500 rounded-xl shadow-xl transition-all hover:shadow-2xl">
              <ImageWithFallback 
                src={currentData.mainImageUrl} 
                alt={`Imagen principal para ${classificationResult}`} 
              />
            </div>
          </div>

          {/* Columna de Ejemplos de Clasificación (Solo carga .jpg/.png simulados) */}
          <div className="lg:col-span-1 border-l border-gray-200 pl-6">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
              <Note className="w-5 h-5 mr-2 text-indigo-500" />
              Ejemplos de Clasificación:
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {currentData.examples.length > 0 ? (
                currentData.examples.map((example, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-xl shadow-md border border-gray-200 text-center">
                    <p className="text-sm font-semibold text-gray-600 mb-2">{example.name}</p>
                    <div className="aspect-square border border-indigo-300 rounded-lg overflow-hidden">
                      <ImageWithFallback 
                        src={example.imageUrl} 
                        alt={`Ejemplo de ${example.name}`} 
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-gray-500 p-4 border rounded-lg bg-yellow-50">
                  No se encontraron imágenes (.jpg/.png) de ejemplo para esta clase.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
