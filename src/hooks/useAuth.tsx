// @ts-nocheck
/**
 * useAuth — thin shim that delegates to EnhancedAuthContext.
 *
 * All components that import useAuth/AuthProvider continue to work unchanged.
 * EnhancedAuthProvider (in App.tsx) is the single auth source of truth.
 */
import React, { createContext, useContext } from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import type { User } from '@/types/auth';

interface LegacyAuthContextType {
  user: User | null;
  tokens: { accessToken: string; refreshToken: string; expiresIn: number } | null;
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

// Kept only so legacy `<AuthProvider>` JSX in tests/storybooks doesn't break.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

const wrapError = (e: { code: string; message: string } | null): Error | null =>
  e ? new Error(e.message) : null;

export const useAuth = (): LegacyAuthContextType => {
  const auth = useEnhancedAuth();

  return {
    user: auth.user,
    tokens: auth.tokens,
    session: null,
    loading: auth.loading,

    signUp: async (email, password, displayName, role) => {
      const { error } = await auth.signUp({ email, password, fullName: displayName ?? '', role: role as any });
      return { error: wrapError(error) };
    },

    signIn: async (email, password) => {
      const { error } = await auth.signIn({ email, password });
      return { error: wrapError(error) };
    },

    demoSignIn: async (role) => {
      const { error } = await auth.demoSignInByRole(role === 'admin' ? 'administrator' : 'donor');
      return { error: wrapError(error) };
    },

    signOut: auth.signOut,

    refreshToken: async () => {
      const { error } = await auth.refreshToken();
      return { error: wrapError(error) };
    },

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
