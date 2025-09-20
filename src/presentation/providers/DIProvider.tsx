import React, { createContext, useContext, ReactNode } from 'react';
import { diContainer, DIContainer } from './DependencyInjectionContainer';

// Create context for dependency injection
const DIContext = createContext<DIContainer | null>(null);

// Provider component
export interface DIProviderProps {
  children: ReactNode;
  container?: DIContainer;
}

export const DIProvider: React.FC<DIProviderProps> = ({
  children,
  container = diContainer
}) => {
  return (
    <DIContext.Provider value={container}>
      {children}
    </DIContext.Provider>
  );
};

// Hook to use the DI container
export const useDI = (): DIContainer => {
  const context = useContext(DIContext);

  if (!context) {
    throw new Error('useDI must be used within a DIProvider');
  }

  return context;
};

// Specific hooks for each use case
export const useAuthUseCases = () => {
  const di = useDI();
  return di.authUseCases;
};

export const useUserUseCases = () => {
  const di = useDI();
  return di.userUseCases;
};

export const useAssessmentUseCases = () => {
  const di = useDI();
  return di.assessmentUseCases;
};

export const useAdminUseCases = () => {
  const di = useDI();
  return di.adminUseCases;
};