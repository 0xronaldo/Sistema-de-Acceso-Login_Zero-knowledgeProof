/**
 * Servicio de Backend ZKP
 * Maneja la comunicación entre el frontend y el backend Node.js
 */

class BackendZKPService {
  constructor() {
    this.baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    this.apiURL = `${this.baseURL}/api/zkp`;
  }

  /**
   * Verifica el estado del backend y issuer node
   */
  async getStatus() {
    try {
      const response = await fetch(`${this.apiURL}/status`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error conectando con backend');
      }
      
      return data;
    } catch (error) {
      console.error('❌ [BackendZKP] Error obteniendo estado:', error);
      throw error;
    }
  }

  /**
   * Crear credencial usando el issuer node
   * @param {Object} credentialData - Datos de la credencial
   */
  async createCredential(credentialData) {
    try {
      const response = await fetch(`${this.apiURL}/create-credential`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentialData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error creando credencial');
      }
      
      return data;
    } catch (error) {
      console.error('❌ [BackendZKP] Error creando credencial:', error);
      throw error;
    }
  }

  /**
   * Verificar prueba ZKP usando el issuer node
   * @param {Object} proofData - Datos de la prueba
   */
  async verifyProof(proofData) {
    try {
      const response = await fetch(`${this.apiURL}/verify-proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proofData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error verificando prueba');
      }
      
      return data;
    } catch (error) {
      console.error('❌ [BackendZKP] Error verificando prueba:', error);
      throw error;
    }
  }

  /**
   * Obtener credencial por ID
   * @param {string} credentialId - ID de la credencial
   */
  async getCredential(credentialId) {
    try {
      const response = await fetch(`${this.apiURL}/credential/${credentialId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error obteniendo credencial');
      }
      
      return data;
    } catch (error) {
      console.error('❌ [BackendZKP] Error obteniendo credencial:', error);
      throw error;
    }
  }

  /**
   * Obtener información del issuer
   */
  async getIssuerInfo() {
    try {
      const response = await fetch(`${this.apiURL}/issuer-info`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error obteniendo información del issuer');
      }
      
      return data;
    } catch (error) {
      console.error('❌ [BackendZKP] Error obteniendo información del issuer:', error);
      throw error;
    }
  }

  /**
   * Crear identidad DID
   * @param {Object} userData - Datos del usuario
   */
  async createIdentity(userData) {
    try {
      const response = await fetch(`${this.apiURL}/create-identity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error creando identidad DID');
      }
      
      return data;
    } catch (error) {
      console.error('❌ [BackendZKP] Error creando identidad:', error);
      throw error;
    }
  }

  /**
   * Crear claim para una identidad
   * @param {string} identityDID - DID de la identidad
   * @param {Object} claimData - Datos del claim
   */
  async createClaim(identityDID, claimData) {
    try {
      const response = await fetch(`${this.apiURL}/create-claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identityDID, claimData })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error creando claim');
      }
      
      return data;
    } catch (error) {
      console.error('❌ [BackendZKP] Error creando claim:', error);
      throw error;
    }
  }

  /**
   * Obtener claims de una identidad
   * @param {string} identityDID - DID de la identidad
   */
  async getClaims(identityDID) {
    try {
      const response = await fetch(`${this.apiURL}/claims/${identityDID}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error obteniendo claims');
      }
      
      return data;
    } catch (error) {
      console.error('❌ [BackendZKP] Error obteniendo claims:', error);
      throw error;
    }
  }

  /**
   * Publicar estado de identidad en blockchain
   * @param {string} identityDID - DID de la identidad
   */
  async publishState(identityDID) {
    try {
      const response = await fetch(`${this.apiURL}/publish-state/${identityDID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error publicando estado');
      }
      
      return data;
    } catch (error) {
      console.error('❌ [BackendZKP] Error publicando estado:', error);
      throw error;
    }
  }

  /**
   * Obtener QR code de un claim
   * @param {string} identityDID - DID de la identidad
   * @param {string} claimId - ID del claim
   */
  async getClaimQR(identityDID, claimId) {
    try {
      const response = await fetch(`${this.apiURL}/qr/${identityDID}/${claimId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error obteniendo QR');
      }
      
      return data;
    } catch (error) {
      console.error('❌ [BackendZKP] Error obteniendo QR:', error);
      throw error;
    }
  }

  /**
   * Flujo completo de autenticación por wallet
   * @param {Object} walletInfo - Información de la wallet conectada
   */
  async authenticateWithWallet(walletInfo) {
    try {
      console.log('🔐 [BackendZKP] Iniciando autenticación por wallet...');

      // 1. Verificar estado del backend
      const status = await this.getStatus();
      if (!status.success) {
        throw new Error('Backend no disponible');
      }

      // 2. Preparar datos para credencial de wallet
      const userData = {
        type: 'wallet',
        address: walletInfo.address,
        network: walletInfo.network.name,
        chainId: walletInfo.network.chainId
      };

      const claimData = {
        credentialSubject: {
          id: walletInfo.address,
          birthday: 19900101, // Fecha por defecto
          documentType: 99, // Tipo especial para wallet ownership
          walletAddress: walletInfo.address,
          network: walletInfo.network.name,
          chainId: walletInfo.network.chainId,
          authenticatedAt: new Date().toISOString()
        },
        type: "KYCAgeCredential",
        context: [
          "https://www.w3.org/2018/credentials/v1",
          "https://schema.iden3.io/core/jsonld/iden3proofs.jsonld",
          "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v4.jsonld"
        ],
        credentialSchema: {
          id: "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v4.json",
          type: "JsonSchema2023"
        }
      };

      console.log('📝 [BackendZKP] Creando credencial completa para wallet...');
      const credential = await this.createCredential({ userData, claimData });

      // 3. Publicar estado en blockchain (opcional)
      try {
        if (credential.data && credential.data.identity) {
          console.log('⛓️ [BackendZKP] Publicando estado en blockchain...');
          await this.publishState(credential.data.identity.identifier);
        }
      } catch (publishError) {
        console.warn('⚠️ [BackendZKP] Error publicando estado:', publishError.message);
      }

      console.log('✅ [BackendZKP] Autenticación por wallet completada');
      return {
        success: true,
        identity: credential.data.identity,
        claim: credential.data.claim,
        qrCode: credential.data.qrCode,
        walletInfo: walletInfo
      };

    } catch (error) {
      console.error('❌ [BackendZKP] Error en autenticación por wallet:', error);
      throw error;
    }
  }

  /**
   * Flujo completo de autenticación tradicional
   * @param {Object} userData - Datos del usuario tradicional
   */
  async authenticateWithCredentials(userData) {
    try {
      console.log('🔐 [BackendZKP] Iniciando autenticación tradicional...');

      // 1. Verificar estado del backend
      const status = await this.getStatus();
      if (!status.success) {
        throw new Error('Backend no disponible');
      }

      // 2. Preparar datos para credencial de usuario
      const userDataForIdentity = {
        type: 'traditional',
        name: userData.name,
        email: userData.email
      };

      const claimData = {
        credentialSubject: {
          id: userData.email,
          birthday: 19900101, // Fecha por defecto
          documentType: 1, // Tipo para identity credential
          name: userData.name,
          email: userData.email,
          authenticatedAt: new Date().toISOString()
        },
        type: "KYCAgeCredential",
        context: [
          "https://www.w3.org/2018/credentials/v1",
          "https://schema.iden3.io/core/jsonld/iden3proofs.jsonld",
          "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v4.jsonld"
        ],
        credentialSchema: {
          id: "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v4.json",
          type: "JsonSchema2023"
        }
      };

      console.log('📝 [BackendZKP] Creando credencial completa para usuario tradicional...');
      const credential = await this.createCredential({ userData: userDataForIdentity, claimData });

      // 3. Publicar estado en blockchain (opcional)
      try {
        if (credential.data && credential.data.identity) {
          console.log('⛓️ [BackendZKP] Publicando estado en blockchain...');
          await this.publishState(credential.data.identity.identifier);
        }
      } catch (publishError) {
        console.warn('⚠️ [BackendZKP] Error publicando estado:', publishError.message);
      }

      console.log('✅ [BackendZKP] Autenticación tradicional completada');
      return {
        success: true,
        identity: credential.data.identity,
        claim: credential.data.claim,
        qrCode: credential.data.qrCode,
        userData: userData
      };

    } catch (error) {
      console.error('❌ [BackendZKP] Error en autenticación tradicional:', error);
      throw error;
    }
  }
}

// Instancia singleton
const backendZKPService = new BackendZKPService();

export default backendZKPService;