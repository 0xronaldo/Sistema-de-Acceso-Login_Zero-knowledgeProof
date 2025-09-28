/**
 * Componente Modal reutilizable con overlay y animaciones
 * Soporte para diferentes tamaños y estilos usando CSS puro
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className = '',
  overlayClassName = '',
  ...props
}) => {
  // Manejar tecla Escape
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEsc, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Manejar click en overlay
  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Construir clases CSS para el modal
  const modalClasses = [
    'modal',
    size === 'lg' ? 'modal-lg' : '',
    size === 'xl' ? 'modal-xl' : '',
    className
  ].filter(Boolean).join(' ');

  const modalContent = (
    <div
      className={`modal-overlay ${overlayClassName}`}
      onClick={handleOverlayClick}
    >
      {/* Modal */}
      <div
        className={modalClasses}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && (
              <h3 className="modal-title">
                {title}
              </h3>
            )}
            
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="modal-close"
              >
                <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>
                  Cerrar
                </span>
                <XIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );

  // Usar portal para renderizar el modal en el body
  return createPortal(modalContent, document.body);
};

// Componente ConfirmModal especializado
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmVariant = "danger",
  isLoading = false,
  ...props
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="sm"
    {...props}
  >
    <div className="space-y-4">
      {message && (
        <p className="text-sm" style={{ color: 'var(--gray-600)' }}>
          {message}
        </p>
      )}
      
      <div className="flex space-x-3 justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="btn btn-secondary"
        >
          {cancelText}
        </button>
        
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`btn ${confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
        >
          {isLoading ? (
            <div className="flex items-center">
              <LoadingSpinner className="w-4 h-4 mr-2" />
              Procesando...
            </div>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </div>
  </Modal>
);

// Componente ZKPModal especializado para mostrar procesos ZKP
export const ZKPModal = ({
  isOpen,
  onClose,
  title = "Proceso Zero Knowledge Proof",
  currentStep,
  progress = 0,
  logs = [],
  error,
  isProcessing,
  ...props
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="lg"
    closeOnOverlayClick={!isProcessing}
    closeOnEsc={!isProcessing}
    {...props}
  >
    <div className="space-y-4">
      {/* Barra de progreso */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--gray-600)' }}>{currentStep}</span>
            <span style={{ color: 'var(--gray-600)' }}>{Math.round(progress)}%</span>
          </div>
          <div className="progress-container">
            <div
              className="progress-bar progress-bar-zkp"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          <ExclamationTriangleIcon className="alert-icon" />
          <div>
            <h3 className="text-sm font-medium">
              Error en el proceso ZKP
            </h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium" style={{ color: 'var(--gray-700)' }}>Registro de actividad:</h4>
          <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
            <div className="space-y-1">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-2 text-xs">
                  <span className="font-mono" style={{ color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span 
                    className="font-medium"
                    style={{
                      color: log.type === 'success' ? 'var(--zkp-600)' :
                             log.type === 'error' ? 'var(--red-600)' :
                             log.type === 'warning' ? 'var(--yellow-600)' :
                             log.type === 'info' ? 'var(--blue-600)' : 'var(--gray-600)'
                    }}
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end pt-4 border-t" style={{ borderColor: 'var(--gray-200)' }}>
        {!isProcessing && (
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  </Modal>
);

// Componentes de iconos
const XIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ExclamationTriangleIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const LoadingSpinner = ({ className }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
  </svg>
);

export default Modal;