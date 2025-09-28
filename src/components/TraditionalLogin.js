import React, { useState } from 'react';

function TraditionalLogin({ onLogin, isLoading }) {
  const [mode, setMode] = useState('login'); // 'login' o 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [registeredUsers] = useState(() => {
    // Cargar usuarios registrados desde localStorage
    const saved = localStorage.getItem('zkp_registered_users');
    return saved ? JSON.parse(saved) : [];
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (mode === 'register') {
      if (!formData.name.trim()) {
        newErrors.name = 'El nombre es requerido';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validaciones específicas por modo
    if (mode === 'register') {
      const existingUser = registeredUsers.find(u => u.email === formData.email);
      if (existingUser) {
        newErrors.email = 'Este email ya está registrado';
      }
    } else {
      const existingUser = registeredUsers.find(u => u.email === formData.email);
      if (!existingUser) {
        newErrors.email = 'Usuario no encontrado';
      } else if (existingUser.password !== formData.password) {
        newErrors.password = 'Contraseña incorrecta';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'register') {
        // Registrar nuevo usuario
        const newUser = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          password: formData.password,
          registeredAt: new Date().toISOString()
        };

        const updatedUsers = [...registeredUsers, newUser];
        localStorage.setItem('zkp_registered_users', JSON.stringify(updatedUsers));
        
        // Auto-login después del registro
        onLogin(newUser);
      } else {
        // Login de usuario existente
        const user = registeredUsers.find(u => u.email === formData.email);
        onLogin(user);
      }
    } catch (error) {
      console.error('Error en autenticación:', error);
      setErrors({ submit: 'Error en la autenticación: ' + error.message });
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="traditional-login">
      <div className="login-form-container">
        <div className="form-header">
          <h3>
            {mode === 'register' ? '📝 Crear Cuenta' : '🔐 Iniciar Sesión'}
          </h3>
          <p>
            {mode === 'register' 
              ? 'Regístrate para generar tu identidad ZKP' 
              : 'Inicia sesión con tu cuenta existente'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="name">Nombre Completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="Tu nombre completo"
                disabled={isLoading}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="tu@email.com"
              disabled={isLoading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'error' : ''}
              placeholder="Mínimo 6 caracteres"
              disabled={isLoading}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Repite tu contraseña"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {errors.submit && (
            <div className="submit-error">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="submit-btn"
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                {mode === 'register' ? 'Creando cuenta...' : 'Iniciando sesión...'}
              </>
            ) : (
              mode === 'register' ? 'Crear Cuenta' : 'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="form-switch">
          <p>
            {mode === 'register' 
              ? '¿Ya tienes cuenta? ' 
              : '¿No tienes cuenta? '
            }
            <button 
              type="button" 
              onClick={switchMode}
              className="switch-btn"
              disabled={isLoading}
            >
              {mode === 'register' ? 'Inicia Sesión' : 'Regístrate'}
            </button>
          </p>
        </div>

        <div className="zkp-features">
          <h4>Al autenticarte obtienes:</h4>
          <div className="features-list">
            <div className="feature">
              <span className="feature-icon">🆔</span>
              <div>
                <strong>DID (Identidad Descentralizada)</strong>
                <p>Una identidad única y verificable</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">📋</span>
              <div>
                <strong>VC (Credencial Verificable)</strong>
                <p>Certificado criptográfico de tus datos</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">🔐</span>
              <div>
                <strong>Zero Knowledge Proofs</strong>
                <p>Demuestra información sin revelarla</p>
              </div>
            </div>
          </div>
        </div>

        {registeredUsers.length > 0 && mode === 'login' && (
          <div className="demo-users">
            <h5>Usuarios de prueba:</h5>
            <div className="demo-user-list">
              {registeredUsers.slice(0, 3).map(user => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      email: user.email,
                      password: user.password
                    });
                  }}
                  className="demo-user-btn"
                  disabled={isLoading}
                >
                  {user.name} ({user.email})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TraditionalLogin;