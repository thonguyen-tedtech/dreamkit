"use client";

import { useEffect, useState } from "react";
import { LoadingOverlay } from "@/components/ui/spinner";
import { getPlayerLeaderboardApi, getStageStandingsApi, type StandingsTable } from "@/lib/tournament-stats-api";
import type { LeaderboardEntry, Stage, Team } from "@/lib/tournament-types";
import { useTournamentData } from "./tournament-data-context";

/** Enough rows to make the tournament-wide card totals accurate for realistically-sized rosters. */
const LEADERBOARD_SAMPLE_SIZE = 100;

interface Highlights {
  readonly leadingTeams: readonly { readonly groupName?: string; readonly teamName: string; readonly points: number }[];
  readonly standoutPlayer: LeaderboardEntry | null;
  readonly totalYellowCards: number;
  readonly totalRedCards: number;
}

async function loadHighlights(
  tournamentId: string,
  stages: readonly Stage[],
  teamsById: ReadonlyMap<string, Team>,
): Promise<Highlights> {
  const firstRankedStage = [...stages].filter((s) => s.type !== "KNOCKOUT").sort((a, b) => a.order - b.order)[0];

  const [standingsResult, leaderboardResult] = await Promise.all([
    firstRankedStage
      ? getStageStandingsApi(tournamentId, firstRankedStage.id, teamsById)
      : Promise.resolve({ ok: false as const, status: 0, message: "" }),
    getPlayerLeaderboardApi(tournamentId, { limit: LEADERBOARD_SAMPLE_SIZE, sortBy: "goals" }),
  ]);

  const leadingTeams: Highlights["leadingTeams"] = standingsResult.ok
    ? (standingsResult.tables as readonly StandingsTable[])
        .filter((table) => table.rows.length > 0)
        .map((table) => ({
          groupName: table.group?.name,
          teamName: table.rows[0].team.name,
          points: table.rows[0].points,
        }))
    : [];

  const entries = leaderboardResult.ok ? leaderboardResult.entries : [];
  const standoutPlayer = entries.length > 0 ? entries[0] : null;
  const totalYellowCards = entries.reduce((sum, entry) => sum + entry.yellowCards, 0);
  const totalRedCards = entries.reduce((sum, entry) => sum + entry.redCards, 0);

  return { leadingTeams, standoutPlayer, totalYellowCards, totalRedCards };
}

interface OverviewHighlightsProps {
  readonly tournamentId: string;
}

/** Tournament-wide highlights: standings leader(s), top scorer, and card totals — derived from standings/leaderboard, not a dedicated endpoint. */
export function OverviewHighlights({ tournamentId }: OverviewHighlightsProps) {
  const { stages, teamsById, isLoadingStages, isLoadingTeams } = useTournamentData();
  const [highlights, setHighlights] = useState<Highlights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoadingStages || isLoadingTeams) return;
    let cancelled = false;
    setIsLoading(true);
    loadHighlights(tournamentId, stages, teamsById).then((result) => {
      if (!cancelled) {
        setHighlights(result);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [tournamentId, stages, teamsById, isLoadingStages, isLoadingTeams]);

  if (isLoading) {
    return <LoadingOverlay label="Đang tải thống kê nổi bật…" />;
  }

  if (!highlights) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <HighlightCard title="Đội dẫn đầu">
        {highlights.leadingTeams.length === 0 ? (
          <p className="text-sm text-muted">Chưa có dữ liệu</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {highlights.leadingTeams.map((entry) => (
              <li key={`${entry.groupName ?? "overall"}-${entry.teamName}`} className="text-sm">
                <span className="font-display text-lg text-foreground">{entry.teamName}</span>
                {entry.groupName ? <span className="text-muted"> · {entry.groupName}</span> : null}
                <span className="text-muted"> · {entry.points} điểm</span>
              </li>
            ))}
          </ul>
        )}
      </HighlightCard>

      <HighlightCard title="Cầu thủ nổi bật">
        {highlights.standoutPlayer ? (
          <>
            <p className="font-display text-lg text-foreground">{highlights.standoutPlayer.player.name}</p>
            <p className="text-sm text-muted">
              {highlights.standoutPlayer.goals} bàn thắng · {highlights.standoutPlayer.assists} kiến tạo
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">Chưa có dữ liệu</p>
        )}
      </HighlightCard>

      <HighlightCard title="Tổng thẻ vàng">
        <p className="font-display text-3xl text-foreground">{highlights.totalYellowCards}</p>
      </HighlightCard>

      <HighlightCard title="Tổng thẻ đỏ">
        <p className="font-display text-3xl text-foreground">{highlights.totalRedCards}</p>
      </HighlightCard>
    </div>
  );
}

function HighlightCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <p className="text-xs uppercase tracking-label text-muted">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}
