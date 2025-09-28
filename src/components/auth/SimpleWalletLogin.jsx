/**
 * Componente SimpleWalletLogin - Login simplificado con RainbowKit
 * Solo maneja la conexión de wallet sin ZKP educativo
 */

import React, { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import Button from '../ui/Button';

const SimpleWalletLogin = ({ onAuthSuccess, onAuthError, className = '' }) => {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();

  // Verificar conexión y autenticar
  useEffect(() => {
    if (isConnected && address && chain) {
      // Verificar que esté en la red correcta (Polygon Amoy)
      if (chain.id === 80002) {
        // Simular autenticación exitosa
        const authResult = {
          method: 'wallet',
          user: {
            id: address.toLowerCase(),
            address: address,
            formattedAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
            network: {
              name: chain.name,
              chainId: chain.id
            },
            zkpDID: `did:iden3:polygon:amoy:${address.slice(2, 42).toLowerCase()}`,
            authenticatedAt: new Date().toISOString()
          },
          session: {
            id: `session_${Date.now()}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
            isWalletAuthenticated: true
          }
        };

        if (onAuthSuccess) {
          onAuthSuccess(authResult);
        }
      } else {
        // Red incorrecta
        const error = new Error(`Red incorrecta. Por favor conecta a Polygon Amoy Testnet (Chain ID: 80002). Red actual: ${chain.name} (${chain.id})`);
        if (onAuthError) {
          onAuthError(error);
        }
      }
    }
  }, [isConnected, address, chain, onAuthSuccess, onAuthError]);

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className={`simple-wallet-login ${className}`}>
      {/* Header */}
      <div className="wallet-login-header">
        <div className="wallet-login-icon-section">
          <WalletIcon className="wallet-login-icon" />
          <h3 className="wallet-login-title">
            Conectar Wallet
          </h3>
        </div>
      </div>

      {/* Descripción */}
      <div className="wallet-login-description">
        <p className="wallet-login-text">
          Conecta tu wallet para acceder al sistema. Asegúrate de estar en la red 
          Polygon Amoy Testnet.
        </p>
      </div>

      {/* Estado de conexión */}
      <div className="wallet-login-status">
        {isConnected ? (
          <div className="wallet-connected-info">
            <div className="wallet-status-item">
              <CheckIcon className="wallet-status-icon wallet-status-success" />
              <span className="wallet-status-text">
                Wallet conectada: {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
            <div className="wallet-status-item">
              <CheckIcon className="wallet-status-icon wallet-status-success" />
              <span className="wallet-status-text">
                Red: {chain?.name} ({chain?.id})
              </span>
            </div>
            {chain?.id !== 80002 && (
              <div className="wallet-status-item">
                <XIcon className="wallet-status-icon wallet-status-error" />
                <span className="wallet-status-text wallet-status-error-text">
                  Red incorrecta. Cambia a Polygon Amoy Testnet
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="wallet-disconnected-info">
            <div className="wallet-status-item">
              <ClockIcon className="wallet-status-icon wallet-status-pending" />
              <span className="wallet-status-text">
                Wallet no conectada
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="wallet-login-actions">
        {!isConnected ? (
          <div className="connect-button-container">
            <ConnectButton
              accountStatus="address"
              chainStatus="icon"
              showBalance={false}
            />
          </div>
        ) : (
          <div className="wallet-login-buttons">
            {chain?.id === 80002 ? (
              <div className="wallet-success-message">
                <CheckIcon className="wallet-success-icon" />
                <span>¡Conexión exitosa! Redirigiendo...</span>
              </div>
            ) : (
              <div className="wallet-network-warning">
                <span className="wallet-warning-text">
                  Por favor cambia a Polygon Amoy Testnet en tu wallet
                </span>
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="disconnect-button"
            >
              Desconectar
            </Button>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="wallet-login-info">
        <h4 className="wallet-info-title">Red requerida:</h4>
        <div className="network-info">
          <div className="network-detail">
            <span className="network-label">Nombre:</span>
            <span className="network-value">Polygon Amoy Testnet</span>
          </div>
          <div className="network-detail">
            <span className="network-label">Chain ID:</span>
            <span className="network-value">80002</span>
          </div>
          <div className="network-detail">
            <span className="network-label">RPC:</span>
            <span className="network-value">https://rpc-amoy.polygon.technology</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Iconos
const WalletIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default SimpleWalletLogin;