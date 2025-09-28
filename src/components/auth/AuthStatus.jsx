/**
 * Componente AuthStatus - Estado de autenticación y perfil de usuario
 * Muestra información del usuario autenticado y opciones de gestión
 */

import React, { useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import CredentialManager from '../zkp/CredentialManager';
import useAuth from '../../hooks/useAuth';

const AuthStatus = ({ 
  onLogout, 
  showCredentials = true,
  className = '' 
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const auth = useAuth();

  const handleLogout = async () => {
    try {
      await auth.logout();
      setShowLogoutConfirm(false);
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  const getUserDisplayName = () => {
    if (auth.isWalletAuthenticated) {
      return auth.user.formattedAddress || 'Usuario Wallet';
    } else if (auth.isTraditionalAuthenticated) {
      return auth.user.name || 'Usuario';
    }
    return 'Usuario';
  };

  const getUserType = () => {
    if (auth.isWalletAuthenticated) {
      return 'Autenticación por Wallet';
    } else if (auth.isTraditionalAuthenticated) {
      return 'Autenticación Tradicional';
    }
    return 'Desconocido';
  };

  const getUserCredentials = () => {
    if (!auth.currentSession) return [];
    
    const claims = [];
    if (auth.currentSession.zkpClaim) {
      claims.push(auth.currentSession.zkpClaim);
    }
    return claims;
  };

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <div className={`zkp-card ${className}`}>
      {/* Header */}
      <div className="auth-status-header">
        <div className="auth-status-user">
          <div className="auth-status-avatar">
            <UserIcon className="auth-status-avatar-icon" />
          </div>
          <div className="auth-status-info">
            <h3 className="auth-status-name">
              {getUserDisplayName()}
            </h3>
            <p className="auth-status-type">
              {getUserType()}
            </p>
          </div>
        </div>

        <div className="auth-status-badge-container">
          <span className="auth-status-badge">
            <div className="auth-status-badge-dot"></div>
            Autenticado
          </span>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="auth-status-info-section">
        {/* DID ZKP */}
        <div className="auth-status-did-card">
          <div className="auth-status-did-header">
            <span className="auth-status-did-label">DID ZKP:</span>
            <button
              onClick={() => setShowProfileModal(true)}
              className="auth-status-info-button"
            >
              <InfoIcon className="auth-status-info-icon" />
            </button>
          </div>
          <div className="auth-status-did-value">
            {auth.user?.zkpDID || 'No disponible'}
          </div>
        </div>

        {/* Información específica del método */}
        {auth.isWalletAuthenticated && (
          <div className="auth-status-wallet-card">
            <div className="auth-status-details">
              <div className="auth-status-detail-row">
                <span className="auth-status-detail-label">Wallet:</span>
                <span className="auth-status-detail-value auth-status-mono">{auth.user.address}</span>
              </div>
              <div className="auth-status-detail-row">
                <span className="auth-status-detail-label">Red:</span>
                <span className="auth-status-detail-value">{auth.user.network?.name}</span>
              </div>
            </div>
          </div>
        )}

        {auth.isTraditionalAuthenticated && (
          <div className="auth-status-traditional-card">
            <div className="auth-status-details">
              <div className="auth-status-detail-row">
                <span className="auth-status-detail-label">Nombre:</span>
                <span className="auth-status-detail-value">{auth.user.name}</span>
              </div>
              <div className="auth-status-detail-row">
                <span className="auth-status-detail-label">Email:</span>
                <span className="auth-status-detail-value">{auth.user.email}</span>
              </div>
            </div>
          </div>
        )}

        {/* Información de la sesión */}
        {auth.sessionInfo && (
          <div className="auth-status-session-card">
            <div className="auth-status-session-details">
              <div className="auth-status-session-row">
                <span className="auth-status-session-label">Autenticado:</span>
                <span className="auth-status-session-value">{new Date(auth.sessionInfo.authenticatedAt).toLocaleString()}</span>
              </div>
              <div className="auth-status-session-row">
                <span className="auth-status-session-label">Expira:</span>
                <span className={`auth-status-session-value ${auth.sessionInfo.isExpired ? 'auth-status-session-expired' : ''}`}>
                  {new Date(auth.sessionInfo.expiresAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="auth-status-actions">
        <div className="auth-status-action-buttons">
          {showCredentials && (
            <Button
              variant="secondary"
              onClick={() => setShowCredentialsModal(true)}
              icon={CredentialsIcon}
              className="btn-small"
            >
              Credenciales
            </Button>
          )}
          
          <Button
            variant="secondary"
            onClick={() => setShowProfileModal(true)}
            icon={UserIcon}
            className="btn-small"
          >
            Perfil
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowLogoutConfirm(true)}
          icon={LogoutIcon}
          className="btn-full-width btn-small"
        >
          Cerrar Sesión
        </Button>
      </div>

      {/* Modal de perfil */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Perfil de Usuario ZKP"
        size="lg"
      >
        <div className="space-y-4">
          {/* Información básica */}
          <div className="profile-info-card">
            <h4 className="profile-section-title">Información Básica</h4>
            <div className="profile-details">
              <div className="profile-detail-row">
                <span className="profile-detail-label">Tipo:</span>
                <span className="profile-detail-value">{getUserType()}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Usuario:</span>
                <span className="profile-detail-value">{getUserDisplayName()}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">ID:</span>
                <span className="profile-detail-value profile-detail-mono">{auth.user?.id}</span>
              </div>
            </div>
          </div>

          {/* Identidad ZKP */}
          <div className="profile-zkp-card">
            <h4 className="profile-section-title profile-zkp-title">Identidad ZKP</h4>
            <div className="profile-zkp-content">
              <div className="profile-zkp-did">
                <span className="profile-zkp-label">DID:</span>
                <div className="profile-zkp-value">
                  {auth.user?.zkpDID}
                </div>
              </div>
              <div className="profile-zkp-explanation">
                <strong>¿Qué es un DID?</strong> Es tu identidad descentralizada única en el 
                ecosistema ZKP. Te permite autenticarte sin revelar información personal.
              </div>
            </div>
          </div>

          {/* Información específica */}
          {auth.isWalletAuthenticated && (
            <div className="profile-wallet-card">
              <h4 className="profile-section-title profile-wallet-title">Información de Wallet</h4>
              <div className="profile-wallet-content">
                <div className="profile-wallet-address">
                  <span className="profile-wallet-label">Dirección:</span>
                  <div className="profile-wallet-value">
                    {auth.user.address}
                  </div>
                </div>
                <div className="profile-wallet-row">
                  <span className="profile-wallet-label">Red:</span>
                  <span className="profile-wallet-text">{auth.user.network?.name}</span>
                </div>
                <div className="profile-wallet-row">
                  <span className="profile-wallet-label">Chain ID:</span>
                  <span className="profile-wallet-text profile-wallet-mono">{auth.user.network?.chainId}</span>
                </div>
              </div>
            </div>
          )}

          {auth.isTraditionalAuthenticated && (
            <div className="profile-traditional-card">
              <h4 className="profile-section-title profile-traditional-title">Información de Usuario</h4>
              <div className="profile-traditional-content">
                <div className="profile-traditional-row">
                  <span className="profile-traditional-label">Nombre:</span>
                  <span className="profile-traditional-value">{auth.user.name}</span>
                </div>
                <div className="profile-traditional-row">
                  <span className="profile-traditional-label">Email:</span>
                  <span className="profile-traditional-value">{auth.user.email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Debug info en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <details className="profile-debug-card">
              <summary className="profile-debug-summary">
                Debug Info (Desarrollo)
              </summary>
              <pre className="profile-debug-content">
                {JSON.stringify(auth.getDebugInfo?.() || { error: 'Debug info not available' }, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </Modal>

      {/* Modal de credenciales */}
      {showCredentials && (
        <Modal
          isOpen={showCredentialsModal}
          onClose={() => setShowCredentialsModal(false)}
          title="Gestor de Credenciales ZKP"
          size="xl"
        >
          <CredentialManager
            identity={auth.currentSession?.zkpIdentity}
            claims={getUserCredentials()}
            showEducationalContent={true}
          />
        </Modal>
      )}

      {/* Modal de confirmación de logout */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Confirmar Cierre de Sesión"
        size="sm"
      >
        <div className="logout-confirm-content">
          <p className="logout-confirm-text">
            ¿Estás seguro de que quieres cerrar tu sesión ZKP? 
            Tendrás que autenticarte nuevamente para acceder.
          </p>
          
          <div className="logout-confirm-actions">
            <Button
              variant="secondary"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancelar
            </Button>
            
            <Button
              variant="danger"
              onClick={handleLogout}
              isLoading={auth.isLoading}
              icon={LogoutIcon}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Iconos
const UserIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const InfoIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CredentialsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const LogoutIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default AuthStatus;