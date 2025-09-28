/**
 * App.js - Aplicación principal de Login con Wallet y Auth Tradicional
 * Sistema simplificado de autenticación usando RainbowKit
 */

import React, { useState } from 'react';
import SimpleLoginContainer from './components/auth/SimpleLoginContainer';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleAuthSuccess = (result) => {
    console.log('🎉 Autenticación exitosa:', result);
    setUser(result.user);
  };

  const handleAuthError = (error) => {
    console.error('❌ Error de autenticación:', error);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-container">
          <div className="app-header-content">
            {/* Logo y título */}
            <div className="app-logo-section">
              <div className="app-logo">
                <LockIcon className="app-logo-icon" />
              </div>
              <div className="app-title-section">
                <h1 className="app-title">
                  Login Demo
                </h1>
                <p className="app-subtitle">
                  Wallet & Traditional Auth
                </p>
              </div>
            </div>

            {/* Usuario autenticado */}
            {user && (
              <div className="app-user-info">
                <span className="app-user-text">
                  Bienvenido, {user.formattedAddress || user.name || 'Usuario'}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="app-main">
        <div className="app-main-simple">
          <div className="app-main-intro">
            <h2 className="app-main-title">
              Sistema de Autenticación
            </h2>
            <p className="app-main-description">
              Conecta tu wallet o usa tu cuenta de email para acceder
            </p>
          </div>

          <SimpleLoginContainer
            onAuthSuccess={handleAuthSuccess}
            onAuthError={handleAuthError}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="app-footer-container">
          <div className="app-footer-content">
            <div className="app-footer-copyright">
              © 2024 Login Demo - Sistema de Autenticación
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Iconos
const LockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default App;
