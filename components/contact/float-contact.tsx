"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { CONTACT_FACEBOOK_URL, CONTACT_PHONE, CONTACT_ZALO_URL } from "@/lib/contact-info";
import { cn } from "@/lib/cn";

interface ContactItem {
  readonly label: string;
  readonly href: string;
  readonly icon: React.ReactNode;
}

export function FloatContact() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const items: ContactItem[] = [
    { label: "Facebook", href: CONTACT_FACEBOOK_URL, icon: <FacebookIcon /> },
    ...(CONTACT_PHONE
      ? [{ label: `Điện thoại ${CONTACT_PHONE}`, href: `tel:${CONTACT_PHONE}`, icon: <PhoneIcon /> }]
      : []),
    ...(CONTACT_ZALO_URL
      ? [{ label: "Zalo", href: CONTACT_ZALO_URL, icon: <ZaloIcon /> }]
      : []),
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <div
        className={cn(
          "flex flex-col items-end gap-3 transition-all duration-200 ease-out",
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
            aria-label={item.label}
            title={item.label}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg transition-colors hover:bg-surface"
          >
            {item.icon}
          </a>
        ))}
      </div>

      <button
        type="button"
        aria-label={isOpen ? "Đóng liên hệ nhanh" : "Mở liên hệ nhanh"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:cursor-pointer hover:scale-105"
      >
        {!isOpen ? (
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-accent opacity-75" />
        ) : null}
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.1-3.5A7.96 7.96 0 0 1 4 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
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

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 9h2.5V6h-2.5c-1.9 0-3.4 1.5-3.4 3.4V11H8.5v3H11v6h3v-6h2.4l.6-3H14V9.9c0-.5.4-.9.9-.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5L16 13l4 1.5v3a2 2 0 0 1-2 2C11.5 19.5 4.5 12.5 4.5 6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ZaloIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M7.5 9.5h4.5l-4.5 5h4.5M13.5 14.5v-5M13.5 9.5h2.7c.9 0 1.3 1.1.6 1.7l-2.9 2.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
