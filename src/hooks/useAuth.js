/**
 * Hook personalizado para autenticación completa
 * Orquesta wallet, ZKP y autenticación tradicional
 */

import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import backendZKPService from '../services/backendZKPService';
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
   * Autenticación por wallet con ZKP usando backend real
   */
  const authenticateWithWallet = useCallback(async () => {
    try {
      setAuthState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      console.log('🔐 [useAuth] Iniciando autenticación por wallet con backend...');

      // Conectar wallet si no está conectada
      if (!wallet.isConnected) {
        console.log('💼 [useAuth] Conectando wallet...');
        await wallet.connectWallet();
      }

      // Verificar red correcta
      if (!wallet.isCorrectNetwork) {
        console.log('🔄 [useAuth] Cambiando a red Polygon Amoy...');
        await wallet.switchToPolygonAmoy();
      }

      // Obtener información de la wallet
      const walletInfo = {
        address: wallet.account,
        formattedAddress: wallet.formattedAccount,
        network: {
          name: wallet.network?.name || 'Polygon Amoy',
          chainId: wallet.network?.chainId || 80002
        }
      };

      console.log('📝 [useAuth] Creando credencial en Issuer Node...', walletInfo);

      // Usar el servicio de backend para crear credencial real
      const result = await backendZKPService.authenticateWithWallet(walletInfo);

      console.log('✅ [useAuth] Credencial creada exitosamente:', result);

      // Actualizar estado de autenticación
      const user = {
        id: result.identity?.identifier || wallet.account,
        method: 'wallet',
        address: walletInfo.address,
        formattedAddress: walletInfo.formattedAddress,
        network: walletInfo.network,
        zkpDID: result.identity?.identifier,
        zkpIdentity: result.identity,
        zkpClaim: result.claim,
        qrCode: result.qrCode
      };

      const session = {
        id: user.id,
        method: 'wallet',
        user: user,
        authenticatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: user,
        session: session
      }));

      // Guardar en localStorage
      localStorage.setItem('zkp_user_session', JSON.stringify(session));

      return {
        success: true,
        user: user,
        session: session,
        credential: result
      };

    } catch (error) {
      console.error('❌ [useAuth] Error en autenticación por wallet:', error);
      const errorMessage = error.message || 'Error desconocido en autenticación';
      
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

      console.log('📝 [useAuth] Registrando nuevo usuario...');

      // Verificar si el usuario ya existe
      const existingUsers = JSON.parse(localStorage.getItem('zkp_registered_users') || '[]');
      const existingUser = existingUsers.find(u => u.email === userData.email);
      
      if (existingUser) {
        throw new Error('El usuario ya está registrado');
      }

      // Crear nuevo usuario
      const newUser = {
        id: btoa(userData.email).replace(/=/g, ''),
        name: userData.name,
        email: userData.email,
        passwordHash: btoa(userData.password), // Hash simple para demo
        registeredAt: new Date().toISOString()
      };

      // Guardar en localStorage
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('zkp_registered_users', JSON.stringify(updatedUsers));
      
      // Actualizar lista de usuarios registrados
      setAuthState(prev => ({
        ...prev,
        registeredUsers: updatedUsers
      }));

      console.log('✅ [useAuth] Usuario registrado exitosamente:', newUser);

      return {
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email
        }
      };

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
   * Autenticación tradicional con ZKP usando backend real
   */
  const authenticateWithCredentials = useCallback(async (credentials) => {
    try {
      setAuthState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      console.log('🔐 [useAuth] Iniciando autenticación tradicional con backend...');

      // Validar credenciales básicas
      if (!credentials.email || !credentials.password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // Verificar si el usuario existe en localStorage
      const registeredUsers = JSON.parse(localStorage.getItem('zkp_registered_users') || '[]');
      const user = registeredUsers.find(u => u.email === credentials.email);
      
      if (!user) {
        throw new Error('Usuario no registrado. Por favor regístrate primero.');
      }

      // Verificar contraseña (hash simple)
      const passwordHash = btoa(credentials.password);
      if (passwordHash !== user.passwordHash) {
        throw new Error('Credenciales inválidas');
      }

      console.log('📝 [useAuth] Creando credencial para usuario tradicional...', user);

      // Usar el servicio de backend para crear credencial real
      const userData = {
        name: user.name,
        email: user.email
      };

      const result = await backendZKPService.authenticateWithCredentials(userData);

      console.log('✅ [useAuth] Credencial tradicional creada exitosamente:', result);

      // Actualizar estado de autenticación
      const authUser = {
        id: result.identity?.identifier || user.id,
        method: 'traditional',
        name: user.name,
        email: user.email,
        zkpDID: result.identity?.identifier,
        zkpIdentity: result.identity,
        zkpClaim: result.claim,
        qrCode: result.qrCode
      };

      const session = {
        id: authUser.id,
        method: 'traditional',
        user: authUser,
        authenticatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: authUser,
        session: session
      }));

      // Guardar en localStorage
      localStorage.setItem('zkp_user_session', JSON.stringify(session));

      return {
        success: true,
        user: authUser,
        session: session,
        credential: result
      };

    } catch (error) {
      console.error('❌ [useAuth] Error en autenticación tradicional:', error);
      const errorMessage = error.message || 'Error desconocido en autenticación';
      
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