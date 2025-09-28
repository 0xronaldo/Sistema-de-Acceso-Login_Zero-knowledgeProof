/**
 * Componente LoginContainer - Contenedor principal de autenticación
 * Orquesta todos los métodos de login y maneja el estado global
 */

import React, { useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import WalletLogin from './WalletLogin';
import TraditionalLogin from './TraditionalLogin';
import RegisterForm from './RegisterForm';
import AuthStatus from './AuthStatus';
import useAuth from '../../hooks/useAuth';
import { EDUCATIONAL_CONTENT } from '../../utils/constants';

const LoginContainer = ({ 
  onAuthSuccess,
  onAuthError,
  showEducationalContent = true,
  className = '' 
}) => {
  const [currentView, setCurrentView] = useState('selector'); // selector, wallet, traditional, register
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [notification, setNotification] = useState(null);

  const auth = useAuth();

  // Mostrar notificación temporal
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Manejar éxito de autenticación
  const handleAuthSuccess = (result) => {
    showNotification(
      `¡Autenticación exitosa con ${result.user.method === 'wallet' ? 'Wallet' : 'credenciales'}!`,
      'success'
    );
    
    if (onAuthSuccess) {
      onAuthSuccess(result);
    }
  };

  // Manejar error de autenticación
  const handleAuthError = (error) => {
    showNotification(`Error: ${error.message}`, 'error');
    
    if (onAuthError) {
      onAuthError(error);
    }
  };

  // Manejar éxito de registro
  const handleRegisterSuccess = (result) => {
    showNotification(
      `Registro exitoso. Bienvenido ${result.user.name}!`,
      'success'
    );
    setCurrentView('traditional');
  };

  // Manejar logout
  const handleLogout = () => {
    showNotification('Sesión cerrada exitosamente', 'info');
    setCurrentView('selector');
  };

  // Si ya está autenticado, mostrar estado
  if (auth.isAuthenticated) {
    return (
      <div className={`auth-container ${className}`}>
        <AuthStatus 
          onLogout={handleLogout}
          showCredentials={true}
        />
        
        {/* Notificación */}
        {notification && (
          <div className={`notification notification-${notification.type}`}>
            {notification.message}
          </div>
        )}
      </div>
    );
  }

  // Vista de selección de método
  const renderMethodSelector = () => (
    <div className="zkp-card">
      {/* Header */}
      <div className="auth-header">
        <div className="auth-icon-container">
          <div className="auth-icon-circle">
            <LockIcon className="auth-icon" />
          </div>
        </div>
        <h1 className="auth-title">
          Zero Knowledge Login
        </h1>
        <p className="auth-subtitle">
          Autentícate de forma segura sin revelar información privada
        </p>
      </div>

      {/* Métodos de autenticación */}
      <div className="auth-methods">
        {/* Wallet Login */}
        <div className="auth-method-card auth-method-wallet">
          <WalletIcon className="auth-method-icon" />
          <h3 className="auth-method-title">
            Conectar Wallet
          </h3>
          <p className="auth-method-description">
            Usa tu wallet (MetaMask, etc.) para generar una identidad ZKP única
          </p>
          <Button
            variant="primary"
            onClick={() => setCurrentView('wallet')}
            className="btn-full-width"
            icon={WalletIcon}
          >
            Continuar con Wallet
          </Button>
        </div>

        {/* Traditional Login */}
        <div className="auth-method-card auth-method-traditional">
          <UserIcon className="auth-method-icon auth-method-icon-zkp" />
          <h3 className="auth-method-title">
            Login Tradicional
          </h3>
          <p className="auth-method-description">
            Usa email y contraseña con verificación ZKP avanzada
          </p>
          <div className="auth-method-buttons">
            <Button
              variant="success"
              onClick={() => setCurrentView('traditional')}
              className="btn-flex"
              icon={LoginIcon}
            >
              Iniciar Sesión
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentView('register')}
              className="btn-flex"
              icon={UserPlusIcon}
            >
              Registrarse
            </Button>
          </div>
        </div>
      </div>

      {/* Información educativa */}
      {showEducationalContent && (
        <div className="educational-info">
          <button
            onClick={() => setShowInfoModal(true)}
            className="educational-button"
          >
            <InfoIcon className="educational-icon" />
            ¿Qué son las Zero Knowledge Proofs?
          </button>
        </div>
      )}
    </div>
  );

  // Renderizar vista actual
  const renderCurrentView = () => {
    switch (currentView) {
      case 'wallet':
        return (
          <WalletLogin
            onAuthSuccess={handleAuthSuccess}
            onAuthError={handleAuthError}
            showEducationalContent={showEducationalContent}
          />
        );

      case 'traditional':
        return (
          <TraditionalLogin
            onLoginSuccess={handleAuthSuccess}
            onLoginError={handleAuthError}
            onSwitchToRegister={() => setCurrentView('register')}
            showEducationalContent={showEducationalContent}
          />
        );

      case 'register':
        return (
          <RegisterForm
            onRegisterSuccess={handleRegisterSuccess}
            onRegisterError={handleAuthError}
            onSwitchToLogin={() => setCurrentView('traditional')}
            showEducationalContent={showEducationalContent}
          />
        );

      default:
        return renderMethodSelector();
    }
  };

  return (
    <div className={`auth-container ${className}`}>
      {/* Botón de regreso */}
      {currentView !== 'selector' && (
        <div className="back-button-container">
          <button
            onClick={() => setCurrentView('selector')}
            disabled={auth.isLoading}
            className="back-button"
          >
            <ArrowLeftIcon className="back-button-icon" />
            Volver a selección
          </button>
        </div>
      )}

      {/* Vista actual */}
      {renderCurrentView()}

      {/* Notificación */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          <div className="notification-content">
            {notification.type === 'success' && <CheckIcon className="notification-icon" />}
            {notification.type === 'error' && <XIcon className="notification-icon" />}
            {notification.type === 'info' && <InfoIcon className="notification-icon" />}
            {notification.message}
          </div>
        </div>
      )}

      {/* Error global */}
      {auth.error && currentView === 'selector' && (
        <div className="global-error">
          <div className="global-error-content">
            <XIcon className="global-error-icon" />
            <div className="global-error-text">
              <h3 className="global-error-title">
                Error del Sistema
              </h3>
              <p className="global-error-message">{auth.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal educativo */}
      {showEducationalContent && (
        <Modal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          title="Zero Knowledge Proofs - Introducción"
          size="lg"
        >
          <div className="educational-content">
            <div className="educational-highlight">
              <p className="educational-highlight-text">
                {EDUCATIONAL_CONTENT.ZKP_EXPLANATION.content}
              </p>
            </div>

            <div className="educational-methods">
              <div className="educational-method-card educational-method-wallet">
                <h4 className="educational-method-title">Autenticación por Wallet</h4>
                <p className="educational-method-description">
                  {EDUCATIONAL_CONTENT.WALLET_AUTH_EXPLANATION.content}
                </p>
                <ul className="educational-method-list">
                  <li>• Conecta tu wallet existente</li>
                  <li>• Generación automática de identidad</li>
                  <li>• Sin registro previo necesario</li>
                </ul>
              </div>

              <div className="educational-method-card educational-method-traditional">
                <h4 className="educational-method-title">Autenticación Tradicional</h4>
                <p className="educational-method-description">
                  {EDUCATIONAL_CONTENT.TRADITIONAL_AUTH_EXPLANATION.content}
                </p>
                <ul className="educational-method-list">
                  <li>• Registro con email/contraseña</li>
                  <li>• Identidad ZKP personalizada</li>
                  <li>• Claims verificables</li>
                </ul>
              </div>
            </div>

            <div className="educational-warning">
              <p className="educational-warning-text">
                <strong>Proyecto Educativo:</strong> Esta es una implementación educativa 
                de ZKP. En producción, se requerirían configuraciones adicionales de 
                seguridad y infraestructura más robusta.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Iconos
const LockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const WalletIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LoginIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

const UserPlusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const InfoIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowLeftIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default LoginContainer;