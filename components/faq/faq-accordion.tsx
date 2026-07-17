"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/types";
import { cn } from "@/lib/cn";

interface FaqAccordionProps {
  items: readonly FaqItem[];
  /** Ids expanded on first render (defaults to the first item). */
  defaultOpenIds?: readonly string[];
}

/**
 * Accessible disclosure accordion. Each row is a native `button` wired to its
 * panel via `aria-expanded`/`aria-controls`, and items toggle independently so
 * several answers can stay open at once.
 */
export function FaqAccordion({ items, defaultOpenIds }: FaqAccordionProps) {
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(
    () => new Set(defaultOpenIds ?? (items[0] ? [items[0].id] : [])),
  );

  function toggle(id: string) {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <ul className="border-y border-border">
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        const panelId = `faq-panel-${item.id}`;
        const buttonId = `faq-button-${item.id}`;
        return (
          <li key={item.id} className="border-b border-border last:border-b-0">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left hover:cursor-pointer"
              >
                <span className="font-display text-lg text-foreground sm:text-xl">
                  {item.question}
                </span>
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border border-border text-foreground transition-transform duration-300",
                    isOpen && "rotate-45 bg-accent text-accent-foreground",
                  )}
                  aria-hidden="true"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-6 pr-4 text-base leading-relaxed text-muted">
                  {item.answer}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
