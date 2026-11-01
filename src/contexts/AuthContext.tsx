import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "doctor" | "patient" | null;
export type AuthMethod =
  | "gmail"
  | "hpr"
  | "abha"
  | "aadhaar"
  | "mobile"
  | null;

export interface User {
  id: string;
  name: string;
  role: UserRole;
  method: AuthMethod;
  identifier: string;
  avatar?: string;
  email?: string;
  mobile?: string;
  abha_number?: string;
  hpr_id?: string;
  specializations?: string[];
  clinic_name?: string;
  address?: string;
}

export interface AuthResponse {
  success: boolean;
  challenge_id?: string;
  masked_target?: string;
  resend_after?: number;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  loading: boolean;
  challengeId: string | null;
  maskedTarget: string | null;
  login: (
    role: UserRole,
    method: AuthMethod,
    identifier: string,
    name?: string,
    language?: string,
    consent?: boolean,
    isSignup?: boolean
  ) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  verifyOtp: (
    otp: string,
    fallbackRole?: UserRole,
    fallbackName?: string
  ) => Promise<{ success: boolean; error?: string }>;
  setAuthenticatedUser: (
    role: "doctor" | "patient",
    name?: string,
    identifier?: string
  ) => void;
  refreshProfile: () => Promise<void>;
}

