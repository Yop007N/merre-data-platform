import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../presentation/hooks';
import { useAuthUseCases } from '../../../presentation/providers';

interface LoginFormProps {
  isAdmin?: boolean;
}

const LoginFormClean: React.FC<LoginFormProps> = ({ isAdmin = false }) => {
  // Clean Architecture dependencies
  const authUseCases = useAuthUseCases();
  const { login, loading, error, clearError } = useAuth(authUseCases);

  // Local state for form
  const [email, setEmail] = useState(isAdmin ? 'admin@gmail.com' : '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Form validation
  const isEmailValid = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isPasswordValid = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateForm = (): string | null => {
    if (!email.trim()) {
      return 'El correo electrónico es requerido';
    }

    if (!isEmailValid(email)) {
      return 'Por favor, introduce una dirección de correo electrónico válida';
    }

    if (!password) {
      return 'La contraseña es requerida';
    }

    if (!isPasswordValid(password)) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }

    return null;
  };

  // Event handlers
  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Clear any previous errors
    clearError();

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      // You could set local validation error here if needed
      return;
    }

    try {
      const result = await login({ email, password });

      if (result.success) {
        // Navigate based on user type
        if (isAdmin) {
          navigate('/admin-page');
        } else {
          navigate('/user-page');
        }
      }
      // Error handling is done by the useAuth hook
    } catch (error) {
      console.error('Unexpected error during login:', error);
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ maxWidth: '400px', margin: 'auto' }}>
      <div className="text-center mb-4">
        <h1 className="h3 mb-3 font-weight-normal">¡Bienvenido a AnxieSense!</h1>
        <h5 className="fw-normal mb-3 pb-3" style={{ letterSpacing: '1px', color: '#666' }}>
          {isAdmin ? 'Iniciar sesión - Administrador' : 'Iniciar sesión'}
        </h5>
      </div>

      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}

      <div className="form-outline inputGroup-sizing-sm">
        <input
          type="email"
          id="email"
          className="form-control form-control-sm mb-3"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isAdmin || loading}
          required
          aria-describedby="email-help"
        />
      </div>

      <div className="input-group mb-3">
        <input
          type={showPassword ? 'text' : 'password'}
          id="password"
          className="form-control form-control-sm"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          aria-describedby="password-help"
        />
        <span
          className="input-group-text"
          style={{ cursor: 'pointer' }}
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} style={{ color: '#666' }}></i>
        </span>
      </div>

      <div className="pt-1 mb-4 d-flex justify-content-center">
        <button
          className="btn btn-primary btn-boton btn-sm btn-block"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Accediendo...' : 'Acceder'}
        </button>
      </div>

      <small className="mb-2 d-flex justify-content-center" style={{ color: '#666' }}>
        {!isAdmin ? (
          <>
            ¿Eres administrador?{' '}
            <Link to="/login-admin" style={{ color: '#508bfc', marginLeft: '10px' }}>
              Ingresa aquí
            </Link>
          </>
        ) : (
          <>
            ¿No eres administrador?{' '}
            <Link to="/" style={{ color: '#508bfc', marginLeft: '10px' }}>
              Ingresa aquí
            </Link>
          </>
        )}
      </small>

      {!isAdmin && (
        <small className="mb-4 d-flex justify-content-center" style={{ color: '#666' }}>
          ¿No tienes una cuenta?{' '}
          <Link to="/register-page" style={{ color: '#508bfc', marginLeft: '10px' }}>
            Regístrate aquí
          </Link>
        </small>
      )}
    </form>
  );
};

export default LoginFormClean;