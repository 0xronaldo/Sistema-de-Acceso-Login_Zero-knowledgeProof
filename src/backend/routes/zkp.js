const express = require('express');
const zkpController = require('../controllers/zkpController');

const router = express.Router();

// Rutas principales para ZKP
router.get('/status', zkpController.getStatus);

// Identidades y credenciales
router.post('/create-identity', zkpController.createIdentity);
router.post('/create-claim', zkpController.createClaim);
router.post('/create-credential', zkpController.createCredential);

// Verificación
router.post('/verify-proof', zkpController.verifyProof);

// Consultas
router.get('/credential/:id', zkpController.getCredential);
router.get('/claims/:identityDID', zkpController.getClaims);
router.get('/qr/:identityDID/:claimId', zkpController.getClaimQR);

// Estado y publicación
router.post('/publish-state/:identityDID', zkpController.publishState);
router.get('/issuer-info', zkpController.getIssuerInfo);

module.exports = router;