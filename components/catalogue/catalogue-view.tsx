"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ColorFilter } from "@/components/product/color-filter";
import { Container } from "@/components/ui/container";
import { useCatalogueFilter } from "@/hooks/use-catalogue-filter";
import { SUPPORT_HOTLINE } from "@/lib/faqs";
import {
  CATALOGUE_COLLECTIONS,
  getCatalogueFilterColors,
} from "@/lib/catalogue";
import type { CatalogueItem } from "@/lib/types";
import { CatalogueLightbox } from "./catalogue-lightbox";
import { CollectionSection } from "./collection-section";

const FILTER_COLORS = getCatalogueFilterColors(CATALOGUE_COLLECTIONS);

export function CatalogueView() {
  const {
    activeColors,
    filteredCollections,
    toggleColor,
    clearFilters,
    isFiltering,
  } = useCatalogueFilter(CATALOGUE_COLLECTIONS);

  const [lightboxItemId, setLightboxItemId] = useState<string | null>(null);
  const visibleItems = useMemo(
    () => filteredCollections.flatMap((collection) => collection.items),
    [filteredCollections],
  );
  const lightboxIndex = lightboxItemId
    ? visibleItems.findIndex((entry) => entry.id === lightboxItemId)
    : -1;

  function handleImageOpen(item: CatalogueItem) {
    setLightboxItemId(item.id);
  }

  return (
    <div className="flex flex-col gap-16 pb-24">
      <Container className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {isFiltering
            ? `Đang hiển thị ${filteredCollections.length} bộ sưu tập phù hợp`
            : `${CATALOGUE_COLLECTIONS.length} bộ sưu tập thiết kế áo đấu`}
        </p>
        <ColorFilter
          colors={FILTER_COLORS}
          activeColors={activeColors}
          onToggle={toggleColor}
          onClear={clearFilters}
          isFiltering={isFiltering}
        />
      </Container>

      {filteredCollections.length > 0 ? (
        <Container className="flex flex-col gap-20">
          {filteredCollections.map((collection, index) => (
            <CollectionSection
              key={collection.id}
              collection={collection}
              priorityImages={index === 0}
              onImageOpen={handleImageOpen}
            />
          ))}
        </Container>
      ) : (
        <Container>
          <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border py-20 text-center">
            <p className="font-display text-2xl text-foreground">
              Không có thiết kế phù hợp
            </p>
            <p className="text-sm text-muted">
              Thử bỏ bớt bộ lọc màu để xem thêm bộ sưu tập.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-2 text-xs font-medium uppercase tracking-label text-foreground underline underline-offset-4"
            >
              Xoá bộ lọc
            </button>
          </div>
        </Container>
      )}

      <Container>
        <section
          aria-labelledby="catalogue-contact"
          className="rounded-card border border-border bg-surface px-6 py-10 text-center sm:px-10"
        >
          <h2
            id="catalogue-contact"
            className="font-display text-2xl uppercase tracking-[0.12em] text-foreground sm:text-3xl"
          >
            Liên hệ đặt hàng
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted">
            Yêu thích một thiết kế trong catalogue? Liên hệ Dreamkit để tuỳ biến
            theo bản sắc đội bóng của bạn.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <a
              href={`tel:${SUPPORT_HOTLINE}`}
              className="inline-flex h-11 items-center justify-center rounded-card bg-accent px-6 text-xs font-medium uppercase tracking-label text-accent-foreground transition-colors hover:bg-foreground/85"
            >
              Hotline {SUPPORT_HOTLINE}
            </a>
            <Link
              href="/#custom"
              className="inline-flex h-11 items-center justify-center rounded-card border border-foreground px-6 text-xs font-medium uppercase tracking-label text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Liên hệ thiết kế
            </Link>
          </div>
        </section>
      </Container>

      {lightboxIndex >= 0 ? (
        <CatalogueLightbox
          items={visibleItems}
          index={lightboxIndex}
          onClose={() => setLightboxItemId(null)}
          onNavigate={(nextIndex) => setLightboxItemId(visibleItems[nextIndex].id)}
        />
      ) : null}
    </div>
  );
}
