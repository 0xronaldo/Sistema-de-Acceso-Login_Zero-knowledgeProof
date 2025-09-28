# Manual de Testing y Validaciones - Sistema ZKP Login

## Suite de Tests Completa

### 1. Tests de Circuitos ZKP

#### Test de Integridad de Circuito
```javascript
// tests/circuits/auth.test.js
const circomTester = require("circom_tester");
const chai = require("chai");
const path = require("path");

describe("ZKP Auth Circuit", function () {
    this.timeout(100000);
    
    let circuit;
    
    before(async () => {
        circuit = await circomTester.wasm(
            path.join(__dirname, "../../contracts/auth.circom")
        );
    });

    it("Should generate valid proof for correct credentials", async () => {
        const email = "test@example.com";
        const password = "securePassword123";
        const nonce = "12345";
        
        // Hash inputs usando Poseidon
        const emailHash = poseidon([...Buffer.from(email)]);
        const passwordHash = poseidon([...Buffer.from(password)]);
        const nonceHash = poseidon([BigInt(nonce)]);
        
        const witness = await circuit.calculateWitness({
            emailHash: emailHash,
            passwordHash: passwordHash,
            nonce: nonceHash,
            timestamp: Math.floor(Date.now() / 1000)
        });
        
        await circuit.checkConstraints(witness);
        
        const publicSignals = witness.slice(1, circuit.nPublic + 1);
        expect(publicSignals[0]).to.equal(emailHash);
    });

    it("Should fail for invalid inputs", async () => {
        try {
            await circuit.calculateWitness({
                emailHash: 0,
                passwordHash: 0,
                nonce: 0,
                timestamp: 0
            });
            expect.fail("Should have failed");
        } catch (error) {
            expect(error.message).to.include("Assert Failed");
        }
    });

    it("Should validate timestamp constraints", async () => {
        const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hora en futuro
        
        try {
            await circuit.calculateWitness({
                emailHash: poseidon([1, 2, 3]),
                passwordHash: poseidon([4, 5, 6]),
                nonce: poseidon([7]),
                timestamp: futureTimestamp
            });
            expect.fail("Should reject future timestamps");
        } catch (error) {
            expect(error.message).to.include("Timestamp validation failed");
        }
    });
});
```

#### Test de Performance de Circuito
```javascript
describe("Circuit Performance Tests", () => {
    it("Should generate proof within acceptable time", async () => {
        const startTime = Date.now();
        
        const witness = await circuit.calculateWitness(validInputs);
        const proof = await snarkjs.groth16.prove(wasmPath, zkeyPath, witness);
        
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        
        expect(executionTime).to.be.lessThan(5000); // Menos de 5 segundos
    });

    it("Should handle maximum input size", async () => {
        const maxEmail = "a".repeat(64) + "@example.com";
        const maxPassword = "p".repeat(128);
        
        const emailHash = poseidon([...Buffer.from(maxEmail)]);
        const passwordHash = poseidon([...Buffer.from(maxPassword)]);
        
        const witness = await circuit.calculateWitness({
            emailHash,
            passwordHash,
            nonce: poseidon([BigInt("999999")]),
            timestamp: Math.floor(Date.now() / 1000)
        });
        
        await circuit.checkConstraints(witness);
    });
});
```

### 2. Tests de Smart Contracts

