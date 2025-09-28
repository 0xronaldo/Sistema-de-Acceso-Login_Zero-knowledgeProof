/**
 * Hook personalizado para operaciones ZKP
 * Integra privadoService con React state management
 */

import { useState, useCallback } from 'react';
import privadoService from '../services/privadoService';
import { AUTH_METHODS, ERROR_MESSAGES } from '../utils/constants';
import { logZKPStep } from '../utils/zkpUtils';

export const useZKP = () => {
  const [zkpState, setZkpState] = useState({
    isGenerating: false,
    isVerifying: false,
    currentStep: null,
    progress: 0,
    identity: null,
    claim: null,
    proof: null,
    verificationResult: null,
    error: null,
    logs: []
  });

  /**
   * Añade un log al estado para debugging educativo
   */
  const addLog = useCallback((type, message, data = null) => {
    const logEntry = {
      id: Date.now(),
      type,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    setZkpState(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-9), logEntry] // Mantener últimos 10 logs
    }));

    logZKPStep(message, data);
  }, []);

  /**
   * Actualiza el progreso del proceso ZKP
   */
  const updateProgress = useCallback((step, progress) => {
    setZkpState(prev => ({
      ...prev,
      currentStep: step,
      progress: Math.min(progress, 100)
    }));
  }, []);

  /**
   * Genera una identidad ZKP
   */
  const generateIdentity = useCallback(async (method, userData) => {
    try {
      setZkpState(prev => ({
        ...prev,
        isGenerating: true,
        error: null,
        currentStep: 'Generando identidad ZKP...',
        progress: 0
      }));

      addLog('info', 'Iniciando generación de identidad ZKP', { method });
      updateProgress('Inicializando...', 10);

      // Inicializar servicio si es necesario
      updateProgress('Inicializando PrivadoID...', 20);
      await privadoService.initialize();

      // Generar identidad
      updateProgress('Generando identidad...', 40);
      const identity = await privadoService.createIdentity(method, userData);
      
      setZkpState(prev => ({
        ...prev,
        identity,
        progress: 100,
        currentStep: 'Identidad generada exitosamente'
      }));

      addLog('success', 'Identidad ZKP generada exitosamente', {
        did: identity.did,
        method: identity.userInfo.method
      });

      return identity;

    } catch (error) {
      console.error('Error generando identidad ZKP:', error);
      const errorMessage = ERROR_MESSAGES[error.message] || error.message;
      
      setZkpState(prev => ({
        ...prev,
        error: errorMessage,
        currentStep: 'Error generando identidad',
        progress: 0
      }));

      addLog('error', 'Error generando identidad ZKP', { error: errorMessage });
      throw error;

    } finally {
      setZkpState(prev => ({
        ...prev,
        isGenerating: false
      }));
    }
  }, [addLog, updateProgress]);

  /**
   * Emite un claim para una identidad
   */
  const issueClaim = useCallback(async (identity, claimType, claimData) => {
    try {
      setZkpState(prev => ({
        ...prev,
        isGenerating: true,
        error: null,
        currentStep: 'Emitiendo claim...',
        progress: 0
      }));

      addLog('info', 'Iniciando emisión de claim', { claimType });
      updateProgress('Preparando claim...', 30);

      const claim = await privadoService.issueClaim(identity, claimType, claimData);
      
      setZkpState(prev => ({
        ...prev,
        claim,
        progress: 100,
        currentStep: 'Claim emitido exitosamente'
      }));

      addLog('success', 'Claim emitido exitosamente', {
        claimId: claim.id,
        type: claim.type
      });

      return claim;

    } catch (error) {
      console.error('Error emitiendo claim:', error);
      const errorMessage = ERROR_MESSAGES[error.message] || error.message;
      
      setZkpState(prev => ({
        ...prev,
        error: errorMessage,
        currentStep: 'Error emitiendo claim',
        progress: 0
      }));

      addLog('error', 'Error emitiendo claim', { error: errorMessage });
      throw error;

    } finally {
      setZkpState(prev => ({
        ...prev,
        isGenerating: false
      }));
    }
  }, [addLog, updateProgress]);

  /**
   * Genera una prueba ZKP
   */
  const generateProof = useCallback(async (identity, claim, verificationRequest = {}) => {
    try {
      setZkpState(prev => ({
        ...prev,
        isGenerating: true,
        error: null,
        currentStep: 'Generando prueba ZKP...',
        progress: 0
      }));

      addLog('info', 'Iniciando generación de prueba ZKP', {
        identity: identity.did,
        claim: claim.id
      });

      updateProgress('Preparando circuito...', 20);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular preparación

      updateProgress('Generando witness...', 50);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular witness

      updateProgress('Calculando prueba...', 80);
      const proof = await privadoService.generateProof(identity, claim, verificationRequest);
      
      setZkpState(prev => ({
        ...prev,
        proof,
        progress: 100,
        currentStep: 'Prueba ZKP generada exitosamente'
      }));

      addLog('success', 'Prueba ZKP generada exitosamente', {
        proofId: proof.id,
        circuitId: proof.circuitId
      });

      return proof;

    } catch (error) {
      console.error('Error generando prueba ZKP:', error);
      const errorMessage = ERROR_MESSAGES[error.message] || error.message;
      
      setZkpState(prev => ({
        ...prev,
        error: errorMessage,
        currentStep: 'Error generando prueba',
        progress: 0
      }));

      addLog('error', 'Error generando prueba ZKP', { error: errorMessage });
      throw error;

    } finally {
      setZkpState(prev => ({
        ...prev,
        isGenerating: false
      }));
    }
  }, [addLog, updateProgress]);

  /**
   * Verifica una prueba ZKP
   */
  const verifyProof = useCallback(async (proof, verificationRequest = {}) => {
    try {
      setZkpState(prev => ({
        ...prev,
        isVerifying: true,
        error: null,
        currentStep: 'Verificando prueba ZKP...',
        progress: 0
      }));

      addLog('info', 'Iniciando verificación de prueba ZKP', {
        proofId: proof.id
      });

      updateProgress('Validando estructura...', 25);
      await new Promise(resolve => setTimeout(resolve, 500));

      updateProgress('Verificando circuito...', 60);
      await new Promise(resolve => setTimeout(resolve, 750));

      updateProgress('Validando signals...', 85);
      const isValid = await privadoService.verifyProof(proof, verificationRequest);

      setZkpState(prev => ({
        ...prev,
        verificationResult: {
          isValid,
          proofId: proof.id,
          timestamp: new Date().toISOString()
        },
        progress: 100,
        currentStep: isValid ? 'Prueba verificada exitosamente' : 'Prueba inválida'
      }));

      addLog(isValid ? 'success' : 'warning', 
            `Prueba ZKP ${isValid ? 'verificada exitosamente' : 'inválida'}`, 
            { proofId: proof.id, isValid });

      return isValid;

    } catch (error) {
      console.error('Error verificando prueba ZKP:', error);
      const errorMessage = ERROR_MESSAGES[error.message] || error.message;
      
      setZkpState(prev => ({
        ...prev,
        error: errorMessage,
        currentStep: 'Error verificando prueba',
        progress: 0,
        verificationResult: {
          isValid: false,
          error: errorMessage,
          timestamp: new Date().toISOString()
        }
      }));

      addLog('error', 'Error verificando prueba ZKP', { error: errorMessage });
      throw error;

    } finally {
      setZkpState(prev => ({
        ...prev,
        isVerifying: false
      }));
    }
  }, [addLog, updateProgress]);

  /**
   * Crea un request de verificación
   */
  const createVerificationRequest = useCallback((requirements) => {
    try {
      addLog('info', 'Creando request de verificación', requirements);
      
      const request = privadoService.createVerificationRequest(requirements);
      
      addLog('success', 'Request de verificación creado', {
        requestId: request.id,
        type: request.query.type
      });

      return request;

    } catch (error) {
      console.error('Error creando request de verificación:', error);
      addLog('error', 'Error creando request de verificación', { error: error.message });
      throw error;
    }
  }, [addLog]);

  /**
   * Limpia el estado ZKP
   */
  const clearState = useCallback(() => {
    setZkpState({
      isGenerating: false,
      isVerifying: false,
      currentStep: null,
      progress: 0,
      identity: null,
      claim: null,
      proof: null,
      verificationResult: null,
      error: null,
      logs: []
    });
  }, []);

  /**
   * Limpia solo los logs
   */
  const clearLogs = useCallback(() => {
    setZkpState(prev => ({
      ...prev,
      logs: []
    }));
  }, []);

  /**
   * Flujo completo de autenticación ZKP para wallet
   */
  const authenticateWithWallet = useCallback(async (walletAddress, network) => {
    try {
      addLog('info', 'Iniciando flujo completo de autenticación por wallet', {
        address: walletAddress,
        network: network.name
      });

      // 1. Generar identidad
      const identity = await generateIdentity(AUTH_METHODS.WALLET, {
        walletAddress,
        network: network.name
      });

      // 2. Emitir claim
      const claim = await issueClaim(identity, 'wallet_owner', {
        walletAddress,
        network: network.chainId,
        timestamp: new Date().toISOString()
      });

      // 3. Crear request de verificación
      const verificationRequest = createVerificationRequest({
        type: 'wallet_ownership',
        credentialSubject: { walletAddress }
      });

      // 4. Generar prueba
      const proof = await generateProof(identity, claim, verificationRequest);

      // 5. Verificar prueba
      const isValid = await verifyProof(proof, verificationRequest);

      addLog('success', 'Flujo de autenticación por wallet completado', {
        identity: identity.did,
        claim: claim.id,
        proof: proof.id,
        verified: isValid
      });

      return { identity, claim, proof, isValid };

    } catch (error) {
      addLog('error', 'Error en flujo de autenticación por wallet', { error: error.message });
      throw error;
    }
  }, [generateIdentity, issueClaim, createVerificationRequest, generateProof, verifyProof, addLog]);

  /**
   * Flujo completo de autenticación ZKP tradicional
   */
  const authenticateWithCredentials = useCallback(async (userData) => {
    try {
      addLog('info', 'Iniciando flujo completo de autenticación tradicional', {
        name: userData.name,
        email: userData.email
      });

      // 1. Generar identidad
      const identity = await generateIdentity(AUTH_METHODS.TRADITIONAL, userData);

      // 2. Emitir claim
      const claim = await issueClaim(identity, 'user_name', {
        name: userData.name,
        email: userData.email,
        registeredAt: new Date().toISOString()
      });

      // 3. Crear request de verificación
      const verificationRequest = createVerificationRequest({
        type: 'user_identity',
        credentialSubject: { name: userData.name, email: userData.email }
      });

      // 4. Generar prueba
      const proof = await generateProof(identity, claim, verificationRequest);

      // 5. Verificar prueba
      const isValid = await verifyProof(proof, verificationRequest);

      addLog('success', 'Flujo de autenticación tradicional completado', {
        identity: identity.did,
        claim: claim.id,
        proof: proof.id,
        verified: isValid
      });

      return { identity, claim, proof, isValid };

    } catch (error) {
      addLog('error', 'Error en flujo de autenticación tradicional', { error: error.message });
      throw error;
    }
  }, [generateIdentity, issueClaim, createVerificationRequest, generateProof, verifyProof, addLog]);

  return {
    // Estado
    ...zkpState,
    
    // Acciones básicas
    generateIdentity,
    issueClaim,
    generateProof,
    verifyProof,
    createVerificationRequest,
    
    // Flujos completos
    authenticateWithWallet,
    authenticateWithCredentials,
    
    // Utilidades
    clearState,
    clearLogs,
    addLog,
    updateProgress,
    
    // Estado computado
    isProcessing: zkpState.isGenerating || zkpState.isVerifying,
    hasError: !!zkpState.error,
    hasIdentity: !!zkpState.identity,
    hasClaim: !!zkpState.claim,
    hasProof: !!zkpState.proof,
    hasVerificationResult: !!zkpState.verificationResult,
    
    // Debug
    getDebugInfo: privadoService.getDebugInfo
  };
};

export default useZKP;