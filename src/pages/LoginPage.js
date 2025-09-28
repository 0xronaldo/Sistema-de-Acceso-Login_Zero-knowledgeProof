import React, { useState, useContext } from 'react';
import { AuthContext } from '../ZKPLoginApp';
import WalletConnector from '../components/WalletConnector';
import TraditionalLogin from '../components/TraditionalLogin';
import ZKPGenerator from '../services/ZKPGenerator';

function LoginPage() {
  const [loginMethod, setLoginMethod] = useState(null); // null, 'wallet', 'traditional'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  // Manejar login por wallet
  const handleWalletLogin = async (walletData) => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔐 Iniciando login por wallet...', walletData);
      
      // Generar ZKP credentials para wallet
      const zkpData = await ZKPGenerator.generateWalletCredentials(walletData);
      
      const userData = {
        id: walletData.address,
        name: `Usuario ${walletData.address.slice(0, 6)}...${walletData.address.slice(-4)}`,
        address: walletData.address,
        network: walletData.network,
        type: 'wallet'
      };
      
      login(userData, 'wallet', zkpData);
      
    } catch (error) {
      console.error('Error en login por wallet:', error);
      setError('Error al autenticar con wallet: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar login tradicional
  const handleTraditionalLogin = async (formData) => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔐 Iniciando login tradicional...');
      
      // Generar ZKP credentials para usuario tradicional
      const zkpData = await ZKPGenerator.generateTraditionalCredentials(formData);
      
      const userData = {
        id: zkpData.did,
        name: formData.name,
        email: formData.email,
        type: 'traditional'
      };
      
      login(userData, 'traditional', zkpData);
      
    } catch (error) {
      console.error('Error en login tradicional:', error);
      setError('Error al autenticar: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (loginMethod === 'wallet') {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-header">
            <button 
              className="back-btn"
              onClick={() => setLoginMethod(null)}
            >
              ← Volver
            </button>
            <h1>� Conectar Wallet</h1>
            <p>Conecta tu wallet digital</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <WalletConnector 
            onConnect={handleWalletLogin}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }

  if (loginMethod === 'traditional') {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-header">
            <button 
              className="back-btn"
              onClick={() => setLoginMethod(null)}
            >
              ← Volver
            </button>
            <h1>� Email y Contraseña</h1>
            <p>Ingresa tus datos</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <TraditionalLogin 
            onLogin={handleTraditionalLogin}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }

  // Pantalla de selección de método
  return (
    <div className="login-page">
      <div className="login-container">
                <div className="login-header">
          <h1>🔐 Acceso ZKP</h1>
          <p>Ingresa de forma segura</p>
        </div>

        <div className="login-methods">
          <div 
            className="login-method-card wallet-card"
            onClick={() => setLoginMethod('wallet')}
          >
            <div className="method-icon">🔗</div>
            <h3>Conectar Wallet</h3>
            <p>Accede con tu wallet digital</p>
            <button className="method-btn wallet-btn">
              Conectar
            </button>
          </div>

          <div 
            className="login-method-card traditional-card"
            onClick={() => setLoginMethod('traditional')}
          >
            <div className="method-icon">📧</div>
            <h3>Email y Contraseña</h3>
            <p>Ingresa con tu cuenta tradicional</p>
            <button className="method-btn traditional-btn">
              Acceder
            </button>
          </div>
        </div>


      </div>
    </div>
  );
}

export default LoginPage;