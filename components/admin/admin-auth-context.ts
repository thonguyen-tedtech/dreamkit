"use client";

import { createContext, useContext } from "react";
import type { AuthSession } from "@/lib/auth-api";
import type { AuthUser } from "@/lib/types";

export interface AdminAuthContextValue {
  readonly user: AuthUser | null;
  readonly accessToken: string | null;
  readonly isAuthenticated: boolean;
  readonly isAdmin: boolean;
  readonly isLoading: boolean;
  readonly login: (session: AuthSession) => void;
  readonly logout: () => void;
}

/** Default value used outside `AdminAuthProvider`: always signed out, never throws. */
const DEFAULT_VALUE: AdminAuthContextValue = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
  login: () => {},
  logout: () => {},
};

export const AdminAuthContext = createContext<AdminAuthContextValue>(DEFAULT_VALUE);

/**
 * Access the admin session. `AdminAuthProvider` scopes this to the `/admin`
 * route tree; components shared with the public site (e.g. read-only
 * tournament views) may call this outside that tree and safely get back
 * "signed out" instead of a thrown error.
 */
export function useAdminAuth(): AdminAuthContextValue {
  return useContext(AdminAuthContext);
}
