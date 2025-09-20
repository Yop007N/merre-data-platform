import { useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  Result
} from '../../domain';
import { UserUseCases } from '../../application';

export interface UseUserReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  hasProfile: boolean;

  // Actions
  createProfile: (request: CreateUserProfileRequest) => Promise<Result<UserProfile>>;
  updateProfile: (userId: string, request: UpdateUserProfileRequest) => Promise<Result<UserProfile>>;
  loadProfile: (userId: string) => Promise<void>;
  checkUserStatus: (userId: string) => Promise<{
    exists: boolean;
    hasProfile: boolean;
    isActive: boolean;
    lastActivity?: Date;
  } | null>;
  clearError: () => void;
}

export const useUser = (userUseCases: UserUseCases): UseUserReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load user profile
  const loadProfile = useCallback(async (userId: string): Promise<void> => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await userUseCases.getUserProfile(userId);

      if (result.success) {
        setProfile(result.data!);
      } else {
        if (result.error!.code !== 'PROFILE_NOT_FOUND') {
          setError(result.error!.message);
        }
        setProfile(null);
      }
    } catch (error) {
      setError('Failed to load user profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userUseCases]);

  // Create user profile
  const createProfile = useCallback(async (request: CreateUserProfileRequest): Promise<Result<UserProfile>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await userUseCases.createUserProfile(request);

      if (result.success) {
        setProfile(result.data!);
      } else {
        setError(result.error!.message);
      }

      return result;
    } catch (error) {
      const errorMessage = 'Failed to create user profile';
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
  }, [userUseCases]);

  // Update user profile
  const updateProfile = useCallback(async (userId: string, request: UpdateUserProfileRequest): Promise<Result<UserProfile>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await userUseCases.updateUserProfile(userId, request);

      if (result.success) {
        setProfile(result.data!);
      } else {
        setError(result.error!.message);
      }

      return result;
    } catch (error) {
      const errorMessage = 'Failed to update user profile';
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
  }, [userUseCases]);

  // Check user status
  const checkUserStatus = useCallback(async (userId: string): Promise<{
    exists: boolean;
    hasProfile: boolean;
    isActive: boolean;
    lastActivity?: Date;
  } | null> => {
    if (!userId) return null;

    try {
      const result = await userUseCases.getUserStatus(userId);

      if (result.success) {
        return result.data!;
      } else {
        setError(result.error!.message);
        return null;
      }
    } catch (error) {
      setError('Failed to check user status');
      return null;
    }
  }, [userUseCases]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    profile,
    loading,
    error,
    hasProfile: !!profile,
    createProfile,
    updateProfile,
    loadProfile,
    checkUserStatus,
    clearError
  };
};