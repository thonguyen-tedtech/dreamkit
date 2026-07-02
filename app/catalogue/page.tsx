import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/ui/container";
import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const metadata: Metadata = {
  title: "Catalogue — Dreamkit",
  description:
    "Khám phá catalogue sản phẩm áo đấu Dreamkit — các bộ sưu tập thiết kế concept theo chủ đề.",
};

export default function CataloguePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-label text-muted">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Trang chủ
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-foreground">Catalogue</li>
            </ol>
          </nav>

          <h1 className="mt-6 text-center font-display text-4xl uppercase tracking-[0.08em] text-foreground sm:text-5xl">
            Catalogue sản phẩm
          </h1>
        </Container>

        <CatalogueView />
      </main>
      <SiteFooter />
    </>
  );
}
