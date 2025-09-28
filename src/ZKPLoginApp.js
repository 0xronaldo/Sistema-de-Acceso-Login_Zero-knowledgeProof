import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import './ZKPLoginApp.css';

// Contexto global para manejo de estado de autenticación
const AuthContext = React.createContext();

function ZKPLoginApp() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    authMethod: null, // 'wallet' o 'traditional'
    zkpCredentials: null,
    did: null,
    vc: null
  });

  // Cargar estado de autenticación desde localStorage al iniciar
  useEffect(() => {
    const savedAuth = localStorage.getItem('zkp_auth_state');
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        // Verificar que la sesión no haya expirado (24 horas)
        const now = Date.now();
        const loginTime = parsedAuth.loginTime || 0;
        const sessionExpiry = 24 * 60 * 60 * 1000; // 24 horas
        
        if (now - loginTime < sessionExpiry) {
          setAuthState(parsedAuth);
        } else {
          // Limpiar sesión expirada
          localStorage.removeItem('zkp_auth_state');
        }
      } catch (error) {
        console.error('Error cargando estado de autenticación:', error);
        localStorage.removeItem('zkp_auth_state');
      }
    }
  }, []);

  // Función para iniciar sesión
  const login = (userData, method, zkpData) => {
    const newAuthState = {
      isAuthenticated: true,
      user: userData,
      authMethod: method,
      zkpCredentials: zkpData.credentials,
      did: zkpData.did,
      vc: zkpData.vc,
      loginTime: Date.now()
    };
    
    setAuthState(newAuthState);
    localStorage.setItem('zkp_auth_state', JSON.stringify(newAuthState));
  };

  // Función para cerrar sesión
  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      authMethod: null,
      zkpCredentials: null,
      did: null,
      vc: null
    });
    localStorage.removeItem('zkp_auth_state');
  };

  const contextValue = {
    ...authState,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      <div className="zkp-app">
        {authState.isAuthenticated ? (
          <Dashboard />
        ) : (
          <LoginPage />
        )}
      </div>
    </AuthContext.Provider>
  );
}

export default ZKPLoginApp;
export { AuthContext };