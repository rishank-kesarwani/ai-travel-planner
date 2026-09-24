'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';
import { User, UserPreferences } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, preferences?: Partial<UserPreferences>) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const profile: any = await api.get('/api/v1/auth/me');
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res: any = await api.post('/api/v1/auth/login', { email, password });
    if (res.accessToken) {
      localStorage.setItem('accessToken', res.accessToken);
      if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
      setUser(res.user);
      localStorage.setItem('user', JSON.stringify(res.user));
      router.push('/dashboard');
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    preferences?: Partial<UserPreferences>,
  ) => {
    const res: any = await api.post('/api/v1/auth/register', {
      name,
      email,
      password,
      preferences,
    });
    if (res.accessToken) {
      localStorage.setItem('accessToken', res.accessToken);
      if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
      setUser(res.user);
      localStorage.setItem('user', JSON.stringify(res.user));
      router.push('/dashboard');
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    }
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    const updated: any = await api.patch('/api/v1/users/preferences', prefs);
    setUser((prev) => (prev ? { ...prev, preferences: updated.preferences || prefs } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
