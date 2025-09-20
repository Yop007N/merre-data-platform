import { Result } from '../common';
import { User } from '../../entities';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthResult {
  user: User;
  token?: string;
}

export interface IAuthRepository {
  // Authentication methods
  register(credentials: RegisterCredentials): Promise<Result<AuthResult>>;
  login(credentials: LoginCredentials): Promise<Result<AuthResult>>;
  loginWithGoogle(): Promise<Result<AuthResult>>;
  logout(): Promise<Result<void>>;

  // Session management
  getCurrentUser(): Promise<Result<User | null>>;
  refreshToken(): Promise<Result<string>>;
  validateToken(token: string): Promise<Result<boolean>>;

  // Password management
  sendPasswordResetEmail(email: string): Promise<Result<void>>;
  confirmPasswordReset(code: string, newPassword: string): Promise<Result<void>>;
  changePassword(currentPassword: string, newPassword: string): Promise<Result<void>>;

  // Email verification
  sendEmailVerification(): Promise<Result<void>>;
  verifyEmail(code: string): Promise<Result<void>>;

  // Account management
  deleteAccount(): Promise<Result<void>>;
  updateProfile(updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<Result<User>>;

  // Auth state monitoring
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}