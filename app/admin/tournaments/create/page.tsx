import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { CreateTournamentForm } from "@/components/tournaments/create-tournament-form";

export const metadata: Metadata = {
  title: "Tạo giải đấu — Admin Dreamkit",
};

export default function AdminCreateTournamentPage() {
  return (
    <AdminShell>
      <div className="flex flex-col gap-8 sm:max-w-2xl">
        <div>
          <h1 className="font-display text-3xl text-foreground">Tạo giải đấu mới</h1>
          <p className="mt-2 text-sm text-muted">
            Sau khi tạo, bạn có thể thêm vòng đấu, đội bóng và lịch thi đấu.
          </p>
        </div>
        <div className="rounded-card border border-border bg-surface p-6">
          <CreateTournamentForm />
        </div>
      </div>
    </AdminShell>
  );
}
