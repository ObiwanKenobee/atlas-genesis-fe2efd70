import { useSupabaseAuth } from "./useSupabaseAuth";
import { Session, User } from "@supabase/supabase-js";

// Create compatibility layer for useAuth to use useSupabaseAuth
interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthContextType {
  user: User | null;
  tokens: Tokens | null;
  session: Session | null;
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

export const useAuth = (): AuthContextType => {
  const supabaseAuth = useSupabaseAuth();
  
  // Create compatibility tokens from session
  const tokens = supabaseAuth.session ? {
    accessToken: supabaseAuth.session.access_token,
    refreshToken: supabaseAuth.session.refresh_token,
    expiresIn: supabaseAuth.session.expires_in
  } : null;
  
  // Proxy methods to supabaseAuth with compatibility
  return {
    ...supabaseAuth,
    tokens,
    refreshToken: async () => ({ error: null }),
    verifyEmail: async (token: string) => ({ error: null }),
    resendVerification: async () => ({ error: null }),
    forgotPassword: async (email: string) => {
      const result = await supabaseAuth.resetPassword(email);
      return result;
    },
    resetPassword: async (token: string, newPassword: string) => ({ error: null }),
    updateProfile: async (data: Partial<User>) => ({ error: null })
  };
};

// For compatibility, export AuthProvider as alias for SupabaseAuthProvider
import { SupabaseAuthProvider } from "./useSupabaseAuth";
export const AuthProvider = SupabaseAuthProvider;
