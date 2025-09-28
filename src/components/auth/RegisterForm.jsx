/**
 * Componente RegisterForm - Formulario de registro con ZKP
 * Maneja registro de usuarios y generación de identidad ZKP personalizada
 */

import React, { useState } from 'react';
import Button from '../ui/Button';
import Input, { EmailInput, PasswordInput } from '../ui/Input';
import Modal from '../ui/Modal';
import useAuth from '../../hooks/useAuth';
import { EDUCATIONAL_CONTENT } from '../../utils/constants';

const RegisterForm = ({ 
  onRegisterSuccess, 
  onRegisterError, 
  onSwitchToLogin,
  showEducationalContent = true,
  className = '' 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showInfoModal, setShowInfoModal] = useState(false);

  const auth = useAuth();

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

    // Validar nombre
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    } else if (auth.isEmailRegistered(formData.email)) {
      errors.email = 'Este email ya está registrado';
    }

    // Validar contraseña
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
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
      // Registrar usuario con ZKP
      const result = await auth.registerUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      // Limpiar formulario
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      if (onRegisterSuccess) {
        onRegisterSuccess(result);
      }

    } catch (error) {
      console.error('Error en registro:', error);
      if (onRegisterError) {
        onRegisterError(error);
      }
    }
  };

  const isFormValid = formData.name && formData.email && formData.password && formData.confirmPassword;

  return (
    <div className={`zkp-card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <UserPlusIcon className="h-6 w-6 text-zkp-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Registro con ZKP
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

      {/* Descripción */}
      <div className="mb-6 p-4 bg-zkp-50 border border-zkp-200 rounded-lg">
        <p className="text-sm text-zkp-800">
          <strong>Registro ZKP:</strong> Al registrarte, se generará una identidad única 
          Zero Knowledge que te permitirá autenticarte sin revelar información sensible.
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <Input
          label="Nombre completo"
          type="text"
          value={formData.name}
          onChange={handleInputChange('name')}
          error={formErrors.name}
          placeholder="Tu nombre completo"
          required
          disabled={auth.isLoading}
          icon={UserIcon}
        />

        {/* Email */}
        <EmailInput
          label="Email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={formErrors.email}
          placeholder="tu@email.com"
          required
          disabled={auth.isLoading}
        />

        {/* Contraseña */}
        <PasswordInput
          label="Contraseña"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={formErrors.password}
          placeholder="Mínimo 6 caracteres"
          required
          disabled={auth.isLoading}
          helpText="Se usará para generar tu identidad ZKP de forma determinística"
        />

        {/* Confirmar contraseña */}
        <PasswordInput
          label="Confirmar contraseña"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          error={formErrors.confirmPassword}
          placeholder="Repite tu contraseña"
          required
          disabled={auth.isLoading}
          showToggle={false}
        />

        {/* Información adicional */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-start space-x-2">
            <InfoIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="mb-1">
                <strong>¿Cómo funciona?</strong>
              </p>
              <ul className="space-y-1 text-xs">
                <li>• Se genera una identidad ZKP única basada en tus datos</li>
                <li>• Se crea un claim verificable con tu nombre</li>
                <li>• Puedes autenticarte sin revelar información privada</li>
                <li>• Tus credenciales se almacenan de forma segura localmente</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error general */}
        {auth.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error en el registro
                </h3>
                <p className="mt-1 text-sm text-red-700">{auth.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="space-y-3">
          <Button
            type="submit"
            variant="success"
            isLoading={auth.isLoading}
            disabled={!isFormValid || auth.isLoading}
            className="w-full"
            icon={UserPlusIcon}
          >
            {auth.isLoading ? 'Generando Identidad ZKP...' : 'Registrarse con ZKP'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              disabled={auth.isLoading}
              className="text-sm text-primary-600 hover:text-primary-700 focus:outline-none focus:underline disabled:opacity-50"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </div>
        </div>
      </form>

      {/* Lista de usuarios registrados (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              Usuarios registrados ({auth.getRegisteredUsers().length})
            </summary>
            <div className="mt-3 space-y-2">
              {auth.getRegisteredUsers().map((user) => (
                <div key={user.id} className="bg-gray-50 p-2 rounded text-xs">
                  <div><strong>{user.name}</strong> ({user.email})</div>
                  <div className="font-mono text-gray-500">DID: {user.zkpDID?.substring(0, 40)}...</div>
                  <div className="text-gray-500">Registrado: {new Date(user.registeredAt).toLocaleDateString()}</div>
                </div>
              ))}
              {auth.getRegisteredUsers().length === 0 && (
                <p className="text-xs text-gray-500 italic">No hay usuarios registrados</p>
              )}
            </div>
          </details>
        </div>
      )}

      {/* Modal educativo */}
      {showEducationalContent && (
        <Modal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          title="Registro con Zero Knowledge Proofs"
          size="lg"
        >
          <div className="space-y-4">
            <div className="bg-zkp-50 border-l-4 border-zkp-400 p-4">
              <p className="text-sm text-zkp-800">
                {EDUCATIONAL_CONTENT.TRADITIONAL_AUTH_EXPLANATION.content}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">¿Qué sucede al registrarte?</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Se toman tus datos (nombre, email, contraseña) como entrada</li>
                <li>Se genera una identidad ZKP única y determinística</li>
                <li>Se crea un claim verificable con tu nombre</li>
                <li>Se almacenan las credenciales ZKP de forma segura</li>
                <li>Quedas registrado para futuras autenticaciones ZKP</li>
              </ol>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-sm text-blue-800">
                <strong>Seguridad:</strong> Tu contraseña se usa solo para generar la identidad ZKP. 
                No se almacena en texto plano, sino como un hash derivado criptográficamente.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Ventajas del registro ZKP:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Identidad única y verificable</li>
                <li>Autenticación sin revelar datos sensibles</li>
                <li>Interoperabilidad con otros sistemas ZKP</li>
                <li>Control total sobre tus credenciales</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Iconos
const UserPlusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

export default RegisterForm;