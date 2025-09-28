/**
 * Componente WalletLogin - Autenticación por wallet con ZKP
 * Maneja conexión de wallet, validación de red y generación de ZKP
 */

import React, { useState, useEffect } from 'react';
import Button, { WalletButton } from '../ui/Button';
import Modal from '../ui/Modal';

import useAuth from '../../hooks/useAuth';
import { EDUCATIONAL_CONTENT, NETWORKS } from '../../utils/constants';

const WalletLogin = ({ 
  onAuthSuccess, 
  onAuthError,
  showEducationalContent = true,
  className = '' 
}) => {
  const [currentStep, setCurrentStep] = useState('connect'); // connect, network, generate, verify, complete
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [zkpData, setZkpData] = useState({
    identity: null,
    claim: null,
    proof: null,
    verificationResult: null
  });

  const auth = useAuth();
  const { wallet, zkp } = auth;

  // Resetear paso cuando se desconecta
  useEffect(() => {
    if (!wallet.isConnected) {
      setCurrentStep('connect');
      setZkpData({
        identity: null,
        claim: null,
        proof: null,
        verificationResult: null
      });
    }
  }, [wallet.isConnected]);

  const handleWalletConnect = async () => {
    try {
      await wallet.connectWallet();
      setCurrentStep('network');
    } catch (error) {
      console.error('Error conectando wallet:', error);
      if (onAuthError) onAuthError(error);
    }
  };

  const handleNetworkValidation = async () => {
    try {
      const isCorrect = await wallet.checkNetwork();
      if (!isCorrect) {
        await wallet.switchToPolygonAmoy();
      }
      setCurrentStep('generate');
      setShowStepsModal(true);
    } catch (error) {
      console.error('Error validando red:', error);
      if (onAuthError) onAuthError(error);
    }
  };

  const handleStartAuthentication = async () => {
    if (!wallet.isConnected || !wallet.isCorrectNetwork) {
      return;
    }

    try {
      setCurrentStep('generate');
      setShowStepsModal(true);
      
      // Usar el hook de autenticación que maneja todo el flujo ZKP
      const result = await auth.authenticateWithWallet();
      
      setCurrentStep('complete');
      
      if (onAuthSuccess) {
        onAuthSuccess(result);
      }

    } catch (error) {
      console.error('Error en autenticación por wallet:', error);
      setCurrentStep('connect');
      if (onAuthError) onAuthError(error);
    }
  };

  const handleCloseStepsModal = () => {
    if (!auth.isLoading && !zkp.isProcessing) {
      setShowStepsModal(false);
      if (currentStep === 'complete') {
        setCurrentStep('connect');
      }
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'connect':
        return (
          <div className="text-center space-y-4">
            <WalletIcon className="h-16 w-16 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Conectar Wallet
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Conecta tu wallet para iniciar la autenticación con Zero Knowledge Proofs
              </p>
            </div>
            
            <WalletButton
              isConnected={wallet.isConnected}
              onClick={handleWalletConnect}
              isLoading={wallet.isLoading}
              className="w-full"
            />

            {!wallet.isWalletAvailable && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <WarningIcon className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      No se detectó ninguna wallet. Por favor instala MetaMask o una wallet compatible.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'network':
        return (
          <div className="text-center space-y-4">
            <NetworkIcon className="h-16 w-16 text-blue-500 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Validar Red
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Asegúrate de estar conectado a Polygon Amoy Testnet
              </p>
              
              {/* Información de la red actual */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Red actual:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      wallet.isCorrectNetwork 
                        ? 'bg-zkp-100 text-zkp-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {wallet.network?.name || 'Desconocida'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Chain ID:</span>
                    <span className="font-mono text-gray-600">
                      {wallet.network?.chainId || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant={wallet.isCorrectNetwork ? 'success' : 'warning'}
              onClick={handleNetworkValidation}
              isLoading={wallet.isLoading}
              className="w-full"
              icon={wallet.isCorrectNetwork ? CheckIcon : SwitchIcon}
            >
              {wallet.isCorrectNetwork 
                ? 'Red Correcta - Continuar' 
                : 'Cambiar a Polygon Amoy'
              }
            </Button>
          </div>
        );

      case 'generate':
      case 'verify':
      case 'complete':
        return (
          <div className="text-center space-y-4">
            <LockIcon className="h-16 w-16 text-zkp-500 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Autenticación ZKP
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Generando y verificando tu prueba Zero Knowledge...
              </p>
            </div>

            <Button
              variant="success"
              onClick={handleStartAuthentication}
              isLoading={auth.isLoading}
              disabled={!wallet.isConnected || !wallet.isCorrectNetwork}
              className="w-full"
              icon={LockIcon}
            >
              {auth.isLoading 
                ? 'Procesando Autenticación...' 
                : 'Iniciar Autenticación ZKP'
              }
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`zkp-card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <WalletIcon className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Autenticación por Wallet
          </h2>
        </div>

        {showEducationalContent && (
          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            className="text-blue-600 hover:text-blue-700 focus:outline-none"
          >
            <InfoIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Indicador de progreso */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso</span>
          <span className="text-sm text-gray-500">
            {currentStep === 'connect' ? '1/3' : 
             currentStep === 'network' ? '2/3' : '3/3'}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{
              width: currentStep === 'connect' ? '33.33%' :
                     currentStep === 'network' ? '66.66%' : '100%'
            }}
          />
        </div>
      </div>

      {/* Contenido del paso actual */}
      {renderCurrentStep()}

      {/* Información de la wallet conectada */}
      {wallet.isConnected && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-zkp-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-zkp-800 mb-2">Wallet Conectada</h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-zkp-600">Dirección:</span>
                <span className="font-mono text-zkp-700">{wallet.formattedAccount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zkp-600">Red:</span>
                <span className="text-zkp-700">{wallet.network?.name}</span>
              </div>
              {wallet.balance && (
                <div className="flex justify-between">
                  <span className="text-zkp-600">Balance:</span>
                  <span className="text-zkp-700">{wallet.balance.formatted}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {auth.error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error de Autenticación
              </h3>
              <p className="mt-1 text-sm text-red-700">{auth.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de proceso ZKP */}
      <Modal
        isOpen={showStepsModal}
        onClose={handleCloseStepsModal}
        title="Proceso de Autenticación ZKP"
        size="xl"
        closeOnOverlayClick={!auth.isLoading}
        closeOnEsc={!auth.isLoading}
      >
        <div className="space-y-6">
          {/* Estado del proceso */}
          {auth.isLoading && (
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-zkp-100 rounded-lg">
                <LoadingSpinner className="w-5 h-5 text-zkp-600 mr-2" />
                <span className="text-zkp-800 font-medium">
                  Procesando autenticación ZKP...
                </span>
              </div>
            </div>
          )}

          {/* Resultado exitoso */}
          {auth.isAuthenticated && currentStep === 'complete' && (
            <div className="text-center">
              <CheckCircleIcon className="h-12 w-12 text-zkp-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-zkp-800 mb-2">
                ¡Autenticación Exitosa!
              </h3>
              <p className="text-sm text-zkp-600">
                Has sido autenticado exitosamente usando Zero Knowledge Proofs
              </p>
              
              {auth.user && (
                <div className="mt-4 bg-zkp-50 rounded-lg p-3">
                  <div className="text-sm">
                    <div><strong>Usuario:</strong> {auth.user.formattedAddress}</div>
                    <div><strong>DID:</strong> {auth.user.zkpDID?.substring(0, 40)}...</div>
                    <div><strong>Método:</strong> Wallet ZKP</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Logs del proceso ZKP */}
          {zkp.logs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Registro de actividad:</h4>
              <div className="bg-gray-50 rounded-md p-3 max-h-40 overflow-y-auto">
                <div className="space-y-1">
                  {zkp.logs.slice(-8).map((log) => (
                    <div key={log.id} className="flex items-start space-x-2 text-xs">
                      <span className="text-gray-400 font-mono whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`
                        font-medium
                        ${log.type === 'success' ? 'text-zkp-600' : ''}
                        ${log.type === 'error' ? 'text-red-600' : ''}
                        ${log.type === 'warning' ? 'text-yellow-600' : ''}
                        ${log.type === 'info' ? 'text-blue-600' : ''}
                      `}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            {!auth.isLoading && (
              <Button
                variant="secondary"
                onClick={handleCloseStepsModal}
              >
                {currentStep === 'complete' ? 'Finalizar' : 'Cerrar'}
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal educativo */}
      {showEducationalContent && (
        <Modal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          title="Autenticación por Wallet con ZKP"
          size="lg"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-sm text-blue-800">
                {EDUCATIONAL_CONTENT.WALLET_AUTH_EXPLANATION.content}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Proceso paso a paso:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Conectas tu wallet (MetaMask, etc.)</li>
                <li>Verificas que estés en Polygon Amoy</li>
                <li>Se genera una identidad ZKP usando tu dirección como semilla</li>
                <li>Se crea un claim de "propiedad de wallet"</li>
                <li>Se genera una prueba ZKP que demuestra que eres el dueño</li>
                <li>Se verifica la prueba sin revelar información privada</li>
                <li>Obtienes acceso autenticado</li>
              </ol>
            </div>

            <div className="bg-zkp-50 border-l-4 border-zkp-400 p-4">
              <p className="text-sm text-zkp-800">
                <strong>Ventaja:</strong> Demuestras que controlas la wallet sin revelar 
                claves privadas ni información sensible adicional.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Iconos
const WalletIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const NetworkIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const LockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const InfoIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const SwitchIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const WarningIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const AlertIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const LoadingSpinner = ({ className }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
  </svg>
);

export default WalletLogin;