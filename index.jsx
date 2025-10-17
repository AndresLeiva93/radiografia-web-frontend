import React from 'react';
import ReactDOM from 'react-dom/client';
// Importamos el componente principal 'App' desde el archivo que creamos.
import App from './RadiographyClassifier.jsx';

// El rootElement debe existir en tu index.html (típicamente <div id="root"></div>).
const rootElement = document.getElementById('root');

// Monta y renderiza el componente App.
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
