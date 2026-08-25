"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/container";
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
  { label: "Portfolio", href: "/portfolio" },
  { label: "Giải đấu", href: "/tournaments" },
];

/** Drops a trailing slash (this site's `trailingSlash: true` build adds one) so pathnames compare cleanly against `NAV_LINKS`. */
function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { count } = useCart();
  const pathname = normalizePath(usePathname());
  const activeIndex = NAV_LINKS.findIndex((link) => link.href === pathname);
  const navListRef = useRef<HTMLUListElement>(null);
  const [highlight, setHighlight] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const container = navListRef.current;
    const activeItem = activeIndex >= 0 ? container?.children[activeIndex] : undefined;
    if (!(activeItem instanceof HTMLElement)) {
      setHighlight(null);
      return;
    }
    setHighlight({ left: activeItem.offsetLeft, width: activeItem.offsetWidth });
  }, [activeIndex]);

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
          <ul ref={navListRef} className="relative flex items-center gap-9">
            {highlight ? (
              <span
                aria-hidden="true"
                className="absolute -inset-y-2 rounded-card bg-surface-strong transition-[left,width] duration-300 ease-out"
                style={{ left: highlight.left - 12, width: highlight.width + 24 }}
              />
            ) : null}
            {NAV_LINKS.map((link, index) => (
              <li key={link.href} className="relative">
                <Link
                  href={link.href}
                  aria-current={index === activeIndex ? "page" : undefined}
                  className={cn(
                    "text-xs font-medium uppercase tracking-label transition-colors",
                    index === activeIndex
                      ? "text-foreground"
                      : "text-foreground/80 hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Tìm kiếm"
            className="text-foreground/80 transition-colors hover:cursor-pointer hover:text-foreground"
          >
            <SearchIcon />
          </button>
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
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-sm font-medium uppercase tracking-label text-foreground/80 hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
