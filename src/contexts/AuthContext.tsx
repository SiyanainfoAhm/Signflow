import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppUser } from '../lib/formEngine';
import { getStoredUser, setStoredUser } from '../lib/formEngine';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  login: (user: AppUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const login = (u: AppUser) => {
    setUser(u);
    setStoredUser(u);
  };

  const logout = () => {
    setUser(null);
    setStoredUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
