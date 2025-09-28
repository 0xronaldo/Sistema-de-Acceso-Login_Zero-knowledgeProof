/**
 * Componente CredentialManager - Gestor educativo de credenciales ZKP
 * Muestra y gestiona identidades, claims y credenciales
 */

import React, { useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { EDUCATIONAL_CONTENT, PRIVADO_CONFIG } from '../../utils/constants';

const CredentialManager = ({
  identity,
  claims = [],
  onClaimGenerated,
  showEducationalContent = true,
  className = ''
}) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [expandedClaim, setExpandedClaim] = useState(null);

  const toggleClaimExpanded = (claimId) => {
    setExpandedClaim(expandedClaim === claimId ? null : claimId);
  };

  const formatClaimData = (claimData) => {
    return Object.entries(claimData).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
    }));
  };

  const getClaimTypeDescription = (type) => {
    const descriptions = {
      [PRIVADO_CONFIG.defaultClaims.WALLET_OWNER]: 'Prueba de propiedad de wallet',
      [PRIVADO_CONFIG.defaultClaims.USER_NAME]: 'Identidad de usuario registrado',
      [PRIVADO_CONFIG.defaultClaims.REGISTRATION_DATE]: 'Fecha de registro verificada',
      'default': 'Claim personalizado'
    };
    return descriptions[type] || descriptions.default;
  };

  return (
    <div className={`zkp-card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CredentialIcon className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Gestor de Credenciales
          </h3>
        </div>

        {showEducationalContent && (
          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            className="text-blue-600 hover:text-blue-700 focus:outline-none"
          >
            <InfoIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Identidad ZKP */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <UserIcon className="h-4 w-4 mr-1" />
          Identidad ZKP
        </h4>
        
        {identity ? (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {identity.userInfo.method === 'wallet' ? 'Wallet' : 'Tradicional'}
                </span>
                <CheckCircleIcon className="h-4 w-4 text-purple-600" />
              </div>
              
              <div className="text-xs font-mono text-purple-700 space-y-1">
                <div><span className="font-semibold">DID:</span> {identity.did}</div>
                <div><span className="font-semibold">Método:</span> {identity.userInfo.method}</div>
                <div><span className="font-semibold">Creado:</span> {new Date(identity.timestamp).toLocaleString()}</div>
              </div>

              {/* Información específica del método */}
              <div className="mt-3 pt-3 border-t border-purple-200">
                {identity.userInfo.method === 'wallet' ? (
                  <div className="text-xs text-purple-600">
                    <div><span className="font-semibold">Wallet:</span> {identity.userInfo.address}</div>
                    <div><span className="font-semibold">Red:</span> {identity.userInfo.network}</div>
                  </div>
                ) : (
                  <div className="text-xs text-purple-600">
                    <div><span className="font-semibold">Email:</span> {identity.userInfo.email}</div>
                    <div><span className="font-semibold">Nombre:</span> {identity.userInfo.name}</div>
                    <div><span className="font-semibold">Registrado:</span> {new Date(identity.userInfo.registeredAt).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <UserIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No hay identidad ZKP generada</p>
          </div>
        )}
      </div>

      {/* Claims */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <DocumentIcon className="h-4 w-4 mr-1" />
            Claims ({claims.length})
          </h4>
        </div>

        {claims.length > 0 ? (
          <div className="space-y-3">
            {claims.map((claim) => (
              <div key={claim.id} className="border border-gray-200 rounded-lg">
                {/* Header del claim */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleClaimExpanded(claim.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {claim.type}
                      </span>
                      <span className="text-sm text-gray-600">
                        {getClaimTypeDescription(claim.type)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">
                        {new Date(claim.issuedAt).toLocaleDateString()}
                      </span>
                      <ChevronDownIcon 
                        className={`h-4 w-4 text-gray-400 transform transition-transform ${
                          expandedClaim === claim.id ? 'rotate-180' : ''
                        }`} 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Contenido expandido */}
                {expandedClaim === claim.id && (
                  <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
                    <div className="space-y-3 pt-3">
                      {/* Información básica */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="font-semibold text-gray-700">ID:</span>
                          <div className="font-mono text-gray-600 break-all">{claim.id}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Emisor:</span>
                          <div className="font-mono text-gray-600 break-all">{claim.issuer}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Sujeto:</span>
                          <div className="font-mono text-gray-600 break-all">{claim.subject}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Expira:</span>
                          <div className="text-gray-600">{new Date(claim.expiresAt).toLocaleDateString()}</div>
                        </div>
                      </div>

                      {/* Datos del claim */}
                      <div>
                        <span className="font-semibold text-gray-700 text-xs">Datos:</span>
                        <div className="mt-1 bg-white rounded border p-2 max-h-32 overflow-y-auto">
                          {formatClaimData(claim.data).map(({ key, value }) => (
                            <div key={key} className="text-xs font-mono">
                              <span className="text-blue-600">{key}:</span> 
                              <span className="text-gray-600 ml-1">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Proof del claim */}
                      <div>
                        <span className="font-semibold text-gray-700 text-xs">Prueba:</span>
                        <div className="mt-1 bg-white rounded border p-2">
                          <div className="text-xs font-mono space-y-1">
                            <div><span className="text-blue-600">tipo:</span> <span className="text-gray-600">{claim.proof.type}</span></div>
                            <div><span className="text-blue-600">valor:</span> <span className="text-gray-600">{claim.proof.value.substring(0, 40)}...</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <DocumentIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No hay claims generados</p>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Resumen</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-semibold text-purple-600">
              {identity ? '1' : '0'}
            </div>
            <div className="text-xs text-gray-500">Identidad</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-blue-600">
              {claims.length}
            </div>
            <div className="text-xs text-gray-500">Claims</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-zkp-600">
              {claims.filter(c => new Date(c.expiresAt) > new Date()).length}
            </div>
            <div className="text-xs text-gray-500">Válidos</div>
          </div>
        </div>
      </div>

      {/* Modal educativo */}
      {showEducationalContent && (
        <Modal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          title="¿Qué son las Credenciales ZKP?"
          size="lg"
        >
          <div className="space-y-4">
            <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
              <p className="text-sm text-purple-800">
                Las credenciales ZKP están compuestas por una identidad única y claims 
                (afirmaciones verificables) que pueden probarse sin revelar información sensible.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Componentes:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li><strong>Identidad:</strong> Un DID único generado criptográficamente</li>
                <li><strong>Claims:</strong> Afirmaciones verificables sobre la identidad</li>
                <li><strong>Proofs:</strong> Pruebas criptográficas de los claims</li>
                <li><strong>Verificación:</strong> Validación sin revelar secretos</li>
              </ul>
            </div>

            <div className="bg-zkp-50 border-l-4 border-zkp-400 p-4">
              <p className="text-sm text-zkp-800">
                <strong>Ventaja:</strong> Puedes demostrar que posees ciertas credenciales 
                (como ser mayor de edad) sin revelar tu fecha de nacimiento exacta.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Tipos de Claims:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div><strong>wallet_owner:</strong> Demuestra propiedad de una wallet</div>
                <div><strong>user_name:</strong> Identifica a un usuario registrado</div>
                <div><strong>registration_date:</strong> Verifica antigüedad de registro</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Iconos
const CredentialIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const DocumentIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const InfoIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default CredentialManager;