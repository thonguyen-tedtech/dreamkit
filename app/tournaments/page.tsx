import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/ui/container";
import { TournamentList } from "@/components/tournaments/tournament-list";

export const metadata: Metadata = {
  title: "Giải đấu — Dreamkit",
  description: "Khám phá các giải đấu bóng đá đang diễn ra và sắp tới trên Dreamkit.",
};

export default function TournamentsPage() {
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
              <li className="text-foreground">Giải đấu</li>
            </ol>
          </nav>
        </Container>

        <Container className="flex flex-col gap-10 pb-24">
          <header className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-label text-highlight">
              Cộng đồng Dreamkit
            </span>
            <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
              Giải đấu bóng đá
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted">
              Theo dõi lịch thi đấu, bảng xếp hạng và thành tích cầu thủ của các giải đấu do
              Dreamkit tổ chức.
            </p>
          </header>

          <TournamentList variant="public" />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
