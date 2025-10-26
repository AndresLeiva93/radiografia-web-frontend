import React, { useState, useCallback, useMemo } from 'react';
// Nota: La URL de la API se mantiene codificada aquí para el entorno de prueba.
// En un proyecto real, se usaría una variable de entorno.
const RENDER_API_URL = "https://radiografia-ia-api.onrender.com/classify";

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

    } catch (
