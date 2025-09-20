import {
  IUserRepository,
  Result,
  User,
  UserProfile,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  QueryFilters,
  PaginatedResult,
  createSuccess,
  createFailure,
  createError
} from '../../domain';
import { HttpClient, HttpError } from '../http';

export class ApiUserRepository implements IUserRepository {
  constructor(private httpClient: HttpClient) {}

  async getCurrentUser(): Promise<Result<User | null>> {
    try {
      // This would typically get current user from auth context
      // For now, we'll return null as this is handled by AuthRepository
      return createSuccess(null);
    } catch (error) {
      return this.handleError('GET_CURRENT_USER_ERROR', 'Failed to get current user', error);
    }
  }

  async getUserById(userId: string): Promise<Result<User>> {
    try {
      const response = await this.httpClient.get<User>(`/persons/${userId}`);
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_USER_ERROR', 'Failed to get user', error);
    }
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<User>> {
    try {
      const response = await this.httpClient.post<User>('/persons', {
        ...user,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('CREATE_USER_ERROR', 'Failed to create user', error);
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<Result<User>> {
    try {
      const response = await this.httpClient.put<User>(`/persons/${userId}`, {
        ...updates,
        updatedAt: new Date()
      });
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('UPDATE_USER_ERROR', 'Failed to update user', error);
    }
  }

  async deleteUser(userId: string): Promise<Result<void>> {
    try {
      await this.httpClient.delete(`/persons/${userId}`);
      return createSuccess(undefined);
    } catch (error) {
      return this.handleError('DELETE_USER_ERROR', 'Failed to delete user', error);
    }
  }

  async getUserProfile(userId: string): Promise<Result<UserProfile>> {
    try {
      const response = await this.httpClient.get<UserProfile>(`/persons/${userId}/profile`);
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_PROFILE_ERROR', 'Failed to get user profile', error);
    }
  }

  async createUserProfile(request: CreateUserProfileRequest): Promise<Result<UserProfile>> {
    try {
      const response = await this.httpClient.post<UserProfile>(`/persons/${request.userId}/profile`, {
        ...request,
        profileCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('CREATE_PROFILE_ERROR', 'Failed to create user profile', error);
    }
  }

  async updateUserProfile(userId: string, request: UpdateUserProfileRequest): Promise<Result<UserProfile>> {
    try {
      const response = await this.httpClient.put<UserProfile>(`/persons/${userId}/profile`, {
        ...request,
        updatedAt: new Date()
      });
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('UPDATE_PROFILE_ERROR', 'Failed to update user profile', error);
    }
  }

  async hasUserProfile(userId: string): Promise<Result<boolean>> {
    try {
      const response = await this.httpClient.get<{ hasProfile: boolean }>(`/persons/${userId}/profile/status`);
      return createSuccess(response.data.hasProfile);
    } catch (error) {
      // If 404, user doesn't have profile
      if (this.isHttpError(error) && error.status === 404) {
        return createSuccess(false);
      }
      return this.handleError('CHECK_PROFILE_ERROR', 'Failed to check user profile', error);
    }
  }

  async getAllUsers(filters?: QueryFilters): Promise<Result<PaginatedResult<User>>> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await this.httpClient.get<PaginatedResult<User>>('/persons', { params });
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_USERS_ERROR', 'Failed to get users', error);
    }
  }

  async searchUsers(query: string, filters?: QueryFilters): Promise<Result<PaginatedResult<User>>> {
    try {
      const params = this.buildQueryParams({ ...filters, search: query });
      const response = await this.httpClient.get<PaginatedResult<User>>('/persons/search', { params });
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('SEARCH_USERS_ERROR', 'Failed to search users', error);
    }
  }

  async getUserCount(): Promise<Result<number>> {
    try {
      const response = await this.httpClient.get<{ count: number }>('/persons/count');
      return createSuccess(response.data.count);
    } catch (error) {
      return this.handleError('GET_USER_COUNT_ERROR', 'Failed to get user count', error);
    }
  }

  async getActiveUserCount(): Promise<Result<number>> {
    try {
      const response = await this.httpClient.get<{ count: number }>('/persons/active/count');
      return createSuccess(response.data.count);
    } catch (error) {
      return this.handleError('GET_ACTIVE_USER_COUNT_ERROR', 'Failed to get active user count', error);
    }
  }

  async verifyUserEmail(userId: string): Promise<Result<void>> {
    try {
      await this.httpClient.post(`/persons/${userId}/verify-email`);
      return createSuccess(undefined);
    } catch (error) {
      return this.handleError('VERIFY_EMAIL_ERROR', 'Failed to verify user email', error);
    }
  }

  async getUserStatus(userId: string): Promise<Result<{
    exists: boolean;
    hasProfile: boolean;
    isActive: boolean;
    lastActivity?: Date;
  }>> {
    try {
      const response = await this.httpClient.get<{
        exists: boolean;
        hasProfile: boolean;
        isActive: boolean;
        lastActivity?: string;
      }>(`/user-status/${userId}`);

      const result = {
        ...response.data,
        lastActivity: response.data.lastActivity ? new Date(response.data.lastActivity) : undefined
      };

      return createSuccess(result);
    } catch (error) {
      return this.handleError('GET_USER_STATUS_ERROR', 'Failed to get user status', error);
    }
  }

  private buildQueryParams(filters?: QueryFilters): Record<string, any> {
    if (!filters) return {};

    const params: Record<string, any> = {};

    if (filters.page !== undefined) params.page = filters.page;
    if (filters.pageSize !== undefined) params.pageSize = filters.pageSize;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;
    if (filters.search) params.search = filters.search;

    return params;
  }

  private isHttpError(error: any): error is HttpError {
    return error && typeof error.status === 'number';
  }

  private handleError(code: string, message: string, error: any): Result<any> {
    if (this.isHttpError(error)) {
      return createFailure(createError(
        error.code || code,
        error.message || message,
        error
      ));
    }

    return createFailure(createError(code, message, error));
  }
}