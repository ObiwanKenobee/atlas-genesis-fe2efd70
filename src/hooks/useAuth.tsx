import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  displayName?: string;
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

const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api.atlas-genesis.com'
  : 'http://localhost:4000';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedTokens = localStorage.getItem('auth_tokens');
      const storedUser = localStorage.getItem('auth_user');

      if (storedTokens && storedUser) {
        try {
          const parsedTokens = JSON.parse(storedTokens);
          const parsedUser = JSON.parse(storedUser);

          // Check if access token is still valid
          const tokenPayload = JSON.parse(atob(parsedTokens.accessToken.split('.')[1]));
          const now = Math.floor(Date.now() / 1000);

          if (tokenPayload.exp > now) {
            setTokens(parsedTokens);
            setUser(parsedUser);
          } else if (parsedTokens.refreshToken) {
            // Try to refresh token
            const refreshResult = await refreshToken();
            if (refreshResult.error) {
              // Clear stored data if refresh fails
              localStorage.removeItem('auth_tokens');
              localStorage.removeItem('auth_user');
            }
          }
        } catch (error) {
          console.error('Error parsing stored auth data:', error);
          localStorage.removeItem('auth_tokens');
          localStorage.removeItem('auth_user');
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Store auth data in localStorage
  const storeAuthData = (userData: User, tokenData: Tokens) => {
    localStorage.setItem('auth_user', JSON.stringify(userData));
    localStorage.setItem('auth_tokens', JSON.stringify(tokenData));
    setUser(userData);
    setTokens(tokenData);
  };

  // Clear auth data
  const clearAuthData = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_tokens');
    setUser(null);
    setTokens(null);
  };

  const signUp = async (email: string, password: string, displayName?: string, role = 'individual') => {
    try {
      const response = await fetch(`${API_BASE}/api/v2/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
          displayName,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.message || 'Signup failed') };
      }

      // For signup, we don't automatically sign in
      // User needs to verify email first
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/v2/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.message || 'Login failed') };
      }

      storeAuthData(data.user, data.tokens);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      if (tokens?.refreshToken) {
        await fetch(`${API_BASE}/api/v2/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokens.accessToken}`,
          },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuthData();
    }
  };

  const refreshToken = async () => {
    if (!tokens?.refreshToken) {
      return { error: new Error('No refresh token available') };
    }

    try {
      const response = await fetch(`${API_BASE}/api/v2/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: tokens.refreshToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        clearAuthData();
        return { error: new Error(data.message || 'Token refresh failed') };
      }

      const newTokens = data.tokens;
      if (user) {
        storeAuthData(user, newTokens);
      }

      return { error: null };
    } catch (error) {
      clearAuthData();
      return { error: error as Error };
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/v2/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.message || 'Email verification failed') };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const resendVerification = async () => {
    if (!tokens?.accessToken) {
      return { error: new Error('Not authenticated') };
    }

    try {
      const response = await fetch(`${API_BASE}/api/v2/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.message || 'Failed to resend verification') };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/v2/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.message || 'Failed to send reset email') };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/v2/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.message || 'Password reset failed') };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!tokens?.accessToken) {
      return { error: new Error('Not authenticated') };
    }

    try {
      const response = await fetch(`${API_BASE}/api/v2/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.message || 'Profile update failed') };
      }

      // Update stored user data
      if (user) {
        const updatedUser = { ...user, ...data };
        storeAuthData(updatedUser, tokens);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      tokens,
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
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
