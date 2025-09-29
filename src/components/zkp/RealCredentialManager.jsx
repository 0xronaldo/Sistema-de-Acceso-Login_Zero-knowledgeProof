/**
 * Componente de gestión de credenciales ZKP integrado con backend
 * Muestra las credenciales del usuario autenticado y permite realizar acciones
 */

import React, { useState, useEffect } from 'react';
import backendZKPService from '../../services/backendZKPService';

const RealCredentialManager = ({ user, session }) => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(null);

  useEffect(() => {
    if (user && user.zkpDID) {
      loadCredentials();
    }
  }, [user]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📂 [RealCredentialManager] Cargando credenciales para:', user.zkpDID);
      
      const result = await backendZKPService.getClaims(user.zkpDID);
      
      if (result.success) {
        setCredentials(result.data || []);
        console.log('✅ [RealCredentialManager] Credenciales cargadas:', result.data);
      } else {
        throw new Error(result.message || 'Error cargando credenciales');
      }

    } catch (error) {
      console.error('❌ [RealCredentialManager] Error cargando credenciales:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const publishState = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📡 [RealCredentialManager] Publicando estado para:', user.zkpDID);
      
      const result = await backendZKPService.publishState(user.zkpDID);
      
      if (result.success) {
        alert('✅ Estado publicado exitosamente en blockchain!');
        console.log('✅ [RealCredentialManager] Estado publicado:', result.data);
      } else {
        throw new Error(result.message || 'Error publicando estado');
      }

    } catch (error) {
      console.error('❌ [RealCredentialManager] Error publicando estado:', error);
      setError(error.message);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showCredentialQR = async (claimId) => {
    try {
      console.log('📱 [RealCredentialManager] Obteniendo QR para claim:', claimId);
      
      const result = await backendZKPService.getClaimQR(user.zkpDID, claimId);
      
      if (result.success) {
        setShowQR(result.data);
      } else {
        alert(`❌ Error obteniendo QR: ${result.message}`);
      }

    } catch (error) {
      console.error('❌ [RealCredentialManager] Error obteniendo QR:', error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  if (!user || !user.zkpDID) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          No hay credenciales disponibles. Inicia sesión para ver tus credenciales ZKP.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Mis Credenciales ZKP
          </h3>
          <p className="text-sm text-gray-600">
            Gestiona tus credenciales de Zero Knowledge Proof
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={loadCredentials}
            disabled={loading}
            className="text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded"
          >
            🔄 Refrescar
          </button>
          
          <button
            onClick={publishState}
            disabled={loading}
            className="text-sm bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-3 py-1 rounded"
          >
            📡 Publicar Estado
          </button>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
        <h4 className="font-medium text-gray-800 mb-2">Información de Identidad</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div><strong>DID:</strong> {user.zkpDID}</div>
          <div><strong>Método:</strong> {user.method}</div>
          {user.name && <div><strong>Nombre:</strong> {user.name}</div>}
          {user.email && <div><strong>Email:</strong> {user.email}</div>}
          {user.address && <div><strong>Wallet:</strong> {user.formattedAddress}</div>}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">Error</h4>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Estado de carga */}
      {loading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span className="ml-2 text-blue-800">Procesando...</span>
          </div>
        </div>
      )}

      {/* Lista de credenciales */}
      <div className="space-y-4">
        {credentials.length > 0 ? (
          credentials.map((credential, index) => (
            <div key={credential.id || index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {credential.credentialStatus || 'Activa'}
                    </span>
                    <span className="text-sm text-gray-500">
                      ID: {credential.id || 'N/A'}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">
                    {credential.type || 'Credencial ZKP'}
                  </h4>
                  
                  {credential.credentialSubject && (
                    <div className="text-sm text-gray-600 space-y-1">
                      {credential.credentialSubject.id && (
                        <div><strong>Subject ID:</strong> {credential.credentialSubject.id}</div>
                      )}
                      {credential.credentialSubject.birthday && (
                        <div><strong>Birthday:</strong> {credential.credentialSubject.birthday}</div>
                      )}
                      {credential.credentialSubject.documentType && (
                        <div><strong>Document Type:</strong> {credential.credentialSubject.documentType}</div>
                      )}
                      {credential.credentialSubject.walletAddress && (
                        <div><strong>Wallet:</strong> {credential.credentialSubject.walletAddress}</div>
                      )}
                      {credential.credentialSubject.name && (
                        <div><strong>Name:</strong> {credential.credentialSubject.name}</div>
                      )}
                      {credential.credentialSubject.email && (
                        <div><strong>Email:</strong> {credential.credentialSubject.email}</div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Creado: {credential.createdAt ? new Date(credential.createdAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
                
                <div className="ml-4 flex space-x-2">
                  {credential.id && (
                    <button
                      onClick={() => showCredentialQR(credential.id)}
                      className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded"
                    >
                      📱 QR
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          !loading && (
            <div className="text-center py-8">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay credenciales
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Aún no tienes credenciales ZKP. Se crean automáticamente al autenticarte.
              </p>
              <button
                onClick={loadCredentials}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
              >
                Verificar Credenciales
              </button>
            </div>
          )
        )}
      </div>

      {/* Modal para mostrar QR */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Código QR de Credencial</h3>
              <button
                onClick={() => setShowQR(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="text-center">
              {showQR.qrCode ? (
                <div>
                  <img 
                    src={`data:image/png;base64,${showQR.qrCode}`} 
                    alt="Credential QR Code" 
                    className="mx-auto mb-4 border"
                  />
                  <p className="text-sm text-gray-600">
                    Escanea este código QR con tu wallet para recibir la credencial
                  </p>
                </div>
              ) : (
                <div>
                  <div className="w-48 h-48 bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-500">QR no disponible</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Código QR no disponible para esta credencial
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowQR(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealCredentialManager;