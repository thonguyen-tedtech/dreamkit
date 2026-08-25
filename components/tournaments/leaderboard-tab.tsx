"use client";

import { useEffect, useState } from "react";
import { LoadingOverlay } from "@/components/ui/spinner";
import { Pagination } from "@/components/shop/pagination";
import { getPlayerLeaderboardApi, type LeaderboardSortKey } from "@/lib/tournament-stats-api";
import type { LeaderboardEntry } from "@/lib/tournament-types";
import { FILTER_SELECT_CLASS } from "./field";
import { EmptyState, ErrorState } from "./state-views";

const PAGE_SIZE = 20;

const SORT_LABEL: Record<LeaderboardSortKey, string> = {
  goals: "Bàn thắng",
  assists: "Kiến tạo",
  rating: "Điểm đánh giá",
};

interface LeaderboardTabProps {
  readonly tournamentId: string;
}

/** Paginated player statistics leaderboard, sortable by goals/assists/rating. */
export function LeaderboardTab({ tournamentId }: LeaderboardTabProps) {
  const [sortBy, setSortBy] = useState<LeaderboardSortKey>("goals");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entries, setEntries] = useState<readonly LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [sortBy]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getPlayerLeaderboardApi(tournamentId, { page, limit: PAGE_SIZE, sortBy }).then((result) => {
      if (cancelled) return;
      setIsLoading(false);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setError(null);
      setEntries(result.entries);
      setTotalPages(result.meta.totalPages);
    });

    return () => {
      cancelled = true;
    };
  }, [tournamentId, page, sortBy]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <select
          aria-label="Sắp xếp theo"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as LeaderboardSortKey)}
          className={`${FILTER_SELECT_CLASS} w-auto min-w-[180px]`}
        >
          {(Object.keys(SORT_LABEL) as LeaderboardSortKey[]).map((key) => (
            <option key={key} value={key}>
              Sắp xếp theo {SORT_LABEL[key]}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingOverlay label="Đang tải bảng thành tích…" />
      ) : error ? (
        <ErrorState message={error} />
      ) : entries.length === 0 ? (
        <EmptyState title="Chưa có dữ liệu thành tích cầu thủ" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-card border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-label text-muted">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Cầu thủ</th>
                  <th className="px-4 py-3 text-center">Trận</th>
                  <th className="px-4 py-3 text-center">Bàn thắng</th>
                  <th className="px-4 py-3 text-center">Kiến tạo</th>
                  <th className="px-4 py-3 text-center">🟨</th>
                  <th className="px-4 py-3 text-center">🟥</th>
                  <th className="px-4 py-3 text-center">Điểm đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.player.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 text-muted">{(page - 1) * PAGE_SIZE + index + 1}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{entry.player.name}</td>
                    <td className="px-4 py-3 text-center">{entry.matchesPlayed}</td>
                    <td className="px-4 py-3 text-center font-semibold text-foreground">{entry.goals}</td>
                    <td className="px-4 py-3 text-center">{entry.assists}</td>
                    <td className="px-4 py-3 text-center">{entry.yellowCards}</td>
                    <td className="px-4 py-3 text-center">{entry.redCards}</td>
                    <td className="px-4 py-3 text-center">{entry.rating?.toFixed(1) ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
