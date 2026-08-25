"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { deleteGroupApi, deleteStageApi, listGroupsApi } from "@/lib/tournament-stages-api";
import { generateMatchesApi, generateNextRoundApi, listMatchesApi } from "@/lib/tournament-matches-api";
import { getStageStandingsApi, type StandingsTable as StandingsTableData } from "@/lib/tournament-stats-api";
import { KNOCKOUT_ROUND_LABEL, STAGE_TYPE_LABEL } from "@/lib/tournament-format";
import type { Group, Stage } from "@/lib/tournament-types";
import { Badge } from "./badge";
import { StageFormModal } from "./stage-form-modal";
import { GroupFormModal } from "./group-form-modal";
import { StandingsTable } from "./standings-table";
import { useTournamentData } from "./tournament-data-context";

interface StageCardProps {
  readonly tournamentId: string;
  readonly stage: Stage;
  readonly canManage: boolean;
  readonly onUpdated: (stage: Stage) => void;
  readonly onDeleted: (stageId: string) => void;
}

/** One stage's card: identity, organizer actions, its groups and current standings. */
export function StageCard({ tournamentId, stage, canManage, onUpdated, onDeleted }: StageCardProps) {
  const { accessToken } = useAdminAuth();
  const { showToast } = useToast();
  const { teamsById } = useTournamentData();
  const [isExpanded, setIsExpanded] = useState(false);
  const [groups, setGroups] = useState<readonly Group[]>([]);
  const [standings, setStandings] = useState<readonly StandingsTableData[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [groupModal, setGroupModal] = useState<"create" | Group | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [hasMatches, setHasMatches] = useState(false);

  useEffect(() => {
    listMatchesApi(tournamentId, { stageId: stage.id, limit: 1 }).then((result) => {
      if (result.ok) setHasMatches(result.meta.total > 0);
    });
  }, [tournamentId, stage.id]);

  useEffect(() => {
    if (!isExpanded) return;
    let cancelled = false;
    setIsLoadingDetail(true);

    async function loadDetail() {
      const [groupsResult, standingsResult] = await Promise.all([
        stage.type === "GROUP" ? listGroupsApi(tournamentId, stage.id) : Promise.resolve(null),
        getStageStandingsApi(tournamentId, stage.id, teamsById),
      ]);
      if (cancelled) return;
      setIsLoadingDetail(false);
      if (groupsResult?.ok) setGroups(groupsResult.groups);
      if (standingsResult.ok) setStandings(standingsResult.tables);
    }

    void loadDetail();
    return () => {
      cancelled = true;
    };
  }, [isExpanded, tournamentId, stage.id, stage.type, teamsById]);

  async function handleDeleteStage() {
    if (!accessToken || !window.confirm(`Xóa vòng đấu "${stage.name}"?`)) return;
    setIsBusy(true);
    const result = await deleteStageApi(accessToken, tournamentId, stage.id);
    setIsBusy(false);
    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }
    showToast("Đã xóa vòng đấu.", "success");
    onDeleted(stage.id);
  }

  async function handleDeleteGroup(group: Group) {
    if (!accessToken || !window.confirm(`Xóa bảng "${group.name}"?`)) return;
    const result = await deleteGroupApi(accessToken, tournamentId, stage.id, group.id);
    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }
    setGroups((current) => current.filter((entry) => entry.id !== group.id));
  }

  async function handleGenerateMatches() {
    if (!accessToken) return;
    setIsBusy(true);
    const result = await generateMatchesApi(accessToken, tournamentId, stage.id);
    setIsBusy(false);
    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }
    showToast(`Đã tạo ${result.matches.length} trận đấu.`, "success");
    setHasMatches(true);
  }

  async function handleGenerateNextRound() {
    if (!accessToken) return;
    setIsBusy(true);
    const result = await generateNextRoundApi(accessToken, tournamentId, stage.id);
    setIsBusy(false);
    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }
    showToast(`Đã tạo vòng tiếp theo (${result.matches.length} trận).`, "success");
  }

  return (
    <div className="rounded-card border border-border">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-strong text-xs font-semibold text-foreground">
          {stage.order}
        </span>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <h3 className="font-display text-lg text-foreground">{stage.name}</h3>
          <Badge label={STAGE_TYPE_LABEL[stage.type]} />
          {stage.knockoutRound ? <Badge label={KNOCKOUT_ROUND_LABEL[stage.knockoutRound]} /> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="text-xs font-medium uppercase tracking-label text-foreground underline-offset-4 hover:cursor-pointer hover:underline"
          >
            {isExpanded ? "Thu gọn" : "Xem chi tiết"}
          </button>

          {canManage ? (
            <>
              {!hasMatches ? (
                <Button type="button" variant="ghost" size="md" disabled={isBusy} onClick={() => void handleGenerateMatches()}>
                  Tạo lịch thi đấu
                </Button>
              ) : null}
              {stage.type === "KNOCKOUT" ? (
                <Button type="button" variant="ghost" size="md" disabled={isBusy} onClick={() => void handleGenerateNextRound()}>
                  Vòng tiếp theo
                </Button>
              ) : null}
              <Button type="button" variant="outline" size="md" onClick={() => setIsEditOpen(true)}>
                Sửa
              </Button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void handleDeleteStage()}
                className="text-xs font-medium uppercase tracking-label text-muted underline-offset-4 hover:cursor-pointer hover:text-foreground hover:underline disabled:opacity-50"
              >
                Xóa
              </button>
            </>
          ) : null}
        </div>
      </div>

      {isExpanded ? (
        <div className="flex flex-col gap-6 border-t border-border p-4">
          {isLoadingDetail ? (
            <div className="flex justify-center py-6">
              <Spinner className="size-6" />
            </div>
          ) : (
            <>
              {stage.type === "GROUP" ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-medium uppercase tracking-label text-muted">
                      Các bảng đấu
                    </h4>
                    {canManage ? (
                      <button
                        type="button"
                        onClick={() => setGroupModal("create")}
                        className="text-xs font-medium uppercase tracking-label text-foreground underline-offset-4 hover:cursor-pointer hover:underline"
                      >
                        + Thêm bảng
                      </button>
                    ) : null}
                  </div>
                  {groups.length === 0 ? (
                    <p className="text-sm text-muted">Chưa có bảng đấu nào.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {groups.map((group) => (
                        <div
                          key={group.id}
                          className="flex items-center gap-2 rounded-card border border-border px-3 py-1.5 text-sm"
                        >
                          <span className="font-medium text-foreground">
                            {group.code} — {group.name}
                          </span>
                          {canManage ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setGroupModal(group)}
                                className="text-xs text-muted hover:cursor-pointer hover:text-foreground"
                              >
                                Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDeleteGroup(group)}
                                className="text-xs text-muted hover:cursor-pointer hover:text-foreground"
                              >
                                Xóa
                              </button>
                            </>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-medium uppercase tracking-label text-muted">
                  Bảng xếp hạng
                </h4>
                <StandingsTable tables={standings} />
              </div>
            </>
          )}
        </div>
      ) : null}

      <StageFormModal
        tournamentId={tournamentId}
        stage={stage}
        nextOrder={stage.order}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSaved={onUpdated}
      />

      <GroupFormModal
        tournamentId={tournamentId}
        stageId={stage.id}
        group={groupModal !== "create" ? (groupModal ?? undefined) : undefined}
        nextOrder={groups.length + 1}
        isOpen={groupModal !== null}
        onClose={() => setGroupModal(null)}
        onSaved={(group) =>
          setGroups((current) => {
            const exists = current.some((entry) => entry.id === group.id);
            return exists
              ? current.map((entry) => (entry.id === group.id ? group : entry))
              : [...current, group];
          })
        }
      />
    </div>
  );
}
