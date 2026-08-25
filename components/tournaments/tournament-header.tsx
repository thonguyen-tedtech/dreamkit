"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-context";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { cancelTournamentApi } from "@/lib/tournaments-api";
import {
  TOURNAMENT_FORMAT_LABEL,
  TOURNAMENT_STATUS_LABEL,
  TOURNAMENT_STATUS_TONE,
  formatTournamentDate,
} from "@/lib/tournament-format";
import type { Tournament } from "@/lib/tournament-types";
import { Badge } from "./badge";
import { EditTournamentModal } from "./edit-tournament-modal";

interface TournamentHeaderProps {
  readonly tournament: Tournament;
  readonly canManage: boolean;
  readonly onUpdated: (tournament: Tournament) => void;
}

/** Hero header for a tournament's detail page: identity, status and organizer actions. */
export function TournamentHeader({ tournament, canManage, onUpdated }: TournamentHeaderProps) {
  const { accessToken } = useAdminAuth();
  const { showToast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const canCancel = canManage && tournament.status !== "CANCELLED" && tournament.status !== "COMPLETED";

  async function handleCancel() {
    if (!accessToken) return;
    if (!window.confirm("Hủy giải đấu này? Hành động này không thể hoàn tác.")) return;

    setIsCancelling(true);
    const result = await cancelTournamentApi(accessToken, tournament.id);
    setIsCancelling(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }
    showToast("Đã hủy giải đấu.", "success");
    onUpdated(result.tournament);
  }

  return (
    <header className="flex flex-col gap-6 rounded-card border border-border bg-surface p-6 sm:flex-row sm:items-center">
      <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-card border border-border bg-background">
        {tournament.logo ? (
          <Image src={tournament.logo} alt={tournament.name} fill sizes="80px" className="object-contain p-2" />
        ) : (
          <span className="font-display text-2xl text-muted">
            {tournament.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            label={TOURNAMENT_STATUS_LABEL[tournament.status]}
            tone={TOURNAMENT_STATUS_TONE[tournament.status]}
          />
          <Badge label={TOURNAMENT_FORMAT_LABEL[tournament.format]} />
          {tournament.isPublic ? null : <Badge label="Riêng tư" />}
        </div>
        <h1 className="font-display text-3xl text-foreground">{tournament.name}</h1>
        <p className="text-sm text-muted">
          {formatTournamentDate(tournament.startDate)}
          {tournament.endDate ? ` — ${formatTournamentDate(tournament.endDate)}` : ""}
          {tournament.location ? ` · ${tournament.location}` : ""}
          {tournament.venue ? ` · ${tournament.venue}` : ""}
        </p>
        {tournament.description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-foreground/80">
            {tournament.description}
          </p>
        ) : null}
      </div>

      {canManage ? (
        <div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setIsEditOpen(true)}>
            Chỉnh sửa
          </Button>
          {canCancel ? (
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              disabled={isCancelling}
              onClick={() => void handleCancel()}
            >
              Hủy giải đấu
            </Button>
          ) : null}
        </div>
      ) : null}

      <EditTournamentModal
        tournament={tournament}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdated={onUpdated}
      />
    </header>
  );
}
