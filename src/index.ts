// Clean Architecture exports for merre-data-platform

// Domain layer
export * from './domain';

// Application layer
export * from './application';

// Infrastructure layer
export * from './infrastructure';

// Presentation layer
export * from './presentation';

// Clean Architecture main exports
export { diContainer } from './presentation/providers/DependencyInjectionContainer';
export { DIProvider, useDI } from './presentation/providers/DIProvider';