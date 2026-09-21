"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/container";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { useCart } from "@/components/cart/cart-context";
import { cn } from "@/lib/cn";

interface NavLink {
  readonly label: string;
  readonly href: string;
}

const NAV_LINKS: readonly NavLink[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Cửa hàng", href: "/shop" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Tra cứu đơn hàng", href: "/track-order" },
];

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { open: openAuth, isAuthenticated, isAdmin } = useAuthModal();
  const { count } = useCart();
  const pathname = usePathname();

  return (
    <header
      id="home"
      className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur"
    >
      <p className="bg-accent py-2 text-center text-[0.7rem] font-medium uppercase tracking-label text-accent-foreground">
        Thiết kế &amp; sản xuất tại Việt Nam · Ưu đãi cho đội từ 5 bộ
      </p>

      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="Dreamkit">
          <Image
            src="/images/logo.png"
            alt="Dreamkit"
            width={140}
            height={84}
            priority
            className="h-8 w-auto sm:h-15"
          />
        </Link>

        <nav aria-label="Điều hướng chính" className="hidden md:block">
          <ul className="flex items-center gap-9">
            {NAV_LINKS.map((link) => {
              const isActive = isActiveLink(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative pb-1 text-xs font-medium uppercase tracking-label transition-colors hover:text-foreground",
                      isActive ? "text-foreground" : "text-foreground/80",
                    )}
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out",
                        isActive && "scale-x-100",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            aria-label={count > 0 ? `Giỏ hàng, ${count} sản phẩm` : "Giỏ hàng"}
            className="relative text-foreground/80 transition-colors hover:text-foreground"
          >
            <CartIcon />
            {count > 0 ? (
              <span className="absolute -right-2 -top-2 flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-semibold leading-4 text-accent-foreground">
                {count}
              </span>
            ) : null}
          </Link>
          {isAuthenticated ? (
            <Link
              href="/account"
              aria-label="Tài khoản"
              className="text-foreground/80 transition-colors hover:text-foreground"
            >
              <UserIcon />
            </Link>
          ) : null}
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="hidden rounded-card border border-foreground px-4 py-2 text-xs font-medium uppercase tracking-label text-foreground transition-colors hover:cursor-pointer hover:bg-foreground hover:text-background md:inline-flex"
            >
              Đăng nhập
            </button>
          ) : null}
          <button
            type="button"
            aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="text-foreground hover:cursor-pointer md:hidden"
          >
            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </Container>

      <nav
        id="mobile-nav"
        aria-label="Điều hướng di động"
        className={cn(
          "overflow-hidden border-t border-border md:hidden",
          isMenuOpen ? "max-h-96" : "max-h-0",
          "transition-[max-height] duration-300 ease-out",
        )}
      >
        <ul className="flex flex-col gap-1 px-6 py-3">
          {NAV_LINKS.map((link) => {
            const isActive = isActiveLink(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "-ml-3 block border-l-2 border-transparent py-2 pl-3 text-sm font-medium uppercase tracking-label hover:text-foreground",
                    isActive ? "border-accent text-foreground" : "text-foreground/80",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          {!isAuthenticated ? (
            <li>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  openAuth("login");
                }}
                className="block w-full py-2 text-left text-sm font-medium uppercase tracking-label text-foreground/80 hover:cursor-pointer hover:text-foreground"
              >
                Đăng nhập / Đăng ký
              </button>
            </li>
          ) : (
            <>
              <li>
                <Link
                  href="/account"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 text-sm font-medium uppercase tracking-label text-foreground/80 hover:text-foreground"
                >
                  Tài khoản
                </Link>
              </li>
              {isAdmin ? (
                <li>
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-sm font-medium uppercase tracking-label text-foreground/80 hover:text-foreground"
                  >
                    Quản trị
                  </Link>
                </li>
              ) : null}
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 19a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 7h12l-1 12H7L6 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 7a3 3 0 0 1 6 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
