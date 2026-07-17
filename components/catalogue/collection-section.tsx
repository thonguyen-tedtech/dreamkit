import Link from "next/link";
import type { CatalogueCollection, CatalogueItem } from "@/lib/types";
import { CatalogueImage } from "./catalogue-image";

interface CollectionSectionProps {
  readonly collection: CatalogueCollection;
  readonly priorityImages?: boolean;
  readonly onImageOpen?: (item: CatalogueItem) => void;
}

export function CollectionSection({
  collection,
  priorityImages = false,
  onImageOpen,
}: CollectionSectionProps) {
  return (
    <section aria-labelledby={`collection-${collection.id}`} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4">
        <h2
          id={`collection-${collection.id}`}
          className="text-center font-display text-xl uppercase tracking-[0.12em] text-foreground sm:text-2xl"
        >
          {collection.title}
        </h2>

        {collection.videoUrl || collection.productId ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {collection.videoUrl ? (
              <a
                href={collection.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-card bg-accent px-4 text-[0.65rem] font-medium uppercase tracking-label text-accent-foreground transition-colors hover:cursor-pointer hover:bg-foreground/85"
              >
                <VideoIcon />
                Xem video
              </a>
            ) : null}
            {collection.productId ? (
              <Link
                href={`/shop/${collection.productId}`}
                className="inline-flex h-9 items-center gap-2 rounded-card border border-foreground px-4 text-[0.65rem] font-medium uppercase tracking-label text-foreground transition-colors hover:cursor-pointer hover:bg-foreground hover:text-background"
              >
                Xem chi tiết sản phẩm
                <ArrowIcon />
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
        {collection.items.map((item, index) => (
          <li key={item.id}>
            <CatalogueImage
              item={item}
              priority={priorityImages && index < 2}
              onOpen={onImageOpen}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function VideoIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
