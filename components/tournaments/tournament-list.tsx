"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/ui/spinner";
import { Pagination } from "@/components/shop/pagination";
import { listMyTournamentsApi, listTournamentsApi } from "@/lib/tournaments-api";
import type { Tournament, TournamentFormat, TournamentStatus } from "@/lib/tournament-types";
import { TournamentCard } from "./tournament-card";
import { TournamentFilters } from "./tournament-filters";
import { EmptyState, ErrorState } from "./state-views";

const PAGE_SIZE = 9;

interface TournamentListProps {
  /**
   * "public" browses every visible tournament (read-only, no auth).
   * "admin" lists tournaments this admin organizes, with a create action —
   * used only under /admin, where an admin session is guaranteed by AdminGuard.
   */
  readonly variant?: "public" | "admin";
}

/** Paginated, filterable grid of tournaments — powers /tournaments and /admin/tournaments. */
export function TournamentList({ variant = "public" }: TournamentListProps) {
  const { accessToken } = useAdminAuth();
  const [tournaments, setTournaments] = useState<readonly Tournament[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [format, setFormat] = useState<TournamentFormat | "">("");
  const [status, setStatus] = useState<TournamentStatus | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [format, status, variant]);

  useEffect(() => {
    if (variant === "admin" && !accessToken) {
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    async function load() {
      const filters = {
        page,
        limit: PAGE_SIZE,
        format: format || undefined,
        status: status || undefined,
      };
      const result =
        variant === "admin" && accessToken
          ? await listMyTournamentsApi(accessToken, filters)
          : await listTournamentsApi(filters);

      if (cancelled) return;
      setIsLoading(false);

      if (!result.ok) {
        setError(result.message);
        return;
      }
      setError(null);
      setTournaments(result.tournaments);
      setTotalPages(result.meta.totalPages);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [variant, accessToken, page, format, status]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <TournamentFilters
          format={format}
          status={status}
          onFormatChange={setFormat}
          onStatusChange={setStatus}
        />
        {variant === "admin" ? (
          <Link href="/admin/tournaments/create">
            <Button type="button">Tạo giải đấu</Button>
          </Link>
        ) : null}
      </div>

      {isLoading ? (
        <LoadingOverlay label="Đang tải giải đấu…" />
      ) : error ? (
        <ErrorState message={error} />
      ) : tournaments.length === 0 ? (
        <EmptyState
          title="Chưa có giải đấu nào"
          description={
            variant === "admin"
              ? "Chưa có giải đấu nào được tạo. Bấm \"Tạo giải đấu\" để bắt đầu."
              : "Không tìm thấy giải đấu phù hợp với bộ lọc hiện tại."
          }
        />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {tournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                hrefBase={variant === "admin" ? "/admin/tournaments" : "/tournaments"}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
