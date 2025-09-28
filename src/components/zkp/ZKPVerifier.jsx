/**
 * Componente ZKPVerifier - Verificador educativo de pruebas ZKP
 * Muestra el proceso paso a paso de verificación de ZKP
 */

import React, { useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import useZKP from '../../hooks/useZKP';
import { EDUCATIONAL_CONTENT } from '../../utils/constants';

const ZKPVerifier = ({
  proof,
  verificationRequest,
  onVerificationComplete,
  showEducationalContent = true,
  className = ''
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const zkp = useZKP();

  const handleVerifyProof = async () => {
    if (!proof) {
      alert('Se requiere una prueba ZKP para verificar');
      return;
    }

    try {
      setShowModal(true);
      const isValid = await zkp.verifyProof(proof, verificationRequest);
      
      if (onVerificationComplete) {
        onVerificationComplete(isValid, zkp.verificationResult);
      }

      // Cerrar modal después de un momento para mostrar el resultado
      setTimeout(() => {
        setShowModal(false);
      }, 2000);

    } catch (error) {
      console.error('Error verificando prueba ZKP:', error);
      // El modal se mantiene abierto para mostrar el error
    }
  };

  const handleCloseModal = () => {
    if (!zkp.isProcessing) {
      setShowModal(false);
    }
  };

  const getVerificationStatusColor = () => {
    if (!zkp.hasVerificationResult) return 'text-gray-500';
    return zkp.verificationResult.isValid ? 'text-zkp-600' : 'text-red-600';
  };

  const getVerificationStatusIcon = () => {
    if (!zkp.hasVerificationResult) return <ClockIcon className="h-5 w-5 text-gray-400" />;
    return zkp.verificationResult.isValid 
      ? <CheckCircleIcon className="h-5 w-5 text-zkp-600" />
      : <XCircleIcon className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className={`zkp-card ${className}`}>
      {/* Header */}
      <div className="zkp-verifier-header">
        <div className="zkp-verifier-title-section">
          <ShieldCheckIcon className="zkp-verifier-icon" />
          <h3 className="zkp-verifier-title">
            Verificador de Pruebas ZKP
          </h3>
        </div>

        {showEducationalContent && (
          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            className="zkp-verifier-info-button"
          >
            <InfoIcon className="zkp-verifier-info-icon" />
          </button>
        )}
      </div>

      {/* Status */}
      <div className="zkp-verifier-status">
        <div className="zkp-verifier-status-item">
          <StatusIcon 
            status={proof ? 'success' : 'pending'} 
            className="zkp-verifier-status-icon" 
          />
          <span className={`zkp-verifier-status-text ${proof ? 'zkp-verifier-status-success' : 'zkp-verifier-status-pending'}`}>
            Prueba ZKP: {proof ? '✓ Disponible' : '⏳ Pendiente'}
          </span>
        </div>

        <div className="zkp-verifier-status-item">
          <StatusIcon 
            status={!zkp.hasVerificationResult ? 'pending' : zkp.verificationResult.isValid ? 'success' : 'error'}
            className="zkp-verifier-status-icon" 
          />
          <span className={`zkp-verifier-status-text ${
            !zkp.hasVerificationResult
              ? 'zkp-verifier-status-pending'
              : zkp.verificationResult.isValid
                ? 'zkp-verifier-status-success'
                : 'zkp-verifier-status-error'
          }`}>
            Verificación: {
              !zkp.hasVerificationResult
                ? '⏳ Pendiente'
                : zkp.verificationResult.isValid
                  ? '✓ Válida'
                  : '✗ Inválida'
            }
          </span>
        </div>
      </div>      {/* Información de la prueba */}
      {proof && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Información de la prueba:</h4>
          
          <div className="text-xs font-mono text-gray-600 space-y-1">
            <div><span className="font-semibold">ID:</span> {proof.id.substring(0, 40)}...</div>
            <div><span className="font-semibold">Tipo:</span> {proof.type}</div>
            <div><span className="font-semibold">Circuito:</span> {proof.circuitId}</div>
            <div><span className="font-semibold">Signals:</span> {proof.publicSignals.length} señales públicas</div>
            <div><span className="font-semibold">Timestamp:</span> {new Date(proof.timestamp).toLocaleString()}</div>
          </div>

          {/* Mostrar algunas señales públicas */}
          <div className="mt-3">
            <h5 className="text-xs font-medium text-gray-700 mb-1">Señales Públicas (muestra):</h5>
            <div className="bg-white rounded border p-2 max-h-20 overflow-y-auto">
              {proof.publicSignals.slice(0, 3).map((signal, index) => (
                <div key={index} className="text-xs font-mono text-gray-500">
                  [{index}]: {signal.substring(0, 30)}...
                </div>
              ))}
              {proof.publicSignals.length > 3 && (
                <div className="text-xs text-gray-400 italic">
                  ... y {proof.publicSignals.length - 3} más
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resultado de verificación */}
      {zkp.hasVerificationResult && (
        <div className={`border rounded-lg p-4 mb-6 ${
          zkp.verificationResult.isValid 
            ? 'bg-zkp-50 border-zkp-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {zkp.verificationResult.isValid ? (
              <CheckCircleIcon className="h-5 w-5 text-zkp-600" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-600" />
            )}
            <h4 className={`text-sm font-medium ${
              zkp.verificationResult.isValid ? 'text-zkp-800' : 'text-red-800'
            }`}>
              {zkp.verificationResult.isValid ? 'Prueba Válida' : 'Prueba Inválida'}
            </h4>
          </div>
          
          <div className="text-xs space-y-1">
            <div className={`${
              zkp.verificationResult.isValid ? 'text-zkp-700' : 'text-red-700'
            }`}>
              <span className="font-semibold">Resultado:</span> {
                zkp.verificationResult.isValid 
                  ? 'La prueba ZKP es criptográficamente válida' 
                  : 'La prueba ZKP no pudo ser verificada'
              }
            </div>
            <div className={`font-mono ${
              zkp.verificationResult.isValid ? 'text-zkp-600' : 'text-red-600'
            }`}>
              <span className="font-semibold">Verificado:</span> {
                new Date(zkp.verificationResult.timestamp).toLocaleString()
              }
            </div>
            {zkp.verificationResult.error && (
              <div className="text-red-600">
                <span className="font-semibold">Error:</span> {zkp.verificationResult.error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {zkp.hasError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-red-800 mb-1">Error</h4>
          <p className="text-sm text-red-700">{zkp.error}</p>
        </div>
      )}

      {/* Botón de acción */}
      <div className="flex space-x-2">
        <Button
          variant="primary"
          onClick={handleVerifyProof}
          disabled={!proof || zkp.isProcessing}
          isLoading={zkp.isVerifying}
          icon={ShieldCheckIcon}
          className="flex-1"
        >
          {zkp.isVerifying 
            ? 'Verificando Prueba...' 
            : zkp.hasVerificationResult 
              ? 'Verificar Nuevamente'
              : 'Verificar Prueba ZKP'
          }
        </Button>

        {zkp.hasVerificationResult && (
          <Button
            variant="secondary"
            onClick={() => zkp.clearState()}
            className="px-3"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Modal de proceso */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Verificando Prueba Zero Knowledge"
        size="lg"
        closeOnOverlayClick={!zkp.isProcessing}
        closeOnEsc={!zkp.isProcessing}
      >
        <div className="space-y-4">
          {/* Barra de progreso */}
          {zkp.isVerifying && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{zkp.currentStep}</span>
                <span className="text-gray-600">{Math.round(zkp.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${zkp.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Logs */}
          {zkp.logs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Proceso de verificación:</h4>
              <div className="bg-gray-50 rounded-md p-3 max-h-40 overflow-y-auto">
                <div className="space-y-1">
                  {zkp.logs.slice(-5).map((log) => (
                    <div key={log.id} className="flex items-start space-x-2 text-xs">
                      <span className="text-gray-400 font-mono whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`
                        font-medium
                        ${log.type === 'success' ? 'text-zkp-600' : ''}
                        ${log.type === 'error' ? 'text-red-600' : ''}
                        ${log.type === 'warning' ? 'text-yellow-600' : ''}
                        ${log.type === 'info' ? 'text-blue-600' : ''}
                      `}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resultado */}
          {zkp.hasVerificationResult && (
            <div className={`p-4 rounded-lg ${
              zkp.verificationResult.isValid 
                ? 'bg-zkp-50 border border-zkp-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {zkp.verificationResult.isValid ? (
                  <CheckCircleIcon className="h-6 w-6 text-zkp-600" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-red-600" />
                )}
                <span className={`font-medium ${
                  zkp.verificationResult.isValid ? 'text-zkp-800' : 'text-red-800'
                }`}>
                  {zkp.verificationResult.isValid ? 'Verificación Exitosa' : 'Verificación Fallida'}
                </span>
              </div>
            </div>
          )}

          {/* Error */}
          {zkp.hasError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <XCircleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error en la verificación
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{zkp.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            {!zkp.isProcessing && (
              <Button
                variant="secondary"
                onClick={handleCloseModal}
              >
                Cerrar
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal educativo */}
      {showEducationalContent && (
        <Modal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          title="¿Cómo se verifica una Prueba ZKP?"
          size="lg"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-sm text-blue-800">
                La verificación de una prueba ZKP valida que quien la generó conoce un secreto 
                sin que el verificador necesite conocer ese secreto.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Proceso de Verificación:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Se valida la estructura de la prueba y las señales públicas</li>
                <li>Se verifica que el circuito utilizado sea el correcto</li>
                <li>Se ejecutan las operaciones criptográficas de verificación</li>
                <li>Se comprueba que todos los parámetros coincidan</li>
                <li>Se confirma que la prueba es válida matemáticamente</li>
              </ol>
            </div>

            <div className="bg-zkp-50 border-l-4 border-zkp-400 p-4">
              <p className="text-sm text-zkp-800">
                <strong>Ventaja clave:</strong> La verificación es rápida (milisegundos) 
                comparada con la generación de la prueba, lo que hace viable su uso en aplicaciones reales.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Componente de estado/icono
const StatusIcon = ({ status, className }) => {
  if (status === 'success') {
    return <CheckCircleIcon className={`text-zkp-600 ${className}`} />;
  }
  if (status === 'error') {
    return <XCircleIcon className={`text-red-500 ${className}`} />;
  }
  return <ClockIcon className={`text-gray-400 ${className}`} />;
};

// Iconos
const ShieldCheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const InfoIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const XCircleIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default ZKPVerifier;