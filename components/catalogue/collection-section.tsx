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
    <section aria-labelledby={`collection-${collection.id}`} className="flex flex-col gap-8">
      <h2
        id={`collection-${collection.id}`}
        className="text-center font-display text-xl uppercase tracking-[0.12em] text-foreground sm:text-2xl"
      >
        {collection.title}
      </h2>

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
