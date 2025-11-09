import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // ✅ Importa o contexto
import './styles/Form.module.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ Envolve a aplicação */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
