import {
  IUserRepository,
  Result,
  User,
  UserProfile,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  createSuccess,
  createFailure,
  createError
} from '../../domain';

export class UserUseCases {
  constructor(private userRepository: IUserRepository) {}

  async getUserProfile(userId: string): Promise<Result<UserProfile>> {
    try {
      if (!userId) {
        return createFailure(createError(
          'INVALID_USER_ID',
          'User ID is required'
        ));
      }

      return await this.userRepository.getUserProfile(userId);
    } catch (error) {
      return createFailure(createError(
        'GET_PROFILE_ERROR',
        'Failed to retrieve user profile',
        error
      ));
    }
  }

  async createUserProfile(request: CreateUserProfileRequest): Promise<Result<UserProfile>> {
    try {
      // Validate required fields
      const validation = this.validateCreateProfileRequest(request);
      if (!validation.success) {
        return validation;
      }

      // Check if profile already exists
      const existingProfile = await this.userRepository.getUserProfile(request.userId);
      if (existingProfile.success) {
        return createFailure(createError(
          'PROFILE_EXISTS',
          'User profile already exists'
        ));
      }

      return await this.userRepository.createUserProfile(request);
    } catch (error) {
      return createFailure(createError(
        'CREATE_PROFILE_ERROR',
        'Failed to create user profile',
        error
      ));
    }
  }

  async updateUserProfile(userId: string, request: UpdateUserProfileRequest): Promise<Result<UserProfile>> {
    try {
      if (!userId) {
        return createFailure(createError(
          'INVALID_USER_ID',
          'User ID is required'
        ));
      }

      // Validate update fields if provided
      const validation = this.validateUpdateProfileRequest(request);
      if (!validation.success) {
        return validation;
      }

      // Check if profile exists
      const existingProfile = await this.userRepository.getUserProfile(userId);
      if (!existingProfile.success) {
        return createFailure(createError(
          'PROFILE_NOT_FOUND',
          'User profile not found'
        ));
      }

      return await this.userRepository.updateUserProfile(userId, request);
    } catch (error) {
      return createFailure(createError(
        'UPDATE_PROFILE_ERROR',
        'Failed to update user profile',
        error
      ));
    }
  }

  async hasUserProfile(userId: string): Promise<Result<boolean>> {
    try {
      if (!userId) {
        return createFailure(createError(
          'INVALID_USER_ID',
          'User ID is required'
        ));
      }

      return await this.userRepository.hasUserProfile(userId);
    } catch (error) {
      return createFailure(createError(
        'CHECK_PROFILE_ERROR',
        'Failed to check if user has profile',
        error
      ));
    }
  }

  async getUserStatus(userId: string): Promise<Result<{
    exists: boolean;
    hasProfile: boolean;
    isActive: boolean;
    lastActivity?: Date;
  }>> {
    try {
      if (!userId) {
        return createFailure(createError(
          'INVALID_USER_ID',
          'User ID is required'
        ));
      }

      return await this.userRepository.getUserStatus(userId);
    } catch (error) {
      return createFailure(createError(
        'GET_STATUS_ERROR',
        'Failed to get user status',
        error
      ));
    }
  }

  async deleteUser(userId: string): Promise<Result<void>> {
    try {
      if (!userId) {
        return createFailure(createError(
          'INVALID_USER_ID',
          'User ID is required'
        ));
      }

      return await this.userRepository.deleteUser(userId);
    } catch (error) {
      return createFailure(createError(
        'DELETE_USER_ERROR',
        'Failed to delete user',
        error
      ));
    }
  }

  private validateCreateProfileRequest(request: CreateUserProfileRequest): Result<void> {
    if (!request.userId) {
      return createFailure(createError('MISSING_USER_ID', 'User ID is required'));
    }

    if (!request.firstName || request.firstName.trim().length === 0) {
      return createFailure(createError('MISSING_FIRST_NAME', 'First name is required'));
    }

    if (!request.lastName || request.lastName.trim().length === 0) {
      return createFailure(createError('MISSING_LAST_NAME', 'Last name is required'));
    }

    if (!request.dateOfBirth) {
      return createFailure(createError('MISSING_DATE_OF_BIRTH', 'Date of birth is required'));
    }

    if (!request.university || request.university.trim().length === 0) {
      return createFailure(createError('MISSING_UNIVERSITY', 'University is required'));
    }

    if (!request.career || request.career.trim().length === 0) {
      return createFailure(createError('MISSING_CAREER', 'Career is required'));
    }

    if (!request.semester || request.semester.trim().length === 0) {
      return createFailure(createError('MISSING_SEMESTER', 'Semester is required'));
    }

    // Validate date of birth is not in the future
    if (request.dateOfBirth > new Date()) {
      return createFailure(createError('INVALID_DATE_OF_BIRTH', 'Date of birth cannot be in the future'));
    }

    // Validate age is reasonable (between 16 and 100)
    const age = this.calculateAge(request.dateOfBirth);
    if (age < 16 || age > 100) {
      return createFailure(createError('INVALID_AGE', 'Age must be between 16 and 100 years'));
    }

    return createSuccess(undefined);
  }

  private validateUpdateProfileRequest(request: UpdateUserProfileRequest): Result<void> {
    if (request.firstName !== undefined && request.firstName.trim().length === 0) {
      return createFailure(createError('INVALID_FIRST_NAME', 'First name cannot be empty'));
    }

    if (request.lastName !== undefined && request.lastName.trim().length === 0) {
      return createFailure(createError('INVALID_LAST_NAME', 'Last name cannot be empty'));
    }

    if (request.university !== undefined && request.university.trim().length === 0) {
      return createFailure(createError('INVALID_UNIVERSITY', 'University cannot be empty'));
    }

    if (request.career !== undefined && request.career.trim().length === 0) {
      return createFailure(createError('INVALID_CAREER', 'Career cannot be empty'));
    }

    if (request.semester !== undefined && request.semester.trim().length === 0) {
      return createFailure(createError('INVALID_SEMESTER', 'Semester cannot be empty'));
    }

    if (request.dateOfBirth !== undefined) {
      if (request.dateOfBirth > new Date()) {
        return createFailure(createError('INVALID_DATE_OF_BIRTH', 'Date of birth cannot be in the future'));
      }

      const age = this.calculateAge(request.dateOfBirth);
      if (age < 16 || age > 100) {
        return createFailure(createError('INVALID_AGE', 'Age must be between 16 and 100 years'));
      }
    }

    return createSuccess(undefined);
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}