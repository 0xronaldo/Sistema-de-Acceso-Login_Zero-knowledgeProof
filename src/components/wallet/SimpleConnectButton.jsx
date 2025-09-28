import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import Button from '../ui/Button';

// ConnectButton simplificado que no usa RainbowKit
const SimpleConnectButton = ({ onAuthSuccess }) => {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isCorrectNetwork = chain?.id === 80002; // Polygon Amoy

  React.useEffect(() => {
    if (isConnected && address && isCorrectNetwork && onAuthSuccess) {
      onAuthSuccess(address);
    }
  }, [isConnected, address, isCorrectNetwork, onAuthSuccess]);

  if (isConnected) {
    return (
      <div className="simple-connect-container">
        <div className="simple-connect-info">
          <div className="simple-connect-status">
            <div className="simple-connect-dot"></div>
            Conectado
          </div>
          <div className="simple-connect-address">
            {formatAddress(address)}
          </div>
          {!isCorrectNetwork && (
            <div className="simple-connect-warning">
              ⚠️ Red incorrecta - Cambia a Polygon Amoy
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
        >
          Desconectar
        </Button>
      </div>
    );
  }

  return (
    <div className="simple-connect-container">
      <div className="simple-connect-buttons">
        {connectors.map((connector) => (
          <Button
            key={connector.id}
            onClick={() => connect({ connector })}
            disabled={!connector.ready}
            variant="primary"
          >
            Conectar {connector.name}
          </Button>
        ))}
      </div>
      {error && (
        <div className="simple-connect-error">
          Error: {error.message}
        </div>
      )}
    </div>
  );
};

export default SimpleConnectButton;