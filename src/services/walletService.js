/**
 * Servicio de Wallet para conexión y validación de wallets
 * Maneja conexión de wallets, validación de red y obtención de información
 */

import { NETWORKS, ERROR_TYPES, TIMEOUTS } from '../utils/constants';
import { isValidWalletAddress, formatWalletAddress, logZKPStep } from '../utils/zkpUtils';

class WalletService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.currentAccount = null;
    this.currentNetwork = null;
    this.isConnected = false;
  }

  /**
   * Detecta si hay un proveedor de wallet disponible
   * @returns {boolean} True si hay wallet disponible
   */
  isWalletAvailable() {
    return typeof window !== 'undefined' && 
           (window.ethereum || window.web3);
  }

  /**
   * Conecta con la wallet del usuario
   * @returns {Object} Información de la conexión
   */
  async connectWallet() {
    try {
      if (!this.isWalletAvailable()) {
        throw new Error('No se detectó ninguna wallet. Por favor instala MetaMask u otra wallet compatible.');
      }

      logZKPStep('Iniciando conexión de wallet', {});

      // Solicitar conexión
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No se pudo conectar con la wallet. Por favor autoriza la conexión.');
      }

      const account = accounts[0];
      
      if (!isValidWalletAddress(account)) {
        throw new Error('Dirección de wallet inválida.');
      }

      // Obtener información de la red
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      const networkInfo = this.getNetworkInfo(parseInt(chainId, 16));
      
      // Actualizar estado interno
      this.currentAccount = account;
      this.currentNetwork = networkInfo;
      this.isConnected = true;

      const connectionInfo = {
        address: account,
        formattedAddress: formatWalletAddress(account),
        network: networkInfo,
        timestamp: new Date().toISOString()
      };

      logZKPStep('Wallet conectada exitosamente', connectionInfo);

      // Configurar listeners para cambios
      this.setupEventListeners();

      return connectionInfo;

    } catch (error) {
      console.error('❌ [Wallet] Error conectando wallet:', error);
      this.isConnected = false;
      throw new Error(ERROR_TYPES.WALLET_NOT_CONNECTED);
    }
  }

  /**
   * Desconecta la wallet
   */
  async disconnectWallet() {
    try {
      logZKPStep('Desconectando wallet', {});
      
      this.provider = null;
      this.signer = null;
      this.currentAccount = null;
      this.currentNetwork = null;
      this.isConnected = false;

      // Remover listeners
      this.removeEventListeners();

      console.log('✅ [Wallet] Wallet desconectada exitosamente');
      
    } catch (error) {
      console.error('❌ [Wallet] Error desconectando wallet:', error);
    }
  }

  /**
   * Verifica si la red actual es la correcta (Polygon Amoy)
   * @returns {boolean} True si está en la red correcta
   */
  async isCorrectNetwork() {
    try {
      if (!this.isConnected) {
        return false;
      }

      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      const currentChainId = parseInt(chainId, 16);
      const isCorrect = currentChainId === NETWORKS.POLYGON_AMOY.chainId;

      logZKPStep('Verificación de red', {
        currentChainId,
        expectedChainId: NETWORKS.POLYGON_AMOY.chainId,
        isCorrect
      });

      return isCorrect;

    } catch (error) {
      console.error('❌ [Wallet] Error verificando red:', error);
      return false;
    }
  }

  /**
   * Cambia a la red Polygon Amoy
   * @returns {boolean} True si el cambio fue exitoso
   */
  async switchToPolygonAmoy() {
    try {
      if (!this.isWalletAvailable()) {
        throw new Error(ERROR_TYPES.WALLET_NOT_CONNECTED);
      }

      logZKPStep('Cambiando a Polygon Amoy', NETWORKS.POLYGON_AMOY);

      try {
        // Intentar cambiar a la red
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${NETWORKS.POLYGON_AMOY.chainId.toString(16)}` }],
        });
      } catch (switchError) {
        // Si la red no está agregada, intentar agregarla
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${NETWORKS.POLYGON_AMOY.chainId.toString(16)}`,
                chainName: NETWORKS.POLYGON_AMOY.name,
                nativeCurrency: NETWORKS.POLYGON_AMOY.nativeCurrency,
                rpcUrls: NETWORKS.POLYGON_AMOY.rpcUrls,
                blockExplorerUrls: NETWORKS.POLYGON_AMOY.blockExplorerUrls,
              },
            ],
          });
        } else {
          throw switchError;
        }
      }

      // Verificar que el cambio fue exitoso
      const isCorrect = await this.isCorrectNetwork();
      
      if (isCorrect) {
        this.currentNetwork = this.getNetworkInfo(NETWORKS.POLYGON_AMOY.chainId);
        console.log('✅ [Wallet] Red cambiada exitosamente a Polygon Amoy');
      }

      return isCorrect;

    } catch (error) {
      console.error('❌ [Wallet] Error cambiando red:', error);
      throw new Error(ERROR_TYPES.WRONG_NETWORK);
    }
  }

  /**
   * Obtiene información de la red basada en el chainId
   * @param {number} chainId - ID de la cadena
   * @returns {Object} Información de la red
   */
  getNetworkInfo(chainId) {
    const networks = {
      [NETWORKS.POLYGON_AMOY.chainId]: NETWORKS.POLYGON_AMOY,
      [NETWORKS.POLYGON_MAINNET.chainId]: NETWORKS.POLYGON_MAINNET,
    };

    return networks[chainId] || {
      chainId,
      name: 'Red Desconocida',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      isSupported: false
    };
  }

  /**
   * Obtiene el balance de la wallet
   * @returns {string} Balance en formato readable
   */
  async getBalance() {
    try {
      if (!this.isConnected || !this.currentAccount) {
        throw new Error(ERROR_TYPES.WALLET_NOT_CONNECTED);
      }

      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [this.currentAccount, 'latest'],
      });

      // Convertir de wei a ether (simplificado)
      const balanceInEther = parseInt(balance, 16) / Math.pow(10, 18);
      
      return {
        wei: balance,
        ether: balanceInEther.toFixed(4),
        formatted: `${balanceInEther.toFixed(4)} ${this.currentNetwork?.nativeCurrency?.symbol || 'ETH'}`
      };

    } catch (error) {
      console.error('❌ [Wallet] Error obteniendo balance:', error);
      return { wei: '0', ether: '0.0000', formatted: '0.0000 ETH' };
    }
  }

  /**
   * Firma un mensaje con la wallet
   * @param {string} message - Mensaje a firmar
   * @returns {string} Signature
   */
  async signMessage(message) {
    try {
      if (!this.isConnected || !this.currentAccount) {
        throw new Error(ERROR_TYPES.WALLET_NOT_CONNECTED);
      }

      logZKPStep('Firmando mensaje', { message });

      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, this.currentAccount],
      });

      logZKPStep('Mensaje firmado exitosamente', { signature: signature.substring(0, 20) + '...' });

      return signature;

    } catch (error) {
      console.error('❌ [Wallet] Error firmando mensaje:', error);
      throw new Error('Error firmando mensaje con la wallet');
    }
  }

  /**
   * Configura listeners para eventos de la wallet
   */
  setupEventListeners() {
    if (!window.ethereum) return;

    // Listener para cambio de cuentas
    const handleAccountsChanged = (accounts) => {
      logZKPStep('Cambio de cuentas detectado', { accounts });
      
      if (accounts.length === 0) {
        this.disconnectWallet();
      } else {
        this.currentAccount = accounts[0];
        window.dispatchEvent(new CustomEvent('walletAccountChanged', { 
          detail: { account: accounts[0] } 
        }));
      }
    };

    // Listener para cambio de red
    const handleChainChanged = (chainId) => {
      const networkInfo = this.getNetworkInfo(parseInt(chainId, 16));
      logZKPStep('Cambio de red detectado', networkInfo);
      
      this.currentNetwork = networkInfo;
      window.dispatchEvent(new CustomEvent('walletNetworkChanged', { 
        detail: { network: networkInfo } 
      }));
    };

    // Listener para desconexión
    const handleDisconnect = () => {
      logZKPStep('Wallet desconectada', {});
      this.disconnectWallet();
      window.dispatchEvent(new CustomEvent('walletDisconnected'));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    // Guardar referencias para poder removerlas después
    this._listeners = {
      handleAccountsChanged,
      handleChainChanged,
      handleDisconnect
    };
  }

  /**
   * Remueve los listeners de eventos
   */
  removeEventListeners() {
    if (!window.ethereum || !this._listeners) return;

    window.ethereum.removeListener('accountsChanged', this._listeners.handleAccountsChanged);
    window.ethereum.removeListener('chainChanged', this._listeners.handleChainChanged);
    window.ethereum.removeListener('disconnect', this._listeners.handleDisconnect);

    this._listeners = null;
  }

  /**
   * Obtiene el estado actual de la wallet
   * @returns {Object} Estado actual
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      account: this.currentAccount,
      formattedAccount: this.currentAccount ? formatWalletAddress(this.currentAccount) : null,
      network: this.currentNetwork,
      isCorrectNetwork: this.currentNetwork?.chainId === NETWORKS.POLYGON_AMOY.chainId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Obtiene información de debug del servicio
   * @returns {Object} Información de debug
   */
  getDebugInfo() {
    return {
      walletAvailable: this.isWalletAvailable(),
      isConnected: this.isConnected,
      currentAccount: this.currentAccount,
      currentNetwork: this.currentNetwork,
      supportedNetworks: Object.values(NETWORKS),
      timestamp: new Date().toISOString()
    };
  }
}

// Instancia singleton del servicio
const walletService = new WalletService();

export default walletService;