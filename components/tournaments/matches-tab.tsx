"use client";

import { useEffect, useMemo, useState } from "react";
import { LoadingOverlay } from "@/components/ui/spinner";
import { Pagination } from "@/components/shop/pagination";
import { listMatchesApi } from "@/lib/tournament-matches-api";
import { MATCH_STATUS_LABEL } from "@/lib/tournament-format";
import type { Match, MatchStatus, Team, TeamRef } from "@/lib/tournament-types";
import { FILTER_SELECT_CLASS } from "./field";
import { MatchRow } from "./match-row";
import { EmptyState, ErrorState } from "./state-views";
import { useTournamentData } from "./tournament-data-context";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = Object.keys(MATCH_STATUS_LABEL) as MatchStatus[];

function toTeamRef(team: Team | undefined, fallbackId: string): TeamRef {
  return team
    ? { id: team.id, name: team.name, shortName: team.shortName, logo: team.logo }
    : { id: fallbackId, name: "—" };
}

interface MatchesTabProps {
  readonly tournamentId: string;
  readonly canManage: boolean;
}

/** Paginated, filterable match schedule; expand a row to manage its result, events and stats. */
export function MatchesTab({ tournamentId, canManage }: MatchesTabProps) {
  const { stages, teamsById } = useTournamentData();
  const [stageId, setStageId] = useState("");
  const [status, setStatus] = useState<MatchStatus | "">("");
  const [matches, setMatches] = useState<readonly Match[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [stageId, status]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    listMatchesApi(tournamentId, {
      page,
      limit: PAGE_SIZE,
      stageId: stageId || undefined,
      status: status || undefined,
    }).then((result) => {
      if (cancelled) return;
      setIsLoading(false);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setError(null);
      setMatches(result.matches);
      setTotalPages(result.meta.totalPages);
    });

    return () => {
      cancelled = true;
    };
  }, [tournamentId, page, stageId, status]);

  // Resolved separately from the fetch so team names fill in as soon as the
  // (independently-loading) teams list arrives, without re-fetching matches.
  const matchesWithTeams = useMemo(
    () =>
      matches.map((match) => ({
        ...match,
        homeTeam: toTeamRef(teamsById.get(match.homeTeamId), match.homeTeamId),
        awayTeam: toTeamRef(teamsById.get(match.awayTeamId), match.awayTeamId),
      })),
    [matches, teamsById],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3 rounded-card border border-highlight/40 bg-surface-strong p-3 sm:flex-nowrap">
        <select
          aria-label="Lọc theo vòng đấu"
          value={stageId}
          onChange={(event) => setStageId(event.target.value)}
          className={`${FILTER_SELECT_CLASS} w-full sm:w-auto sm:min-w-[180px] sm:shrink-0`}
        >
          <option value="">Mọi vòng đấu</option>
          {stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Lọc theo trạng thái"
          value={status}
          onChange={(event) => setStatus(event.target.value as MatchStatus | "")}
          className={`${FILTER_SELECT_CLASS} w-full sm:w-auto sm:min-w-[180px] sm:shrink-0`}
        >
          <option value="">Mọi trạng thái</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {MATCH_STATUS_LABEL[option]}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingOverlay label="Đang tải lịch thi đấu…" />
      ) : error ? (
        <ErrorState message={error} />
      ) : matchesWithTeams.length === 0 ? (
        <EmptyState
          title="Chưa có trận đấu nào"
          description="Vào tab Vòng đấu để tạo lịch thi đấu cho một vòng."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {matchesWithTeams.map((match) => (
              <MatchRow
                key={match.id}
                tournamentId={tournamentId}
                match={match}
                canManage={canManage}
                onUpdated={(updated) =>
                  setMatches((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)))
                }
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
