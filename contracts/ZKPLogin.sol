// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ZKPVerifier.sol";

/**
 * @title ZKPLogin
 * @dev Contrato principal para el sistema de autenticación ZKP
 * @author Sistema de Autenticación ZKP
 */
contract ZKPLogin {
    // Dependencias
    ZKPVerifier public immutable zkpVerifier;
    
    // Estructuras
    struct User {
        bytes32 emailHash;
        bytes32 passwordHash;
        bytes32 userCommitment;
        bytes32 publicKeyHash;
        address walletAddress;
        uint256 registrationTimestamp;
        uint256 lastLoginTimestamp;
        bool isRegistered;
        bool isActive;
        AuthMethod preferredMethod;
    }
    
    struct LoginAttempt {
        address user;
        bytes32 proofHash;
        uint256 timestamp;
        bool success;
        AuthMethod method;
    }
    
    enum AuthMethod {
        TRADITIONAL,
        WALLET,
        HYBRID
    }
    
    // Estados
    mapping(address => User) public users;
    mapping(bytes32 => address) public emailHashToUser;
    mapping(bytes32 => bool) public usedNonces;
    mapping(address => LoginAttempt[]) public loginHistory;
    
    // Configuraciones
    uint256 public constant MAX_LOGIN_ATTEMPTS = 5;
    uint256 public constant LOCKOUT_DURATION = 1 hours;
    uint256 public constant PROOF_VALIDITY_PERIOD = 15 minutes;
    uint256 public minPasswordEntropy = 50; // bits
    
    // Contadores
    uint256 public totalUsers;
    uint256 public totalLogins;
    mapping(address => uint256) public failedAttempts;
    mapping(address => uint256) public lockoutUntil;
    
    // Eventos
    event UserRegistered(
        address indexed user,
        bytes32 indexed emailHash,
        AuthMethod preferredMethod,
        uint256 timestamp
    );
    
    event LoginSuccessful(
        address indexed user,
        AuthMethod method,
        bytes32 proofHash,
        uint256 timestamp
    );
    
    event LoginFailed(
        address indexed user,
        AuthMethod method,
        string reason,
        uint256 timestamp
    );
    
    event UserLocked(
        address indexed user,
        uint256 lockoutUntil,
        uint256 timestamp
    );
    
    event UserUnlocked(
        address indexed user,
        uint256 timestamp
    );
    
    // Modificadores
    modifier notLocked(address user) {
        require(block.timestamp >= lockoutUntil[user], "User is locked out");
        _;
    }
    
    modifier validUser(address user) {
        require(users[user].isRegistered, "User not registered");
        require(users[user].isActive, "User account is inactive");
        _;
    }
    
    modifier validNonce(bytes32 nonce) {
        require(!usedNonces[nonce], "Nonce already used");
        _;
        usedNonces[nonce] = true;
    }
    
    constructor(address _zkpVerifier) {
        zkpVerifier = ZKPVerifier(_zkpVerifier);
    }
    
    /**
     * @dev Registra un nuevo usuario con método tradicional
     * @param emailHash Hash del email del usuario
     * @param passwordHash Hash de la contraseña
     * @param userCommitment Commitment ZKP del usuario
     * @param publicKeyHash Hash de la clave pública
     * @param proof Prueba ZKP de registro
     * @param publicInputs Inputs públicos de la prueba
     */
    function registerTraditional(
        bytes32 emailHash,
        bytes32 passwordHash,
        bytes32 userCommitment,
        bytes32 publicKeyHash,
        ZKPVerifier.Proof memory proof,
        uint256[] memory publicInputs
    ) external {
        require(!users[msg.sender].isRegistered, "User already registered");
        require(emailHashToUser[emailHash] == address(0), "Email already registered");
        require(emailHash != bytes32(0), "Invalid email hash");
        require(passwordHash != bytes32(0), "Invalid password hash");
        
        // Verificar la prueba ZKP de registro
        require(
            zkpVerifier.verifyProof(proof, publicInputs),
            "Invalid registration proof"
        );
        
        // Crear usuario
        users[msg.sender] = User({
            emailHash: emailHash,
            passwordHash: passwordHash,
            userCommitment: userCommitment,
            publicKeyHash: publicKeyHash,
            walletAddress: msg.sender,
            registrationTimestamp: block.timestamp,
            lastLoginTimestamp: 0,
            isRegistered: true,
            isActive: true,
            preferredMethod: AuthMethod.TRADITIONAL
        });
        
        emailHashToUser[emailHash] = msg.sender;
        totalUsers++;
        
        emit UserRegistered(msg.sender, emailHash, AuthMethod.TRADITIONAL, block.timestamp);
    }
    
    /**
     * @dev Registra un usuario con wallet
     * @param publicKeyHash Hash de la clave pública de la wallet
     * @param proof Prueba ZKP de control de wallet
     * @param publicInputs Inputs públicos de la prueba
     */
    function registerWallet(
        bytes32 publicKeyHash,
        ZKPVerifier.Proof memory proof,
        uint256[] memory publicInputs
    ) external {
        require(!users[msg.sender].isRegistered, "User already registered");
        require(publicKeyHash != bytes32(0), "Invalid public key hash");
        
        // Verificar la prueba ZKP de control de wallet
        require(
            zkpVerifier.verifyProof(proof, publicInputs),
            "Invalid wallet proof"
        );
        
        // Crear usuario
        users[msg.sender] = User({
            emailHash: bytes32(0),
            passwordHash: bytes32(0),
            userCommitment: publicKeyHash,
            publicKeyHash: publicKeyHash,
            walletAddress: msg.sender,
            registrationTimestamp: block.timestamp,
            lastLoginTimestamp: 0,
            isRegistered: true,
            isActive: true,
            preferredMethod: AuthMethod.WALLET
        });
        
        totalUsers++;
        
        emit UserRegistered(msg.sender, bytes32(0), AuthMethod.WALLET, block.timestamp);
    }
    
    /**
     * @dev Login tradicional con ZKP
     * @param proof Prueba ZKP de autenticación
     * @param publicInputs Inputs públicos incluyendo timestamp y nonce
     * @param nonce Nonce único para prevenir replay attacks
     */
    function loginTraditional(
        ZKPVerifier.Proof memory proof,
        uint256[] memory publicInputs,
        bytes32 nonce
    ) external 
        validUser(msg.sender)
        notLocked(msg.sender)
        validNonce(nonce)
    {
        // Verificar que el timestamp está dentro del período válido
        require(publicInputs.length >= 2, "Invalid public inputs");
        uint256 proofTimestamp = publicInputs[0];
        require(
            proofTimestamp <= block.timestamp && 
            proofTimestamp > block.timestamp - PROOF_VALIDITY_PERIOD,
            "Proof timestamp invalid"
        );
        
        // Verificar la prueba ZKP
        bool proofValid = zkpVerifier.verifyProof(proof, publicInputs);
        
        if (proofValid) {
            _handleSuccessfulLogin(AuthMethod.TRADITIONAL, 
                keccak256(abi.encodePacked(proof.a, proof.b, proof.c)));
        } else {
            _handleFailedLogin(AuthMethod.TRADITIONAL, "Invalid proof");
        }
    }
    
    /**
     * @dev Login con wallet
     * @param proof Prueba ZKP de control de wallet
     * @param publicInputs Inputs públicos
     * @param nonce Nonce único
     */
    function loginWallet(
        ZKPVerifier.Proof memory proof,
        uint256[] memory publicInputs,
        bytes32 nonce
    ) external 
        validUser(msg.sender)
        notLocked(msg.sender)
        validNonce(nonce)
    {
        require(publicInputs.length >= 2, "Invalid public inputs");
        uint256 proofTimestamp = publicInputs[0];
        require(
            proofTimestamp <= block.timestamp && 
            proofTimestamp > block.timestamp - PROOF_VALIDITY_PERIOD,
            "Proof timestamp invalid"
        );
        
        bool proofValid = zkpVerifier.verifyProof(proof, publicInputs);
        
        if (proofValid) {
            _handleSuccessfulLogin(AuthMethod.WALLET,
                keccak256(abi.encodePacked(proof.a, proof.b, proof.c)));
        } else {
            _handleFailedLogin(AuthMethod.WALLET, "Invalid wallet proof");
        }
    }
    
    /**
     * @dev Maneja un login exitoso
     * @param method Método de autenticación usado
     * @param proofHash Hash de la prueba
     */
    function _handleSuccessfulLogin(AuthMethod method, bytes32 proofHash) internal {
        // Resetear intentos fallidos
        failedAttempts[msg.sender] = 0;
        lockoutUntil[msg.sender] = 0;
        
        // Actualizar timestamp de último login
        users[msg.sender].lastLoginTimestamp = block.timestamp;
        
        // Registrar en historial
        loginHistory[msg.sender].push(LoginAttempt({
            user: msg.sender,
            proofHash: proofHash,
            timestamp: block.timestamp,
            success: true,
            method: method
        }));
        
        totalLogins++;
        
        emit LoginSuccessful(msg.sender, method, proofHash, block.timestamp);
    }
    
    /**
     * @dev Maneja un login fallido
     * @param method Método de autenticación usado
     * @param reason Razón del fallo
     */
    function _handleFailedLogin(AuthMethod method, string memory reason) internal {
        failedAttempts[msg.sender]++;
        
        // Registrar en historial
        loginHistory[msg.sender].push(LoginAttempt({
            user: msg.sender,
            proofHash: bytes32(0),
            timestamp: block.timestamp,
            success: false,
            method: method
        }));
        
        // Bloquear usuario si excede intentos máximos
        if (failedAttempts[msg.sender] >= MAX_LOGIN_ATTEMPTS) {
            lockoutUntil[msg.sender] = block.timestamp + LOCKOUT_DURATION;
            emit UserLocked(msg.sender, lockoutUntil[msg.sender], block.timestamp);
        }
        
        emit LoginFailed(msg.sender, method, reason, block.timestamp);
    }
    
    /**
     * @dev Desbloquea manualmente un usuario (función administrativa)
     * @param user Usuario a desbloquear
     */
    function unlockUser(address user) external {
        // En producción, agregar modificador onlyOwner o onlyAdmin
        require(lockoutUntil[user] > block.timestamp, "User is not locked");
        
        lockoutUntil[user] = 0;
        failedAttempts[user] = 0;
        
        emit UserUnlocked(user, block.timestamp);
    }
    
    /**
     * @dev Logout (revoca la prueba actual)
     */
    function logout() external validUser(msg.sender) {
        bytes32 proofHash = zkpVerifier.getUserProofHash(msg.sender);
        if (proofHash != bytes32(0)) {
            zkpVerifier.revokeProof(proofHash);
        }
    }
    
    /**
     * @dev Obtiene información del usuario
     * @param user Dirección del usuario
     * @return Información básica del usuario (sin datos sensibles)
     */
    function getUserInfo(address user) external view returns (
        bool isRegistered,
        bool isActive,
        AuthMethod preferredMethod,
        uint256 registrationTimestamp,
        uint256 lastLoginTimestamp,
        uint256 failedAttempts_,
        uint256 lockoutUntil_
    ) {
        User memory userData = users[user];
        return (
            userData.isRegistered,
            userData.isActive,
            userData.preferredMethod,
            userData.registrationTimestamp,
            userData.lastLoginTimestamp,
            failedAttempts[user],
            lockoutUntil[user]
        );
    }
    
    /**
     * @dev Obtiene estadísticas del sistema
     */
    function getSystemStats() external view returns (
        uint256 totalUsers_,
        uint256 totalLogins_,
        uint256 activeUsers
    ) {
        uint256 active = 0;
        // En producción, mantener un contador separado para eficiencia
        return (totalUsers, totalLogins, active);
    }
    
    /**
     * @dev Obtiene el historial de login de un usuario (limitado)
     * @param user Usuario
     * @param limit Número máximo de registros
     */
    function getLoginHistory(address user, uint256 limit) 
        external 
        view 
        returns (LoginAttempt[] memory) 
    {
        LoginAttempt[] memory history = loginHistory[user];
        if (history.length <= limit) {
            return history;
        }
        
        LoginAttempt[] memory limitedHistory = new LoginAttempt[](limit);
        uint256 startIndex = history.length - limit;
        
        for (uint256 i = 0; i < limit; i++) {
            limitedHistory[i] = history[startIndex + i];
        }
        
        return limitedHistory;
    }
}