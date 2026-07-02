import Image from "next/image";
import type { CatalogueItem } from "@/lib/types";

interface CatalogueImageProps {
  readonly item: CatalogueItem;
  readonly priority?: boolean;
}

export function CatalogueImage({ item, priority = false }: CatalogueImageProps) {
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
    </figure>
  );
}
