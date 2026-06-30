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
  segment?: string;
  onboardingCompleted?: boolean;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthContextType {
  user: User | null;
  tokens: Tokens | null;
  session: Record<string, unknown> | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string, role?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  demoSignIn: (role: 'user' | 'admin') => Promise<{ error: Error | null }>;
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

  // On mount: attempt silent token refresh via the httpOnly refresh cookie,
  // then restore user profile from localStorage for UX continuity.
  useEffect(() => {
    const restoreSession = async () => {
      const savedUser = localStorage.getItem('auth_user');

      try {
        // Attempt silent refresh — the httpOnly cookie is sent automatically
        const resp = await fetch('/api/v2/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (resp.ok) {
          const data = await resp.json();
          const newToken = data?.tokens?.accessToken;
          if (newToken) {
            apiService.setToken(newToken);
            setTokens(data.tokens);

            // Fetch fresh user profile with the new access token
            try {
              const meResp = await fetch('/api/v2/auth/me', {
                credentials: 'include',
                headers: { Authorization: `Bearer ${newToken}` },
              });
              if (meResp.ok) {
                const freshUser = await meResp.json();
                setUser(freshUser);
                localStorage.setItem('auth_user', JSON.stringify(freshUser));
                setLoading(false);
                return;
              }
            } catch {
              // fall through to cached user below
            }
          }
        }
      } catch {
        // Refresh endpoint unreachable (backend offline) — fall back to cache
      }

      // Fall back: restore cached user so UI is not blank, but mark no live token
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem('auth_user');
        }
      }

      setLoading(false);
    };

    restoreSession();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string, _role?: string): Promise<{ error: Error | null }> => {
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
      
      if (response.data) {
        setUser(response.data.user);
        // Store only access token in memory; refresh token should be httpOnly cookie
        setTokens(response.data.tokens);
        // Persist user profile (non-sensitive) for UX continuity across page reloads
        localStorage.setItem('auth_user', JSON.stringify(response.data.user));
        apiService.setToken(response.data.tokens.accessToken);
      }
      
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Sign in failed') };
    }
  };

  const demoSignIn = async (role: 'user' | 'admin'): Promise<{ error: Error | null }> => {
    const demoEmail = role === 'admin' ? 'admin@demo.com' : 'user@demo.com';
    return signIn(demoEmail, 'demo123');
  };

  const signOut = async (): Promise<void> => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('auth_user');
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
    demoSignIn,
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
    // Fallback: AuthProvider not mounted (app uses EnhancedAuthProvider).
    // Return a safe no-op context so legacy consumers don't crash.
    const noop = async () => ({ error: null });
    return {
      user: null,
      tokens: null,
      session: null,
      loading: false,
      signUp: noop,
      signIn: noop,
      demoSignIn: noop,
      signOut: async () => {},
      refreshToken: noop,
      verifyEmail: noop,
      resendVerification: noop,
      forgotPassword: noop,
      resetPassword: noop,
      updateProfile: noop,
    } as AuthContextType;
  }
  return context;
};
