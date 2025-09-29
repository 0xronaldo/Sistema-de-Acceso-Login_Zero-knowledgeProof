/**
 * App.js - Aplicación principal de Login con Wallet y Auth Tradicional
 * Sistema simplificado de autenticación usando RainbowKit
 */

import React, { useState } from 'react';
import SimpleLoginContainer from './components/auth/SimpleLoginContainer';
import BackendConnectionTest from './components/ui/BackendConnectionTest';
import RealCredentialManager from './components/zkp/RealCredentialManager';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  const handleAuthSuccess = (result) => {
    console.log('🎉 Autenticación exitosa:', result);
    setUser(result.user);
    setSession(result.session);
  };

  const handleAuthError = (error) => {
    console.error('❌ Error de autenticación:', error);
  };

  const handleLogout = () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem('zkp_user_session');
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
                <button
                  onClick={handleLogout}
                  className="ml-4 text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Logout
                </button>
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

          {!user ? (
            <>
              <SimpleLoginContainer
                onAuthSuccess={handleAuthSuccess}
                onAuthError={handleAuthError}
              />
              
              {/* Componente de prueba del backend */}
              <div className="mt-8">
                <BackendConnectionTest />
              </div>
            </>
          ) : (
            <>
              {/* Dashboard del usuario autenticado */}
              <div className="space-y-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-green-800 mb-2">
                    ¡Autenticación Exitosa! 🎉
                  </h2>
                  <p className="text-green-700">
                    Has sido autenticado exitosamente usando Zero Knowledge Proofs.
                  </p>
                  {user.zkpDID && (
                    <div className="mt-3 p-3 bg-green-100 rounded">
                      <p className="text-sm text-green-800">
                        <strong>DID:</strong> {user.zkpDID}
                      </p>
                    </div>
                  )}
                </div>

                {/* Gestión de credenciales */}
                <RealCredentialManager user={user} session={session} />
                
                {/* Componente de prueba del backend */}
                <BackendConnectionTest />
              </div>
            </>
          )}
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
