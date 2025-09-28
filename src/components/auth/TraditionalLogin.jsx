/**
 * Componente TraditionalLogin - Login tradicional con ZKP
 * Maneja autenticación con credenciales y generación de pruebas ZKP
 */

import React, { useState } from 'react';
import Button from '../ui/Button';
import { EmailInput, PasswordInput } from '../ui/Input';
import Modal from '../ui/Modal';
import useAuth from '../../hooks/useAuth';


const TraditionalLogin = ({ 
  onLoginSuccess, 
  onLoginError, 
  onSwitchToRegister,
  showEducationalContent = true,
  className = '' 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);

  const auth = useAuth();
  const { zkp } = auth;

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    // Validar contraseña
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setShowProcessModal(true);

      // Autenticar con credenciales y ZKP
      const result = await auth.authenticateWithCredentials({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      // Limpiar formulario
      setFormData({
        email: '',
        password: ''
      });

      setTimeout(() => {
        setShowProcessModal(false);
        if (onLoginSuccess) {
          onLoginSuccess(result);
        }
      }, 2000);

    } catch (error) {
      console.error('Error en login:', error);
      setTimeout(() => {
        setShowProcessModal(false);
        if (onLoginError) {
          onLoginError(error);
        }
      }, 1000);
    }
  };

  const handleCloseProcessModal = () => {
    if (!auth.isLoading && !zkp.isProcessing) {
      setShowProcessModal(false);
    }
  };

  const isFormValid = formData.email && formData.password;

  return (
    <div className={`zkp-card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <LoginIcon className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
          <h2 className="text-xl font-semibold" style={{ color: 'var(--gray-900)' }}>
            Login con ZKP
          </h2>
        </div>

        {showEducationalContent && (
          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            style={{
              color: 'var(--blue-600)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-1)',
              borderRadius: 'var(--radius)'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--blue-700)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--blue-600)'}
          >
            <InfoIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Descripción */}
      <div className="info-card">
        <p className="text-sm" style={{ color: 'var(--blue-800)' }}>
          <strong>Login ZKP:</strong> Inicia sesión con tus credenciales y demuestra tu identidad 
          usando Zero Knowledge Proofs sin revelar información sensible.
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <EmailInput
          label="Email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={formErrors.email}
          placeholder="tu@email.com"
          required
          disabled={auth.isLoading}
          autoComplete="email"
        />

        {/* Contraseña */}
        <PasswordInput
          label="Contraseña"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={formErrors.password}
          placeholder="Tu contraseña"
          required
          disabled={auth.isLoading}
          autoComplete="current-password"
        />

        {/* Error general */}
        {auth.error && (
          <div className="alert alert-error">
            <AlertIcon className="alert-icon" />
            <div>
              <h3 className="text-sm font-medium">
                Error de autenticación
              </h3>
              <p className="mt-1 text-sm">{auth.error}</p>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="space-y-3">
          <Button
            type="submit"
            variant="primary"
            isLoading={auth.isLoading}
            disabled={!isFormValid || auth.isLoading}
            className="btn-full"
            icon={LoginIcon}
          >
            {auth.isLoading ? 'Autenticando con ZKP...' : 'Iniciar Sesión ZKP'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToRegister}
              disabled={auth.isLoading}
              style={{
                fontSize: '0.875rem',
                color: 'var(--primary-600)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                opacity: auth.isLoading ? 0.5 : 1
              }}
              onMouseEnter={(e) => !auth.isLoading && (e.target.style.color = 'var(--primary-700)')}
              onMouseLeave={(e) => !auth.isLoading && (e.target.style.color = 'var(--primary-600)')}
            >
              ¿No tienes cuenta? Regístrate
            </button>
          </div>
        </div>
      </form>

      {/* Información del proceso ZKP */}
      <div className="mt-6 text-xs bg-gray-50 p-3 rounded-lg" style={{ color: 'var(--gray-600)' }}>
        <div className="flex items-start space-x-2">
          <LockIcon className="h-4 w-4 mt-1" style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
          <div>
            <p className="mb-1">
              <strong>Proceso de autenticación ZKP:</strong>
            </p>
            <ul className="space-y-1 text-xs">
              <li>• Se validan tus credenciales tradicionales</li>
              <li>• Se recupera tu identidad ZKP previamente generada</li>
              <li>• Se genera una prueba que demuestra tu identidad</li>
              <li>• Se verifica la prueba sin revelar datos sensibles</li>
              <li>• Obtienes acceso autenticado de forma segura</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de proceso ZKP */}
      <Modal
        isOpen={showProcessModal}
        onClose={handleCloseProcessModal}
        title="Autenticando con Zero Knowledge Proofs"
        size="lg"
        closeOnOverlayClick={!auth.isLoading}
        closeOnEsc={!auth.isLoading}
      >
        <div className="space-y-6">
          {/* Estado del proceso */}
          {auth.isLoading && (
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-lg">
                <LoadingSpinner className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">
                  Procesando autenticación ZKP...
                </span>
              </div>
            </div>
          )}

          {/* Resultado exitoso */}
          {auth.isAuthenticated && (
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
                    <div><strong>Usuario:</strong> {auth.user.name}</div>
                    <div><strong>Email:</strong> {auth.user.email}</div>
                    <div><strong>DID:</strong> {auth.user.zkpDID?.substring(0, 40)}...</div>
                    <div><strong>Método:</strong> Tradicional ZKP</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {auth.error && (
            <div className="text-center">
              <XCircleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Error en la Autenticación
              </h3>
              <p className="text-sm text-red-600">{auth.error}</p>
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
                onClick={handleCloseProcessModal}
              >
                {auth.isAuthenticated ? 'Finalizar' : 'Cerrar'}
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
          title="Login Tradicional con ZKP"
          size="lg"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-sm text-blue-800">
                Combina la familiaridad del login tradicional con la seguridad avanzada 
                de Zero Knowledge Proofs para una autenticación sin comprometer la privacidad.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">¿Cómo funciona?</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Ingresas tu email y contraseña (validación tradicional)</li>
                <li>Se recupera tu identidad ZKP previamente registrada</li>
                <li>Se genera una prueba ZKP de tu claim de identidad</li>
                <li>Se verifica la prueba criptográficamente</li>
                <li>Obtienes acceso sin revelar información sensible</li>
              </ol>
            </div>

            <div className="bg-zkp-50 border-l-4 border-zkp-400 p-4">
              <p className="text-sm text-zkp-800">
                <strong>Diferencia clave:</strong> Aunque uses email/contraseña para identificarte, 
                la autenticación final se realiza mediante ZKP, demostrando tu identidad sin 
                revelar datos personales al sistema verificador.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Ventajas del Login ZKP:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Familiaridad del login tradicional</li>
                <li>Seguridad avanzada con ZKP</li>
                <li>No se revelan datos personales</li>
                <li>Prueba verificable de identidad</li>
                <li>Interoperabilidad con sistemas ZKP</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Iconos
const LoginIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
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

const XCircleIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

const LoadingSpinner = ({ className }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
  </svg>
);

export default TraditionalLogin;