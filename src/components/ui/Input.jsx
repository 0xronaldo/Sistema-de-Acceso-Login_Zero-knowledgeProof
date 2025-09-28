/**
 * Componente Input reutilizable con estilos CSS puros
 * Soporte para diferentes tipos y estados de validación
 */

import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  helpText,
  id,
  name,
  autoComplete,
  ...props
}, ref) => {
  // Generar ID único si no se proporciona
  const inputId = id || `input-${name || Math.random().toString(36).substr(2, 9)}`;

  // Construir clases CSS
  const inputClasses = [
    'input',
    error ? 'input-error' : '',
    Icon && iconPosition === 'left' ? 'input-with-icon' : '',
    Icon && iconPosition === 'right' ? 'input-with-icon-right' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="input-group">
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId} 
          className={`input-label ${required ? 'input-required' : ''}`}
        >
          {label}
        </label>
      )}

      {/* Input container */}
      <div className="input-container">
        {/* Icono izquierdo */}
        {Icon && iconPosition === 'left' && (
          <Icon className="input-icon input-icon-left" />
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={inputClasses}
          {...props}
        />

        {/* Icono derecho */}
        {Icon && iconPosition === 'right' && !error && (
          <Icon className="input-icon input-icon-right" />
        )}

        {/* Icono de error */}
        {error && (
          <ExclamationCircleIcon className="input-icon input-icon-right" style={{ color: 'var(--red-500)' }} />
        )}
      </div>

      {/* Texto de ayuda */}
      {helpText && !error && (
        <p className="input-help">{helpText}</p>
      )}

      {/* Mensaje de error */}
      {error && (
        <p className="input-error-message" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Componente PasswordInput especializado
export const PasswordInput = ({ showToggle = true, ...props }) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div style={{ position: 'relative' }}>
      <Input
        {...props}
        type={showPassword ? 'text' : 'password'}
        iconPosition="right"
        icon={showToggle ? (showPassword ? EyeSlashIcon : EyeIcon) : undefined}
      />
      {showToggle && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          style={{
            position: 'absolute',
            right: '12px',
            top: props.label ? '32px' : '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius)',
            color: 'var(--gray-400)'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--gray-600)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--gray-400)'}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
};

// Componente EmailInput especializado
export const EmailInput = (props) => (
  <Input
    {...props}
    type="email"
    icon={MailIcon}
    autoComplete="email"
    placeholder={props.placeholder || "tu@email.com"}
  />
);

// Componente WalletAddressInput especializado
export const WalletAddressInput = ({ value, ...props }) => (
  <Input
    {...props}
    type="text"
    value={value}
    icon={WalletIcon}
    placeholder="0x..."
    className="font-mono text-sm"
    readOnly
  />
);

// Iconos simples
const ExclamationCircleIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const EyeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeSlashIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

const MailIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const WalletIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

export default Input;