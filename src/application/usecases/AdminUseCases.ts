import {
  IAdminRepository,
  IUserRepository,
  IAssessmentRepository,
  Result,
  Admin,
  UserStatistics,
  UserDetail,
  AdminLoginCredentials,
  AdminAuthResult,
  QueryFilters,
  PaginatedResult,
  createSuccess,
  createFailure,
  createError
} from '../../domain';

export class AdminUseCases {
  constructor(
    private adminRepository: IAdminRepository,
    private userRepository: IUserRepository,
    private assessmentRepository: IAssessmentRepository
  ) {}

  async loginAdmin(credentials: AdminLoginCredentials): Promise<Result<AdminAuthResult>> {
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        return createFailure(createError(
          'INVALID_CREDENTIALS',
          'Email and password are required'
        ));
      }

      return await this.adminRepository.loginAdmin(credentials);
    } catch (error) {
      return createFailure(createError(
        'ADMIN_LOGIN_ERROR',
        'Failed to authenticate admin',
        error
      ));
    }
  }

  async logoutAdmin(): Promise<Result<void>> {
    try {
      return await this.adminRepository.logoutAdmin();
    } catch (error) {
      return createFailure(createError(
        'ADMIN_LOGOUT_ERROR',
        'Failed to logout admin',
        error
      ));
    }
  }

  async getCurrentAdmin(): Promise<Result<Admin | null>> {
    try {
      return await this.adminRepository.getCurrentAdmin();
    } catch (error) {
      return createFailure(createError(
        'GET_ADMIN_ERROR',
        'Failed to get current admin',
        error
      ));
    }
  }

  async getAllUsers(filters?: QueryFilters): Promise<Result<PaginatedResult<UserDetail>>> {
    try {
      return await this.adminRepository.getAllUsersForAdmin(filters);
    } catch (error) {
      return createFailure(createError(
        'GET_USERS_ERROR',
        'Failed to retrieve users',
        error
      ));
    }
  }

  async getUserDetailById(userId: string): Promise<Result<UserDetail>> {
    try {
      if (!userId) {
        return createFailure(createError(
          'INVALID_USER_ID',
          'User ID is required'
        ));
      }

      return await this.adminRepository.getUserDetailById(userId);
    } catch (error) {
      return createFailure(createError(
        'GET_USER_DETAIL_ERROR',
        'Failed to retrieve user details',
        error
      ));
    }
  }

  async getUserStatistics(): Promise<Result<UserStatistics>> {
    try {
      return await this.adminRepository.getUserStatistics();
    } catch (error) {
      return createFailure(createError(
        'GET_STATISTICS_ERROR',
        'Failed to retrieve user statistics',
        error
      ));
    }
  }

  async getSystemOverview(): Promise<Result<{
    userStatistics: UserStatistics;
    assessmentStatistics: {
      totalAssessments: number;
      completedAssessments: number;
      averageScore: number;
      completionRate: number;
    };
    recentActivity: UserDetail[];
  }>> {
    try {
      // Get user statistics
      const userStatsResult = await this.adminRepository.getUserStatistics();
      if (!userStatsResult.success) {
        return userStatsResult as any;
      }

      // Get assessment statistics
      const assessmentStatsResult = await this.assessmentRepository.getAssessmentStatistics();
      if (!assessmentStatsResult.success) {
        return createFailure(createError(
          'GET_ASSESSMENT_STATS_ERROR',
          'Failed to retrieve assessment statistics'
        ));
      }

      // Get recent activity (last 10 users)
      const recentUsersResult = await this.adminRepository.getAllUsersForAdmin({
        page: 1,
        pageSize: 10,
        sortBy: 'lastActivity',
        sortOrder: 'desc'
      });

      const recentActivity = recentUsersResult.success ? recentUsersResult.data!.items : [];

      return createSuccess({
        userStatistics: userStatsResult.data!,
        assessmentStatistics: assessmentStatsResult.data!,
        recentActivity
      });
    } catch (error) {
      return createFailure(createError(
        'GET_OVERVIEW_ERROR',
        'Failed to retrieve system overview',
        error
      ));
    }
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<Result<void>> {
    try {
      if (!userId) {
        return createFailure(createError(
          'INVALID_USER_ID',
          'User ID is required'
        ));
      }

      // Verify user exists
      const userDetailResult = await this.adminRepository.getUserDetailById(userId);
      if (!userDetailResult.success) {
        return createFailure(createError(
          'USER_NOT_FOUND',
          'User not found'
        ));
      }

      return await this.adminRepository.updateUserStatus(userId, isActive);
    } catch (error) {
      return createFailure(createError(
        'UPDATE_USER_STATUS_ERROR',
        'Failed to update user status',
        error
      ));
    }
  }

  async deleteUserData(userId: string): Promise<Result<void>> {
    try {
      if (!userId) {
        return createFailure(createError(
          'INVALID_USER_ID',
          'User ID is required'
        ));
      }

      // Verify user exists
      const userDetailResult = await this.adminRepository.getUserDetailById(userId);
      if (!userDetailResult.success) {
        return createFailure(createError(
          'USER_NOT_FOUND',
          'User not found'
        ));
      }

      // This should cascade delete user assessments and results
      return await this.adminRepository.deleteUserData(userId);
    } catch (error) {
      return createFailure(createError(
        'DELETE_USER_ERROR',
        'Failed to delete user data',
        error
      ));
    }
  }

  async exportUserData(userId?: string): Promise<Result<any>> {
    try {
      if (userId) {
        // Export specific user data
        const userDetailResult = await this.adminRepository.getUserDetailById(userId);
        if (!userDetailResult.success) {
          return createFailure(createError(
            'USER_NOT_FOUND',
            'User not found'
          ));
        }

        return createSuccess(userDetailResult.data);
      } else {
        // Export all user data
        return await this.adminRepository.exportAllUserData();
      }
    } catch (error) {
      return createFailure(createError(
        'EXPORT_DATA_ERROR',
        'Failed to export user data',
        error
      ));
    }
  }

  async searchUsers(query: string, filters?: QueryFilters): Promise<Result<PaginatedResult<UserDetail>>> {
    try {
      if (!query || query.trim().length === 0) {
        return this.getAllUsers(filters);
      }

      // Use the search functionality through user repository
      const searchResult = await this.userRepository.searchUsers(query, filters);
      if (!searchResult.success) {
        return searchResult as any;
      }

      // Convert User[] to UserDetail[] by getting additional details
      const users = searchResult.data!.items;
      const userDetails: UserDetail[] = [];

      for (const user of users) {
        const detailResult = await this.adminRepository.getUserDetailById(user.id);
        if (detailResult.success) {
          userDetails.push(detailResult.data!);
        }
      }

      return createSuccess({
        items: userDetails,
        totalCount: searchResult.data!.totalCount,
        page: searchResult.data!.page,
        pageSize: searchResult.data!.pageSize,
        hasNext: searchResult.data!.hasNext,
        hasPrevious: searchResult.data!.hasPrevious
      });
    } catch (error) {
      return createFailure(createError(
        'SEARCH_USERS_ERROR',
        'Failed to search users',
        error
      ));
    }
  }

  async hasPermission(permission: string): Promise<Result<boolean>> {
    try {
      const adminResult = await this.adminRepository.getCurrentAdmin();
      if (!adminResult.success || !adminResult.data) {
        return createFailure(createError(
          'ADMIN_NOT_AUTHENTICATED',
          'Admin is not authenticated'
        ));
      }

      return await this.adminRepository.hasPermission(adminResult.data.id, permission);
    } catch (error) {
      return createFailure(createError(
        'CHECK_PERMISSION_ERROR',
        'Failed to check permission',
        error
      ));
    }
  }
}