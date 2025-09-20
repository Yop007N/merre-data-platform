import { useState, useCallback } from 'react';
import {
  Admin,
  UserStatistics,
  UserDetail,
  AdminLoginCredentials,
  AdminAuthResult,
  QueryFilters,
  PaginatedResult,
  Result
} from '../../domain';
import { AdminUseCases } from '../../application';

export interface UseAdminReturn {
  admin: Admin | null;
  users: UserDetail[];
  userStatistics: UserStatistics | null;
  systemOverview: any | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  loginAdmin: (credentials: AdminLoginCredentials) => Promise<Result<AdminAuthResult>>;
  logoutAdmin: () => Promise<Result<void>>;
  getAllUsers: (filters?: QueryFilters) => Promise<void>;
  getUserDetail: (userId: string) => Promise<UserDetail | null>;
  getSystemOverview: () => Promise<void>;
  updateUserStatus: (userId: string, isActive: boolean) => Promise<Result<void>>;
  deleteUserData: (userId: string) => Promise<Result<void>>;
  searchUsers: (query: string, filters?: QueryFilters) => Promise<void>;
  exportUserData: (userId?: string) => Promise<any>;
  clearError: () => void;
}

export const useAdmin = (adminUseCases: AdminUseCases): UseAdminReturn => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [userStatistics, setUserStatistics] = useState<UserStatistics | null>(null);
  const [systemOverview, setSystemOverview] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Login admin
  const loginAdmin = useCallback(async (credentials: AdminLoginCredentials): Promise<Result<AdminAuthResult>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await adminUseCases.loginAdmin(credentials);

      if (result.success) {
        setAdmin(result.data!.admin);
      } else {
        setError(result.error!.message);
      }

      return result;
    } catch (error) {
      const errorMessage = 'Failed to login admin';
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
  }, [adminUseCases]);

  // Logout admin
  const logoutAdmin = useCallback(async (): Promise<Result<void>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await adminUseCases.logoutAdmin();

      if (result.success) {
        setAdmin(null);
        setUsers([]);
        setUserStatistics(null);
        setSystemOverview(null);
      } else {
        setError(result.error!.message);
      }

      return result;
    } catch (error) {
      const errorMessage = 'Failed to logout admin';
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
  }, [adminUseCases]);

  // Get all users
  const getAllUsers = useCallback(async (filters?: QueryFilters): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await adminUseCases.getAllUsers(filters);

      if (result.success) {
        setUsers(result.data!.items);
      } else {
        setError(result.error!.message);
      }
    } catch (error) {
      setError('Failed to get users');
    } finally {
      setLoading(false);
    }
  }, [adminUseCases]);

  // Get user detail
  const getUserDetail = useCallback(async (userId: string): Promise<UserDetail | null> => {
    try {
      const result = await adminUseCases.getUserDetailById(userId);

      if (result.success) {
        return result.data!;
      } else {
        setError(result.error!.message);
        return null;
      }
    } catch (error) {
      setError('Failed to get user detail');
      return null;
    }
  }, [adminUseCases]);

  // Get system overview
  const getSystemOverview = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await adminUseCases.getSystemOverview();

      if (result.success) {
        setSystemOverview(result.data!);
        setUserStatistics(result.data!.userStatistics);
      } else {
        setError(result.error!.message);
      }
    } catch (error) {
      setError('Failed to get system overview');
    } finally {
      setLoading(false);
    }
  }, [adminUseCases]);

  // Update user status
  const updateUserStatus = useCallback(async (userId: string, isActive: boolean): Promise<Result<void>> => {
    try {
      const result = await adminUseCases.updateUserStatus(userId, isActive);

      if (!result.success) {
        setError(result.error!.message);
      }

      return result;
    } catch (error) {
      const errorMessage = 'Failed to update user status';
      setError(errorMessage);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: errorMessage
        }
      };
    }
  }, [adminUseCases]);

  // Delete user data
  const deleteUserData = useCallback(async (userId: string): Promise<Result<void>> => {
    try {
      const result = await adminUseCases.deleteUserData(userId);

      if (!result.success) {
        setError(result.error!.message);
      } else {
        // Remove user from local state
        setUsers(prevUsers => prevUsers.filter(user => user.userId !== userId));
      }

      return result;
    } catch (error) {
      const errorMessage = 'Failed to delete user data';
      setError(errorMessage);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: errorMessage
        }
      };
    }
  }, [adminUseCases]);

  // Search users
  const searchUsers = useCallback(async (query: string, filters?: QueryFilters): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await adminUseCases.searchUsers(query, filters);

      if (result.success) {
        setUsers(result.data!.items);
      } else {
        setError(result.error!.message);
      }
    } catch (error) {
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  }, [adminUseCases]);

  // Export user data
  const exportUserData = useCallback(async (userId?: string): Promise<any> => {
    try {
      const result = await adminUseCases.exportUserData(userId);

      if (result.success) {
        return result.data;
      } else {
        setError(result.error!.message);
        return null;
      }
    } catch (error) {
      setError('Failed to export user data');
      return null;
    }
  }, [adminUseCases]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    admin,
    users,
    userStatistics,
    systemOverview,
    loading,
    error,
    isAuthenticated: !!admin,
    loginAdmin,
    logoutAdmin,
    getAllUsers,
    getUserDetail,
    getSystemOverview,
    updateUserStatus,
    deleteUserData,
    searchUsers,
    exportUserData,
    clearError
  };
};