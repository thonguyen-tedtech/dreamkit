"use client";

import { useEffect, useState } from "react";
import { LoadingOverlay } from "@/components/ui/spinner";
import { getTournamentApi } from "@/lib/tournaments-api";
import type { Tournament } from "@/lib/tournament-types";
import { TournamentDataProvider } from "./tournament-data-provider";
import { TournamentHeader } from "./tournament-header";
import { TournamentTabs } from "./tournament-tabs";
import { ErrorState } from "./state-views";

interface TournamentDetailProps {
  readonly tournamentId: string;
  /** Whether to show organizer controls (create/update/delete). True only under /admin. */
  readonly canManage: boolean;
}

/** Fetches a tournament by id and renders its header + tabs. */
export function TournamentDetail({ tournamentId, canManage }: TournamentDetailProps) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getTournamentApi(tournamentId).then((result) => {
      if (cancelled) return;
      setIsLoading(false);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setTournament(result.tournament);
    });

    return () => {
      cancelled = true;
    };
  }, [tournamentId]);

  if (isLoading) {
    return <LoadingOverlay label="Đang tải giải đấu…" />;
  }

  if (error || !tournament) {
    return <ErrorState message={error ?? "Không tìm thấy giải đấu."} />;
  }

  return (
    <TournamentDataProvider tournamentId={tournamentId}>
      <div className="flex flex-col gap-8">
        <TournamentHeader tournament={tournament} canManage={canManage} onUpdated={setTournament} />
        <TournamentTabs tournament={tournament} canManage={canManage} />
      </div>
    </TournamentDataProvider>
  );
}
