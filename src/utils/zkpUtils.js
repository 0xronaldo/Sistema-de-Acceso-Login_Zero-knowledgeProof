/**
 * Utilidades para Zero Knowledge Proofs
 * Funciones auxiliares para generación, verificación y manejo de ZKP
 */

import { Identity, Claim, Proof } from '@iden3/js-crypto';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { PRIVADO_CONFIG, AUTH_METHODS } from './constants';

/**
 * Genera una identidad ZKP basada en diferentes métodos
 * @param {string} method - Método de autenticación (wallet o traditional) 
 * @param {Object} data - Datos para generar la identidad
 * @returns {Object} Identidad ZKP generada
 */
export const generateZKPIdentity = async (method, data) => {
  try {
    console.log('🔐 [ZKP] Generando identidad ZKP...', { method, data: { ...data, password: '***' } });
    
    let seed, userInfo;
    
    if (method === AUTH_METHODS.WALLET) {
      // Para wallet: usar la dirección como semilla
      seed = data.walletAddress.toLowerCase();
      userInfo = {
        method: AUTH_METHODS.WALLET,
        address: data.walletAddress,
        network: data.network
      };
    } else if (method === AUTH_METHODS.TRADITIONAL) {
      // Para traditional: generar semilla basada en email + password
      const combined = `${data.email.toLowerCase()}:${data.password}`;
      seed = CryptoJS.SHA256(combined).toString();
      userInfo = {
        method: AUTH_METHODS.TRADITIONAL,
        email: data.email,
        name: data.name,
        registeredAt: data.registeredAt || new Date().toISOString()
      };
    } else {
      throw new Error(`Método de autenticación no soportado: ${method}`);
    }

    // Generar identidad determinística basada en la semilla
    const identity = await createIdentityFromSeed(seed);
    
    console.log('✅ [ZKP] Identidad generada exitosamente:', {
      did: identity.did,
      method: userInfo.method
    });

    return {
      identity,
      userInfo,
      seed,
      did: identity.did,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ [ZKP] Error generando identidad:', error);
    throw new Error(`Error generando identidad ZKP: ${error.message}`);
  }
};

/**
 * Crea una identidad desde una semilla determinística
 * @param {string} seed - Semilla para generar la identidad
 * @returns {Object} Identidad generada
 */
const createIdentityFromSeed = async (seed) => {
  try {
    // Convertir semilla a bytes
    const seedBytes = CryptoJS.enc.Utf8.parse(seed);
    const seedHash = CryptoJS.SHA256(seedBytes);
    
    // Simular generación de identidad (esto debería usar PrivadoID SDK real)
    const did = `did:iden3:polygon:amoy:${seedHash.toString().substring(0, 40)}`;
    
    return {
      did,
      seed: seedHash.toString(),
      privateKey: CryptoJS.SHA256(seed + ':private').toString(),
      publicKey: CryptoJS.SHA256(seed + ':public').toString()
    };
  } catch (error) {
    throw new Error(`Error creando identidad desde semilla: ${error.message}`);
  }
};

/**
 * Genera un claim ZKP para la identidad
 * @param {Object} identity - Identidad ZKP
 * @param {string} claimType - Tipo de claim
 * @param {Object} claimData - Datos del claim
 * @returns {Object} Claim generado
 */
export const generateClaim = async (identity, claimType, claimData) => {
  try {
    console.log('📝 [ZKP] Generando claim...', { claimType, claimData });
    
    const claimId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Simular generación de claim (esto debe usar PrivadoID SDK real)
    const claim = {
      id: claimId,
      type: claimType,
      issuer: PRIVADO_CONFIG.issuerDID,
      subject: identity.did,
      data: claimData,
      issuedAt: timestamp,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 año
      proof: {
        type: 'iden3SparseMerkleTreeProof',
        value: CryptoJS.SHA256(`${claimId}:${identity.did}:${JSON.stringify(claimData)}`).toString()
      }
    };
    
    console.log('✅ [ZKP] Claim generado exitosamente:', claim.id);
    return claim;
    
  } catch (error) {
    console.error('❌ [ZKP] Error generando claim:', error);
    throw new Error(`Error generando claim: ${error.message}`);
  }
};

/**
 * Genera una prueba ZKP para un claim
 * @param {Object} identity - Identidad ZKP
 * @param {Object} claim - Claim a probar
 * @param {Object} request - Request de verificación
 * @returns {Object} Prueba ZKP generada
 */
export const generateProof = async (identity, claim, request = {}) => {
  try {
    console.log('🔍 [ZKP] Generando prueba ZKP...', { 
      identity: identity.did, 
      claim: claim.id,
      request 
    });
    
    // Simular delay de generación de prueba (proceso computacionalmente intensivo)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const proofId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Simular generación de prueba (esto debe usar PrivadoID SDK real)
    const proof = {
      id: proofId,
      type: 'credentialAtomicQuerySigV2',
      circuitId: PRIVADO_CONFIG.circuitId,
      issuer: identity.did,
      claim: claim.id,
      request: request,
      publicSignals: [
        CryptoJS.SHA256(`${identity.did}:public`).toString().substring(0, 32),
        CryptoJS.SHA256(`${claim.id}:public`).toString().substring(0, 32),
        timestamp
      ],
      proof: {
        pi_a: [
          CryptoJS.SHA256(`${proofId}:pi_a_1`).toString(),
          CryptoJS.SHA256(`${proofId}:pi_a_2`).toString()
        ],
        pi_b: [
          [
            CryptoJS.SHA256(`${proofId}:pi_b_1_1`).toString(),
            CryptoJS.SHA256(`${proofId}:pi_b_1_2`).toString()
          ],
          [
            CryptoJS.SHA256(`${proofId}:pi_b_2_1`).toString(),
            CryptoJS.SHA256(`${proofId}:pi_b_2_2`).toString()
          ]
        ],
        pi_c: [
          CryptoJS.SHA256(`${proofId}:pi_c_1`).toString(),
          CryptoJS.SHA256(`${proofId}:pi_c_2`).toString()
        ]
      },
      timestamp,
      valid: true
    };
    
    console.log('✅ [ZKP] Prueba generada exitosamente:', proof.id);
    return proof;
    
  } catch (error) {
    console.error('❌ [ZKP] Error generando prueba:', error);
    throw new Error(`Error generando prueba ZKP: ${error.message}`);
  }
};

/**
 * Verifica una prueba ZKP
 * @param {Object} proof - Prueba a verificar
 * @param {Object} expectedClaim - Claim esperado (opcional)
 * @returns {boolean} True si la prueba es válida
 */
export const verifyProof = async (proof, expectedClaim = null) => {
  try {
    console.log('✅ [ZKP] Verificando prueba ZKP...', { 
      proofId: proof.id,
      expectedClaim: expectedClaim?.id 
    });
    
    // Simular delay de verificación
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Verificaciones básicas
    if (!proof || !proof.id || !proof.proof || !proof.publicSignals) {
      console.error('❌ [ZKP] Prueba inválida: estructura incorrecta');
      return false;
    }
    
    // Verificar timestamp (no muy antigua)
    const proofTimestamp = new Date(proof.timestamp);
    const now = new Date();
    const maxAge = 5 * 60 * 1000; // 5 minutos
    
    if (now - proofTimestamp > maxAge) {
      console.error('❌ [ZKP] Prueba expirada');
      return false;
    }
    
    // Simular verificación criptográfica (esto debe usar PrivadoID SDK real)
    const isValid = proof.valid === true && 
                   proof.publicSignals.length >= 2 &&
                   proof.proof.pi_a.length === 2 &&
                   proof.proof.pi_b.length === 2 &&
                   proof.proof.pi_c.length === 2;
    
    if (expectedClaim && proof.claim !== expectedClaim.id) {
      console.error('❌ [ZKP] Claim no coincide con el esperado');
      return false;
    }
    
    console.log(isValid ? '✅ [ZKP] Prueba verificada exitosamente' : '❌ [ZKP] Prueba inválida');
    return isValid;
    
  } catch (error) {
    console.error('❌ [ZKP] Error verificando prueba:', error);
    return false;
  }
};

/**
 * Valida el formato de una dirección de wallet
 * @param {string} address - Dirección a validar
 * @returns {boolean} True si es válida
 */
export const isValidWalletAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Formatea una dirección de wallet para mostrar
 * @param {string} address - Dirección completa
 * @param {number} chars - Número de caracteres a mostrar al inicio/final
 * @returns {string} Dirección formateada
 */
export const formatWalletAddress = (address, chars = 6) => {
  if (!isValidWalletAddress(address)) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
};

/**
 * Genera un hash único para un usuario basado en sus datos
 * @param {Object} userData - Datos del usuario
 * @returns {string} Hash único
 */
export const generateUserHash = (userData) => {
  const data = typeof userData === 'string' ? userData : JSON.stringify(userData);
  return CryptoJS.SHA256(data).toString();
};

/**
 * Encripta datos sensibles para almacenamiento local
 * @param {Object} data - Datos a encriptar
 * @param {string} password - Password para encriptar
 * @returns {string} Datos encriptados
 */
export const encryptData = (data, password) => {
  try {
    const dataString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(dataString, password).toString();
  } catch (error) {
    console.error('Error encriptando datos:', error);
    throw new Error('Error encriptando datos');
  }
};

/**
 * Desencripta datos del almacenamiento local
 * @param {string} encryptedData - Datos encriptados
 * @param {string} password - Password para desencriptar
 * @returns {Object} Datos desencriptados
 */
export const decryptData = (encryptedData, password) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    const dataString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(dataString);
  } catch (error) {
    console.error('Error desencriptando datos:', error);
    throw new Error('Error desencriptando datos');
  }
};

/**
 * Log educativo para debug del proceso ZKP
 * @param {string} step - Paso del proceso
 * @param {Object} data - Datos relevantes
 */
export const logZKPStep = (step, data) => {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    console.group(`🔐 [ZKP Debug] ${step} - ${timestamp}`);
    console.log('Datos:', data);
    console.groupEnd();
  }
};

export default {
  generateZKPIdentity,
  generateClaim,
  generateProof,
  verifyProof,
  isValidWalletAddress,
  formatWalletAddress,
  generateUserHash,
  encryptData,
  decryptData,
  logZKPStep
};