#### Test de ZKPVerifier
```solidity
// tests/ZKPVerifier.test.sol
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/ZKPVerifier.sol";

contract ZKPVerifierTest is Test {
    ZKPVerifier public verifier;
    
    uint256[2] validProofA = [
        0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef,
        0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321
    ];
    
    uint256[2][2] validProofB = [
        [0x1111111111111111111111111111111111111111111111111111111111111111,
         0x2222222222222222222222222222222222222222222222222222222222222222],
        [0x3333333333333333333333333333333333333333333333333333333333333333,
         0x4444444444444444444444444444444444444444444444444444444444444444]
    ];
    
    uint256[2] validProofC = [
        0x5555555555555555555555555555555555555555555555555555555555555555,
        0x6666666666666666666666666666666666666666666666666666666666666666
    ];
    
    uint256[] validPublicInputs;

    function setUp() public {
        verifier = new ZKPVerifier();
        validPublicInputs = new uint256[](3);
        validPublicInputs[0] = block.timestamp;
        validPublicInputs[1] = 0x1234;
        validPublicInputs[2] = 0x5678;
    }

    function testValidProofVerification() public {
        // Mock valid proof verification
        vm.mockCall(
            address(verifier),
            abi.encodeWithSelector(verifier.verifyProof.selector),
            abi.encode(true)
        );
        
        ZKPVerifier.Proof memory proof = ZKPVerifier.Proof({
            a: validProofA,
            b: validProofB,
            c: validProofC
        });
        
        bool result = verifier.verifyProof(proof, validPublicInputs);
        assertTrue(result);
    }

    function testInvalidProofRejection() public {
        ZKPVerifier.Proof memory invalidProof = ZKPVerifier.Proof({
            a: [uint256(0), uint256(0)],
            b: [[uint256(0), uint256(0)], [uint256(0), uint256(0)]],
            c: [uint256(0), uint256(0)]
        });
        
        bool result = verifier.verifyProof(invalidProof, validPublicInputs);
        assertFalse(result);
    }

    function testReplayAttackPrevention() public {
        bytes32 proofHash = keccak256(abi.encodePacked(
            validProofA, validProofB, validProofC, validPublicInputs
        ));
        
        // Primera verificación exitosa
        verifier.markProofUsed(proofHash);
        assertTrue(verifier.verifiedProofs(proofHash));
        
        // Segundo intento debe fallar
        vm.expectRevert("Proof already used");
        verifier.markProofUsed(proofHash);
    }

    function testTimestampValidation() public {
        uint256[] memory futureInputs = new uint256[](3);
        futureInputs[0] = block.timestamp + 3600; // 1 hora en futuro
        futureInputs[1] = 0x1234;
        futureInputs[2] = 0x5678;
        
        ZKPVerifier.Proof memory proof = ZKPVerifier.Proof({
            a: validProofA,
            b: validProofB,
            c: validProofC
        });
        
        vm.expectRevert("Future timestamp not allowed");
        verifier.verifyProofWithTimestamp(proof, futureInputs);
    }
}
```

#### Test de ZKPLogin
```solidity
// tests/ZKPLogin.test.sol
contract ZKPLoginTest is Test {
    ZKPLogin public zkpLogin;
    ZKPVerifier public verifier;
    
    address user1 = address(0x1);
    address user2 = address(0x2);
    bytes32 emailHash = keccak256("test@example.com");
    bytes32 passwordHash = keccak256("password123");

    function setUp() public {
        verifier = new ZKPVerifier();
        zkpLogin = new ZKPLogin(address(verifier));
    }

    function testTraditionalRegistration() public {
        vm.prank(user1);
        zkpLogin.registerTraditional(emailHash, passwordHash);
        
        assertTrue(zkpLogin.users(emailHash).isActive);
        assertEq(zkpLogin.users(emailHash).passwordHash, passwordHash);
        assertEq(zkpLogin.users(emailHash).userAddress, user1);
    }

    function testDuplicateRegistrationPrevention() public {
        vm.prank(user1);
        zkpLogin.registerTraditional(emailHash, passwordHash);
        
        vm.prank(user2);
        vm.expectRevert("User already exists");
        zkpLogin.registerTraditional(emailHash, passwordHash);
    }

    function testSuccessfulLogin() public {
        // Registrar usuario
        vm.prank(user1);
        zkpLogin.registerTraditional(emailHash, passwordHash);
        
        // Preparar prueba ZKP válida
        uint256[] memory publicInputs = new uint256[](3);
        publicInputs[0] = block.timestamp;
        publicInputs[1] = uint256(emailHash);
        publicInputs[2] = uint256(passwordHash);
        
        ZKPVerifier.Proof memory proof = ZKPVerifier.Proof({
            a: [uint256(1), uint256(2)],
            b: [[uint256(3), uint256(4)], [uint256(5), uint256(6)]],
            c: [uint256(7), uint256(8)]
        });
        
        // Mock verificación exitosa
        vm.mockCall(
            address(verifier),
            abi.encodeWithSelector(verifier.verifyProof.selector),
            abi.encode(true)
        );
        
        vm.prank(user1);
        bytes32 nonce = keccak256("test_nonce");
        zkpLogin.loginTraditional(proof, publicInputs, nonce);
        
        assertTrue(zkpLogin.authenticatedUsers(user1));
    }

    function testRateLimiting() public {
        vm.prank(user1);
        zkpLogin.registerTraditional(emailHash, passwordHash);
        
        // Preparar prueba inválida
        uint256[] memory invalidInputs = new uint256[](3);
        ZKPVerifier.Proof memory invalidProof;
        
        vm.mockCall(
            address(verifier),
            abi.encodeWithSelector(verifier.verifyProof.selector),
            abi.encode(false)
        );
        
        // Intentos fallidos hasta límite
        for (uint i = 0; i < 5; i++) {
            vm.prank(user1);
            try zkpLogin.loginTraditional(invalidProof, invalidInputs, bytes32(i)) {
                // Should fail
            } catch {
                // Expected
            }
        }
        
        // Sexto intento debe ser bloqueado
        vm.prank(user1);
        vm.expectRevert("Rate limit exceeded");
        zkpLogin.loginTraditional(invalidProof, invalidInputs, bytes32(5));
    }
}
```

