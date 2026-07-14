"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { CatalogueItem } from "@/lib/types";

interface CatalogueLightboxProps {
  readonly items: readonly CatalogueItem[];
  readonly index: number;
  readonly onClose: () => void;
  readonly onNavigate: (index: number) => void;
}

/**
 * Full-screen image viewer rendered in a portal, with keyboard/backdrop
 * dismissal and prev/next navigation across the currently visible items.
 */
export function CatalogueLightbox({
  items,
  index,
  onClose,
  onNavigate,
}: CatalogueLightboxProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const item = items[index];

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowRight") {
        onNavigate((index + 1) % items.length);
      } else if (event.key === "ArrowLeft") {
        onNavigate((index - 1 + items.length) % items.length);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [index, items.length, onClose, onNavigate]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!item || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      tabIndex={-1}
      className="fixed inset-0 z-100 flex items-center justify-center outline-none"
    >
      <div
        className="absolute inset-0 animate-fade-in bg-background/95 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className="absolute right-5 top-5 z-10 text-foreground/70 transition-colors hover:text-foreground"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m6 6 12 12M18 6 6 18"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {items.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => onNavigate((index - 1 + items.length) % items.length)}
            aria-label="Ảnh trước"
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-foreground/70 transition-colors hover:text-foreground sm:left-6"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m15 6-6 6 6 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onNavigate((index + 1) % items.length)}
            aria-label="Ảnh tiếp theo"
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-foreground/70 transition-colors hover:text-foreground sm:right-6"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m9 6 6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      ) : null}

      <figure className="relative z-0 flex h-full w-full max-w-5xl flex-col items-center justify-center gap-4 p-6 sm:p-10">
        <div className="relative aspect-square max-h-[75vh] w-full max-w-[90vw]">
          <Image
            key={item.id}
            src={item.fullImage}
            alt={item.alt}
            fill
            sizes="90vw"
            className="animate-pop-in object-contain"
            priority
          />
        </div>
        <figcaption className="text-center text-xs uppercase tracking-label text-muted">
          {item.alt} · {index + 1}/{items.length}
        </figcaption>
      </figure>
    </div>,
    document.body,
  );
}
