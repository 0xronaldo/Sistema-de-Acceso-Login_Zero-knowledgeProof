/**
 * Componente Button reutilizable con estilos CSS puros
 * Soporte para diferentes variantes y estados
 */

import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  // Construir clases CSS
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={buttonClasses}
      {...props}
    >
      {/* Loading spinner */}
      {isLoading && (
        <svg 
          className="animate-spin w-4 h-4 mr-2" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            style={{ opacity: 0.25 }} 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            style={{ opacity: 0.75 }} 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Icono izquierdo */}
      {Icon && iconPosition === 'left' && !isLoading && (
        <Icon className="w-4 h-4 mr-2" />
      )}

      {/* Contenido del botón */}
      <span>{children}</span>

      {/* Icono derecho */}
      {Icon && iconPosition === 'right' && !isLoading && (
        <Icon className="w-4 h-4 ml-2" />
      )}
    </button>
  );
};

// Componente WalletButton especializado
export const WalletButton = ({ isConnected, onClick, isLoading, ...props }) => (
  <Button
    variant={isConnected ? 'success' : 'primary'}
    onClick={onClick}
    isLoading={isLoading}
    icon={isConnected ? CheckIcon : WalletIcon}
    {...props}
  >
    {isConnected ? 'Wallet Conectada' : 'Conectar Wallet'}
  </Button>
);

// Componente ZKPButton especializado
export const ZKPButton = ({ isGenerating, onClick, children, ...props }) => (
  <Button
    variant="success"
    onClick={onClick}
    isLoading={isGenerating}
    icon={!isGenerating ? LockIcon : undefined}
    {...props}
  >
    {isGenerating ? 'Generando ZKP...' : children || 'Generar Prueba ZKP'}
  </Button>
);

// Iconos simples (puedes reemplazar con react-icons o heroicons)
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

const LockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default Button;