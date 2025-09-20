import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { environment, validateEnvironment } from './environment';

class FirebaseConfig {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;

  initialize(): void {
    try {
      // Validate environment variables
      validateEnvironment();

      // Initialize Firebase
      this.app = initializeApp(environment.firebase);

      // Initialize Auth
      this.auth = getAuth(this.app);

      // Set persistence
      setPersistence(this.auth, browserLocalPersistence);

      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      throw error;
    }
  }

  getAuth(): Auth {
    if (!this.auth) {
      throw new Error('Firebase Auth not initialized. Call initialize() first.');
    }
    return this.auth;
  }

  getApp(): FirebaseApp {
    if (!this.app) {
      throw new Error('Firebase App not initialized. Call initialize() first.');
    }
    return this.app;
  }

  isInitialized(): boolean {
    return this.app !== null && this.auth !== null;
  }
}

// Export singleton instance
export const firebaseConfig = new FirebaseConfig();