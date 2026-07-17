import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Portfolio — Dreamkit",
  description: "Các dự án áo đấu tiêu biểu Dreamkit đã thiết kế và sản xuất.",
};

export default function PortfolioPage() {
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
              <li className="text-foreground">Portfolio</li>
            </ol>
          </nav>
        </Container>

        <Container className="flex flex-col gap-4 pb-24">
          <span className="text-xs font-medium uppercase tracking-label text-highlight">
            Dự án
          </span>
          <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
            Portfolio
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted">
            Đang cập nhật các dự án tiêu biểu. Quay lại sau nhé.
          </p>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
