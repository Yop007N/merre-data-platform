# Clean Architecture Implementation - Merre Data Platform

## Overview

This project has been refactored to implement Clean Architecture principles, providing a scalable, maintainable, and testable codebase for the educational assessment platform.

## Architecture Structure

```
src/
├── domain/                 # Business entities and rules
│   ├── entities/          # Core business entities
│   └── interfaces/        # Repository contracts and common types
├── application/           # Use cases and business logic
│   └── usecases/         # Application-specific business rules
├── infrastructure/        # External concerns
│   ├── config/           # Configuration and environment
│   ├── http/             # HTTP client and API communication
│   └── repositories/     # Repository implementations
├── presentation/          # UI and framework concerns
│   ├── hooks/            # React hooks for state management
│   └── providers/        # Dependency injection and context
└── components/           # React components (to be refactored)
```

## Key Components

### Domain Layer (`/domain`)

**Entities:**
- `User.ts` - User account and profile management
- `Assessment.ts` - Assessment questions, answers, and results
- `Admin.ts` - Admin accounts and permissions

**Interfaces:**
- Repository contracts (`IAuthRepository`, `IUserRepository`, etc.)
- Common types (`Result`, `PaginatedResult`, `QueryFilters`)

### Application Layer (`/application`)

**Use Cases:**
- `AuthUseCases` - Authentication and session management
- `UserUseCases` - User profile management
- `AssessmentUseCases` - Assessment creation and submission
- `AdminUseCases` - Administrative operations

### Infrastructure Layer (`/infrastructure`)

**Repositories:**
- `FirebaseAuthRepository` - Firebase authentication implementation
- `ApiUserRepository` - User data via HTTP API
- `ApiAssessmentRepository` - Assessment data via HTTP API
- `ApiAdminRepository` - Admin operations via HTTP API

**Services:**
- `HttpClient` - Centralized HTTP communication
- `firebaseConfig` - Firebase initialization and configuration

### Presentation Layer (`/presentation`)

**Hooks:**
- `useAuth` - Authentication state and operations
- `useUser` - User profile management
- `useAssessment` - Assessment operations
- `useAdmin` - Administrative operations

**Providers:**
- `DIProvider` - Dependency injection container
- `DependencyInjectionContainer` - Service registration and resolution

## Key Features

### 1. Clean Separation of Concerns
- **Domain**: Contains pure business logic without dependencies
- **Application**: Orchestrates business rules and use cases
- **Infrastructure**: Handles external APIs, databases, and services
- **Presentation**: Manages UI state and user interactions

### 2. Dependency Injection
```typescript
// Use DI container throughout the application
const authUseCases = useAuthUseCases();
const { login, logout, user } = useAuth(authUseCases);
```

### 3. Error Handling
- Standardized `Result<T>` type for consistent error handling
- Clean error propagation from infrastructure to presentation
- User-friendly error messages with proper localization

### 4. Type Safety
- Comprehensive TypeScript definitions
- Strong typing throughout all layers
- Interface segregation for better maintainability

### 5. Testability
- Dependency injection enables easy mocking
- Pure functions in domain layer
- Isolated use cases for unit testing

## Usage Examples

### Authentication
```typescript
// In a React component
const authUseCases = useAuthUseCases();
const { login, user, loading, error } = useAuth(authUseCases);

const handleLogin = async (credentials: LoginCredentials) => {
  const result = await login(credentials);
  if (result.success) {
    navigate('/dashboard');
  }
  // Error is automatically handled by the hook
};
```

### User Management
```typescript
// Admin operations
const adminUseCases = useAdminUseCases();
const { getAllUsers, deleteUserData } = useAdmin(adminUseCases);

const handleDeleteUser = async (userId: string) => {
  const result = await deleteUserData(userId);
  if (result.success) {
    // Refresh user list
    await getAllUsers();
  }
};
```

### Assessment Submission
```typescript
// Assessment operations
const assessmentUseCases = useAssessmentUseCases();
const { submitAssessment } = useAssessment(assessmentUseCases);

const handleSubmit = async (answers: Answer[]) => {
  const result = await submitAssessment({
    userId: user.id,
    assessmentId: assessmentId,
    answers: answers
  });

  if (result.success) {
    navigate('/results', { state: { result: result.data } });
  }
};
```

## Migration Guide

### From Old Architecture to Clean Architecture

1. **Replace old auth service:**
```typescript
// Old way
import { useAuth } from '../services/auth-service';

// New way
import { useAuth } from '../presentation/hooks';
import { useAuthUseCases } from '../presentation/providers';

const authUseCases = useAuthUseCases();
const auth = useAuth(authUseCases);
```

2. **Replace direct API calls:**
```typescript
// Old way
import axios from 'axios';
const response = await axios.get('/api/users');

// New way
const userUseCases = useUserUseCases();
const result = await userUseCases.getAllUsers();
```

3. **Error handling:**
```typescript
// Old way
try {
  const result = await apiCall();
  // handle success
} catch (error) {
  // handle error
}

// New way
const result = await useCase.operation();
if (result.success) {
  // handle success with result.data
} else {
  // handle error with result.error
}
```

## Environment Configuration

Update your `.env` file with required variables:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

## Benefits

### 1. Maintainability
- Clear separation of concerns makes code easier to understand
- Changes in one layer don't affect others
- Business logic is isolated and reusable

### 2. Testability
- Pure functions in domain layer are easy to test
- Dependency injection enables comprehensive unit testing
- Mock implementations for integration testing

### 3. Scalability
- New features can be added without affecting existing code
- Easy to swap implementations (e.g., different authentication providers)
- Clear contracts between layers

### 4. Team Development
- Different team members can work on different layers
- Clear interfaces prevent breaking changes
- Consistent patterns across the application

## Next Steps

1. **Complete Migration**: Gradually refactor existing components to use Clean Architecture
2. **Add Tests**: Implement comprehensive test suite for all layers
3. **Documentation**: Create detailed API documentation for all use cases
4. **Performance**: Add caching and optimization strategies
5. **Monitoring**: Implement logging and error tracking

## File Examples

### Domain Entity
```typescript
// domain/entities/User.ts
export interface User {
  id: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Use Case
```typescript
// application/usecases/AuthUseCases.ts
export class AuthUseCases {
  constructor(
    private authRepository: IAuthRepository,
    private userRepository: IUserRepository
  ) {}

  async login(credentials: LoginCredentials): Promise<Result<AuthResult>> {
    // Business logic implementation
  }
}
```

### Repository Implementation
```typescript
// infrastructure/repositories/FirebaseAuthRepository.ts
export class FirebaseAuthRepository implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<Result<AuthResult>> {
    // Firebase-specific implementation
  }
}
```

### React Hook
```typescript
// presentation/hooks/useAuth.ts
export const useAuth = (authUseCases: AuthUseCases): UseAuthReturn => {
  // React-specific state management
};
```

This Clean Architecture implementation provides a solid foundation for building scalable, maintainable, and testable applications while keeping business logic separate from framework concerns.