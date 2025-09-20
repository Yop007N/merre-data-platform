import {
  IAuthRepository,
  IUserRepository,
  IAssessmentRepository,
  IAdminRepository
} from '../../domain';

import {
  AuthUseCases,
  UserUseCases,
  AssessmentUseCases,
  AdminUseCases
} from '../../application';

import {
  FirebaseAuthRepository,
  ApiUserRepository,
  ApiAssessmentRepository,
  ApiAdminRepository,
  HttpClient,
  httpClient,
  firebaseConfig
} from '../../infrastructure';

export interface DIContainer {
  // Repositories
  authRepository: IAuthRepository;
  userRepository: IUserRepository;
  assessmentRepository: IAssessmentRepository;
  adminRepository: IAdminRepository;

  // Use Cases
  authUseCases: AuthUseCases;
  userUseCases: UserUseCases;
  assessmentUseCases: AssessmentUseCases;
  adminUseCases: AdminUseCases;

  // Services
  httpClient: HttpClient;
}

class DependencyInjectionContainer implements DIContainer {
  private _authRepository: IAuthRepository | null = null;
  private _userRepository: IUserRepository | null = null;
  private _assessmentRepository: IAssessmentRepository | null = null;
  private _adminRepository: IAdminRepository | null = null;

  private _authUseCases: AuthUseCases | null = null;
  private _userUseCases: UserUseCases | null = null;
  private _assessmentUseCases: AssessmentUseCases | null = null;
  private _adminUseCases: AdminUseCases | null = null;

  private _httpClient: HttpClient = httpClient;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    if (!firebaseConfig.isInitialized()) {
      firebaseConfig.initialize();
    }
  }

  // HTTP Client
  get httpClient(): HttpClient {
    return this._httpClient;
  }

  // Repositories
  get authRepository(): IAuthRepository {
    if (!this._authRepository) {
      this._authRepository = new FirebaseAuthRepository();
    }
    return this._authRepository;
  }

  get userRepository(): IUserRepository {
    if (!this._userRepository) {
      this._userRepository = new ApiUserRepository(this.httpClient);
    }
    return this._userRepository;
  }

  get assessmentRepository(): IAssessmentRepository {
    if (!this._assessmentRepository) {
      this._assessmentRepository = new ApiAssessmentRepository(this.httpClient);
    }
    return this._assessmentRepository;
  }

  get adminRepository(): IAdminRepository {
    if (!this._adminRepository) {
      this._adminRepository = new ApiAdminRepository(this.httpClient);
    }
    return this._adminRepository;
  }

  // Use Cases
  get authUseCases(): AuthUseCases {
    if (!this._authUseCases) {
      this._authUseCases = new AuthUseCases(
        this.authRepository,
        this.userRepository
      );
    }
    return this._authUseCases;
  }

  get userUseCases(): UserUseCases {
    if (!this._userUseCases) {
      this._userUseCases = new UserUseCases(this.userRepository);
    }
    return this._userUseCases;
  }

  get assessmentUseCases(): AssessmentUseCases {
    if (!this._assessmentUseCases) {
      this._assessmentUseCases = new AssessmentUseCases(
        this.assessmentRepository,
        this.userRepository
      );
    }
    return this._assessmentUseCases;
  }

  get adminUseCases(): AdminUseCases {
    if (!this._adminUseCases) {
      this._adminUseCases = new AdminUseCases(
        this.adminRepository,
        this.userRepository,
        this.assessmentRepository
      );
    }
    return this._adminUseCases;
  }

  // Reset method for testing or environment changes
  reset(): void {
    this._authRepository = null;
    this._userRepository = null;
    this._assessmentRepository = null;
    this._adminRepository = null;
    this._authUseCases = null;
    this._userUseCases = null;
    this._assessmentUseCases = null;
    this._adminUseCases = null;
  }
}

// Export singleton instance
export const diContainer = new DependencyInjectionContainer();