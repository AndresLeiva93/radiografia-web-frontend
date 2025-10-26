import React, { useState, useCallback, useMemo } from 'react';
// IMPORTAMOS EL HOOK DE AUTENTICACIÓN
import { useAuth } from './AuthContext.jsx'; 

// --- CLASIFICADOR DE RADIOGRAFÍA (CONSTANTES) ---
// La URL de tu API de clasificación en Render
const RENDER_API_URL = "https://radiografia-ia-api.onrender.com/predict"; 

// Constantes de Estado
const STEPS = {
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  RESULT: 'result'
};

// ----------------------------------------------------
// COMPONENTE DE AUTENTICACIÓN (AuthForm)
// Muestra el formulario de Login/Registro simulado.
// ----------------------------------------------------
const AuthForm = ({ login }) => { 
    const [isLoginView, setIsLoginView] = useState(true); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            if (email === 'admin@test.com' && password === '123456') {
                const token = isLoginView ? `token_login_${email}` : `token_register_${email}`;
                login(token); 
            } else {
                setError(isLoginView 
                    ? 'Credenciales incorrectas. Usa admin@test.com / 123456' 
                    : 'Error de registro simulado. Usa admin@test.com / 123456');
            }
        }, 1500); 
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-2xl transition duration-500">
                <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
                    {isLoginView ? 'Iniciar Sesión' : 'Registrarse'}
                </h2>
                {error && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                        {error}
                    </div>
                )}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="admin@test.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={isLoginView ? 'current-password' : 'new-password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="123456"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                                isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150'
                            }`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                isLoginView ? 'Acceder' : 'Crear Cuenta'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLoginView(!isLoginView)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition duration-150"
                    >
                        {isLoginView ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// ----------------------------------------------------
// COMPONENTE PRINCIPAL (App)
// ----------------------------------------------------
const App = () => {
  const [currentStep, setCurrentStep] = useState(STEPS.UPLOAD);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [classificationResult, setClassificationResult] = useState(null);
  const [error, setError] = useState(null);

  // USAMOS EL HOOK DE AUTENTICACIÓN
  const { isLoggedIn, token, login, logout } = useAuth();

  // --- Manejadores de Estado ---

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setCurrentStep(STEPS.UPLOAD); // Reset to upload step if file changes
      setError(null);
      setClassificationResult(null);
    }
  }, []);

  const handleClassify = useCallback(async () => {
    if (!file || !isLoggedIn) {
      setError('Por favor, selecciona una imagen e inicia sesión.');
      return;
    }

    setCurrentStep(STEPS.PROCESSING);
    setError(null);
    setClassificationResult(null);

    const formData = new FormData();
    formData.append('file', file);

    // AÑADIMOS REINTENTOS CON BACKOFF EXPONENCIAL
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const response = await fetch(RENDER_API_URL, {
                method: 'POST',
                // ENVIAMOS EL TOKEN EN EL HEADER
                headers: {
                    'Authorization': `Bearer ${token}`, 
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setClassificationResult(data);
                setCurrentStep(STEPS.RESULT);
                return; // Éxito, salimos del bucle
            } else if (response.status === 401) {
                // 401: Manejar error de autenticación
                setError('Error de autenticación: Por favor, cierra sesión e intenta iniciarla de nuevo.');
                setCurrentStep(STEPS.UPLOAD);
                logout();
                return;
            } else {
                // 🚨 CORRECCIÓN CLAVE: Manejo robusto de errores de respuesta
                let errorMessage = `Error del servidor: ${response.status} (${response.statusText})`;
                try {
                    // Intentamos leer el JSON del cuerpo del error
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch (jsonError) {
                    // Si falla, el cuerpo no es JSON (ej. un error 504 de Render), 
                    // simplemente usamos el código de estado. Esto evita el crash.
                }
                
                // Lanzamos el error capturado para que el bloque catch externo lo maneje
                throw new Error(errorMessage);
            }
        } catch (err) {
            console.error('Error de clasificación (intento '+ (attempt + 1) +'):', err.message);
            attempt++;
            
            if (attempt >= maxRetries) {
                // Falla después del máximo de reintentos
                setError(`Clasificación fallida después de ${maxRetries} intentos. Revisa la consola para más detalles.`);
                setCurrentStep(STEPS.UPLOAD);
                break; // Salimos del bucle
            }
            
            // Espera con backoff exponencial: 1s, 2s, 4s
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
  }, [file, isLoggedIn, token, logout]);

  const handleReset = useCallback(() => {
    // Revocar la URL del blob para liberar memoria
    if(previewUrl) URL.revokeObjectURL(previewUrl); 
    setFile(null);
    setPreviewUrl('');
    setClassificationResult(null);
    setCurrentStep(STEPS.UPLOAD);
    setError(null);
  }, [previewUrl]);

  // --- Renderizado de Componentes de Paso (sin cambios) ---

  const renderUploadStep = () => (
    <div className="p-8 space-y-6">
      <div 
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 transition duration-300 cursor-pointer"
        onClick={() => document.getElementById('fileInput').click()}
      >
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-8m8-12h8m-8 0a4 4 0 110-8 4 4 0 010 8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="mt-2 text-sm text-gray-600">
          {file ? file.name : 'Haz clic para seleccionar o arrastra una imagen de otoscopia (JPG, PNG)'}
        </p>
        <input 
          id="fileInput" 
          type="file" 
          accept="image/jpeg, image/png" 
          onChange={handleFileChange} 
          className="hidden" 
        />
      </div>

      {previewUrl && (
        <div className="flex justify-center">
          <img 
            src={previewUrl} 
            alt="Vista previa de la imagen cargada" 
            className="rounded-lg shadow-lg max-h-64 max-w-full object-contain"
          />
        </div>
      )}

      {error && (
        <div className="p-4 text-sm font-medium text-red-800 rounded-lg bg-red-50 text-center">
          {error}
        </div>
      )}

      <button
        onClick={handleClassify}
        disabled={!file || !isLoggedIn}
        className={`w-full py-3 px-6 rounded-lg font-bold transition duration-300 shadow-lg 
          ${file && isLoggedIn ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
      >
        {isLoggedIn ? 'Clasificar Imagen' : 'Inicia Sesión para Clasificar'}
      </button>
      
      {file && (
        <button
            onClick={handleReset}
            className="w-full py-2 text-sm text-gray-600 hover:text-red-500 transition duration-200"
        >
            Cancelar / Cargar otra imagen
        </button>
      )}
    </div>
  );

  const renderProcessingStep = () => (
    <div className="p-8 text-center space-y-6">
      <svg className="animate-spin mx-auto h-16 w-16 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-xl font-semibold text-gray-700">Analizando la otoscopia...</p>
      <p className="text-sm text-gray-500">Esto puede tardar unos segundos, estamos ejecutando el modelo IA.</p>
    </div>
  );

  const renderResultStep = () => {
    if (!classificationResult) return null;

    // Encuentra la clase con mayor probabilidad
    const results = classificationResult.result || {};
    const classes = Object.keys(results);
    const topClass = classes.reduce((a, b) => (results[a] > results[b] ? a : b), '');

    // Formatear el porcentaje de la clase principal
    const confidence = results[topClass] ? (results[topClass] * 100).toFixed(2) : '0.00';

    // Función para obtener colores basados en la clase
    const getClassName = (className) => {
        switch(className) {
            case 'Normal': return 'text-green-700 bg-green-100 border-green-300';
            case 'AOE': return 'text-orange-700 bg-orange-100 border-orange-300';
            case 'AOM': return 'text-red-700 bg-red-100 border-red-300';
            default: return 'text-gray-700 bg-gray-100 border-gray-300';
        }
    }
    
    // Función para dar una breve explicación
    const getExplanation = (className) => {
        switch(className) {
            case 'Normal': return 'No se detectaron signos compatibles con otitis media o externa. El oído parece estar sano.';
            case 'AOE': return 'Alta probabilidad de Otitis Externa. Sugiere inflamación del conducto auditivo externo.';
            case 'AOM': return 'Alta probabilidad de Otitis Media Aguda. Sugiere la presencia de efusión o inflamación del oído medio.';
            default: return 'Clasificación desconocida. Revisa la calidad de la imagen.';
        }
    }

    return (
      <div className="p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Resultado del Diagnóstico IA</h2>
        
        <div className={`p-5 border-l-4 rounded-lg shadow-md ${getClassName(topClass)}`}>
            <p className="text-sm font-semibold">CLASIFICACIÓN PRINCIPAL</p>
            <h3 className="text-4xl font-extrabold mt-1">{topClass}</h3>
            <p className="text-lg font-medium mt-2">Confianza: {confidence}%</p>
            <p className="text-sm mt-3">{getExplanation(topClass)}</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">Detalle de Probabilidades</h4>
            {classes.sort((a, b) => results[b] - results[a]).map(cls => (
                <div key={cls} className="flex items-center space-x-4 mb-2">
                    <span className="w-1/4 text-sm font-medium text-gray-600">{cls}</span>
                    <div className="w-3/4 bg-gray-200 rounded-full h-2.5">
                        <div 
                            className={`h-2.5 rounded-full ${cls === topClass ? 'bg-indigo-500' : 'bg-gray-400'}`} 
                            style={{ width: `${(results[cls] * 100).toFixed(2)}%` }}
                            title={`${(results[cls] * 100).toFixed(2)}%`}
                        ></div>
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-10 text-right">{(results[cls] * 100).toFixed(2)}%</span>
                </div>
            ))}
        </div>
        
        <div className="mt-8">
            <button
                onClick={handleReset}
                className="w-full py-3 px-6 rounded-lg font-bold transition duration-300 shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white"
            >
                Nueva Clasificación
            </button>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case STEPS.UPLOAD:
        return renderUploadStep();
      case STEPS.PROCESSING:
        return renderProcessingStep();
      case STEPS.RESULT:
        return renderResultStep();
      default:
        return <p>Paso desconocido.</p>;
    }
  };

  const getStepIndicator = () => {
    const stepsOrder = [STEPS.UPLOAD, STEPS.PROCESSING, STEPS.RESULT];
    const stepLabels = {
        [STEPS.UPLOAD]: '1. Cargar Imagen',
        [STEPS.PROCESSING]: '2. Analizando',
        [STEPS.RESULT]: '3. Resultados'
    };

    return (
        <div className="flex justify-between w-full max-w-lg mb-8">
            {stepsOrder.map((step, index) => (
                <div key={step} className="flex flex-col items-center">
                    <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition duration-300 
                            ${currentStep === step ? 'bg-indigo-600 shadow-xl' : 
                              stepsOrder.indexOf(currentStep) > index ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                        {index + 1}
                    </div>
                    <p className={`mt-2 text-sm ${currentStep === step ? 'text-indigo-600 font-semibold' : 'text-gray-500'}`}>
                        {stepLabels[step]}
                    </p>
                </div>
            ))}
        </div>
    );
  };

  // --- Renderizado Principal del App ---
  if (!isLoggedIn) {
    // Si no está logeado, muestra el formulario de autenticación
    return <AuthForm login={login} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Título / Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-extrabold text-gray-900">
                👂 Oido IA Match
              </h1>
            </div>
            {/* Botón de Logout que llama a la función corregida */}
            <button
              onClick={logout}
              className="text-sm px-4 py-2 bg-red-500 text-white font-medium rounded-lg shadow-md hover:bg-red-600 transition duration-200"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="w-full max-w-3xl mx-auto p-4 flex flex-col items-center">
        <p className="text-center text-gray-600 mb-8 mt-4">Herramienta de apoyo al diagnóstico rápido para la detección de otitis (media y externa).</p>

        {getStepIndicator()}

        <div className="bg-white rounded-2xl shadow-2xl transition-all duration-500 ease-in-out w-full">
          {renderCurrentStep()}
        </div>
      </main>

      <footer className="mt-8 text-sm text-gray-500 text-center w-full pb-4">
        Desarrollado con React y Tailwind CSS
      </footer>
    </div>
  );
};

// Se exporta el componente principal para ser usado en index.jsx
export default App;
```eof
