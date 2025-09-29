const issuerService = require('../services/issuerService');

class ZKPController {
  
  // Verificar estado del issuer node
  async getStatus(req, res) {
    try {
      const result = await issuerService.getStatus();
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Issuer Node conectado correctamente',
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error conectando con Issuer Node',
          error: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Crear identidad DID
  async createIdentity(req, res) {
    try {
      const { userData } = req.body;

      console.log('🆔 Creando nueva identidad DID para:', userData);
      
      const result = await issuerService.createIdentity(userData);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Identidad DID creada exitosamente',
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error creando identidad DID',
          error: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Crear claim para una identidad
  async createClaim(req, res) {
    try {
      const { identityDID, claimData } = req.body;

      // Validación básica
      if (!identityDID || !claimData) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: identityDID, claimData'
        });
      }

      console.log('📝 Creando claim para identidad:', identityDID);
      
      const result = await issuerService.createClaim(identityDID, claimData);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Claim creado exitosamente',
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error creando claim',
          error: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Crear credencial completa (identidad + claim)
  async createCredential(req, res) {
    try {
      const { userData, claimData } = req.body;

      console.log('🔐 Iniciando proceso completo de credencial...');

      // 1. Crear identidad DID
      const identityResult = await issuerService.createIdentity(userData);
      if (!identityResult.success) {
        throw new Error(`Error creando identidad: ${identityResult.error}`);
      }

      const identityDID = identityResult.data.identifier;
      console.log('✅ Identidad creada:', identityDID);

      // 2. Crear claim
      const claimResult = await issuerService.createClaim(identityDID, claimData);
      if (!claimResult.success) {
        throw new Error(`Error creando claim: ${claimResult.error}`);
      }

      console.log('✅ Claim creado:', claimResult.data.id);

      // 3. Obtener QR code (opcional)
      let qrCode = null;
      try {
        const qrResult = await issuerService.getClaimQR(identityDID, claimResult.data.id);
        if (qrResult.success) {
          qrCode = qrResult.data;
        }
      } catch (qrError) {
        console.warn('⚠️ Error obteniendo QR:', qrError.message);
      }

      res.json({
        success: true,
        message: 'Credencial completa creada exitosamente',
        data: {
          identity: identityResult.data,
          claim: claimResult.data,
          qrCode: qrCode
        }
      });
      
    } catch (error) {
      console.error('❌ Error en createCredential:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Verificar prueba ZKP
  async verifyProof(req, res) {
    try {
      const { proof, publicSignals } = req.body;

      if (!proof || !publicSignals) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: proof, publicSignals'
        });
      }

      const proofData = {
        proof,
        publicSignals
      };

      const result = await issuerService.verifyProof(proofData);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Prueba verificada exitosamente',
          verified: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error verificando prueba',
          verified: false,
          error: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener credencial por ID
  async getCredential(req, res) {
    try {
      const { id } = req.params;
      
      const result = await issuerService.getCredential(id);
      
      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Credencial no encontrada',
          error: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener información del issuer
  async getIssuerInfo(req, res) {
    try {
      const result = await issuerService.getIssuerDID();
      
      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error obteniendo información del issuer',
          error: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener claims de una identidad
  async getClaims(req, res) {
    try {
      const { identityDID } = req.params;
      
      const result = await issuerService.getClaims(identityDID);
      
      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Claims no encontrados',
          error: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Publicar estado de identidad
  async publishState(req, res) {
    try {
      const { identityDID } = req.params;
      
      const result = await issuerService.publishState(identityDID);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Estado publicado exitosamente',
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error publicando estado',
          error: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener QR de un claim
  async getClaimQR(req, res) {
    try {
      const { identityDID, claimId } = req.params;
      
      const result = await issuerService.getClaimQR(identityDID, claimId);
      
      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'QR no encontrado',
          error: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = new ZKPController();