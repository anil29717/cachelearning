import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: string) => Promise<string>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isTokenExpired = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // exp is in seconds; Date.now() is ms
      return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const fetchUserProfile = async (accessToken: string) => {
    try {
      apiClient.setAccessToken(accessToken);
      const { profile } = await apiClient.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    if (session?.access_token) {
      await fetchUserProfile(session.access_token);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && !isTokenExpired(token)) {
      const sess = { access_token: token };
      setSession(sess);
      apiClient.setAccessToken(token);
      fetchUserProfile(token).finally(() => setLoading(false));
    } else {
      if (token && isTokenExpired(token)) {
        localStorage.removeItem('auth_token');
      }
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, name: string, role: string = 'student') => {
    try {
      const { message } = await apiClient.register(email, password, name, role);
      // Do not auto-login; require email verification
      return message || 'Account created. Check your email to verify.';
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user, token } = await apiClient.login(email, password);
      localStorage.setItem('auth_token', token);
      setSession({ access_token: token });
      await fetchUserProfile(token);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('auth_token');
      setUser(null);
      setSession(null);
      apiClient.setAccessToken(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