const STORAGE_KEY = "medlink:user";
const CHALLENGE_KEY = "medlink:challenge";

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

  const [loading, setLoading] = useState(true);
  const [challengeId, setChallengeId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(CHALLENGE_KEY);
    } catch {
      return null;
    }
  });
  const [maskedTarget, setMaskedTarget] = useState<string | null>(null);

  const [pendingAuth, setPendingAuth] = useState<{
    role: UserRole;
    method: AuthMethod;
    identifier: string;
    name?: string;
  } | null>(null);

  // Fetch full user profile from Supabase
  const fetchProfileForUser = useCallback(async (userId: string) => {
    try {
      const { data: prof, error } = await supabase
        .from("profiles")
        .select("*, doctor_details(*)")
        .eq("id", userId)
        .maybeSingle();

      if (error || !prof) return null;

      const docDetails = (prof as Record<string, unknown>).doctor_details as
        | {
            specializations?: string[];
            clinic_name?: string;
            rating?: number;
          }
        | undefined;
      const constructedUser: User = {
        id: prof.id,
        name: prof.full_name,
        role: prof.role as "doctor" | "patient",
        method: prof.role === "doctor" ? "hpr" : "abha",
        identifier:
          prof.role === "doctor"
            ? prof.hpr_id || prof.mobile || ""
            : prof.abha_number || prof.mobile || "",
        avatar: prof.avatar_path || undefined,
        email: prof.email || undefined,
        mobile: prof.mobile || undefined,
        abha_number: prof.abha_number || undefined,
        hpr_id: prof.hpr_id || undefined,
        specializations: docDetails?.specializations || [],
        clinic_name: docDetails?.clinic_name || undefined,
        address: docDetails?.address || undefined,
      };

      return constructedUser;
    } catch {
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    const updated = await fetchProfileForUser(user.id);
    if (updated) {
      setUser(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }, [user?.id, fetchProfileForUser]);

  // Hydrate session on mount
  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          const profileUser = await fetchProfileForUser(session.user.id);
          if (profileUser) {
            setUser(profileUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profileUser));
          }
        }
      } catch (err) {
        console.warn("Auth hydration notice:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    hydrate();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profileUser = await fetchProfileForUser(session.user.id);
        if (profileUser && mounted) {
          setUser(profileUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(profileUser));
        }
      } else if (event === "SIGNED_OUT") {
        if (mounted) {
          setUser(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfileForUser]);

  // Login handler calling auth-otp-request or auth-signup
  const login = useCallback(
    async (
      role: UserRole,
      method: AuthMethod,
      identifier: string,
      name?: string,
      language = "English",
      consent = true,
      isSignup = false
    ): Promise<AuthResponse> => {
      setPendingAuth({ role, method, identifier, name });

      const endpoint = isSignup ? "auth-signup" : "auth-otp-request";
      const payload = isSignup
        ? {
            role,
            name: name?.trim() || "User",
            mobile: identifier.replace(/\D/g, ""),
            identifier,
            language,
            consent,
          }
        : {
            role,
            identifier,
          };

      try {
        const { data, error } = await supabase.functions.invoke(endpoint, {
          body: payload,
        });

        if (error || data?.error) {
          const errMsg =
            data?.error?.message ||
            error?.message ||
            "Authentication request failed";
          return { success: false, error: errMsg };
        }

        const cid = data.challenge_id;
        const masked = data.masked_target;
        setChallengeId(cid);
        setMaskedTarget(masked);
        try {
          sessionStorage.setItem(CHALLENGE_KEY, cid);
        } catch {
          // sessionStorage may be disabled in private mode
        }

        return {
          success: true,
          challenge_id: cid,
          masked_target: masked,
          resend_after: data.resend_after || 30,
        };
      } catch (err: unknown) {
        return {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to communicate with authentication service",
        };
      }
    },
    []
  );

  // Verify OTP handler
  const verifyOtp = useCallback(
    async (
      otp: string,
      fallbackRole?: UserRole,
      fallbackName?: string
    ): Promise<{ success: boolean; error?: string }> => {
      const activeChallengeId =
        challengeId || sessionStorage.getItem(CHALLENGE_KEY);

      if (!activeChallengeId) {
        // Fallback for prototype mock if challenge id is not present
        if (otp === "587315") {
          const targetRole = pendingAuth?.role || fallbackRole || "doctor";
          const targetName =
            pendingAuth?.name ||
            fallbackName ||
            (targetRole === "doctor" ? "Dr. Ananya Rao" : "Priya Sharma");

          const fallbackUser: User = {
            id: targetRole === "doctor" ? "00000000-0000-0000-0001-000000000001" : "00000000-0000-0000-0002-000000000001",
            name: targetName,
            role: targetRole,
            method: pendingAuth?.method || (targetRole === "doctor" ? "hpr" : "abha"),
            identifier:
              pendingAuth?.identifier ||
              (targetRole === "doctor" ? "HPR-1234-5678" : "91-8842-1920-3341"),
          };
          setUser(fallbackUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackUser));
          return { success: true };
        }
        return { success: false, error: "Authentication challenge expired. Please try again." };
      }

      try {
        const { data, error } = await supabase.functions.invoke("auth-otp-verify", {
          body: {
            challenge_id: activeChallengeId,
            otp: otp.trim(),
          },
        });

        if (error || data?.error) {
          const errMsg =
            data?.error?.message || error?.message || "Invalid verification code";
          return { success: false, error: errMsg };
        }

        const { token_hash, role: serverRole } = data;

        if (token_hash) {
          const { data: sessionData, error: sessionErr } =
            await supabase.auth.verifyOtp({
              token_hash,
              type: "magiclink",
            });

          if (sessionErr) {
            console.error("Magiclink verification error:", sessionErr);
          } else if (sessionData?.user) {
            const profileUser = await fetchProfileForUser(sessionData.user.id);
            if (profileUser) {
              setUser(profileUser);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(profileUser));
            }
          }
        }

        // Check role mismatch if expected role doesn't match server
        const expectedRole = pendingAuth?.role || fallbackRole;
        if (expectedRole && serverRole && expectedRole !== serverRole) {
          return {
            success: false,
            error: `This account is registered as a ${serverRole}. Please sign in via the ${serverRole} tab.`,
          };
        }

        sessionStorage.removeItem(CHALLENGE_KEY);
        setChallengeId(null);
        setPendingAuth(null);
        return { success: true };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to verify code",
        };
      }
    },
    [challengeId, pendingAuth, fetchProfileForUser]
  );

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    setPendingAuth(null);
    setChallengeId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(CHALLENGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const setAuthenticatedUser = useCallback(
    (role: "doctor" | "patient", name?: string, identifier = "") => {
      const defaultName =
        role === "doctor" ? "Dr. Ananya Rao" : "Priya Sharma";
      const newUser: User = {
        id: role === "doctor" ? "00000000-0000-0000-0001-000000000001" : "00000000-0000-0000-0002-000000000001",
        name: name?.trim() || defaultName,
        role,
        method: role === "doctor" ? "hpr" : "abha",
        identifier:
          identifier ||
          (role === "doctor" ? "HPR-1234-5678" : "91-8842-1920-3341"),
      };
      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setPendingAuth(null);
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        challengeId,
        maskedTarget,
        login,
        logout,
        verifyOtp,
        setAuthenticatedUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
