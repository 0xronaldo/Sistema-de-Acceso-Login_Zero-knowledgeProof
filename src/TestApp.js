import React from 'react';
import './App.css';

// Componente de prueba simple sin RainbowKit para diagnosticar el problema
function TestApp() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🧪 Test App - ZKP Login</h1>
        <p>Probando la aplicación sin RainbowKit para diagnosticar errores</p>
        
        <div style={{ 
          background: '#1a1a1a', 
          padding: '20px', 
          borderRadius: '8px', 
          marginTop: '20px',
          textAlign: 'left'
        }}>
          <h3>Diagnóstico:</h3>
          <ul>
            <li>✅ Polyfills cargados</li>
            <li>✅ Buffer disponible: {typeof Buffer !== 'undefined' ? 'Sí' : 'No'}</li>
            <li>✅ Process disponible: {typeof process !== 'undefined' ? 'Sí' : 'No'}</li>
            <li>✅ Window.ethereum: {typeof window.ethereum !== 'undefined' ? 'Sí' : 'No'}</li>
            <li>✅ OpenAPI Mock: {typeof window.__openapiMockClient !== 'undefined' ? 'Sí' : 'No'}</li>
          </ul>
        </div>

        <button 
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
          onClick={() => {
            console.log('🔍 Debug Info:', {
              buffer: typeof Buffer,
              process: typeof process,
              ethereum: typeof window.ethereum,
              openapiMock: typeof window.__openapiMockClient
            });
          }}
        >
          Debug Console
        </button>
      </header>
    </div>
  );
}

export default TestApp;