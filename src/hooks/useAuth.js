/**
 * Hook personalizado para autenticación completa
 * Orquesta wallet, ZKP y autenticación tradicional
 */

import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { AUTH_STATES, AUTH_METHODS, ERROR_MESSAGES } from '../utils/constants';
import useWallet from './useWallet';
import useZKP from './useZKP';

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: false,
    authMethod: null,
    user: null,
    session: null,
    error: null,
    registeredUsers: []
  });

  const wallet = useWallet();
  const zkp = useZKP();

  /**
   * Actualiza el estado de autenticación
   */
  const updateAuthState = useCallback(() => {
    const currentAuthState = authService.getAuthState();
    
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: currentAuthState.isAuthenticated,
      authMethod: currentAuthState.user?.method || null,
      user: currentAuthState.user,
      session: currentAuthState.session,
      error: null
    }));
  }, []);

  /**
   * Inicializa el servicio de autenticación
   */
  const initialize = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      await authService.initialize();
      updateAuthState();
      
    } catch (error) {
      console.error('Error inicializando auth service:', error);
      setAuthState(prev => ({
        ...prev,
        error: ERROR_MESSAGES[error.message] || error.message
      }));
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [updateAuthState]);

  /**
   * Autenticación por wallet con ZKP
   */
  const authenticateWithWallet = useCallback(async () => {
    try {
      setAuthState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      // Conectar wallet si no está conectada
      if (!wallet.isConnected) {
        await wallet.connectWallet();
      }

      // Verificar red correcta
      if (!wallet.isCorrectNetwork) {
        await wallet.switchToPolygonAmoy();
      }

      // Autenticar con el servicio
      const result = await authService.authenticateWithWallet();
      
      updateAuthState();
      
      return result;

    } catch (error) {
      console.error('Error en autenticación por wallet:', error);
      const errorMessage = ERROR_MESSAGES[error.message] || error.message;
      
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      throw new Error(errorMessage);

    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [wallet, updateAuthState]);

  /**
   * Registro de usuario tradicional
   */
  const registerUser = useCallback(async (userData) => {
    try {
      setAuthState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      // Validar datos básicos
      if (!userData.name || !userData.email || !userData.password) {
        throw new Error('Todos los campos son requeridos');
      }

      if (userData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      if (!userData.email.includes('@')) {
        throw new Error('Email inválido');
      }

      // Registrar en el servicio
      const result = await authService.registerUser(userData);
      
      // Actualizar lista de usuarios registrados
      setAuthState(prev => ({
        ...prev,
        registeredUsers: [...prev.registeredUsers, result.user]
      }));

      return result;

    } catch (error) {
      console.error('Error en registro:', error);
      const errorMessage = ERROR_MESSAGES[error.message] || error.message;
      
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      throw new Error(errorMessage);

    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Autenticación tradicional con ZKP
   */
  const authenticateWithCredentials = useCallback(async (credentials) => {
    try {
      setAuthState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      // Validar credenciales básicas
      if (!credentials.email || !credentials.password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // Autenticar con el servicio
      const result = await authService.authenticateWithCredentials(credentials);
      
      updateAuthState();
      
      return result;

    } catch (error) {
      console.error('Error en autenticación tradicional:', error);
      const errorMessage = ERROR_MESSAGES[error.message] || error.message;
      
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      throw new Error(errorMessage);

    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [updateAuthState]);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      await authService.logout();
      
      // Limpiar estados relacionados
      zkp.clearState();
      
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        authMethod: null,
        user: null,
        session: null,
        error: null,
        registeredUsers: []
      });

    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [zkp]);

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    setAuthState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  /**
   * Obtiene información de debug
   */
  const getDebugInfo = useCallback(() => {
    try {
      return {
        authService: authService?.getDebugInfo?.() || { error: 'authService.getDebugInfo not available' },
        wallet: wallet?.getDebugInfo?.() || { error: 'wallet.getDebugInfo not available' },
        zkp: zkp?.getDebugInfo?.() || { error: 'zkp.getDebugInfo not available' },
        currentState: authState,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        error: 'Failed to get debug info',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }, [authState, wallet, zkp]);

  /**
   * Verifica si un email ya está registrado
   */
  const isEmailRegistered = useCallback((email) => {
    const users = authService.registeredUsers || [];
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }, []);

  /**
   * Obtiene lista de usuarios registrados (para demo)
   */
  const getRegisteredUsers = useCallback(() => {
    return authService.registeredUsers?.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      registeredAt: user.registeredAt,
      zkpDID: user.zkpIdentity?.did
    })) || [];
  }, []);

  // Inicializar al montar el componente
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Actualizar estado cuando cambien los servicios subyacentes
  useEffect(() => {
    updateAuthState();
  }, [updateAuthState]);

  return {
    // Estado principal
    ...authState,
    
    // Estados computados
    canAuthenticateWithWallet: wallet.isWalletAvailable && !authState.isAuthenticated,
    canAuthenticateTraditional: !authState.isAuthenticated,
    isWalletAuthenticated: authState.isAuthenticated && authState.authMethod === AUTH_METHODS.WALLET,
    isTraditionalAuthenticated: authState.isAuthenticated && authState.authMethod === AUTH_METHODS.TRADITIONAL,
    
    // Acciones principales
    authenticateWithWallet,
    registerUser,
    authenticateWithCredentials,
    logout,
    
    // Utilidades
    clearError,
    isEmailRegistered,
    getRegisteredUsers,
    getDebugInfo,
    
    // Sub-hooks
    wallet,
    zkp,
    
    // Estados adicionales
    authStates: AUTH_STATES,
    authMethods: AUTH_METHODS,
    
    // Información de sesión
    sessionInfo: authState.session ? {
      authenticatedAt: authState.session.authenticatedAt,
      expiresAt: authState.session.expiresAt,
      method: authState.session.method,
      isExpired: new Date() > new Date(authState.session.expiresAt)
    } : null
  };
};

export default useAuth;