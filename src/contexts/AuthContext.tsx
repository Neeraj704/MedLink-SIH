import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'doctor' | 'patient' | null;
export type AuthMethod = 'gmail' | 'hpr' | 'abha' | 'aadhaar' | null;

interface User {
  id: string;
  name: string;
  role: UserRole;
  method: AuthMethod;
  identifier: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (role: UserRole, method: AuthMethod, identifier: string) => void;
  logout: () => void;
  verifyOtp: (otp: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingAuth, setPendingAuth] = useState<{ role: UserRole; method: AuthMethod; identifier: string } | null>(null);

  const login = useCallback((role: UserRole, method: AuthMethod, identifier: string) => {
    setPendingAuth({ role, method, identifier });
  }, []);

  const verifyOtp = useCallback((otp: string): boolean => {
    if (otp === '587315' && pendingAuth) {
      const nameMap: Record<string, string> = {
        gmail: 'Dr. Sharma',
        hpr: 'Dr. Patel',
        abha: 'Rahul Kumar',
        aadhaar: 'Priya Singh',
      };
      setUser({
        id: crypto.randomUUID(),
        name: nameMap[pendingAuth.method || 'gmail'] || 'User',
        role: pendingAuth.role,
        method: pendingAuth.method,
        identifier: pendingAuth.identifier,
      });
      setPendingAuth(null);
      return true;
    }
    return false;
  }, [pendingAuth]);

  const logout = useCallback(() => {
    setUser(null);
    setPendingAuth(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || null,
      isAuthenticated: !!user,
      login,
      logout,
      verifyOtp,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
