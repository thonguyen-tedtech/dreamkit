"use client";

import { useState } from "react";
import { LoadingOverlay } from "@/components/ui/spinner";
import { StageCard } from "./stage-card";
import { StageFormModal } from "./stage-form-modal";
import { useTournamentData } from "./tournament-data-context";
import { EmptyState, ErrorState } from "./state-views";

interface StagesTabProps {
  readonly tournamentId: string;
  readonly canManage: boolean;
}

/** Lists a tournament's stages (with their groups and standings) and lets the organizer manage them. */
export function StagesTab({ tournamentId, canManage }: StagesTabProps) {
  const { stages, isLoadingStages, stagesError, refreshStages } = useTournamentData();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (isLoadingStages) return <LoadingOverlay label="Đang tải vòng đấu…" />;
  if (stagesError) return <ErrorState message={stagesError} />;

  return (
    <div className="flex flex-col gap-4">
      {canManage ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="text-xs font-medium uppercase tracking-label text-foreground underline-offset-4 hover:cursor-pointer hover:underline"
          >
            + Thêm vòng đấu
          </button>
        </div>
      ) : null}

      {stages.length === 0 ? (
        <EmptyState
          title="Chưa có vòng đấu nào"
          description={canManage ? "Thêm vòng đấu đầu tiên để bắt đầu lên lịch thi đấu." : undefined}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {stages.map((stage) => (
            <StageCard
              key={stage.id}
              tournamentId={tournamentId}
              stage={stage}
              canManage={canManage}
              onUpdated={() => void refreshStages()}
              onDeleted={() => void refreshStages()}
            />
          ))}
        </div>
      )}

      <StageFormModal
        tournamentId={tournamentId}
        nextOrder={stages.length + 1}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSaved={() => void refreshStages()}
      />
    </div>
  );
}
