import {
  IAdminRepository,
  Result,
  Admin,
  UserStatistics,
  UserDetail,
  AdminLoginCredentials,
  AdminAuthResult,
  AdminRole,
  QueryFilters,
  PaginatedResult,
  createSuccess,
  createFailure,
  createError
} from '../../domain';
import { HttpClient, HttpError } from '../http';

export class ApiAdminRepository implements IAdminRepository {
  constructor(private httpClient: HttpClient) {}

  async loginAdmin(credentials: AdminLoginCredentials): Promise<Result<AdminAuthResult>> {
    try {
      const response = await this.httpClient.post<AdminAuthResult>('/admin/login', credentials);

      // Store the admin token
      if (response.data.token) {
        this.httpClient.setAuthToken(response.data.token);
      }

      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('ADMIN_LOGIN_ERROR', 'Failed to login admin', error);
    }
  }

  async logoutAdmin(): Promise<Result<void>> {
    try {
      await this.httpClient.post('/admin/logout');
      this.httpClient.clearAuthToken();
      return createSuccess(undefined);
    } catch (error) {
      // Clear token even if logout fails
      this.httpClient.clearAuthToken();
      return this.handleError('ADMIN_LOGOUT_ERROR', 'Failed to logout admin', error);
    }
  }

  async getCurrentAdmin(): Promise<Result<Admin | null>> {
    try {
      const response = await this.httpClient.get<Admin>('/admin/me');
      return createSuccess(response.data);
    } catch (error) {
      if (this.isHttpError(error) && error.status === 401) {
        return createSuccess(null);
      }
      return this.handleError('GET_ADMIN_ERROR', 'Failed to get current admin', error);
    }
  }

  async createAdmin(admin: Omit<Admin, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Admin>> {
    try {
      const response = await this.httpClient.post<Admin>('/admin', {
        ...admin,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('CREATE_ADMIN_ERROR', 'Failed to create admin', error);
    }
  }

  async updateAdmin(adminId: string, updates: Partial<Admin>): Promise<Result<Admin>> {
    try {
      const response = await this.httpClient.put<Admin>(`/admin/${adminId}`, {
        ...updates,
        updatedAt: new Date()
      });
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('UPDATE_ADMIN_ERROR', 'Failed to update admin', error);
    }
  }

  async deleteAdmin(adminId: string): Promise<Result<void>> {
    try {
      await this.httpClient.delete(`/admin/${adminId}`);
      return createSuccess(undefined);
    } catch (error) {
      return this.handleError('DELETE_ADMIN_ERROR', 'Failed to delete admin', error);
    }
  }

  async getAllAdmins(): Promise<Result<Admin[]>> {
    try {
      const response = await this.httpClient.get<Admin[]>('/admin');
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_ADMINS_ERROR', 'Failed to get admins', error);
    }
  }

  async getAllUsersForAdmin(filters?: QueryFilters): Promise<Result<PaginatedResult<UserDetail>>> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await this.httpClient.get<PaginatedResult<UserDetail>>('/admin/users', { params });
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_USERS_FOR_ADMIN_ERROR', 'Failed to get users for admin', error);
    }
  }

  async getUserDetailById(userId: string): Promise<Result<UserDetail>> {
    try {
      const response = await this.httpClient.get<UserDetail>(`/detalle/${userId}`);
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_USER_DETAIL_ERROR', 'Failed to get user detail', error);
    }
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<Result<void>> {
    try {
      await this.httpClient.put(`/admin/users/${userId}/status`, { isActive });
      return createSuccess(undefined);
    } catch (error) {
      return this.handleError('UPDATE_USER_STATUS_ERROR', 'Failed to update user status', error);
    }
  }

  async deleteUserData(userId: string): Promise<Result<void>> {
    try {
      await this.httpClient.delete(`/admin/users/${userId}`);
      return createSuccess(undefined);
    } catch (error) {
      return this.handleError('DELETE_USER_DATA_ERROR', 'Failed to delete user data', error);
    }
  }

  async getUserStatistics(): Promise<Result<UserStatistics>> {
    try {
      const response = await this.httpClient.get<UserStatistics>('/admin/statistics/users');
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_USER_STATISTICS_ERROR', 'Failed to get user statistics', error);
    }
  }

  async getDetailedUserReport(userId: string): Promise<Result<UserDetail>> {
    try {
      const response = await this.httpClient.get<UserDetail>(`/admin/reports/user/${userId}`);
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_USER_REPORT_ERROR', 'Failed to get user report', error);
    }
  }

  async exportAllUserData(): Promise<Result<any>> {
    try {
      const response = await this.httpClient.get('/admin/export/users');
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('EXPORT_USER_DATA_ERROR', 'Failed to export user data', error);
    }
  }

  async hasPermission(adminId: string, permission: string): Promise<Result<boolean>> {
    try {
      const response = await this.httpClient.get<{ hasPermission: boolean }>(
        `/admin/${adminId}/permissions/${permission}`
      );
      return createSuccess(response.data.hasPermission);
    } catch (error) {
      return this.handleError('CHECK_PERMISSION_ERROR', 'Failed to check permission', error);
    }
  }

  async updateAdminRole(adminId: string, role: AdminRole): Promise<Result<Admin>> {
    try {
      const response = await this.httpClient.put<Admin>(`/admin/${adminId}/role`, {
        role,
        updatedAt: new Date()
      });
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('UPDATE_ADMIN_ROLE_ERROR', 'Failed to update admin role', error);
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