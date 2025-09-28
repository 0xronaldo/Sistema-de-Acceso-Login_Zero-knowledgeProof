// Backup simple del index.js en caso de que RainbowKit siga fallando
import './aggressive-polyfills';
import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';

// Simple App component that doesn't depend on RainbowKit
function SimpleZKPApp() {
  return (
    <div style={{ 
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#0a0a0a',
      color: 'white',
      minHeight: '100vh'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#8b5cf6' }}>ZKP Sistema de Acceso</h1>
        <p>Autenticación Zero Knowledge Proof</p>
      </header>
      
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto',
        backgroundColor: '#1a1a1a',
        padding: '30px',
        borderRadius: '12px',
        border: '1px solid #333'
      }}>
        <h2>Sistema de Autenticación</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>✅ Estado del Sistema:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>✅ Polyfills cargados</li>
            <li>✅ Buffer: {typeof Buffer !== 'undefined' ? 'Disponible' : 'No disponible'}</li>
            <li>✅ Process: {typeof process !== 'undefined' ? 'Disponible' : 'No disponible'}</li>
            <li>✅ Ethereum: {typeof window.ethereum !== 'undefined' ? 'Detectado' : 'No detectado'}</li>
          </ul>
        </div>

        <div style={{ 
          padding: '20px', 
          backgroundColor: '#2a2a2a', 
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <h3>🛠️ Próximos pasos:</h3>
          <p>Una vez que resolvamos los problemas de dependencias con RainbowKit, 
             este sistema incluirá:</p>
          <ul>
            <li>Conexión de wallet con múltiples proveedores</li>
            <li>Autenticación Zero Knowledge Proof</li>
            <li>Registro tradicional con ZKP</li>
            <li>Gestión de identidades descentralizadas</li>
          </ul>
        </div>
        
        <button
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '20px'
          }}
          onClick={() => {
            console.log('🔍 Diagnóstico del sistema:', {
              buffer: typeof Buffer,
              process: typeof process,
              ethereum: typeof window.ethereum,
              userAgent: navigator.userAgent
            });
            alert('Revisa la consola para información de diagnóstico');
          }}
        >
          Ejecutar Diagnóstico
        </button>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SimpleZKPApp />
  </React.StrictMode>
);

reportWebVitals();