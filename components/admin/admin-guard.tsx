"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { LoadingOverlay } from "@/components/ui/spinner";
import { useAdminAuth } from "./admin-auth-context";

interface AdminGuardProps {
  readonly children: React.ReactNode;
}

/** Restricts admin routes to signed-in admin accounts; everyone else is sent to /admin/login. */
export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center py-24">
        <LoadingOverlay label="Đang xác thực…" />
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="font-display text-3xl text-foreground">Khu vực quản trị</h1>
        <p className="max-w-md text-sm text-muted">
          Vui lòng đăng nhập bằng tài khoản quản trị để tiếp tục.
        </p>
        <Link
          href="/admin/login"
          className="inline-flex h-11 items-center justify-center rounded-card bg-accent px-6 text-xs font-medium uppercase tracking-label text-accent-foreground transition-colors hover:bg-foreground/85"
        >
          Đăng nhập quản trị
        </Link>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="font-display text-3xl text-foreground">Không có quyền truy cập</h1>
        <p className="max-w-md text-sm text-muted">
          Tài khoản này không có quyền quản trị.
        </p>
        <Link
          href="/"
          className="text-xs font-medium uppercase tracking-label text-foreground underline underline-offset-4"
        >
          Về trang chủ
        </Link>
      </Container>
    );
  }

  return children;
}
