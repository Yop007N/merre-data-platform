import { Result, QueryFilters, PaginatedResult } from '../common';
import { User, UserProfile, CreateUserProfileRequest, UpdateUserProfileRequest } from '../../entities';

export interface IUserRepository {
  // User authentication related methods
  getCurrentUser(): Promise<Result<User | null>>;
  getUserById(userId: string): Promise<Result<User>>;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<User>>;
  updateUser(userId: string, updates: Partial<User>): Promise<Result<User>>;
  deleteUser(userId: string): Promise<Result<void>>;

  // User profile methods
  getUserProfile(userId: string): Promise<Result<UserProfile>>;
  createUserProfile(request: CreateUserProfileRequest): Promise<Result<UserProfile>>;
  updateUserProfile(userId: string, request: UpdateUserProfileRequest): Promise<Result<UserProfile>>;
  hasUserProfile(userId: string): Promise<Result<boolean>>;

  // User listing and search
  getAllUsers(filters?: QueryFilters): Promise<Result<PaginatedResult<User>>>;
  searchUsers(query: string, filters?: QueryFilters): Promise<Result<PaginatedResult<User>>>;

  // User statistics
  getUserCount(): Promise<Result<number>>;
  getActiveUserCount(): Promise<Result<number>>;

  // User verification and status
  verifyUserEmail(userId: string): Promise<Result<void>>;
  getUserStatus(userId: string): Promise<Result<{
    exists: boolean;
    hasProfile: boolean;
    isActive: boolean;
    lastActivity?: Date;
  }>>;
}