// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title UserDataRegistry
 * @dev Contrato para el registro y gestión de datos de usuario
 * @author Sistema de Autenticación ZKP
 */
contract UserDataRegistry {
    // Estructuras
    struct UserProfile {
        bytes32 profileHash;
        bytes32 metadataHash;
        uint256 createdAt;
        uint256 updatedAt;
        bool isPublic;
        mapping(string => bytes32) attributeHashes;
        string[] attributeKeys;
    }
    
    struct DataCommitment {
        bytes32 commitment;
        bytes32 nullifierHash;
        uint256 timestamp;
        bool isRevealed;
        address submitter;
    }
    
    struct AuditLog {
        address user;
        string action;
        bytes32 dataHash;
        uint256 timestamp;
        bytes32 proofHash;
    }
    
    // Estados
    mapping(address => UserProfile) public userProfiles;
    mapping(bytes32 => DataCommitment) public dataCommitments;
    mapping(address => AuditLog[]) public auditLogs;
    mapping(bytes32 => bool) public revokedCommitments;
    
    // Configuraciones
    uint256 public constant MAX_ATTRIBUTES = 50;
    uint256 public constant DATA_RETENTION_PERIOD = 365 days;
    uint256 public minCommitmentDelay = 1 hours;
    
    // Contadores
    uint256 public totalProfiles;
    uint256 public totalCommitments;
    
    // Eventos
    event ProfileCreated(address indexed user, bytes32 profileHash, uint256 timestamp);
    event ProfileUpdated(address indexed user, bytes32 newProfileHash, uint256 timestamp);
    event DataCommitted(address indexed user, bytes32 commitment, bytes32 nullifierHash);
    event DataRevealed(address indexed user, bytes32 commitment, bytes32 dataHash);
    event AttributeAdded(address indexed user, string attributeKey, bytes32 attributeHash);
    event AttributeRemoved(address indexed user, string attributeKey);
    event CommitmentRevoked(bytes32 commitment, address revokedBy, uint256 timestamp);
    
    // Modificadores
    modifier onlyProfileOwner(address user) {
        require(msg.sender == user, "Not authorized to modify this profile");
        _;
    }
    
    modifier validCommitment(bytes32 commitment) {
        require(commitment != bytes32(0), "Invalid commitment");
        require(!revokedCommitments[commitment], "Commitment is revoked");
        _;
    }
    
    modifier profileExists(address user) {
        require(userProfiles[user].createdAt > 0, "Profile does not exist");
        _;
    }
    
    /**
     * @dev Crea un perfil de usuario
     * @param profileHash Hash del perfil inicial
     * @param metadataHash Hash de metadatos adicionales
     * @param isPublic Si el perfil es público
     */
    function createProfile(
        bytes32 profileHash,
        bytes32 metadataHash,
        bool isPublic
    ) external {
        require(userProfiles[msg.sender].createdAt == 0, "Profile already exists");
        require(profileHash != bytes32(0), "Invalid profile hash");
        
        UserProfile storage profile = userProfiles[msg.sender];
        profile.profileHash = profileHash;
        profile.metadataHash = metadataHash;
        profile.createdAt = block.timestamp;
        profile.updatedAt = block.timestamp;
        profile.isPublic = isPublic;
        
        totalProfiles++;
        
        _addAuditLog(msg.sender, "PROFILE_CREATED", profileHash, bytes32(0));
        emit ProfileCreated(msg.sender, profileHash, block.timestamp);
    }
    
    /**
     * @dev Actualiza un perfil de usuario
     * @param newProfileHash Nuevo hash del perfil
     * @param newMetadataHash Nuevo hash de metadatos
     */
    function updateProfile(
        bytes32 newProfileHash,
        bytes32 newMetadataHash
    ) external profileExists(msg.sender) onlyProfileOwner(msg.sender) {
        require(newProfileHash != bytes32(0), "Invalid profile hash");
        
        UserProfile storage profile = userProfiles[msg.sender];
        bytes32 oldHash = profile.profileHash;
        
        profile.profileHash = newProfileHash;
        profile.metadataHash = newMetadataHash;
        profile.updatedAt = block.timestamp;
        
        _addAuditLog(msg.sender, "PROFILE_UPDATED", newProfileHash, bytes32(0));
        emit ProfileUpdated(msg.sender, newProfileHash, block.timestamp);
    }
    
    /**
     * @dev Commit a un dato sin revelarlo
     * @param commitment Hash commitment del dato
     * @param nullifierHash Hash nullifier para prevenir double-spending
     */
    function commitData(
        bytes32 commitment,
        bytes32 nullifierHash
    ) external profileExists(msg.sender) validCommitment(commitment) {
        require(nullifierHash != bytes32(0), "Invalid nullifier hash");
        require(dataCommitments[commitment].timestamp == 0, "Commitment already exists");
        
        dataCommitments[commitment] = DataCommitment({
            commitment: commitment,
            nullifierHash: nullifierHash,
            timestamp: block.timestamp,
            isRevealed: false,
            submitter: msg.sender
        });
        
        totalCommitments++;
        
        _addAuditLog(msg.sender, "DATA_COMMITTED", commitment, bytes32(0));
        emit DataCommitted(msg.sender, commitment, nullifierHash);
    }
    
    /**
     * @dev Revela un dato previamente committeado
     * @param commitment El commitment original
     * @param data El dato original
     * @param nonce El nonce usado en el commitment
     */
    function revealData(
        bytes32 commitment,
        bytes32 data,
        bytes32 nonce
    ) external validCommitment(commitment) {
        DataCommitment storage dataCommit = dataCommitments[commitment];
        require(dataCommit.submitter == msg.sender, "Not authorized to reveal this commitment");
        require(!dataCommit.isRevealed, "Data already revealed");
        require(
            block.timestamp >= dataCommit.timestamp + minCommitmentDelay,
            "Commitment delay not met"
        );
        
        // Verificar que el commitment es correcto
        bytes32 computedCommitment = keccak256(abi.encodePacked(data, nonce, msg.sender));
        require(computedCommitment == commitment, "Invalid reveal data");
        
        dataCommit.isRevealed = true;
        
        _addAuditLog(msg.sender, "DATA_REVEALED", data, commitment);
        emit DataRevealed(msg.sender, commitment, data);
    }
    
    /**
     * @dev Agrega un atributo al perfil
     * @param key Clave del atributo
     * @param attributeHash Hash del valor del atributo
     */
    function addAttribute(
        string memory key,
        bytes32 attributeHash
    ) external profileExists(msg.sender) onlyProfileOwner(msg.sender) {
        require(bytes(key).length > 0, "Invalid attribute key");
        require(attributeHash != bytes32(0), "Invalid attribute hash");
        
        UserProfile storage profile = userProfiles[msg.sender];
        require(profile.attributeKeys.length < MAX_ATTRIBUTES, "Maximum attributes reached");
        
        // Verificar que la clave no existe
        require(profile.attributeHashes[key] == bytes32(0), "Attribute already exists");
        
        profile.attributeHashes[key] = attributeHash;
        profile.attributeKeys.push(key);
        profile.updatedAt = block.timestamp;
        
        _addAuditLog(msg.sender, "ATTRIBUTE_ADDED", attributeHash, bytes32(0));
        emit AttributeAdded(msg.sender, key, attributeHash);
    }
    
    /**
     * @dev Remueve un atributo del perfil
     * @param key Clave del atributo a remover
     */
    function removeAttribute(
        string memory key
    ) external profileExists(msg.sender) onlyProfileOwner(msg.sender) {
        require(bytes(key).length > 0, "Invalid attribute key");
        
        UserProfile storage profile = userProfiles[msg.sender];
        require(profile.attributeHashes[key] != bytes32(0), "Attribute does not exist");
        
        // Remover del mapping
        delete profile.attributeHashes[key];
        
        // Remover del array
        for (uint256 i = 0; i < profile.attributeKeys.length; i++) {
            if (keccak256(bytes(profile.attributeKeys[i])) == keccak256(bytes(key))) {
                profile.attributeKeys[i] = profile.attributeKeys[profile.attributeKeys.length - 1];
                profile.attributeKeys.pop();
                break;
            }
        }
        
        profile.updatedAt = block.timestamp;
        
        _addAuditLog(msg.sender, "ATTRIBUTE_REMOVED", bytes32(0), bytes32(0));
        emit AttributeRemoved(msg.sender, key);
    }
    
    /**
     * @dev Revoca un commitment
     * @param commitment El commitment a revocar
     */
    function revokeCommitment(
        bytes32 commitment
    ) external validCommitment(commitment) {
        DataCommitment storage dataCommit = dataCommitments[commitment];
        require(
            dataCommit.submitter == msg.sender || msg.sender == address(this),
            "Not authorized to revoke this commitment"
        );
        
        revokedCommitments[commitment] = true;
        
        _addAuditLog(msg.sender, "COMMITMENT_REVOKED", commitment, bytes32(0));
        emit CommitmentRevoked(commitment, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Obtiene información del perfil de un usuario
     * @param user Dirección del usuario
     */
    function getProfile(address user) external view returns (
        bytes32 profileHash,
        bytes32 metadataHash,
        uint256 createdAt,
        uint256 updatedAt,
        bool isPublic,
        uint256 attributeCount
    ) {
        UserProfile storage profile = userProfiles[user];
        return (
            profile.profileHash,
            profile.metadataHash,
            profile.createdAt,
            profile.updatedAt,
            profile.isPublic,
            profile.attributeKeys.length
        );
    }
    
    /**
     * @dev Obtiene las claves de atributos de un perfil
     * @param user Dirección del usuario
     */
    function getAttributeKeys(address user) external view returns (string[] memory) {
        require(
            userProfiles[user].isPublic || user == msg.sender,
            "Profile is private"
        );
        return userProfiles[user].attributeKeys;
    }
    
    /**
     * @dev Obtiene el hash de un atributo específico
     * @param user Dirección del usuario
     * @param key Clave del atributo
     */
    function getAttributeHash(address user, string memory key) 
        external 
        view 
        returns (bytes32) 
    {
        require(
            userProfiles[user].isPublic || user == msg.sender,
            "Profile is private"
        );
        return userProfiles[user].attributeHashes[key];
    }
    
    /**
     * @dev Obtiene información de un commitment
     * @param commitment El commitment a consultar
     */
    function getCommitmentInfo(bytes32 commitment) external view returns (
        bytes32 nullifierHash,
        uint256 timestamp,
        bool isRevealed,
        address submitter,
        bool isRevoked
    ) {
        DataCommitment storage dataCommit = dataCommitments[commitment];
        return (
            dataCommit.nullifierHash,
            dataCommit.timestamp,
            dataCommit.isRevealed,
            dataCommit.submitter,
            revokedCommitments[commitment]
        );
    }
    
    /**
     * @dev Obtiene logs de auditoría (limitados)
     * @param user Usuario
     * @param limit Número máximo de logs
     */
    function getAuditLogs(address user, uint256 limit) 
        external 
        view 
        returns (AuditLog[] memory) 
    {
        require(user == msg.sender, "Can only view own audit logs");
        
        AuditLog[] memory logs = auditLogs[user];
        if (logs.length <= limit) {
            return logs;
        }
        
        AuditLog[] memory limitedLogs = new AuditLog[](limit);
        uint256 startIndex = logs.length - limit;
        
        for (uint256 i = 0; i < limit; i++) {
            limitedLogs[i] = logs[startIndex + i];
        }
        
        return limitedLogs;
    }
    
    /**
     * @dev Función interna para agregar logs de auditoría
     */
    function _addAuditLog(
        address user,
        string memory action,
        bytes32 dataHash,
        bytes32 proofHash
    ) internal {
        auditLogs[user].push(AuditLog({
            user: user,
            action: action,
            dataHash: dataHash,
            timestamp: block.timestamp,
            proofHash: proofHash
        }));
    }
    
    /**
     * @dev Limpia datos antiguos (función de mantenimiento)
     * @param user Usuario cuyos datos se van a limpiar
     */
    function cleanupOldData(address user) external {
        require(
            user == msg.sender || msg.sender == address(this),
            "Not authorized to cleanup this user's data"
        );
        
        UserProfile storage profile = userProfiles[user];
        require(
            block.timestamp > profile.updatedAt + DATA_RETENTION_PERIOD,
            "Data retention period not met"
        );
        
        // Limpiar atributos
        for (uint256 i = 0; i < profile.attributeKeys.length; i++) {
            delete profile.attributeHashes[profile.attributeKeys[i]];
        }
        delete profile.attributeKeys;
        
        // Mantener solo hash básico por auditoría
        profile.metadataHash = bytes32(0);
        profile.isPublic = false;
        
        _addAuditLog(user, "DATA_CLEANUP", bytes32(0), bytes32(0));
    }
}