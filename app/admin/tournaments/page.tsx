import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { TournamentList } from "@/components/tournaments/tournament-list";

export const metadata: Metadata = {
  title: "Giải đấu — Admin Dreamkit",
};

export default function AdminTournamentsPage() {
  return (
    <AdminShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-display text-3xl text-foreground">Giải đấu</h1>
          <p className="mt-2 text-sm text-muted">
            Tạo và quản lý các giải đấu bóng đá của Dreamkit.
          </p>
        </div>
        <TournamentList variant="admin" />
      </div>
    </AdminShell>
  );
}
