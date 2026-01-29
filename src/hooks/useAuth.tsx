import { useState, useEffect, createContext, useContext } from 'react';
import { apiService } from '@/lib/api/client';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  tenantId?: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  lastLogin?: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthContextType {
  user: User | null;
  tokens: Tokens | null;
  session: any;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string, role?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<{ error: Error | null }>;
  verifyEmail: (token: string) => Promise<{ error: Error | null }>;
  resendVerification: () => Promise<{ error: Error | null }>;
  forgotPassword: (email: string) => Promise<{ error: Error | null }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: Partial<User>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [loading, setLoading] = useState(true);

  // Load saved user and tokens from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    const savedTokens = localStorage.getItem('auth_tokens');
    
    if (savedUser && savedTokens) {
      try {
        setUser(JSON.parse(savedUser));
        setTokens(JSON.parse(savedTokens));
        apiService.setToken(JSON.parse(savedTokens).accessToken);
      } catch (error) {
        console.error('Failed to parse saved auth data:', error);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_tokens');
      }
    }
    
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, displayName?: string, role?: string): Promise<{ error: Error | null }> => {
    try {
      const response = await apiService.auth.signup(email, password, displayName);
      
      if (response.error) {
        return { error: new Error(response.error) };
      }
      
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Sign up failed') };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const response = await apiService.auth.login(email, password);
      
      if (response.error) {
        return { error: new Error(response.error) };
      }
      
      // Save user and tokens
      if (response.data) {
        setUser(response.data.user);
        setTokens(response.data.tokens);
        localStorage.setItem('auth_user', JSON.stringify(response.data.user));
        localStorage.setItem('auth_tokens', JSON.stringify(response.data.tokens));
        apiService.setToken(response.data.tokens.accessToken);
      }
      
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Sign in failed') };
    }
  };

  const signOut = async (): Promise<void> => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_tokens');
    apiService.setToken('');
  };

  const refreshToken = async (): Promise<{ error: Error | null }> => {
    if (!tokens?.refreshToken) {
      return { error: new Error('No refresh token available') };
    }

    try {
      const response = await apiService.auth.refreshToken(tokens.refreshToken);
      
      if (response.error) {
        // If refresh token is invalid, sign out the user
        if (response.error.includes('Invalid') || response.error.includes('expired')) {
          signOut();
        }
        return { error: new Error(response.error) };
      }
      
      if (response.data) {
        setTokens(response.data.tokens);
        localStorage.setItem('auth_tokens', JSON.stringify(response.data.tokens));
        apiService.setToken(response.data.tokens.accessToken);
      }
      
      return { error: null };
    } catch (error) {
      // If refresh fails, sign out the user
      signOut();
      return { error: error instanceof Error ? error : new Error('Token refresh failed') };
    }
  };

  const verifyEmail = async (token: string): Promise<{ error: Error | null }> => {
    try {
      const response = await apiService.auth.verifyEmail(token);
      
      if (response.error) {
        return { error: new Error(response.error) };
      }
      
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Email verification failed') };
    }
  };

  const resendVerification = async (): Promise<{ error: Error | null }> => {
    try {
      const response = await apiService.auth.resendVerification();
      
      if (response.error) {
        return { error: new Error(response.error) };
      }
      
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Failed to resend verification email') };
    }
  };

  const forgotPassword = async (email: string): Promise<{ error: Error | null }> => {
    try {
      const response = await apiService.auth.forgotPassword(email);
      
      if (response.error) {
        return { error: new Error(response.error) };
      }
      
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Failed to send password reset email') };
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<{ error: Error | null }> => {
    try {
      const response = await apiService.auth.resetPassword(token, newPassword);
      
      if (response.error) {
        return { error: new Error(response.error) };
      }
      
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Password reset failed') };
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<{ error: Error | null }> => {
    try {
      if (!user) {
        return { error: new Error('User not authenticated') };
      }

      const response = await apiService.auth.updateProfile(data);
      
      if (response.error) {
        return { error: new Error(response.error) };
      }
      
      // Update local user state
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Profile update failed') };
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    session: null,
    loading,
    signUp,
    signIn,
    signOut,
    refreshToken,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
