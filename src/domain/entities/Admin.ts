export interface Admin {
  id: string;
  email: string;
  role: AdminRole;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSession {
  adminId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  completedAssessments: number;
  averageScore: number;
  severityDistribution: {
    [key in SeverityLevel]: number;
  };
}

export interface UserDetail {
  userId: string;
  email: string;
  profile: UserProfile;
  assessments: Assessment[];
  results: AssessmentResult[];
  registrationDate: Date;
  lastActivity: Date;
}

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER'
}

export enum Permission {
  VIEW_USERS = 'VIEW_USERS',
  EDIT_USERS = 'EDIT_USERS',
  DELETE_USERS = 'DELETE_USERS',
  VIEW_ASSESSMENTS = 'VIEW_ASSESSMENTS',
  EDIT_ASSESSMENTS = 'EDIT_ASSESSMENTS',
  VIEW_STATISTICS = 'VIEW_STATISTICS',
  MANAGE_ADMINS = 'MANAGE_ADMINS'
}

import { SeverityLevel } from './Assessment';
import { UserProfile } from './User';
import { Assessment, AssessmentResult } from './Assessment';