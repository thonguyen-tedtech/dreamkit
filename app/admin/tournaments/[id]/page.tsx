import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { TournamentDetail } from "@/components/tournaments/tournament-detail";

export const metadata: Metadata = {
  title: "Quản lý giải đấu — Admin Dreamkit",
};

export default async function AdminTournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AdminShell>
      <TournamentDetail tournamentId={id} canManage />
    </AdminShell>
  );
}
