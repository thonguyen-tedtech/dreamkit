import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/ui/container";
import { TournamentDetail } from "@/components/tournaments/tournament-detail";

export const metadata: Metadata = {
  title: "Chi tiết giải đấu — Dreamkit",
};

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
              <li>
                <Link href="/tournaments" className="hover:text-foreground">
                  Giải đấu
                </Link>
              </li>
            </ol>
          </nav>
        </Container>

        <Container className="pb-24">
          <TournamentDetail tournamentId={id} canManage={false} />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