### 3. Tests de Frontend

#### Test de Hooks
```javascript
// tests/hooks/useZKP.test.js
import { renderHook, act } from '@testing-library/react';
import { useZKP } from '../../src/hooks/useZKP';

describe('useZKP Hook', () => {
    test('should generate proof successfully', async () => {
        const { result } = renderHook(() => useZKP());
        
        const credentials = {
            email: 'test@example.com',
            password: 'password123'
        };
        
        await act(async () => {
            const proof = await result.current.generateProof(credentials);
            expect(proof).toBeDefined();
            expect(proof.proof).toBeDefined();
            expect(proof.publicSignals).toBeDefined();
        });
    });

    test('should handle invalid credentials', async () => {
        const { result } = renderHook(() => useZKP());
        
        const invalidCredentials = {
            email: '',
            password: ''
        };
        
        await act(async () => {
            await expect(
                result.current.generateProof(invalidCredentials)
            ).rejects.toThrow('Invalid credentials');
        });
    });

    test('should verify proof correctly', async () => {
        const { result } = renderHook(() => useZKP());
        
        const mockProof = {
            proof: { a: [1, 2], b: [[3, 4], [5, 6]], c: [7, 8] },
            publicSignals: ['123', '456', '789']
        };
        
        const isValid = await result.current.verifyProof(mockProof);
        expect(typeof isValid).toBe('boolean');
    });
});
```

#### Test de Componentes
```javascript
// tests/components/SimpleWalletLogin.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SimpleWalletLogin } from '../../src/components/auth/SimpleWalletLogin';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

const mockWagmiConfig = {
    // Mock config
};

const MockProviders = ({ children }) => (
    <WagmiConfig config={mockWagmiConfig}>
        <RainbowKitProvider>
            {children}
        </RainbowKitProvider>
    </WagmiConfig>
);

describe('SimpleWalletLogin Component', () => {
    test('renders connect button', () => {
        render(
            <MockProviders>
                <SimpleWalletLogin />
            </MockProviders>
        );
        
        expect(screen.getByText(/conectar wallet/i)).toBeInTheDocument();
    });

    test('shows network warning for wrong chain', () => {
        // Mock wrong chain
        jest.mock('wagmi', () => ({
            useAccount: () => ({
                isConnected: true,
                address: '0x123',
                chain: { id: 1 } // Ethereum mainnet instead of Polygon Amoy
            })
        }));
        
        render(
            <MockProviders>
                <SimpleWalletLogin />
            </MockProviders>
        );
        
        expect(screen.getByText(/red incorrecta/i)).toBeInTheDocument();
    });

    test('handles successful authentication', async () => {
        const mockOnAuthSuccess = jest.fn();
        
        jest.mock('wagmi', () => ({
            useAccount: () => ({
                isConnected: true,
                address: '0x123',
                chain: { id: 80002 } // Polygon Amoy
            })
        }));
        
        render(
            <MockProviders>
                <SimpleWalletLogin onAuthSuccess={mockOnAuthSuccess} />
            </MockProviders>
        );
        
        await waitFor(() => {
            expect(mockOnAuthSuccess).toHaveBeenCalledWith('0x123');
        });
    });
});
```

### 4. Tests de Integración

#### Test End-to-End
```javascript
// tests/e2e/auth-flow.test.js
const { chromium } = require('playwright');

describe('Authentication Flow E2E', () => {
    let browser, page;
    
    beforeAll(async () => {
        browser = await chromium.launch();
        page = await browser.newPage();
        await page.goto('http://localhost:3000');
    });
    
    afterAll(async () => {
        await browser.close();
    });

    test('complete traditional registration and login flow', async () => {
        // Registro
        await page.click('[data-testid="traditional-auth-btn"]');
        await page.click('[data-testid="register-tab"]');
        
        await page.fill('[data-testid="email-input"]', 'test@example.com');
        await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
        await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
        
        await page.click('[data-testid="register-btn"]');
        
        // Esperar confirmación
        await page.waitForSelector('[data-testid="registration-success"]');
        
        // Login
        await page.click('[data-testid="login-tab"]');
        await page.fill('[data-testid="email-input"]', 'test@example.com');
        await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
        
        await page.click('[data-testid="login-btn"]');
        
        // Verificar autenticación exitosa
        await page.waitForSelector('[data-testid="auth-success"]');
        const successMessage = await page.textContent('[data-testid="auth-success"]');
        expect(successMessage).toContain('Autenticación exitosa');
    });

    test('wallet connection flow', async () => {
        await page.click('[data-testid="wallet-auth-btn"]');
        
        // Simular conexión de wallet (requiere MetaMask mock)
        await page.evaluate(() => {
            window.ethereum = {
                isMetaMask: true,
                request: async (params) => {
                    if (params.method === 'eth_requestAccounts') {
                        return ['0x742C3cF9Af45f91B109a81EfEaf11535ECDe24d1'];
                    }
                    if (params.method === 'eth_chainId') {
                        return '0x13882'; // Polygon Amoy
                    }
                }
            };
        });
        
        await page.click('[data-testid="connect-wallet-btn"]');
        
        // Verificar conexión exitosa
        await page.waitForSelector('[data-testid="wallet-connected"]');
        const address = await page.textContent('[data-testid="wallet-address"]');
        expect(address).toContain('0x742C');
    });
});
```

