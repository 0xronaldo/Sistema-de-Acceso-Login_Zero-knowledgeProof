/**
 * Servicio de Autenticación para manejo completo del flujo ZKP
 * Orquesta wallet, PrivadoID y autenticación tradicional
 */

import walletService from './walletService';
import privadoService from './privadoService';
import { 
  AUTH_STATES, 
  AUTH_METHODS, 
  ERROR_TYPES, 
  ERROR_MESSAGES,
  STORAGE_KEYS,
  PRIVADO_CONFIG 
} from '../utils/constants';
import { 
  generateUserHash, 
  encryptData, 
  decryptData, 
  logZKPStep 
} from '../utils/zkpUtils';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.currentSession = null;
    this.authState = AUTH_STATES.DISCONNECTED;
    this.registeredUsers = this.loadRegisteredUsers();
  }

  /**
   * Inicializa el servicio de autenticación
   */
  async initialize() {
    try {
      logZKPStep('Inicializando AuthService', {});
      
      // Inicializar PrivadoID
      await privadoService.initialize();
      
      // Verificar si hay una sesión previa
      await this.checkExistingSession();
      
      console.log('✅ [Auth] Servicio de autenticación inicializado');
      
    } catch (error) {
      console.error('❌ [Auth] Error inicializando servicio:', error);
      this.authState = AUTH_STATES.ERROR;
    }
  }

  /**
   * Autenticación por wallet
   * @returns {Object} Resultado de la autenticación
   */
  async authenticateWithWallet() {
    try {
      this.authState = AUTH_STATES.CONNECTING;
      logZKPStep('Iniciando autenticación por wallet', {});

      // 1. Conectar wallet
      const walletInfo = await walletService.connectWallet();
      
      // 2. Verificar red correcta
      const isCorrectNetwork = await walletService.isCorrectNetwork();
      if (!isCorrectNetwork) {
        const switched = await walletService.switchToPolygonAmoy();
        if (!switched) {
          throw new Error(ERROR_TYPES.WRONG_NETWORK);
        }
      }

      // 3. Generar identidad ZKP
      this.authState = AUTH_STATES.GENERATING_PROOF;
      const zkpIdentity = await privadoService.createIdentity(AUTH_METHODS.WALLET, {
        walletAddress: walletInfo.address,
        network: walletInfo.network.name
      });

      // 4. Crear claim de propiedad de wallet
      const walletClaim = await privadoService.issueClaim(
        zkpIdentity,
        PRIVADO_CONFIG.defaultClaims.WALLET_OWNER,
        {
          walletAddress: walletInfo.address,
          network: walletInfo.network.chainId,
          timestamp: new Date().toISOString()
        }
      );

      // 5. Generar prueba ZKP
      const verificationRequest = privadoService.createVerificationRequest({
        type: 'wallet_ownership',
        credentialSubject: {
          walletAddress: walletInfo.address
        }
      });

      const zkpProof = await privadoService.generateProof(
        zkpIdentity,
        walletClaim,
        verificationRequest
      );

      // 6. Verificar la prueba
      this.authState = AUTH_STATES.VERIFYING_PROOF;
      const isValidProof = await privadoService.verifyProof(zkpProof, verificationRequest);

      if (!isValidProof) {
        throw new Error(ERROR_TYPES.ZKP_VERIFICATION_FAILED);
      }

      // 7. Crear sesión de usuario
      const userSession = {
        id: generateUserHash(walletInfo.address),
        method: AUTH_METHODS.WALLET,
        walletAddress: walletInfo.address,
        walletNetwork: walletInfo.network,
        zkpIdentity: zkpIdentity,
        zkpClaim: walletClaim,
        zkpProof: zkpProof,
        authenticatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      };

      this.currentUser = {
        id: userSession.id,
        method: AUTH_METHODS.WALLET,
        address: walletInfo.address,
        formattedAddress: walletInfo.formattedAddress,
        network: walletInfo.network,
        zkpDID: zkpIdentity.did
      };

      this.currentSession = userSession;
      this.authState = AUTH_STATES.AUTHENTICATED;

      // 8. Guardar sesión
      await this.saveSession(userSession);

      logZKPStep('Autenticación por wallet completada', {
        userId: this.currentUser.id,
        did: this.currentUser.zkpDID,
        method: AUTH_METHODS.WALLET
      });

      return {
        success: true,
        user: this.currentUser,
        session: this.currentSession
      };

    } catch (error) {
      console.error('❌ [Auth] Error en autenticación por wallet:', error);
      this.authState = AUTH_STATES.ERROR;
      throw new Error(ERROR_MESSAGES[error.message] || ERROR_MESSAGES[ERROR_TYPES.GENERIC_ERROR]);
    }
  }

  /**
   * Registro de usuario tradicional
   * @param {Object} userData - Datos del usuario (nombre, email, password)
   * @returns {Object} Resultado del registro
   */
  async registerUser(userData) {
    try {
      logZKPStep('Iniciando registro de usuario', { 
        name: userData.name, 
        email: userData.email 
      });

      // 1. Validar datos
      this.validateUserData(userData);

      // 2. Verificar que no exista ya
      const existingUser = this.findUserByEmail(userData.email);
      if (existingUser) {
        throw new Error(ERROR_TYPES.USER_ALREADY_EXISTS);
      }

      // 3. Generar identidad ZKP
      const zkpIdentity = await privadoService.createIdentity(AUTH_METHODS.TRADITIONAL, {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        registeredAt: new Date().toISOString()
      });

      // 4. Crear claim personalizado con el nombre
      const userClaim = await privadoService.issueClaim(
        zkpIdentity,
        PRIVADO_CONFIG.defaultClaims.USER_NAME,
        {
          name: userData.name,
          email: userData.email,
          registeredAt: new Date().toISOString()
        }
      );

      // 5. Crear usuario registrado
      const registeredUser = {
        id: generateUserHash(userData.email),
        name: userData.name,
        email: userData.email,
        passwordHash: generateUserHash(userData.password), // Hash simple para demo
        zkpIdentity: zkpIdentity,
        zkpClaim: userClaim,
        registeredAt: new Date().toISOString(),
        method: AUTH_METHODS.TRADITIONAL
      };

      // 6. Guardar usuario
      this.registeredUsers.push(registeredUser);
      this.saveRegisteredUsers();

      logZKPStep('Usuario registrado exitosamente', {
        userId: registeredUser.id,
        name: registeredUser.name,
        did: zkpIdentity.did
      });

      return {
        success: true,
        user: {
          id: registeredUser.id,
          name: registeredUser.name,
          email: registeredUser.email,
          zkpDID: zkpIdentity.did
        }
      };

    } catch (error) {
      console.error('❌ [Auth] Error en registro:', error);
      throw new Error(ERROR_MESSAGES[error.message] || ERROR_MESSAGES[ERROR_TYPES.GENERIC_ERROR]);
    }
  }

  /**
   * Autenticación tradicional con login
   * @param {Object} credentials - Email y password
   * @returns {Object} Resultado de la autenticación
   */
  async authenticateWithCredentials(credentials) {
    try {
      this.authState = AUTH_STATES.CONNECTING;
      logZKPStep('Iniciando autenticación tradicional', { email: credentials.email });

      // 1. Validar credenciales
      const user = this.validateCredentials(credentials);

      // 2. Generar prueba ZKP del claim del usuario
      this.authState = AUTH_STATES.GENERATING_PROOF;
      
      const verificationRequest = privadoService.createVerificationRequest({
        type: 'user_identity',
        credentialSubject: {
          name: user.name,
          email: user.email
        }
      });

      const zkpProof = await privadoService.generateProof(
        user.zkpIdentity,
        user.zkpClaim,
        verificationRequest
      );

      // 3. Verificar la prueba
      this.authState = AUTH_STATES.VERIFYING_PROOF;
      const isValidProof = await privadoService.verifyProof(zkpProof, verificationRequest);

      if (!isValidProof) {
        throw new Error(ERROR_TYPES.ZKP_VERIFICATION_FAILED);
      }

      // 4. Crear sesión de usuario
      const userSession = {
        id: user.id,
        method: AUTH_METHODS.TRADITIONAL,
        name: user.name,
        email: user.email,
        zkpIdentity: user.zkpIdentity,
        zkpClaim: user.zkpClaim,
        zkpProof: zkpProof,
        authenticatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      this.currentUser = {
        id: user.id,
        method: AUTH_METHODS.TRADITIONAL,
        name: user.name,
        email: user.email,
        zkpDID: user.zkpIdentity.did
      };

      this.currentSession = userSession;
      this.authState = AUTH_STATES.AUTHENTICATED;

      // 5. Guardar sesión
      await this.saveSession(userSession);

      logZKPStep('Autenticación tradicional completada', {
        userId: this.currentUser.id,
        name: this.currentUser.name,
        did: this.currentUser.zkpDID
      });

      return {
        success: true,
        user: this.currentUser,
        session: this.currentSession
      };

    } catch (error) {
      console.error('❌ [Auth] Error en autenticación tradicional:', error);
      this.authState = AUTH_STATES.ERROR;
      throw new Error(ERROR_MESSAGES[error.message] || ERROR_MESSAGES[ERROR_TYPES.GENERIC_ERROR]);
    }
  }

  /**
   * Logout del usuario
   */
  async logout() {
    try {
      logZKPStep('Cerrando sesión', { userId: this.currentUser?.id });

      // Desconectar wallet si está conectada
      if (walletService.isConnected) {
        await walletService.disconnectWallet();
      }

      // Limpiar estado local
      this.currentUser = null;
      this.currentSession = null;
      this.authState = AUTH_STATES.DISCONNECTED;

      // Limpiar almacenamiento local
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
      localStorage.removeItem(STORAGE_KEYS.AUTH_METHOD);

      console.log('✅ [Auth] Sesión cerrada exitosamente');

    } catch (error) {
      console.error('❌ [Auth] Error cerrando sesión:', error);
    }
  }

  /**
   * Verifica si hay una sesión existente
   */
  async checkExistingSession() {
    try {
      const sessionData = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
      
      if (!sessionData) {
        return false;
      }

      const session = JSON.parse(sessionData);
      
      // Verificar que la sesión no haya expirado
      if (new Date() > new Date(session.expiresAt)) {
        localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
        return false;
      }

      // Restaurar sesión
      this.currentSession = session;
      this.authState = AUTH_STATES.AUTHENTICATED;

      if (session.method === AUTH_METHODS.WALLET) {
        this.currentUser = {
          id: session.id,
          method: AUTH_METHODS.WALLET,
          address: session.walletAddress,
          network: session.walletNetwork,
          zkpDID: session.zkpIdentity.did
        };
      } else {
        this.currentUser = {
          id: session.id,
          method: AUTH_METHODS.TRADITIONAL,
          name: session.name,
          email: session.email,
          zkpDID: session.zkpIdentity.did
        };
      }

      logZKPStep('Sesión restaurada', { userId: this.currentUser.id });
      return true;

    } catch (error) {
      console.error('❌ [Auth] Error verificando sesión existente:', error);
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
      return false;
    }
  }

  /**
   * Valida datos de usuario para registro
   * @param {Object} userData - Datos a validar
   */
  validateUserData(userData) {
    if (!userData.name || userData.name.length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }

    if (!userData.email || !userData.email.includes('@')) {
      throw new Error('Email inválido');
    }

    if (!userData.password || userData.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
  }

  /**
   * Valida credenciales de login
   * @param {Object} credentials - Credenciales a validar
   * @returns {Object} Usuario encontrado
   */
  validateCredentials(credentials) {
    const user = this.findUserByEmail(credentials.email);
    
    if (!user) {
      throw new Error(ERROR_TYPES.USER_NOT_REGISTERED);
    }

    const passwordHash = generateUserHash(credentials.password);
    if (passwordHash !== user.passwordHash) {
      throw new Error(ERROR_TYPES.INVALID_CREDENTIALS);
    }

    return user;
  }

  /**
   * Busca un usuario por email
   * @param {string} email - Email a buscar
   * @returns {Object|null} Usuario encontrado o null
   */
  findUserByEmail(email) {
    return this.registeredUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  /**
   * Guarda la sesión en localStorage
   * @param {Object} session - Sesión a guardar
   */
  async saveSession(session) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
      localStorage.setItem(STORAGE_KEYS.AUTH_METHOD, session.method);
    } catch (error) {
      console.error('❌ [Auth] Error guardando sesión:', error);
    }
  }

  /**
   * Carga usuarios registrados del localStorage
   * @returns {Array} Lista de usuarios registrados
   */
  loadRegisteredUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_CREDENTIALS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ [Auth] Error cargando usuarios registrados:', error);
      return [];
    }
  }

  /**
   * Guarda usuarios registrados en localStorage
   */
  saveRegisteredUsers() {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_CREDENTIALS, JSON.stringify(this.registeredUsers));
    } catch (error) {
      console.error('❌ [Auth] Error guardando usuarios registrados:', error);
    }
  }

  /**
   * Obtiene el estado actual de autenticación
   * @returns {Object} Estado actual
   */
  getAuthState() {
    return {
      isAuthenticated: this.authState === AUTH_STATES.AUTHENTICATED,
      authState: this.authState,
      user: this.currentUser,
      session: this.currentSession,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Obtiene información de debug del servicio
   * @returns {Object} Información de debug
   */
  getDebugInfo() {
    return {
      authState: this.authState,
      currentUser: this.currentUser,
      currentSession: this.currentSession ? {
        id: this.currentSession.id,
        method: this.currentSession.method,
        authenticatedAt: this.currentSession.authenticatedAt,
        expiresAt: this.currentSession.expiresAt
      } : null,
      registeredUsersCount: this.registeredUsers.length,
      walletService: walletService.getDebugInfo(),
      privadoService: privadoService.getDebugInfo(),
      timestamp: new Date().toISOString()
    };
  }
}

// Instancia singleton del servicio
const authService = new AuthService();

export default authService;