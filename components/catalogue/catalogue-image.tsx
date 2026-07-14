import Image from "next/image";
import type { CatalogueItem } from "@/lib/types";

interface CatalogueImageProps {
  readonly item: CatalogueItem;
  readonly priority?: boolean;
  readonly onOpen?: (item: CatalogueItem) => void;
}

export function CatalogueImage({ item, priority = false, onOpen }: CatalogueImageProps) {
  return (
    <figure className="group relative aspect-square overflow-hidden rounded-card border border-border bg-surface">
      <Image
        src={item.image}
        alt={item.alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <button
        type="button"
        onClick={() => onOpen?.(item)}
        aria-label={`Xem toàn màn hình: ${item.alt}`}
        className="absolute inset-0 cursor-zoom-in"
      >
        <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 3H4v5M15 3h5v5M9 21H4v-5M15 21h5v-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </figure>
  );
}
