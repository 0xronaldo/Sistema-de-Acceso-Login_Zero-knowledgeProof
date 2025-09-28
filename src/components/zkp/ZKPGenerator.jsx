/**
 * Componente ZKPGenerator - Generador educativo de pruebas ZKP
 * Muestra el proceso paso a paso de generación de ZKP
 */

import React, { useState } from 'react';
import Button from '../ui/Button';
import Modal, { ZKPModal } from '../ui/Modal';
import useZKP from '../../hooks/useZKP';
import { EDUCATIONAL_CONTENT } from '../../utils/constants';

const ZKPGenerator = ({
  identity,
  claim,
  verificationRequest,
  onProofGenerated,
  showEducationalContent = true,
  className = ''
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const zkp = useZKP();

  const handleGenerateProof = async () => {
    if (!identity || !claim) {
      alert('Se requiere una identidad y claim para generar la prueba ZKP');
      return;
    }

    try {
      setShowModal(true);
      const proof = await zkp.generateProof(identity, claim, verificationRequest);
      
      if (onProofGenerated) {
        onProofGenerated(proof);
      }

      // Cerrar modal después de un momento para mostrar el resultado
      setTimeout(() => {
        setShowModal(false);
      }, 2000);

    } catch (error) {
      console.error('Error generando prueba ZKP:', error);
      // El modal se mantiene abierto para mostrar el error
    }
  };

  const handleCloseModal = () => {
    if (!zkp.isProcessing) {
      setShowModal(false);
      zkp.clearState();
    }
  };

  return (
    <div className={`zkp-card ${className}`}>
      {/* Header */}
      <div className="zkp-generator-header">
        <div className="zkp-generator-title-section">
          <LockIcon className="zkp-generator-icon" />
          <h3 className="zkp-generator-title">
            Generador de Pruebas ZKP
          </h3>
        </div>

        {showEducationalContent && (
          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            className="zkp-generator-info-button"
          >
            <InfoIcon className="zkp-generator-info-icon" />
          </button>
        )}
      </div>

      {/* Status */}
      <div className="zkp-generator-status">
        <div className="zkp-generator-status-item">
          <StatusIcon 
            status={identity ? 'success' : 'pending'} 
            className="zkp-generator-status-icon" 
          />
          <span className={`zkp-generator-status-text ${identity ? 'zkp-generator-status-success' : 'zkp-generator-status-pending'}`}>
            Identidad ZKP: {identity ? '✓ Disponible' : '⏳ Pendiente'}
          </span>
        </div>

        <div className="zkp-generator-status-item">
          <StatusIcon 
            status={claim ? 'success' : 'pending'} 
            className="zkp-generator-status-icon" 
          />
          <span className={`zkp-generator-status-text ${claim ? 'zkp-generator-status-success' : 'zkp-generator-status-pending'}`}>
            Claim: {claim ? '✓ Disponible' : '⏳ Pendiente'}
          </span>
        </div>

        <div className="zkp-generator-status-item">
          <StatusIcon 
            status={zkp.hasProof ? 'success' : 'pending'} 
            className="zkp-generator-status-icon" 
          />
          <span className={`zkp-generator-status-text ${zkp.hasProof ? 'zkp-generator-status-success' : 'zkp-generator-status-pending'}`}>
            Prueba ZKP: {zkp.hasProof ? '✓ Generada' : '⏳ Pendiente'}
          </span>
        </div>
      </div>

      {/* Información de entrada */}
      {(identity || claim) && (
        <div className="zkp-generator-input-info">
          <h4 className="zkp-generator-input-title">Información de entrada:</h4>
          
          {identity && (
            <div className="zkp-generator-input-item">
              <span className="zkp-generator-input-label">DID:</span> {identity.did.substring(0, 40)}...
            </div>
          )}
          
          {claim && (
            <div className="zkp-generator-input-item">
              <span className="zkp-generator-input-label">Claim ID:</span> {claim.id.substring(0, 20)}...
              <br />
              <span className="zkp-generator-input-label">Tipo:</span> {claim.type}
            </div>
          )}
        </div>
      )}

      {/* Información de la prueba generada */}
      {zkp.hasProof && (
        <div className="zkp-generator-proof-card">
          <h4 className="zkp-generator-proof-title">Prueba ZKP Generada</h4>
          <div className="zkp-generator-proof-details">
            <div className="zkp-generator-proof-item">
              <span className="zkp-generator-proof-label">ID:</span> {zkp.proof.id.substring(0, 20)}...
            </div>
            <div className="zkp-generator-proof-item">
              <span className="zkp-generator-proof-label">Circuito:</span> {zkp.proof.circuitId}
            </div>
            <div className="zkp-generator-proof-item">
              <span className="zkp-generator-proof-label">Signals:</span> {zkp.proof.publicSignals.length} señales públicas
            </div>
            <div className="zkp-generator-proof-item">
              <span className="zkp-generator-proof-label">Timestamp:</span> {new Date(zkp.proof.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {zkp.hasError && (
        <div className="zkp-generator-error-card">
          <h4 className="zkp-generator-error-title">Error</h4>
          <p className="zkp-generator-error-message">{zkp.error}</p>
        </div>
      )}

      {/* Botón de acción */}
      <div className="zkp-generator-actions">
        <Button
          variant="success"
          onClick={handleGenerateProof}
          disabled={!identity || !claim || zkp.isProcessing}
          isLoading={zkp.isGenerating}
          icon={LockIcon}
          className="btn-flex"
        >
          {zkp.isGenerating 
            ? 'Generando Prueba ZKP...' 
            : zkp.hasProof 
              ? 'Regenerar Prueba ZKP'
              : 'Generar Prueba ZKP'
          }
        </Button>

        {zkp.hasProof && (
          <Button
            variant="secondary"
            onClick={() => zkp.clearState()}
            className="zkp-generator-clear-button"
          >
            <TrashIcon className="zkp-generator-clear-icon" />
          </Button>
        )}
      </div>

      {/* Modal de proceso */}
      <ZKPModal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Generando Prueba Zero Knowledge"
        currentStep={zkp.currentStep}
        progress={zkp.progress}
        logs={zkp.logs}
        error={zkp.error}
        isProcessing={zkp.isGenerating}
      />

      {/* Modal educativo */}
      {showEducationalContent && (
        <Modal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          title="¿Qué es una Prueba Zero Knowledge?"
          size="lg"
        >
          <div className="space-y-4">
            <div className="zkp-generator-edu-highlight">
              <p className="zkp-generator-edu-text">
                {EDUCATIONAL_CONTENT.ZKP_EXPLANATION.content}
              </p>
            </div>

            <div className="zkp-generator-edu-process">
              <h4 className="zkp-generator-edu-process-title">Proceso de Generación:</h4>
              <ol className="zkp-generator-edu-process-list">
                <li>Se toma la identidad ZKP (privada) y el claim (certificado)</li>
                <li>Se ejecuta el circuito criptográfico correspondiente</li>
                <li>Se genera un "witness" que contiene toda la información</li>
                <li>Se calcula la prueba usando algoritmos de ZK-SNARKs</li>
                <li>El resultado es una prueba que demuestra conocimiento sin revelar secretos</li>
              </ol>
            </div>

            <div className="zkp-generator-edu-warning">
              <p className="zkp-generator-edu-warning-text">
                <strong>Importante:</strong> En un entorno de producción, este proceso sería 
                mucho más complejo y computacionalmente intensivo. Esta es una simulación educativa.
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
const LockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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

export default ZKPGenerator;