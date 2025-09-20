import { Result, QueryFilters, PaginatedResult } from '../common';
import { Admin, UserStatistics, UserDetail, AdminRole } from '../../entities';

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminAuthResult {
  admin: Admin;
  token: string;
}

export interface IAdminRepository {
  // Admin authentication
  loginAdmin(credentials: AdminLoginCredentials): Promise<Result<AdminAuthResult>>;
  logoutAdmin(): Promise<Result<void>>;
  getCurrentAdmin(): Promise<Result<Admin | null>>;

  // Admin management
  createAdmin(admin: Omit<Admin, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Admin>>;
  updateAdmin(adminId: string, updates: Partial<Admin>): Promise<Result<Admin>>;
  deleteAdmin(adminId: string): Promise<Result<void>>;
  getAllAdmins(): Promise<Result<Admin[]>>;

  // User management for admins
  getAllUsersForAdmin(filters?: QueryFilters): Promise<Result<PaginatedResult<UserDetail>>>;
  getUserDetailById(userId: string): Promise<Result<UserDetail>>;
  updateUserStatus(userId: string, isActive: boolean): Promise<Result<void>>;
  deleteUserData(userId: string): Promise<Result<void>>;

  // Statistics and reporting
  getUserStatistics(): Promise<Result<UserStatistics>>;
  getDetailedUserReport(userId: string): Promise<Result<UserDetail>>;
  exportAllUserData(): Promise<Result<any>>;

  // Admin permissions
  hasPermission(adminId: string, permission: string): Promise<Result<boolean>>;
  updateAdminRole(adminId: string, role: AdminRole): Promise<Result<Admin>>;
}