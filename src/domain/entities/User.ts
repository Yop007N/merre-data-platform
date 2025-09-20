export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  university?: string;
  career?: string;
  semester?: string;
  phone?: string;
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProfileRequest {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  university: string;
  career: string;
  semester: string;
  phone?: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  university?: string;
  career?: string;
  semester?: string;
  phone?: string;
}