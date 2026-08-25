"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const ADMIN_LINKS = [
  { href: "/admin/", label: "Tổng quan" },
  { href: "/admin/products/", label: "Sản phẩm" },
  { href: "/admin/orders/", label: "Đơn hàng" },
  { href: "/admin/tournaments/", label: "Giải đấu" },
  { href: "/admin/discount-codes/", label: "Mã giảm giá" },
  { href: "/admin/users/", label: "Khách hàng" },
  { href: "/admin/contacts/", label: "Liên hệ" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Quản trị" className="flex flex-col gap-1">
      {ADMIN_LINKS.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-card px-4 py-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:bg-surface-strong hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
