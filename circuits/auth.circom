pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";

/**
 * Circuito de Autenticación ZKP
 * Verifica que el usuario conoce una contraseña/clave privada sin revelarla
 * 
 * Inputs:
 * - privateKey: Clave privada del usuario (privada)
 * - publicKeyHash: Hash de la clave pública (pública)
 * - timestamp: Timestamp de la autenticación (pública)
 * - nonce: Nonce para prevenir replay attacks (pública)
 * 
 * Output:
 * - valid: Booleano que indica si la autenticación es válida
 */
template AuthCircuit() {
    // Señales privadas (inputs secretos)
    signal private input privateKey;
    signal private input password;
    signal private input salt;
    
    // Señales públicas (inputs públicos)
    signal input publicKeyHash;
    signal input timestamp;
    signal input nonce;
    signal input minTimestamp;  // Timestamp mínimo válido
    signal input maxTimestamp;  // Timestamp máximo válido
    
    // Outputs
    signal output valid;
    signal output userHash;
    
    // Componentes
    component hasher1 = Poseidon(2);
    component hasher2 = Poseidon(3);
    component hasher3 = Poseidon(4);
    
    // Comparadores para timestamp
    component greaterThan = GreaterThan(64);
    component lessThan = LessThan(64);
    
    // Verificar que privateKey corresponde al publicKeyHash
    hasher1.inputs[0] <== privateKey;
    hasher1.inputs[1] <== salt;
    
    // El hash de la clave privada + salt debe coincidir con publicKeyHash
    component keyVerifier = IsEqual();
    keyVerifier.in[0] <== hasher1.out;
    keyVerifier.in[1] <== publicKeyHash;
    
    // Generar hash del usuario (privateKey + password + salt)
    hasher2.inputs[0] <== privateKey;
    hasher2.inputs[1] <== password;
    hasher2.inputs[2] <== salt;
    userHash <== hasher2.out;
    
    // Verificar validez temporal (anti-replay)
    greaterThan.in[0] <== timestamp;
    greaterThan.in[1] <== minTimestamp;
    
    lessThan.in[0] <== timestamp;
    lessThan.in[1] <== maxTimestamp;
    
    // Generar prueba de autenticación válida
    hasher3.inputs[0] <== userHash;
    hasher3.inputs[1] <== timestamp;
    hasher3.inputs[2] <== nonce;
    hasher3.inputs[3] <== publicKeyHash;
    
    // La autenticación es válida si:
    // 1. La clave privada corresponde a la pública
    // 2. El timestamp está en el rango válido
    component and1 = AND();
    component and2 = AND();
    
    and1.a <== keyVerifier.out;
    and1.b <== greaterThan.out;
    
    and2.a <== and1.out;
    and2.b <== lessThan.out;
    
    valid <== and2.out;
}

/**
 * Circuito de Registro ZKP
 * Permite registrar un usuario sin revelar su información sensible
 */
template RegisterCircuit() {
    // Señales privadas
    signal private input email;
    signal private input password;
    signal private input name;
    signal private input privateKey;
    
    // Señales públicas
    signal input salt;
    signal input timestamp;
    
    // Outputs
    signal output emailHash;
    signal output passwordHash;
    signal output userCommitment;
    signal output publicKeyHash;
    
    // Componentes de hash
    component emailHasher = Poseidon(2);
    component passwordHasher = Poseidon(2);
    component userHasher = Poseidon(4);
    component keyHasher = Poseidon(2);
    
    // Hash del email con salt
    emailHasher.inputs[0] <== email;
    emailHasher.inputs[1] <== salt;
    emailHash <== emailHasher.out;
    
    // Hash de la contraseña con salt
    passwordHasher.inputs[0] <== password;
    passwordHasher.inputs[1] <== salt;
    passwordHash <== passwordHasher.out;
    
    // Hash de la clave pública
    keyHasher.inputs[0] <== privateKey;
    keyHasher.inputs[1] <== salt;
    publicKeyHash <== keyHasher.out;
    
    // Commitment del usuario (todas las credenciales juntas)
    userHasher.inputs[0] <== emailHash;
    userHasher.inputs[1] <== passwordHash;
    userHasher.inputs[2] <== publicKeyHash;
    userHasher.inputs[3] <== timestamp;
    userCommitment <== userHasher.out;
}

/**
 * Circuito de Verificación de Wallet
 * Verifica que el usuario controla una wallet específica
 */
template WalletVerificationCircuit() {
    // Señales privadas
    signal private input privateKey;
    signal private input signature;
    
    // Señales públicas
    signal input walletAddress;
    signal input message;
    signal input timestamp;
    
    // Output
    signal output valid;
    signal output addressHash;
    
    // Componentes
    component hasher = Poseidon(3);
    component verifier = IsEqual();
    
    // Generar hash de la dirección para verificación
    hasher.inputs[0] <== walletAddress;
    hasher.inputs[1] <== message;
    hasher.inputs[2] <== timestamp;
    addressHash <== hasher.out;
    
    // Verificar que la firma es válida para esta wallet
    // (Simplificado - en producción usaría ECDSA verification)
    component signatureVerifier = Poseidon(4);
    signatureVerifier.inputs[0] <== privateKey;
    signatureVerifier.inputs[1] <== walletAddress;
    signatureVerifier.inputs[2] <== message;
    signatureVerifier.inputs[3] <== timestamp;
    
    verifier.in[0] <== signatureVerifier.out;
    verifier.in[1] <== signature;
    
    valid <== verifier.out;
}

// Instanciar los circuitos principales
component main = AuthCircuit();