import React, { useState, useEffect, useCallback } from 'react';

function WalletConnector({ onConnect, isLoading }) {
  const [walletStatus, setWalletStatus] = useState({
    isAvailable: false,
    isConnected: false,
    address: null,
    network: null,
    balance: null
  });
  const [connecting, setConnecting] = useState(false);

  // Verificar disponibilidad de wallet
  const checkWalletAvailability = useCallback(async () => {
    try {
      const isAvailable = typeof window.ethereum !== 'undefined';
      setWalletStatus(prev => ({
        ...prev,
        isAvailable
      }));

      if (isAvailable) {
        // Verificar si ya está conectado
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const address = accounts[0];
          const network = await getNetworkInfo();
          const balance = await getBalance(address);
          
          setWalletStatus(prev => ({
            ...prev,
            isConnected: true,
            address,
            network,
            balance
          }));
        }
      }
    } catch (error) {
      console.error('Error checking wallet:', error);
      setWalletStatus(prev => ({
        ...prev,
        isAvailable: false
      }));
    }
  }, []);

  useEffect(() => {
    checkWalletAvailability();
  }, [checkWalletAvailability]);

  const getNetworkInfo = async () => {
    try {
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      
      const networks = {
        '0x1': { id: 1, name: 'Ethereum Mainnet', symbol: 'ETH' },
        '0x89': { id: 137, name: 'Polygon Mainnet', symbol: 'MATIC' },
        '0x13882': { id: 80002, name: 'Polygon Amoy Testnet', symbol: 'MATIC' },
        '0xa': { id: 10, name: 'Optimism', symbol: 'ETH' },
        '0xa4b1': { id: 42161, name: 'Arbitrum One', symbol: 'ETH' }
      };
      
      return networks[chainId] || { 
        id: parseInt(chainId, 16), 
        name: 'Red Desconocida', 
        symbol: 'ETH' 
      };
    } catch (error) {
      console.error('Error obteniendo info de red:', error);
      return { id: 0, name: 'Error', symbol: 'ETH' };
    }
  };

  const getBalance = async (address) => {
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      
      // Convertir de wei a ether
      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
      return {
        wei: balance,
        eth: balanceInEth.toFixed(4),
        formatted: `${balanceInEth.toFixed(4)} ETH`
      };
    } catch (error) {
      console.error('Error obteniendo balance:', error);
      return { wei: '0', eth: '0.0000', formatted: '0.0000 ETH' };
    }
  };

  const connectWallet = async () => {
    if (!walletStatus.isAvailable) {
      alert('Por favor instala MetaMask u otra wallet compatible');
      return;
    }

    setConnecting(true);
    
    try {
      // Solicitar conexión
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        const network = await getNetworkInfo();
        const balance = await getBalance(address);
        
        const walletData = {
          address,
          network,
          balance,
          timestamp: Date.now()
        };

        setWalletStatus(prev => ({
          ...prev,
          isConnected: true,
          address,
          network,
          balance
        }));

        // Llamar callback con datos de wallet
        onConnect(walletData);
      }
    } catch (error) {
      console.error('Error conectando wallet:', error);
      alert('Error conectando wallet: ' + error.message);
    } finally {
      setConnecting(false);
    }
  };

  const switchNetwork = async (targetChainId = '0x13882') => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }]
      });
      
      // Actualizar info después del cambio
      setTimeout(checkWalletAvailability, 1000);
      
    } catch (error) {
      if (error.code === 4902) {
        // Red no agregada, intentar agregarla
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: targetChainId,
              chainName: 'Polygon Amoy Testnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
              },
              rpcUrls: ['https://rpc-amoy.polygon.technology/'],
              blockExplorerUrls: ['https://amoy.polygonscan.com/']
            }]
          });
        } catch (addError) {
          console.error('Error agregando red:', addError);
        }
      } else {
        console.error('Error cambiando red:', error);
      }
    }
  };

  if (!walletStatus.isAvailable) {
    return (
      <div className="wallet-connector">
        <div className="wallet-not-available">
          <div className="warning-icon">⚠️</div>
          <h3>Wallet No Detectada</h3>
          <p>
            Para usar la autenticación por wallet, necesitas instalar una 
            wallet compatible como MetaMask.
          </p>
          <div className="wallet-links">
            <a 
              href="https://metamask.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="install-btn"
            >
              Instalar MetaMask
            </a>
            <button 
              onClick={checkWalletAvailability}
              className="retry-btn"
            >
              Verificar Nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (walletStatus.isConnected) {
    return (
      <div className="wallet-connector">
        <div className="wallet-connected">
          <div className="connection-status">
            <div className="status-indicator connected"></div>
            <span>Wallet Conectada</span>
          </div>
          
          <div className="wallet-info">
            <div className="info-row">
              <span className="label">Dirección:</span>
              <span className="value address">
                {walletStatus.address?.slice(0, 8)}...{walletStatus.address?.slice(-6)}
              </span>
            </div>
            
            <div className="info-row">
              <span className="label">Red:</span>
              <span className="value">
                {walletStatus.network?.name || 'Desconocida'}
              </span>
            </div>
            
            <div className="info-row">
              <span className="label">Balance:</span>
              <span className="value">
                {walletStatus.balance?.formatted || '0.0000 ETH'}
              </span>
            </div>
          </div>

          {walletStatus.network?.id !== 80002 && (
            <div className="network-warning">
              <p>⚠️ Red recomendada: Polygon Amoy Testnet</p>
              <button 
                onClick={() => switchNetwork()}
                className="switch-network-btn"
              >
                Cambiar a Polygon Amoy
              </button>
            </div>
          )}

          <button 
            onClick={() => onConnect({
              address: walletStatus.address,
              network: walletStatus.network,
              balance: walletStatus.balance,
              timestamp: Date.now()
            })}
            disabled={isLoading}
            className="continue-btn"
          >
            {isLoading ? 'Generando Credenciales ZKP...' : 'Continuar con Esta Wallet'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connector">
      <div className="wallet-connect">
        <div className="connect-info">
          <div className="wallet-icon">🔗</div>
          <h3>Conectar Wallet</h3>
          <p>
            Conecta tu wallet para generar automáticamente tu identidad ZKP 
            y credenciales verificables.
          </p>
          
          <div className="security-features">
            <div className="feature">
              <span className="check">✓</span>
              <span>Sin compartir claves privadas</span>
            </div>
            <div className="feature">
              <span className="check">✓</span>
              <span>Identidad descentralizada (DID)</span>
            </div>
            <div className="feature">
              <span className="check">✓</span>
              <span>Credenciales verificables (VC)</span>
            </div>
          </div>
        </div>

        <button 
          onClick={connectWallet}
          disabled={connecting || isLoading}
          className="connect-wallet-btn"
        >
          {connecting ? (
            <>
              <span className="spinner"></span>
              Conectando...
            </>
          ) : (
            <>
              <span className="wallet-emoji">🔗</span>
              Conectar Wallet
            </>
          )}
        </button>

        <div className="supported-wallets">
          <p>Wallets soportadas:</p>
          <div className="wallet-list">
            <span>MetaMask</span>
            <span>Trust Wallet</span>
            <span>Coinbase Wallet</span>

          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletConnector;