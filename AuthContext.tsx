import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { authService } from './services/authService';
import {
  AgentSpecialization,
  AuthContextValue,
  AuthUser,
  LoginResult,
  UserRole,
  VerificationStatus,
} from './types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalize_user(api_user: any): AuthUser {
  return {
    id: api_user.id,
    name: api_user.name,
    avatar: api_user.avatar,
    email: api_user.email,
    role: api_user.role as UserRole,
    specialization: api_user.specialization as AgentSpecialization,
    verification_status: api_user?.verification_status as VerificationStatus,
  };
}

const CACHE_KEY = 'trivgoo_user_cache';

function readCache(): AuthUser | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? (JSON.parse(cached) as AuthUser) : null;
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, set_user] = useState<AuthUser | null>(() => readCache());
  const [is_loading, set_is_loading] = useState(true);

  // ✅ versi operasi (biar request lama ga boleh nimpain state terbaru)
  const opVersionRef = useRef(0);

  const persist_user = useCallback((u: AuthUser | null) => {
    set_user(u);
    try {
      if (u) localStorage.setItem(CACHE_KEY, JSON.stringify(u));
      else localStorage.removeItem(CACHE_KEY);
    } catch {}
  }, []);

  const refresh_me = useCallback(async () => {
    const v = ++opVersionRef.current;

    try {
      const api_user = await authService.me();
      if (v !== opVersionRef.current) return;
      persist_user(normalize_user(api_user));
    } catch (e: any) {
      if (v !== opVersionRef.current) return;

      const status = e?.response?.status;
      if (status === 401) persist_user(null);
    }
  }, [persist_user]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        await refresh_me();
      } finally {
        if (alive) set_is_loading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [refresh_me]);

  const update_user = useCallback((partial: Partial<AuthUser>) => {
    set_user((prev) => {
      if (!prev) return prev;
      const merged = { ...prev, ...partial };
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
      } catch {}
      return merged;
    });
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      const v = ++opVersionRef.current;

      try {
        const api_user = await authService.login({ email, password });
        const u = normalize_user(api_user);
        if (v !== opVersionRef.current) return { success: false, message: 'Login cancelled' };
        persist_user(u);
        return { success: true, user: u };
      } catch (e: any) {
        return { success: false, message: e?.message || 'Login failed' };
      }
    },
    [persist_user],
  );

  const logout = useCallback(async () => {
    const v = ++opVersionRef.current;

    try {
      await authService.logout();
    } catch (e) {
      console.error('[AUTH] logout error:', e);
    } finally {
      if (v === opVersionRef.current) persist_user(null);
    }
  }, [persist_user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading: is_loading,
      login,
      logout,
      refreshMe: refresh_me,
      updateUser: update_user,
    }),
    [user, is_loading, login, logout, refresh_me, update_user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
