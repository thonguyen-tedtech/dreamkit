"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { loginApi } from "@/lib/auth-api";
import { validateLogin, type FieldErrors, type LoginValues } from "@/lib/auth-validation";
import { useAdminAuth } from "./admin-auth-context";

const EMPTY: LoginValues = { email: "", password: "" };

const INPUT_CLASS =
  "h-11 w-full rounded-card border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground";

/** Sign-in form for the admin panel. The only login surface left in the app. */
export function AdminLoginForm() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading, login } = useAdminAuth();
  const [values, setValues] = useState<LoginValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<LoginValues>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Already signed in as an admin (e.g. a stale session) — skip straight past the form.
  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin) {
      router.replace("/admin");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const result = await loginApi(values);
    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    if (result.session.user.role !== "admin") {
      setFormError("Tài khoản này không có quyền quản trị.");
      return;
    }

    login(result.session);
    router.replace("/admin");
  }

  return (
    <div className="w-full max-w-sm rounded-card border border-border bg-surface p-8">
      <h1 className="font-display text-2xl text-foreground">Đăng nhập quản trị</h1>
      <p className="mt-2 text-sm text-muted">Dành riêng cho quản trị viên Dreamkit.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-label text-muted">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            className={INPUT_CLASS}
          />
          {errors.email ? <span className="text-xs text-red-600">{errors.email}</span> : null}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-label text-muted">Mật khẩu</span>
          <input
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
            className={INPUT_CLASS}
          />
          {errors.password ? <span className="text-xs text-red-600">{errors.password}</span> : null}
        </label>

        {formError ? <p className="text-xs text-red-600">{formError}</p> : null}

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : null}
          Đăng nhập
        </Button>
      </form>

      <Link
        href="/"
        className="mt-6 block text-center text-xs font-medium uppercase tracking-label text-muted underline-offset-4 hover:text-foreground hover:underline"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
