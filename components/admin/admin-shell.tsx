"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminGuard } from "./admin-guard";
import { AdminNav } from "./admin-nav";
import { Container } from "@/components/ui/container";
import { useAdminAuth } from "./admin-auth-context";

interface AdminShellProps {
  readonly children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const { user, logout } = useAdminAuth();

  function handleLogout() {
    logout();
    router.replace("/admin/login");
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-surface">
          <Container className="max-w-full flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-0 sm:h-16">
            <div className="flex flex-col">
              <Link href="/admin" className="font-display text-2xl font-semibold">
                Dreamkit Admin
              </Link>
              <p className="text-xs text-muted">
                {user ? `Xin chào, ${user.name}` : "Quản lý sản phẩm và đơn hàng"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="whitespace-nowrap text-xs font-medium uppercase tracking-label text-foreground underline-offset-4 hover:underline"
              >
                Về cửa hàng
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="whitespace-nowrap text-xs font-medium uppercase tracking-label text-muted underline-offset-4 hover:cursor-pointer hover:text-foreground hover:underline"
              >
                Đăng xuất
              </button>
            </div>
          </Container>
        </header>

        <Container className="max-w-full grid grid-cols-1 gap-10 py-10 lg:grid-cols-[220px_1fr]">
          <aside className="h-fit rounded-card border border-border bg-surface p-4">
            <AdminNav />
          </aside>
          {/* min-w-0: without it, a grid item's default min-width:auto lets wide descendant
              content (e.g. the tab bar's horizontal-scroll min-w-max) blow out the whole
              column instead of scrolling locally within its own overflow-x-auto. */}
          <main className="min-w-0">{children}</main>
        </Container>
      </div>
    </AdminGuard>
  );
}