### 5. Tests de Seguridad

#### Test de Vulnerabilidades
```javascript
// tests/security/vulnerabilities.test.js
describe('Security Vulnerability Tests', () => {
    test('prevents replay attacks', async () => {
        const { zkpLogin, verifier } = await deployContracts();
        
        // Primera transacción exitosa
        const nonce = ethers.utils.id('test_nonce');
        const proof = generateValidProof();
        const publicInputs = [timestamp, emailHash, passwordHash];
        
        await zkpLogin.loginTraditional(proof, publicInputs, nonce);
        
        // Intentar replay
        await expect(
            zkpLogin.loginTraditional(proof, publicInputs, nonce)
        ).to.be.revertedWith('Nonce already used');
    });

    test('prevents timing attacks', async () => {
        const validHash = ethers.utils.id('valid_password');
        const invalidHash = ethers.utils.id('invalid_password');
        
        const times = [];
        
        // Medir tiempo de verificación válida
        for (let i = 0; i < 10; i++) {
            const start = Date.now();
            await zkpLogin.verifyPasswordHash(validHash, validHash);
            times.push(Date.now() - start);
        }
        
        // Medir tiempo de verificación inválida
        for (let i = 0; i < 10; i++) {
            const start = Date.now();
            try {
                await zkpLogin.verifyPasswordHash(validHash, invalidHash);
            } catch (e) {
                // Expected failure
            }
            times.push(Date.now() - start);
        }
        
        // Verificar que los tiempos son similares (diferencia < 10%)
        const avgTime = times.reduce((a, b) => a + b) / times.length;
        const maxDeviation = Math.max(...times.map(t => Math.abs(t - avgTime)));
        
        expect(maxDeviation / avgTime).to.be.lessThan(0.1);
    });

    test('prevents DoS attacks', async () => {
        const largeArray = new Array(1000).fill(generateValidProof());
        
        await expect(
            zkpLogin.batchVerifyProofs(largeArray)
        ).to.be.revertedWith('Batch too large');
    });
});
```

### 6. Tests de Performance

#### Benchmarking
```javascript
// tests/performance/benchmarks.test.js
describe('Performance Benchmarks', () => {
    test('proof generation performance', async () => {
        const iterations = 100;
        const times = [];
        
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            
            await generateZKProof({
                email: `user${i}@test.com`,
                password: `password${i}`
            });
            
            times.push(performance.now() - start);
        }
        
        const avgTime = times.reduce((a, b) => a + b) / times.length;
        const p95Time = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];
        
        console.log(`Average proof generation time: ${avgTime.toFixed(2)}ms`);
        console.log(`P95 proof generation time: ${p95Time.toFixed(2)}ms`);
        
        expect(avgTime).to.be.lessThan(3000); // Menos de 3 segundos
        expect(p95Time).to.be.lessThan(5000); // P95 menos de 5 segundos
    });

    test('contract gas usage', async () => {
        const tx = await zkpLogin.loginTraditional(proof, publicInputs, nonce);
        const receipt = await tx.wait();
        
        console.log(`Gas used for login: ${receipt.gasUsed.toString()}`);
        expect(receipt.gasUsed.lt(500000)).to.be.true; // Menos de 500k gas
    });
});
```

## Scripts de Automatización

### Script de Tests Completos
```bash
#!/bin/bash
# run-all-tests.sh

echo "🧪 Ejecutando suite completa de tests..."

# Tests de circuitos
echo "Testing ZKP circuits..."
cd circuits && npm test

# Tests de contratos
echo "Testing smart contracts..."
forge test -vvv

# Tests de frontend
echo "Testing React components..."
npm test -- --coverage

# Tests de integración
echo "Running integration tests..."
npm run test:integration

# Tests de seguridad
echo "Running security tests..."
npm run test:security

# Análisis estático
echo "Running static analysis..."
slither contracts/
mythril analyze contracts/ZKPLogin.sol

echo "✅ Todos los tests completados!"
```

Este sistema de testing comprehensive asegura la calidad, seguridad y performance del sistema ZKP Login desde todos los ángulos posibles.