"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { ToastContext, type ToastContextValue, type ToastVariant } from "./toast-context";

interface ToastItem {
  readonly id: number;
  readonly message: string;
  readonly variant: ToastVariant;
}

const AUTO_DISMISS_MS = 5000;

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: "border-foreground/20 bg-background text-highlight",
  error: "border-red-600/30 bg-background text-red-600",
  info: "border-border bg-background text-foreground",
};

/** Renders API response messages as dismissible popups, available app-wide via {@link useToast}. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<readonly ToastItem[]>([]);
  const nextId = useRef(0);
  // `document` exists during SSR-vs-hydration checks too, so branching on
  // `typeof document` alone renders `null` on the server but the portal on
  // the client's hydration pass — a hydration mismatch. Gating on a flag
  // that only flips in an effect keeps both passes rendering `null`.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, variant }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted
        ? createPortal(
            <div className="pointer-events-none fixed inset-x-0 top-4 z-100 flex flex-col items-center gap-2 px-4 sm:left-auto sm:right-4 sm:items-end">
              {toasts.map((toast) => (
                <div
                  key={toast.id}
                  role="status"
                  className={cn(
                    "pointer-events-auto flex w-full max-w-sm animate-pop-in items-start gap-3 rounded-card border px-4 py-3 text-sm shadow-2xl",
                    VARIANT_CLASSES[toast.variant],
                  )}
                >
                  <p className="flex-1">{toast.message}</p>
                  <button
                    type="button"
                    onClick={() => dismiss(toast.id)}
                    aria-label="Đóng thông báo"
                    className="shrink-0 text-muted transition-colors hover:cursor-pointer hover:text-foreground"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="m6 6 12 12M18 6 6 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}
