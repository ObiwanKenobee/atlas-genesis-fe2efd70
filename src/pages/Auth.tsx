import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const { signIn, signUp, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await signIn(email, password);
    } else {
      await signUp(email, password, displayName);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isLogin ? 'Sign In' : 'Sign Up'} - Atlas Sanctum</title>
      </Helmet>
      
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-card border border-border rounded-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">
                {isLogin ? 'Welcome Back' : 'Join Atlas Sanctum'}
              </h1>
              <p className="text-muted-foreground">
                {isLogin ? 'Sign in to your account' : 'Create your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-2">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border bg-background"
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg border border-border bg-background"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-border bg-background"
                  required
                />
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading ? 'Loading...' : (
                  <>
                    {isLogin ? <LogIn className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                    {isLogin ? 'Sign In' : 'Sign Up'}
                  </>
                )}
              </Button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;