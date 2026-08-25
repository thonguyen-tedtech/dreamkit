import type { ReactNode } from "react";
import { AdminAuthProvider } from "@/components/admin/admin-auth-provider";

/**
 * Scopes the admin session to everything under `/admin` (including the login
 * page itself). The public site is never wrapped in this — it has no
 * sign-in concept at all.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
