// ... (código anterior)

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
                    <h2 className="text-2xl font-extrabold text-gray-900">
                        {/* ✅ Título de Resultado */}
                        <span className={`${data.color === "green" ? 'text-green-600' : data.color === "red" ? 'text-red-600' : 'text-orange-600'}`}>{isHealthy ? "Diagnóstico Confirmado" : "Resultado"}</span>
                    </h2>
                    
                    <div className={`mt-4 inline-block px-6 py-2 text-xl font-black text-white rounded-full shadow-xl ${statusColor} ring-4 ${statusRing}`}>
                        {classificationText}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col items-center space-y-3">
                        {/* ✅ Título de Imagen */}
                        <h3 className="text-lg font-semibold text-indigo-700 border-b border-indigo-200 w-full text-center pb-1">Imagen:</h3>
                        <img
                        src={previewUrl}
                        alt="Radiografía Clasificada"
                        className="w-full max-w-xs h-auto object-contain rounded-xl shadow-2xl border-4 border-indigo-400"
                        />
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-indigo-700 border-b border-indigo-200 w-full text-center pb-1">Ejemplos de Clasificación:</h3>
                        
                        {/* 🚨 CAMBIO CLAVE: Contenedor de ejemplos en 2 columnas */}
                        <div className="grid grid-cols-2 gap-2"> 
                            {Object.keys(dynamicExampleImages).map((key) => (
                                <div key={key} className="flex flex-col items-center p-2 rounded-lg border border-gray-200 bg-white shadow-sm w-full">
                                    
                                    {/* 🚨 DISTRIBUCIÓN 60% (IMAGEN) - 40% (TEXTO) */}
                                    <img 
                                        src={dynamicExampleImages[key]} 
                                        alt={`Ejemplo de ${key}`} 
                                        className="w-full h-auto object-cover rounded-md border-2 border-gray-100 mb-1" // w-full dentro de su columna
                                    />
                                    <p className="w-full text-center text-xs font-medium text-gray-700">{key}</p>
                                </div>
                            ))}
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

// ... (resto del código sin cambios)
