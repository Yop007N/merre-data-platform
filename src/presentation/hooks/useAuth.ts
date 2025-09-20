import { useState, useEffect, useCallback } from 'react';
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResult,
  Result
} from '../../domain';
import { AuthUseCases } from '../../application';

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<Result<AuthResult>>;
  register: (credentials: RegisterCredentials) => Promise<Result<AuthResult>>;
  loginWithGoogle: () => Promise<Result<AuthResult>>;
  logout: () => Promise<Result<void>>;
  sendPasswordResetEmail: (email: string) => Promise<Result<void>>;
  verifyEmail: () => Promise<Result<void>>;
  clearError: () => void;
}

export const useAuth = (authUseCases: AuthUseCases): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const result = await authUseCases.getCurrentUser();
        if (result.success) {
          setUser(result.data!);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [authUseCases]);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<Result<AuthResult>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await authUseCases.login(credentials);

      if (result.success) {
        setUser(result.data!.user);
      } else {
        setError(result.error!.message);
      }

      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during login';
      setError(errorMessage);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: errorMessage
        }
      };
    } finally {
      setLoading(false);
    }
  }, [authUseCases]);

  // Register function
  const register = useCallback(async (credentials: RegisterCredentials): Promise<Result<AuthResult>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await authUseCases.register(credentials);

      if (result.success) {
        setUser(result.data!.user);
      } else {
        setError(result.error!.message);
      }

      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during registration';
      setError(errorMessage);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: errorMessage
        }
      };
    } finally {
      setLoading(false);
    }
  }, [authUseCases]);

  // Google login function
  const loginWithGoogle = useCallback(async (): Promise<Result<AuthResult>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await authUseCases.loginWithGoogle();

      if (result.success) {
        setUser(result.data!.user);
      } else {
        setError(result.error!.message);
      }

      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during Google login';
      setError(errorMessage);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: errorMessage
        }
      };
    } finally {
      setLoading(false);
    }
  }, [authUseCases]);

  // Logout function
  const logout = useCallback(async (): Promise<Result<void>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await authUseCases.logout();

      if (result.success) {
        setUser(null);
      } else {
        setError(result.error!.message);
      }

      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during logout';
      setError(errorMessage);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: errorMessage
        }
      };
    } finally {
      setLoading(false);
    }
  }, [authUseCases]);

  // Send password reset email
  const sendPasswordResetEmail = useCallback(async (email: string): Promise<Result<void>> => {
    setError(null);

    try {
      const result = await authUseCases.sendPasswordResetEmail(email);

      if (!result.success) {
        setError(result.error!.message);
      }

      return result;
    } catch (error) {
      const errorMessage = 'Failed to send password reset email';
      setError(errorMessage);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: errorMessage
        }
      };
    }
  }, [authUseCases]);

  // Verify email
  const verifyEmail = useCallback(async (): Promise<Result<void>> => {
    setError(null);

    try {
      const result = await authUseCases.verifyEmail();

      if (!result.success) {
        setError(result.error!.message);
      }

      return result;
    } catch (error) {
      const errorMessage = 'Failed to send email verification';
      setError(errorMessage);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: errorMessage
        }
      };
    }
  }, [authUseCases]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    loginWithGoogle,
    logout,
    sendPasswordResetEmail,
    verifyEmail,
    clearError
  };
};