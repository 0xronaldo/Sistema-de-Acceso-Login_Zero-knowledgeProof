/**
 * Servicio de PrivadoID para manejo de identidades ZKP
 * Integración con PrivadoID local para generación y verificación de pruebas
 */

import { PRIVADO_CONFIG, ERROR_TYPES, TIMEOUTS } from '../utils/constants';
import { generateZKPIdentity, generateClaim, generateProof, verifyProof, logZKPStep } from '../utils/zkpUtils';

class PrivadoService {
  constructor() {
    this.initialized = false;
    this.config = PRIVADO_CONFIG;
  }

  /**
   * Inicializa el servicio PrivadoID
   * @returns {boolean} True si se inicializó correctamente
   */
  async initialize() {
    try {
      logZKPStep('Inicializando PrivadoID Service', this.config);
      
      // Verificar si el servicio local está disponible
      const isAvailable = await this.checkServiceAvailability();
      
      if (!isAvailable) {
        console.warn('⚠️ [PrivadoID] Servicio local no disponible, usando modo simulación');
      }
      
      this.initialized = true;
      console.log('✅ [PrivadoID] Servicio inicializado exitosamente');
      return true;
      
    } catch (error) {
      console.error('❌ [PrivadoID] Error inicializando servicio:', error);
      throw new Error(ERROR_TYPES.PRIVADO_SERVICE_UNAVAILABLE);
    }
  }

  /**
   * Verifica si el servicio PrivadoID local está disponible
   * @returns {boolean} True si está disponible
   */
  async checkServiceAvailability() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUTS.API_REQUEST);

      const response = await fetch(`${this.config.issuerUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      clearTimeout(timeout);
      return response.ok;
      
    } catch (error) {
      console.warn('⚠️ [PrivadoID] Servicio local no disponible:', error.message);
      return false;
    }
  }

  /**
   * Crea una nueva identidad ZKP
   * @param {string} method - Método de autenticación
   * @param {Object} userData - Datos del usuario
   * @returns {Object} Identidad ZKP creada
   */
  async createIdentity(method, userData) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      logZKPStep('Creando identidad ZKP', { method, userData: { ...userData, password: '***' } });
      
      const identity = await generateZKPIdentity(method, userData);
      
      logZKPStep('Identidad ZKP creada', { did: identity.did, method: identity.userInfo.method });
      return identity;
      
    } catch (error) {
      console.error('❌ [PrivadoID] Error creando identidad:', error);
      throw new Error(ERROR_TYPES.ZKP_GENERATION_FAILED);
    }
  }

  /**
   * Emite un claim para una identidad
   * @param {Object} identity - Identidad ZKP
   * @param {string} claimType - Tipo de claim
   * @param {Object} claimData - Datos del claim
   * @returns {Object} Claim emitido
   */
  async issueClaim(identity, claimType, claimData) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      logZKPStep('Emitiendo claim', { 
        identity: identity.did, 
        claimType, 
        claimData 
      });

      const claim = await generateClaim(identity, claimType, claimData);
      
      // En un escenario real, aquí se comunicaría con el issuer de PrivadoID
      // para emitir el claim oficialmente
      
      logZKPStep('Claim emitido exitosamente', { claimId: claim.id, type: claim.type });
      return claim;
      
    } catch (error) {
      console.error('❌ [PrivadoID] Error emitiendo claim:', error);
      throw new Error(ERROR_TYPES.ZKP_GENERATION_FAILED);
    }
  }

  /**
   * Genera una prueba ZKP para un claim
   * @param {Object} identity - Identidad ZKP
   * @param {Object} claim - Claim a probar
   * @param {Object} verificationRequest - Request de verificación
   * @returns {Object} Prueba ZKP generada
   */
  async generateProof(identity, claim, verificationRequest = {}) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      logZKPStep('Generando prueba ZKP', { 
        identity: identity.did,
        claim: claim.id,
        request: verificationRequest
      });

      const proof = await generateProof(identity, claim, verificationRequest);
      
      logZKPStep('Prueba ZKP generada exitosamente', { 
        proofId: proof.id,
        circuitId: proof.circuitId
      });
      
      return proof;
      
    } catch (error) {
      console.error('❌ [PrivadoID] Error generando prueba:', error);
      throw new Error(ERROR_TYPES.ZKP_GENERATION_FAILED);
    }
  }

  /**
   * Verifica una prueba ZKP
   * @param {Object} proof - Prueba a verificar
   * @param {Object} verificationRequest - Request original de verificación
   * @returns {boolean} True si la prueba es válida
   */
  async verifyProof(proof, verificationRequest = {}) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      logZKPStep('Verificando prueba ZKP', { 
        proofId: proof.id,
        request: verificationRequest
      });

      const isValid = await verifyProof(proof, verificationRequest.expectedClaim);
      
      logZKPStep('Resultado verificación', { 
        proofId: proof.id,
        valid: isValid
      });
      
      return isValid;
      
    } catch (error) {
      console.error('❌ [PrivadoID] Error verificando prueba:', error);
      throw new Error(ERROR_TYPES.ZKP_VERIFICATION_FAILED);
    }
  }

  /**
   * Obtiene el estado del issuer
   * @returns {Object} Estado del issuer
   */
  async getIssuerState() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // En un escenario real, esto consultaría el estado del issuer
      return {
        did: this.config.issuerDID,
        state: 'active',
        timestamp: new Date().toISOString(),
        network: this.config.network
      };
      
    } catch (error) {
      console.error('❌ [PrivadoID] Error obteniendo estado del issuer:', error);
      throw new Error(ERROR_TYPES.PRIVADO_SERVICE_UNAVAILABLE);
    }
  }

  /**
   * Crea un request de verificación personalizado
   * @param {Object} requirements - Requerimientos de verificación
   * @returns {Object} Request de verificación
   */
  createVerificationRequest(requirements) {
    try {
      const request = {
        id: `req_${Date.now()}`,
        circuitId: this.config.circuitId,
        query: {
          allowedIssuers: [this.config.issuerDID],
          credentialSubject: requirements.credentialSubject || {},
          type: requirements.type || 'credentialAtomicQuerySigV2'
        },
        timestamp: new Date().toISOString()
      };

      logZKPStep('Request de verificación creado', request);
      return request;
      
    } catch (error) {
      console.error('❌ [PrivadoID] Error creando request de verificación:', error);
      throw new Error(ERROR_TYPES.GENERIC_ERROR);
    }
  }

  /**
   * Obtiene información de debug del servicio
   * @returns {Object} Información de debug
   */
  getDebugInfo() {
    return {
      initialized: this.initialized,
      config: {
        network: this.config.network,
        mode: this.config.mode,
        issuerDID: this.config.issuerDID,
        issuerUrl: this.config.issuerUrl,
        verifierUrl: this.config.verifierUrl
      },
      timestamp: new Date().toISOString()
    };
  }
}

// Instancia singleton del servicio
const privadoService = new PrivadoService();

export default privadoService;