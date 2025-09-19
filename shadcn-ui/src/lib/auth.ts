import { databaseService } from './database';
import { User } from './types';

export class AuthService {
  private currentUser: User | null = null;

  async initialize(): Promise<void> {
    // Initialize database on first load
    try {
      await databaseService.initializeDatabase();
      
      // Check if user is logged in (from localStorage for session persistence)
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
    } catch (error) {
      console.error('Failed to initialize auth service:', error);
      // Fallback to localStorage mode if database is not available
      this.initializeFallbackMode();
    }
  }

  private initializeFallbackMode(): void {
    console.warn('Database not available, using localStorage fallback');
    // Keep existing localStorage logic as fallback
  }

  async register(userData: {
    email: string;
    password: string;
    role: 'farmer' | 'buyer';
    name: string;
    phone?: string;
    address?: string;
  }): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Check if user already exists
      const existingUser = await databaseService.getUserByEmail(userData.email);
      if (existingUser) {
        return { success: false, message: 'User with this email already exists' };
      }

      // Hash password (in production, use proper hashing like bcrypt)
      const hashedPassword = await this.hashPassword(userData.password);

      // Create user
      const user = await databaseService.createUser({
        ...userData,
        password: hashedPassword
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return { 
        success: true, 
        message: 'Registration successful', 
        user: userWithoutPassword as User 
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const user = await databaseService.getUserByEmail(email);
      
      if (!user) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Verify password (in production, use proper password verification)
      const isValidPassword = await this.verifyPassword(password, user.password);
      
      if (!isValidPassword) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Set current user and save to localStorage for session persistence
      const { password: _, ...userWithoutPassword } = user;
      this.currentUser = userWithoutPassword as User;
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

      return { 
        success: true, 
        message: 'Login successful', 
        user: this.currentUser 
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Simple password hashing (use bcrypt in production)
  private async hashPassword(password: string): Promise<string> {
    // This is a simple hash for demo purposes
    // In production, use bcrypt or similar
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password);
    return hashedInput === hashedPassword;
  }
}

export const authService = new AuthService();