import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  UserCredential
} from 'firebase/auth';
import {
  IAuthRepository,
  LoginCredentials,
  RegisterCredentials,
  AuthResult,
  User,
  Result,
  createSuccess,
  createFailure,
  createError
} from '../../domain';
import { firebaseConfig } from '../config/firebase';

export class FirebaseAuthRepository implements IAuthRepository {
  private auth = firebaseConfig.getAuth();

  async register(credentials: RegisterCredentials): Promise<Result<AuthResult>> {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      // Update display name if provided
      if (credentials.displayName) {
        await updateProfile(userCredential.user, {
          displayName: credentials.displayName
        });
      }

      const user = this.mapFirebaseUserToUser(userCredential.user);
      return createSuccess({ user });
    } catch (error: any) {
      return createFailure(this.mapFirebaseError(error));
    }
  }

  async login(credentials: LoginCredentials): Promise<Result<AuthResult>> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      const user = this.mapFirebaseUserToUser(userCredential.user);
      return createSuccess({ user });
    } catch (error: any) {
      return createFailure(this.mapFirebaseError(error));
    }
  }

  async loginWithGoogle(): Promise<Result<AuthResult>> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential: UserCredential = await signInWithPopup(this.auth, provider);

      const user = this.mapFirebaseUserToUser(userCredential.user);
      return createSuccess({ user });
    } catch (error: any) {
      return createFailure(this.mapFirebaseError(error));
    }
  }

  async logout(): Promise<Result<void>> {
    try {
      await signOut(this.auth);
      return createSuccess(undefined);
    } catch (error: any) {
      return createFailure(createError(
        'LOGOUT_ERROR',
        'Failed to logout',
        error
      ));
    }
  }

  async getCurrentUser(): Promise<Result<User | null>> {
    try {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(this.auth, (firebaseUser) => {
          unsubscribe();
          if (firebaseUser) {
            const user = this.mapFirebaseUserToUser(firebaseUser);
            resolve(createSuccess(user));
          } else {
            resolve(createSuccess(null));
          }
        });
      });
    } catch (error: any) {
      return createFailure(createError(
        'GET_USER_ERROR',
        'Failed to get current user',
        error
      ));
    }
  }

  async refreshToken(): Promise<Result<string>> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return createFailure(createError(
          'NO_USER',
          'No authenticated user found'
        ));
      }

      const token = await user.getIdToken(true);
      return createSuccess(token);
    } catch (error: any) {
      return createFailure(createError(
        'REFRESH_TOKEN_ERROR',
        'Failed to refresh token',
        error
      ));
    }
  }

  async validateToken(token: string): Promise<Result<boolean>> {
    try {
      // Firebase automatically validates tokens, so we just check if user is authenticated
      const user = this.auth.currentUser;
      return createSuccess(!!user);
    } catch (error: any) {
      return createFailure(createError(
        'VALIDATE_TOKEN_ERROR',
        'Failed to validate token',
        error
      ));
    }
  }

  async sendPasswordResetEmail(email: string): Promise<Result<void>> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return createSuccess(undefined);
    } catch (error: any) {
      return createFailure(this.mapFirebaseError(error));
    }
  }

  async confirmPasswordReset(code: string, newPassword: string): Promise<Result<void>> {
    try {
      // This would typically use confirmPasswordReset from Firebase
      // Implementation depends on your specific flow
      return createFailure(createError(
        'NOT_IMPLEMENTED',
        'Password reset confirmation not implemented'
      ));
    } catch (error: any) {
      return createFailure(createError(
        'CONFIRM_PASSWORD_RESET_ERROR',
        'Failed to confirm password reset',
        error
      ));
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<Result<void>> {
    try {
      // This would require re-authentication and then updatePassword
      // Implementation depends on your specific requirements
      return createFailure(createError(
        'NOT_IMPLEMENTED',
        'Change password not implemented'
      ));
    } catch (error: any) {
      return createFailure(createError(
        'CHANGE_PASSWORD_ERROR',
        'Failed to change password',
        error
      ));
    }
  }

  async sendEmailVerification(): Promise<Result<void>> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return createFailure(createError(
          'NO_USER',
          'No authenticated user found'
        ));
      }

      await sendEmailVerification(user);
      return createSuccess(undefined);
    } catch (error: any) {
      return createFailure(createError(
        'EMAIL_VERIFICATION_ERROR',
        'Failed to send email verification',
        error
      ));
    }
  }

  async verifyEmail(code: string): Promise<Result<void>> {
    try {
      // This would use applyActionCode from Firebase
      // Implementation depends on your specific flow
      return createFailure(createError(
        'NOT_IMPLEMENTED',
        'Email verification not implemented'
      ));
    } catch (error: any) {
      return createFailure(createError(
        'VERIFY_EMAIL_ERROR',
        'Failed to verify email',
        error
      ));
    }
  }

  async deleteAccount(): Promise<Result<void>> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return createFailure(createError(
          'NO_USER',
          'No authenticated user found'
        ));
      }

      await user.delete();
      return createSuccess(undefined);
    } catch (error: any) {
      return createFailure(createError(
        'DELETE_ACCOUNT_ERROR',
        'Failed to delete account',
        error
      ));
    }
  }

  async updateProfile(updates: { displayName?: string; photoURL?: string }): Promise<Result<User>> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return createFailure(createError(
          'NO_USER',
          'No authenticated user found'
        ));
      }

      await updateProfile(user, updates);
      const updatedUser = this.mapFirebaseUserToUser(user);
      return createSuccess(updatedUser);
    } catch (error: any) {
      return createFailure(createError(
        'UPDATE_PROFILE_ERROR',
        'Failed to update profile',
        error
      ));
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, (firebaseUser) => {
      if (firebaseUser) {
        const user = this.mapFirebaseUserToUser(firebaseUser);
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  private mapFirebaseUserToUser(firebaseUser: FirebaseUser): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      emailVerified: firebaseUser.emailVerified,
      createdAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime) : new Date(),
      updatedAt: firebaseUser.metadata.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : new Date()
    };
  }

  private mapFirebaseError(error: any) {
    const errorCode = error.code;
    let message = 'An unexpected error occurred';

    switch (errorCode) {
      case 'auth/email-already-in-use':
        message = 'El correo electrónico ya está en uso.';
        break;
      case 'auth/invalid-email':
        message = 'El correo electrónico no es válido.';
        break;
      case 'auth/weak-password':
        message = 'La contraseña es demasiado débil.';
        break;
      case 'auth/user-disabled':
        message = 'La cuenta de usuario ha sido deshabilitada.';
        break;
      case 'auth/user-not-found':
        message = 'No se encontró una cuenta con ese correo electrónico.';
        break;
      case 'auth/wrong-password':
        message = 'La contraseña es incorrecta.';
        break;
      case 'auth/invalid-credential':
        message = 'El correo electrónico o la contraseña son incorrectos.';
        break;
      case 'auth/network-request-failed':
        message = 'Error de red. Por favor, revisa tu conexión a Internet.';
        break;
      case 'auth/requires-recent-login':
        message = 'Por favor, inicia sesión de nuevo para completar esta acción.';
        break;
      case 'auth/popup-closed-by-user':
        message = 'La ventana de inicio de sesión fue cerrada.';
        break;
      default:
        message = error.message || 'Ocurrió un error inesperado.';
    }

    return createError(errorCode || 'FIREBASE_ERROR', message, error);
  }
}