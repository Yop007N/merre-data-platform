import {
  IAuthRepository,
  IUserRepository,
  Result,
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResult,
  createSuccess,
  createFailure,
  createError
} from '../../domain';

export class AuthUseCases {
  constructor(
    private authRepository: IAuthRepository,
    private userRepository: IUserRepository
  ) {}

  async register(credentials: RegisterCredentials): Promise<Result<AuthResult>> {
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        return createFailure(createError(
          'INVALID_CREDENTIALS',
          'Email and password are required'
        ));
      }

      if (!this.isValidEmail(credentials.email)) {
        return createFailure(createError(
          'INVALID_EMAIL',
          'Please provide a valid email address'
        ));
      }

      if (credentials.password.length < 6) {
        return createFailure(createError(
          'WEAK_PASSWORD',
          'Password must be at least 6 characters long'
        ));
      }

      // Register user with auth repository
      const authResult = await this.authRepository.register(credentials);
      if (!authResult.success) {
        return authResult;
      }

      // Create user record in user repository
      const userResult = await this.userRepository.createUser({
        email: credentials.email,
        displayName: credentials.displayName,
        emailVerified: false
      });

      if (!userResult.success) {
        // Rollback: logout the user if user creation fails
        await this.authRepository.logout();
        return createFailure(createError(
          'USER_CREATION_FAILED',
          'Failed to create user profile after registration'
        ));
      }

      return authResult;
    } catch (error) {
      return createFailure(createError(
        'REGISTRATION_ERROR',
        'An unexpected error occurred during registration',
        error
      ));
    }
  }

  async login(credentials: LoginCredentials): Promise<Result<AuthResult>> {
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        return createFailure(createError(
          'INVALID_CREDENTIALS',
          'Email and password are required'
        ));
      }

      // Attempt login
      const authResult = await this.authRepository.login(credentials);
      if (!authResult.success) {
        return authResult;
      }

      // Verify user exists in our system
      const userResult = await this.userRepository.getUserById(authResult.data!.user.id);
      if (!userResult.success) {
        await this.authRepository.logout();
        return createFailure(createError(
          'USER_NOT_FOUND',
          'User account not found in system'
        ));
      }

      return authResult;
    } catch (error) {
      return createFailure(createError(
        'LOGIN_ERROR',
        'An unexpected error occurred during login',
        error
      ));
    }
  }

  async loginWithGoogle(): Promise<Result<AuthResult>> {
    try {
      const authResult = await this.authRepository.loginWithGoogle();
      if (!authResult.success) {
        return authResult;
      }

      // Check if user exists, if not create them
      const userCheck = await this.userRepository.getUserById(authResult.data!.user.id);
      if (!userCheck.success) {
        const createResult = await this.userRepository.createUser({
          email: authResult.data!.user.email,
          displayName: authResult.data!.user.displayName,
          photoURL: authResult.data!.user.photoURL,
          emailVerified: authResult.data!.user.emailVerified
        });

        if (!createResult.success) {
          await this.authRepository.logout();
          return createFailure(createError(
            'USER_CREATION_FAILED',
            'Failed to create user profile after Google login'
          ));
        }
      }

      return authResult;
    } catch (error) {
      return createFailure(createError(
        'GOOGLE_LOGIN_ERROR',
        'An unexpected error occurred during Google login',
        error
      ));
    }
  }

  async logout(): Promise<Result<void>> {
    try {
      return await this.authRepository.logout();
    } catch (error) {
      return createFailure(createError(
        'LOGOUT_ERROR',
        'An unexpected error occurred during logout',
        error
      ));
    }
  }

  async getCurrentUser(): Promise<Result<User | null>> {
    try {
      return await this.authRepository.getCurrentUser();
    } catch (error) {
      return createFailure(createError(
        'GET_USER_ERROR',
        'Failed to get current user',
        error
      ));
    }
  }

  async sendPasswordResetEmail(email: string): Promise<Result<void>> {
    try {
      if (!email || !this.isValidEmail(email)) {
        return createFailure(createError(
          'INVALID_EMAIL',
          'Please provide a valid email address'
        ));
      }

      return await this.authRepository.sendPasswordResetEmail(email);
    } catch (error) {
      return createFailure(createError(
        'PASSWORD_RESET_ERROR',
        'Failed to send password reset email',
        error
      ));
    }
  }

  async verifyEmail(): Promise<Result<void>> {
    try {
      return await this.authRepository.sendEmailVerification();
    } catch (error) {
      return createFailure(createError(
        'EMAIL_VERIFICATION_ERROR',
        'Failed to send email verification',
        error
      ));
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}