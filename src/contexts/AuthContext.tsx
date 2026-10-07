import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type UserRole = "doctor" | "patient" | null;
export type AuthMethod = "gmail" | "hpr" | "abha" | "aadhaar" | "mobile" | null;

export interface User {
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
  login: (role: UserRole, method: AuthMethod, identifier: string, name?: string) => void;
  logout: () => void;
  verifyOtp: (otp: string, fallbackRole?: UserRole, fallbackName?: string) => boolean;
  setAuthenticatedUser: (role: "doctor" | "patient", name?: string, identifier?: string) => void;
}

const STORAGE_KEY = "medlink:user";

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [pendingAuth, setPendingAuth] = useState<{
    role: UserRole;
    method: AuthMethod;
    identifier: string;
    name?: string;
  } | null>(null);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // storage unavailable
    }
  }, [user]);

  const login = useCallback(
    (role: UserRole, method: AuthMethod, identifier: string, name?: string) => {
      setPendingAuth({ role, method, identifier, name });
    },
    [],
  );

  const setAuthenticatedUser = useCallback(
    (role: "doctor" | "patient", name?: string, identifier: string = "") => {
      const defaultName = role === "doctor" ? "Dr. Ananya Sharma" : "Priya Sharma";
      const newUser: User = {
        id: crypto.randomUUID(),
        name: name?.trim() || defaultName,
        role,
        method: role === "doctor" ? "hpr" : "abha",
        identifier: identifier || (role === "doctor" ? "HPR-9824-3102" : "91-8842-1920-3341"),
      };
      setUser(newUser);
      setPendingAuth(null);
    },
    [],
  );

  const verifyOtp = useCallback(
    (otp: string, fallbackRole?: UserRole, fallbackName?: string): boolean => {
      if (otp === "587315") {
        const targetRole = pendingAuth?.role || fallbackRole || "doctor";
        const targetName =
          pendingAuth?.name ||
          fallbackName ||
          (targetRole === "doctor" ? "Dr. Ananya Sharma" : "Priya Sharma");

        const newUser: User = {
          id: crypto.randomUUID(),
          name: targetName,
          role: targetRole,
          method: pendingAuth?.method || (targetRole === "doctor" ? "hpr" : "abha"),
          identifier: pendingAuth?.identifier || (targetRole === "doctor" ? "HPR-9824-3102" : "91-8842-1920-3341"),
        };

        setUser(newUser);
        setPendingAuth(null);
        return true;
      }
      return false;
    },
    [pendingAuth],
  );

  const logout = useCallback(() => {
    setUser(null);
    setPendingAuth(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        login,
        logout,
        verifyOtp,
        setAuthenticatedUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
