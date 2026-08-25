"use client";

import { useEffect, useMemo, useState } from "react";
import { LoadingOverlay } from "@/components/ui/spinner";
import { Pagination } from "@/components/shop/pagination";
import { listGroupsApi } from "@/lib/tournament-stages-api";
import type { Tournament } from "@/lib/tournament-types";
import { TeamRow } from "./team-row";
import { TeamFormModal, type GroupOption } from "./team-form-modal";
import { useTournamentData } from "./tournament-data-context";
import { EmptyState, ErrorState } from "./state-views";

const PAGE_SIZE = 10;

interface TeamsTabProps {
  readonly tournament: Tournament;
  readonly canManage: boolean;
}

/** Loads every GROUP-type stage's groups, for the team form's "assign to group" picker. */
async function loadGroupOptions(
  tournamentId: string,
  stages: readonly { readonly id: string; readonly name: string; readonly type: string }[],
): Promise<readonly GroupOption[]> {
  const groupStages = stages.filter((stage) => stage.type === "GROUP");
  const groupLists = await Promise.all(
    groupStages.map((stage) => listGroupsApi(tournamentId, stage.id)),
  );

  return groupStages.flatMap((stage, index) => {
    const result = groupLists[index];
    if (!result.ok) return [];
    return result.groups.map((group) => ({
      id: group.id,
      label: `${stage.name} — ${group.code} (${group.name})`,
    }));
  });
}

/** Lists a tournament's registered teams and their rosters; organizer can register/edit/remove teams. */
export function TeamsTab({ tournament, canManage }: TeamsTabProps) {
  const { stages, teams, isLoadingTeams, teamsError, refreshTeams } = useTournamentData();
  const [groupOptions, setGroupOptions] = useState<readonly GroupOption[]>([]);
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    void loadGroupOptions(tournament.id, stages).then(setGroupOptions);
  }, [tournament.id, stages]);

  const totalPages = Math.max(1, Math.ceil(teams.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageTeams = useMemo(
    () => teams.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [teams, safePage],
  );

  if (isLoadingTeams) return <LoadingOverlay label="Đang tải đội bóng…" />;
  if (teamsError) return <ErrorState message={teamsError} />;

  return (
    <div className="flex flex-col gap-4">
      {canManage ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="text-xs font-medium uppercase tracking-label text-foreground underline-offset-4 hover:cursor-pointer hover:underline"
          >
            + Đăng ký đội bóng
          </button>
        </div>
      ) : null}

      {teams.length === 0 ? (
        <EmptyState
          title="Chưa có đội bóng nào"
          description={canManage ? "Đăng ký đội bóng đầu tiên tham dự giải đấu." : undefined}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {pageTeams.map((team) => (
              <TeamRow
                key={team.id}
                tournamentId={tournament.id}
                team={team}
                groupOptions={groupOptions}
                canManage={canManage}
                onUpdated={() => void refreshTeams()}
                onDeleted={() => void refreshTeams()}
              />
            ))}
          </div>
          <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <TeamFormModal
        tournamentId={tournament.id}
        groupOptions={groupOptions}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSaved={() => void refreshTeams()}
      />
    </div>
  );
}
