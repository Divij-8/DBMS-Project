import { apiService } from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  role: 'farmer' | 'buyer' | 'admin';
  phone?: string;
  location?: string;
  farm_size?: number;
  profile_image?: string;
  created_at?: string;
}

class AuthService {
  async initialize(): Promise<void> {
    // Initialize by checking if user has valid token
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        apiService.setToken(token);
        // Verify token is still valid
        await this.getCurrentUser();
      } catch (error) {
        console.error('Token invalid, clearing auth');
        this.logout();
      }
    }
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    password2: string;
    role: 'farmer' | 'buyer';
  }): Promise<{ success: boolean; message: string; user?: User; tokens?: any }> {
    try {
      const response = await apiService.register(userData);
      
      if (response.tokens?.access) {
        apiService.setToken(response.tokens.access);
        localStorage.setItem('refresh_token', response.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return {
        success: true,
        message: 'Registration successful',
        user: response.user,
        tokens: response.tokens,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Registration failed',
      };
    }
  }

  async login(username: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const response = await apiService.login(username, password);
      if (response.access) {
        apiService.setToken(response.access);
        localStorage.setItem('refresh_token', response.refresh);
        
        // If user data is in response, use it; otherwise fetch it
        let user: User | null = null;
        if (response.user) {
          user = response.user;
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          user = await this.getCurrentUser();
        }
        
        return {
          success: true,
          message: 'Login successful',
          user: user || undefined,
        };
      }
      return {
        success: false,
        message: 'Invalid credentials',
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed',
      };
    }
  }

  async logout(): Promise<void> {
    apiService.clearToken();
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await apiService.getCurrentUser();
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  async updateProfile(data: Partial<User>): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const user = await apiService.updateProfile(data);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      return {
        success: true,
        message: 'Profile updated successfully',
        user,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to update profile',
      };
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getStoredUser(): User | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }
}

export const authService = new AuthService();