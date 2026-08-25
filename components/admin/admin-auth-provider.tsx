"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { getMeApi, type AuthSession } from "@/lib/auth-api";
import {
  clearSessionCookie,
  isAdmin as computeIsAdmin,
  parseSession,
  SESSION_STORAGE_KEY,
  writeSessionCookie,
} from "@/lib/auth";
import type { AuthUser } from "@/lib/types";
import { AdminAuthContext, type AdminAuthContextValue } from "./admin-auth-context";

function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return stored ? parseSession(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

/**
 * Holds the signed-in admin's session for everything under `/admin`. There is
 * no customer-facing counterpart: the public site never renders this.
 */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = useCallback((session: AuthSession | null) => {
    setUser(session?.user ?? null);
    setAccessToken(session?.accessToken ?? null);

    try {
      if (session) {
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        writeSessionCookie(session.user);
      } else {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
        clearSessionCookie();
      }
    } catch {
      // Ignore storage failures.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const stored = readStoredSession();
      if (!stored) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      const me = await getMeApi(stored.accessToken);
      if (cancelled) {
        return;
      }

      persistSession(me.ok ? { user: me.user, accessToken: stored.accessToken } : null);
      setIsLoading(false);
    }

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, [persistSession]);

  const login = useCallback((session: AuthSession) => persistSession(session), [persistSession]);
  const logout = useCallback(() => persistSession(null), [persistSession]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: user !== null,
      isAdmin: computeIsAdmin(user),
      isLoading,
      login,
      logout,
    }),
    [user, accessToken, isLoading, login, logout],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
