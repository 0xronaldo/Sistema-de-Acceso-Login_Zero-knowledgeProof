/**
 * Hook personalizado para manejo de wallet
 * Integra walletService con React state management
 */

import { useState, useEffect, useCallback } from 'react';
import walletService from '../services/walletService';
import { AUTH_STATES, ERROR_MESSAGES, NETWORKS } from '../utils/constants';

export const useWallet = () => {
  const [walletState, setWalletState] = useState({
    isConnected: false,
    account: null,
    formattedAccount: null,
    network: null,
    balance: null,
    isCorrectNetwork: false,
    isLoading: false,
    error: null
  });

  /**
   * Actualiza el estado de la wallet
   */
  const updateWalletState = useCallback(async () => {
    try {
      const status = walletService.getStatus();
      const balance = status.isConnected ? await walletService.getBalance() : null;
      
      setWalletState(prev => ({
        ...prev,
        isConnected: status.isConnected,
        account: status.account,
        formattedAccount: status.formattedAccount,
        network: status.network,
        balance: balance,
        isCorrectNetwork: status.isCorrectNetwork,
        error: null,
        isLoading: false
      }));
      
    } catch (error) {
      console.error('Error actualizando estado de wallet:', error);
      setWalletState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
    }
  }, []);

  /**
   * Conecta la wallet
   */
  const connectWallet = useCallback(async () => {
    try {
      setWalletState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      const connectionInfo = await walletService.connectWallet();
      await updateWalletState();
      
      return connectionInfo;
      
    } catch (error) {
      console.error('Error conectando wallet:', error);
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: ERROR_MESSAGES[error.message] || error.message
      }));
      throw error;
    }
  }, [updateWalletState]);

  /**
   * Desconecta la wallet
   */
  const disconnectWallet = useCallback(async () => {
    try {
      await walletService.disconnectWallet();
      setWalletState({
        isConnected: false,
        account: null,
        formattedAccount: null,
        network: null,
        balance: null,
        isCorrectNetwork: false,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error desconectando wallet:', error);
    }
  }, []);

  /**
   * Cambia a la red Polygon Amoy
   */
  const switchToPolygonAmoy = useCallback(async () => {
    try {
      setWalletState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      const success = await walletService.switchToPolygonAmoy();
      await updateWalletState();
      
      return success;
      
    } catch (error) {
      console.error('Error cambiando red:', error);
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: ERROR_MESSAGES[error.message] || error.message
      }));
      throw error;
    }
  }, [updateWalletState]);

  /**
   * Firma un mensaje
   */
  const signMessage = useCallback(async (message) => {
    try {
      setWalletState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      const signature = await walletService.signMessage(message);
      
      setWalletState(prev => ({
        ...prev,
        isLoading: false
      }));
      
      return signature;
      
    } catch (error) {
      console.error('Error firmando mensaje:', error);
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
      throw error;
    }
  }, []);

  /**
   * Refresca el balance
   */
  const refreshBalance = useCallback(async () => {
    try {
      if (!walletState.isConnected) return;
      
      const balance = await walletService.getBalance();
      setWalletState(prev => ({
        ...prev,
        balance: balance
      }));
      
      return balance;
      
    } catch (error) {
      console.error('Error refrescando balance:', error);
    }
  }, [walletState.isConnected]);

  /**
   * Verifica el estado de la red
   */
  const checkNetwork = useCallback(async () => {
    try {
      const isCorrect = await walletService.isCorrectNetwork();
      setWalletState(prev => ({
        ...prev,
        isCorrectNetwork: isCorrect
      }));
      
      return isCorrect;
      
    } catch (error) {
      console.error('Error verificando red:', error);
      return false;
    }
  }, []);

  // Configurar listeners para eventos de wallet
  useEffect(() => {
    const handleAccountChanged = (event) => {
      console.log('Account changed:', event.detail);
      updateWalletState();
    };

    const handleNetworkChanged = (event) => {
      console.log('Network changed:', event.detail);
      updateWalletState();
    };

    const handleWalletDisconnected = () => {
      console.log('Wallet disconnected');
      disconnectWallet();
    };

    // Agregar listeners
    window.addEventListener('walletAccountChanged', handleAccountChanged);
    window.addEventListener('walletNetworkChanged', handleNetworkChanged);
    window.addEventListener('walletDisconnected', handleWalletDisconnected);

    // Verificar estado inicial
    updateWalletState();

    // Cleanup
    return () => {
      window.removeEventListener('walletAccountChanged', handleAccountChanged);
      window.removeEventListener('walletNetworkChanged', handleNetworkChanged);
      window.removeEventListener('walletDisconnected', handleWalletDisconnected);
    };
  }, [updateWalletState, disconnectWallet]);

  // Refrescar balance periódicamente si está conectado
  useEffect(() => {
    if (!walletState.isConnected) return;

    const interval = setInterval(() => {
      refreshBalance();
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [walletState.isConnected, refreshBalance]);

  return {
    // Estado
    ...walletState,
    
    // Acciones
    connectWallet,
    disconnectWallet,
    switchToPolygonAmoy,
    signMessage,
    refreshBalance,
    checkNetwork,
    
    // Utilidades
    isWalletAvailable: typeof walletService.isWalletAvailable === 'function' ? walletService.isWalletAvailable() : false,
    supportedNetworks: Object.values(NETWORKS),
    
    // Debug
    getDebugInfo: () => {
      try {
        return typeof walletService.getDebugInfo === 'function' ? walletService.getDebugInfo() : { error: 'getDebugInfo not available' };
      } catch (error) {
        return { error: 'Failed to get wallet debug info', message: error.message };
      }
    }
  };
};

export default useWallet;