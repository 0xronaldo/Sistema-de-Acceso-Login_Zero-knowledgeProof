/**
 * Componente de prueba para verificar la conexión con el backend ZKP
 */

import React, { useState, useEffect } from 'react';
import backendZKPService from '../services/backendZKPService';

const BackendConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [backendStatus, setBackendStatus] = useState(null);
  const [issuerStatus, setIssuerStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      setConnectionStatus('checking');
      setError(null);

      console.log('🔍 Verificando conexión con backend...');
      
      // Probar conexión básica con el backend
      const response = await fetch('http://localhost:5000/health');
      const healthData = await response.json();
      
      console.log('✅ Backend health check:', healthData);

      // Probar endpoint de estado ZKP
      const statusData = await backendZKPService.getStatus();
      
      console.log('✅ Backend ZKP status:', statusData);

      setBackendStatus(healthData);
      setIssuerStatus(statusData);
      setConnectionStatus('connected');

    } catch (error) {
      console.error('❌ Error conectando con backend:', error);
      setError(error.message);
      setConnectionStatus('error');
    }
  };

  const testCredentialCreation = async () => {
    try {
      setError(null);
      
      const testCredential = {
        did: 'did:example:test123',
        schemaId: 'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/kyc-v4.json',
        credentialSubject: {
          '@type': 'KYCAgeCredential',
          credentialSubject: {
            id: 'did:example:test123',
            birthday: 19900101,
            documentType: 99
          }
        }
      };

      console.log('🧪 Probando creación de credencial...', testCredential);
      
      const result = await backendZKPService.createCredential(testCredential);
      
      console.log('✅ Credencial creada:', result);
      alert('✅ Credencial de prueba creada exitosamente!');

    } catch (error) {
      console.error('❌ Error creando credencial de prueba:', error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'checking': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢 Conectado';
      case 'error': return '🔴 Error de conexión';
      case 'checking': return '🟡 Verificando...';
      default: return '⚪ Desconocido';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Estado de Conexión con Backend
        </h3>
        <button
          onClick={checkBackendConnection}
          className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
        >
          Refrescar
        </button>
      </div>

      {/* Estado general */}
      <div className="mb-6">
        <div className={`text-lg font-semibold ${getConnectionStatusColor()}`}>
          {getConnectionStatusText()}
        </div>
      </div>

      {/* Información del backend */}
      {backendStatus && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
          <h4 className="font-medium text-green-800 mb-2">Backend Status</h4>
          <div className="text-sm text-green-700">
            <div>Status: {backendStatus.status}</div>
            <div>Mensaje: {backendStatus.message}</div>
          </div>
        </div>
      )}

      {/* Información del issuer node */}
      {issuerStatus && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-medium text-blue-800 mb-2">Issuer Node Status</h4>
          <div className="text-sm text-blue-700">
            <div>Success: {issuerStatus.success ? '✅' : '❌'}</div>
            <div>Mensaje: {issuerStatus.message}</div>
            {issuerStatus.data && (
              <div className="mt-2">
                <pre className="text-xs bg-blue-100 p-2 rounded">
                  {JSON.stringify(issuerStatus.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <h4 className="font-medium text-red-800 mb-2">Error</h4>
          <div className="text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* URLs importantes */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
        <h4 className="font-medium text-gray-800 mb-2">URLs del Sistema</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>
            <strong>Backend:</strong>{' '}
            <a 
              href="http://localhost:5000/health" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              http://localhost:5000/health
            </a>
          </div>
          <div>
            <strong>Issuer Node API:</strong>{' '}
            <a 
              href="http://localhost:3001/status" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              http://localhost:3001/status
            </a>
          </div>
          <div>
            <strong>Issuer Node UI:</strong>{' '}
            <a 
              href="http://localhost:8088" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              http://localhost:8088
            </a>
          </div>
        </div>
      </div>

      {/* Botones de prueba */}
      <div className="flex space-x-3">
        <button
          onClick={testCredentialCreation}
          disabled={connectionStatus !== 'connected'}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm"
        >
          🧪 Probar Creación de Credencial
        </button>
        
        <button
          onClick={() => window.open('http://localhost:8088', '_blank')}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm"
        >
          🎛️ Abrir Issuer Node UI
        </button>
      </div>

      {/* Información de configuración */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-800 mb-2">Configuración Actual</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Red:</strong> Polygon Amoy (Chain ID: 80002)</div>
          <div><strong>RPC:</strong> https://rpc-amoy.polygon.technology/</div>
          <div><strong>State Contract:</strong> 0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124</div>
          <div><strong>Backend Port:</strong> 5000</div>
          <div><strong>Issuer API Port:</strong> 3001</div>
          <div><strong>Issuer UI Port:</strong> 8088</div>
        </div>
      </div>
    </div>
  );
};

export default BackendConnectionTest;