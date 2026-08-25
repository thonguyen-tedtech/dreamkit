"use client";

import { useState } from "react";
import Image from "next/image";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { useToast } from "@/components/ui/toast-context";
import { deleteTeamApi } from "@/lib/tournament-teams-api";
import type { GroupOption } from "./team-form-modal";
import type { Team } from "@/lib/tournament-types";
import { TeamFormModal } from "./team-form-modal";
import { TeamRosterPanel } from "./team-roster-panel";

interface TeamRowProps {
  readonly tournamentId: string;
  readonly team: Team;
  readonly groupOptions: readonly GroupOption[];
  readonly canManage: boolean;
  readonly onUpdated: (team: Team) => void;
  readonly onDeleted: (teamId: string) => void;
}

/** One registered team: identity, organizer actions, and its expandable roster. */
export function TeamRow({ tournamentId, team, groupOptions, canManage, onUpdated, onDeleted }: TeamRowProps) {
  const { accessToken } = useAdminAuth();
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const groupLabel = groupOptions.find((option) => option.id === team.groupId)?.label;

  async function handleDelete() {
    if (!accessToken || !window.confirm(`Xóa đội "${team.name}" khỏi giải đấu?`)) return;
    setIsDeleting(true);
    const result = await deleteTeamApi(accessToken, tournamentId, team.id);
    setIsDeleting(false);
    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }
    showToast("Đã xóa đội bóng.", "success");
    onDeleted(team.id);
  }

  return (
    <div className="rounded-card border border-border">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-card border border-border bg-background">
          {team.logo ? (
            <Image src={team.logo} alt={team.name} fill sizes="40px" className="object-contain p-1" />
          ) : (
            <span className="text-xs font-semibold text-muted">{team.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>

        <div className="flex-1">
          <p className="font-medium text-foreground">{team.name}</p>
          <p className="text-xs text-muted">
            {team.shortName ? `${team.shortName} · ` : ""}
            {groupLabel ?? "Chưa xếp bảng"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="text-xs font-medium uppercase tracking-label text-foreground underline-offset-4 hover:cursor-pointer hover:underline"
        >
          {isExpanded ? "Thu gọn" : "Xem đội hình"}
        </button>

        {canManage ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="text-xs font-medium uppercase tracking-label text-muted hover:cursor-pointer hover:text-foreground"
            >
              Sửa
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => void handleDelete()}
              className="text-xs font-medium uppercase tracking-label text-muted hover:cursor-pointer hover:text-foreground disabled:opacity-50"
            >
              Xóa
            </button>
          </div>
        ) : null}
      </div>

      {isExpanded ? (
        <div className="border-t border-border p-4">
          <TeamRosterPanel teamId={team.id} canManage={canManage} />
        </div>
      ) : null}

      <TeamFormModal
        tournamentId={tournamentId}
        team={team}
        groupOptions={groupOptions}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSaved={onUpdated}
      />
    </div>
  );
}
