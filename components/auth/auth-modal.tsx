"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { getPostLoginRedirect } from "@/lib/auth-redirect";
import type { AuthUser } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useAuthModal, type AuthMode } from "./auth-modal-context";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

const TABS: ReadonlyArray<{ mode: AuthMode; label: string }> = [
  { mode: "login", label: "Đăng nhập" },
  { mode: "register", label: "Đăng ký" },
];

export function AuthModal() {
  const router = useRouter();
  const { isOpen, mode, close, setMode } = useAuthModal();
  const isLogin = mode === "login";

  function handleSuccess(user: AuthUser) {
    close();

    const redirectPath = getPostLoginRedirect(user);
    if (redirectPath) {
      router.push(redirectPath);
      return;
    }

    router.refresh();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={isLogin ? "Đăng nhập" : "Tạo tài khoản"}
      description={
        isLogin
          ? "Chào mừng trở lại với Dreamkit."
          : "Tham gia Dreamkit để theo dõi đơn thiết kế của đội bạn."
      }
    >
      <div
        role="tablist"
        aria-label="Chọn đăng nhập hoặc đăng ký"
        className="mb-6 grid grid-cols-2 gap-1 rounded-card bg-surface p-1"
      >
        {TABS.map((tab) => {
          const isActive = tab.mode === mode;
          return (
            <button
              key={tab.mode}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setMode(tab.mode)}
              className={cn(
                "rounded-card py-2.5 text-xs font-medium uppercase tracking-label transition-colors hover:cursor-pointer",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLogin ? (
        <LoginForm onSuccess={handleSuccess} />
      ) : (
        <RegisterForm onRegistered={() => setMode("login")} />
      )}

      <p className="mt-6 text-center text-xs text-muted">
        {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
        <button
          type="button"
          onClick={() => setMode(isLogin ? "register" : "login")}
          className="font-medium text-foreground underline underline-offset-4 hover:cursor-pointer"
        >
          {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
        </button>
      </p>
    </Modal>
  );
}
