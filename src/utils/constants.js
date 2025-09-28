/**
 * Configuración de constantes para el sistema ZKP
 * Incluye redes, configuración de PrivadoID y estados de autenticación
 */

// Configuración de redes blockchain
export const NETWORKS = {
  POLYGON_AMOY: {
    chainId: 80002,
    name: 'Polygon Amoy Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-amoy.polygon.technology/'],
    blockExplorerUrls: ['https://amoy.polygonscan.com/'],
  },
  POLYGON_MAINNET: {
    chainId: 137,
    name: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
  }
};

// Configuración por defecto de PrivadoID
export const PRIVADO_CONFIG = {
  // Configuración para modo local - estos valores deben ser actualizados según tu setup
  network: 'polygon-amoy',
  mode: 'local',
  issuerDID: process.env.REACT_APP_ISSUER_DID || 'did:iden3:polygon:amoy:your-issuer-did-here',
  schemaUrl: process.env.REACT_APP_SCHEMA_URL || 'https://raw.githubusercontent.com/your-repo/schema.json',
  circuitId: process.env.REACT_APP_CIRCUIT_ID || 'credentialAtomicQuerySigV2',
  
  // URLs del servicio PrivadoID local
  issuerUrl: process.env.REACT_APP_ISSUER_URL || 'http://localhost:3001',
  verifierUrl: process.env.REACT_APP_VERIFIER_URL || 'http://localhost:3002',
  
  // Configuración de claims
  defaultClaims: {
    WALLET_OWNER: 'wallet_owner',
    USER_NAME: 'user_name',
    REGISTRATION_DATE: 'registration_date'
  }
};

// Estados de autenticación
export const AUTH_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  GENERATING_PROOF: 'generating_proof',
  VERIFYING_PROOF: 'verifying_proof',
  AUTHENTICATED: 'authenticated',
  ERROR: 'error'
};

// Tipos de autenticación
export const AUTH_METHODS = {
  WALLET: 'wallet',
  TRADITIONAL: 'traditional'
};

// Tipos de error
export const ERROR_TYPES = {
  WALLET_NOT_CONNECTED: 'wallet_not_connected',
  WRONG_NETWORK: 'wrong_network',
  ZKP_GENERATION_FAILED: 'zkp_generation_failed',
  ZKP_VERIFICATION_FAILED: 'zkp_verification_failed',
  USER_NOT_REGISTERED: 'user_not_registered',
  INVALID_CREDENTIALS: 'invalid_credentials',
  PRIVADO_SERVICE_UNAVAILABLE: 'privado_service_unavailable',
  GENERIC_ERROR: 'generic_error'
};

// Mensajes de error en español
export const ERROR_MESSAGES = {
  [ERROR_TYPES.WALLET_NOT_CONNECTED]: 'Por favor conecta tu wallet para continuar',
  [ERROR_TYPES.WRONG_NETWORK]: 'Por favor cambia a la red Polygon Amoy para continuar',
  [ERROR_TYPES.ZKP_GENERATION_FAILED]: 'Error al generar la prueba Zero Knowledge. Inténtalo de nuevo.',
  [ERROR_TYPES.ZKP_VERIFICATION_FAILED]: 'Error al verificar la prueba Zero Knowledge. Verifica tus credenciales.',
  [ERROR_TYPES.USER_NOT_REGISTERED]: 'Usuario no registrado. Por favor regístrate primero.',
  [ERROR_TYPES.INVALID_CREDENTIALS]: 'Credenciales inválidas. Verifica tu email y contraseña.',
  [ERROR_TYPES.PRIVADO_SERVICE_UNAVAILABLE]: 'Servicio PrivadoID no disponible. Verifica la configuración local.',
  [ERROR_TYPES.GENERIC_ERROR]: 'Ha ocurrido un error inesperado. Inténtalo de nuevo.'
};

// Configuración de localStorage keys
export const STORAGE_KEYS = {
  USER_SESSION: 'zkp_user_session',
  ZKP_IDENTITY: 'zkp_identity',
  USER_CREDENTIALS: 'user_credentials',
  AUTH_METHOD: 'auth_method'
};

// Configuración de timeouts (en milisegundos)
export const TIMEOUTS = {
  WALLET_CONNECTION: 30000,
  ZKP_GENERATION: 60000,
  ZKP_VERIFICATION: 30000,
  API_REQUEST: 15000
};

// Configuración educativa - textos explicativos
export const EDUCATIONAL_CONTENT = {
  ZKP_EXPLANATION: {
    title: "¿Qué son las Zero Knowledge Proofs?",
    content: "Las ZKP permiten demostrar que conoces un secreto sin revelarlo. En este caso, demuestras que eres el dueño de una wallet o usuario registrado sin revelar información privada."
  },
  WALLET_AUTH_EXPLANATION: {
    title: "Autenticación por Wallet",
    content: "Tu dirección de wallet se usa como semilla para generar una identidad única. Luego se crea una prueba ZKP que demuestra la propiedad de la wallet."
  },
  TRADITIONAL_AUTH_EXPLANATION: {
    title: "Autenticación Tradicional + ZKP",
    content: "Después del registro tradicional, se genera una identidad ZKP personalizada que incluye tus datos como claims verificables."
  }
};

export default {
  NETWORKS,
  PRIVADO_CONFIG,
  AUTH_STATES,
  AUTH_METHODS,
  ERROR_TYPES,
  ERROR_MESSAGES,
  STORAGE_KEYS,
  TIMEOUTS,
  EDUCATIONAL_CONTENT
};