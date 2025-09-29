const axios = require('axios');

class IssuerService {
  constructor() {
    this.baseURL = process.env.ISSUER_NODE_URL || 'http://localhost:3001';
    this.username = process.env.ISSUER_NODE_AUTH_USER || 'user-issuer';
    this.password = process.env.ISSUER_NODE_AUTH_PASSWORD || 'password-issuer';
    
    // Crear instancia de axios con auth básica
    this.client = axios.create({
      baseURL: this.baseURL,
      auth: {
        username: this.username,
        password: this.password
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Obtener estado del issuer node
  async getStatus() {
    try {
      const response = await this.client.get('/status');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Crear una credencial
  async createCredential(credentialData) {
    try {
      const response = await this.client.post('/v1/credentials', credentialData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creando credencial:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  // Obtener credencial por ID
  async getCredential(credentialId) {
    try {
      const response = await this.client.get(`/v1/credentials/${credentialId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  // Verificar prueba ZKP
  async verifyProof(proofData) {
    try {
      const response = await this.client.post('/v1/verification', proofData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error verificando prueba:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  // Obtener identidad del issuer
  async getIssuerDID() {
    try {
      const response = await this.client.get('/v1/identities');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  // Crear nueva identidad DID
  async createIdentity(identityData) {
    try {
      const payload = {
        didMetadata: {
          method: "iden3",
          blockchain: "polygon",
          network: "amoy",
          type: "BJJ"
        }
      };

      const response = await this.client.post('/v1/identities', payload);
      console.log('✅ Identidad DID creada:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error creando identidad DID:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  // Crear claim/credential para una identidad
  async createClaim(identityDID, claimData) {
    try {
      const payload = {
        credentialSubject: claimData.credentialSubject,
        type: claimData.type || "KYCAgeCredential",
        context: claimData.context || [
          "https://www.w3.org/2018/credentials/v1",
          "https://schema.iden3.io/core/jsonld/iden3proofs.jsonld",
          "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v4.jsonld"
        ],
        credentialSchema: claimData.credentialSchema || {
          id: "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v4.json",
          type: "JsonSchema2023"
        },
        expiration: claimData.expiration || null,
        subjectPosition: claimData.subjectPosition || "none",
        merklizeRootPosition: claimData.merklizeRootPosition || "none",
        revNonce: claimData.revNonce || null,
        version: claimData.version || 0,
        updatable: claimData.updatable || false
      };

      console.log('📝 Creando claim con payload:', payload);
      const response = await this.client.post(`/v1/${identityDID}/claims`, payload);
      console.log('✅ Claim creado:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error creando claim:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  // Obtener claims de una identidad
  async getClaims(identityDID) {
    try {
      const response = await this.client.get(`/v1/${identityDID}/claims`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  // Publicar estado de identidad en blockchain
  async publishState(identityDID) {
    try {
      const response = await this.client.post(`/v1/${identityDID}/state/publish`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error publicando estado:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  // Obtener QR code para claim
  async getClaimQR(identityDID, claimId) {
    try {
      const response = await this.client.get(`/v1/${identityDID}/claims/${claimId}/qrcode`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  // Crear conexión para verificación
  async createConnection(identityDID) {
    try {
      const response = await this.client.post(`/v1/${identityDID}/connections`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }
}

module.exports = new IssuerService();