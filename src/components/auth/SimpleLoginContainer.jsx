/**
 * Componente SimpleLoginContainer - Contenedor de login simplificado
 * Solo maneja wallet login y login tradicional, sin contenido educativo ZKP
 */

import React, { useState } from 'react';
import Button from '../ui/Button';
import SimpleWalletLogin from './SimpleWalletLogin';
import TraditionalLogin from './TraditionalLogin';
import RegisterForm from './RegisterForm';
import AuthStatus from './AuthStatus';
import useAuth from '../../hooks/useAuth';

const SimpleLoginContainer = ({ 
  onAuthSuccess,
  onAuthError,
  className = '' 
}) => {
  const [currentView, setCurrentView] = useState('selector'); // selector, wallet, traditional, register
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
      `¡Autenticación exitosa!`,
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
      `Registro exitoso. ¡Bienvenido!`,
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
      <div className={`simple-auth-container ${className}`}>
        <AuthStatus 
          onLogout={handleLogout}
          showCredentials={false}
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
    <div className="simple-login-card">
      {/* Header */}
      <div className="simple-login-header">
        <div className="simple-login-icon-container">
          <div className="simple-login-icon-circle">
            <LockIcon className="simple-login-icon" />
          </div>
        </div>
        <h1 className="simple-login-title">
          Iniciar Sesión
        </h1>
        <p className="simple-login-subtitle">
          Elige tu método de autenticación preferido
        </p>
      </div>

      {/* Métodos de autenticación */}
      <div className="simple-login-methods">
        {/* Wallet Login */}
        <div className="simple-login-method-card simple-login-method-wallet">
          <WalletIcon className="simple-login-method-icon" />
          <h3 className="simple-login-method-title">
            Conectar Wallet
          </h3>
          <p className="simple-login-method-description">
            Conecta con MetaMask, Coinbase Wallet, WalletConnect y más
          </p>
          <Button
            variant="primary"
            onClick={() => setCurrentView('wallet')}
            className="btn-full-width"
            icon={WalletIcon}
          >
            Conectar Wallet
          </Button>
        </div>

        {/* Traditional Login */}
        <div className="simple-login-method-card simple-login-method-traditional">
          <UserIcon className="simple-login-method-icon" />
          <h3 className="simple-login-method-title">
            Email y Contraseña
          </h3>
          <p className="simple-login-method-description">
            Usa tu cuenta de email para acceder
          </p>
          <div className="simple-login-method-buttons">
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
    </div>
  );

  // Renderizar vista actual
  const renderCurrentView = () => {
    switch (currentView) {
      case 'wallet':
        return (
          <SimpleWalletLogin
            onAuthSuccess={handleAuthSuccess}
            onAuthError={handleAuthError}
          />
        );

      case 'traditional':
        return (
          <TraditionalLogin
            onLoginSuccess={handleAuthSuccess}
            onLoginError={handleAuthError}
            onSwitchToRegister={() => setCurrentView('register')}
            showEducationalContent={false}
          />
        );

      case 'register':
        return (
          <RegisterForm
            onRegisterSuccess={handleRegisterSuccess}
            onRegisterError={handleAuthError}
            onSwitchToLogin={() => setCurrentView('traditional')}
            showEducationalContent={false}
          />
        );

      default:
        return renderMethodSelector();
    }
  };

  return (
    <div className={`simple-auth-container ${className}`}>
      {/* Botón de regreso */}
      {currentView !== 'selector' && (
        <div className="simple-back-button-container">
          <button
            onClick={() => setCurrentView('selector')}
            disabled={auth.isLoading}
            className="simple-back-button"
          >
            <ArrowLeftIcon className="simple-back-button-icon" />
            Volver
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
        <div className="simple-global-error">
          <div className="simple-global-error-content">
            <XIcon className="simple-global-error-icon" />
            <div className="simple-global-error-text">
              <h3 className="simple-global-error-title">
                Error del Sistema
              </h3>
              <p className="simple-global-error-message">{auth.error}</p>
            </div>
          </div>
        </div>
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

const InfoIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default SimpleLoginContainer;