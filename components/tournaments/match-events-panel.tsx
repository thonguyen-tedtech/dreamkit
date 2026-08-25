"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { deleteMatchEventApi, listMatchEventsApi } from "@/lib/tournament-matches-api";
import { listRosterApi } from "@/lib/tournament-teams-api";
import { MATCH_EVENT_ICON, MATCH_EVENT_LABEL } from "@/lib/tournament-format";
import type { MatchEvent, MatchWithTeams, Player } from "@/lib/tournament-types";
import { MatchEventFormModal } from "./match-event-form-modal";

interface MatchEventsPanelProps {
  readonly tournamentId: string;
  readonly match: MatchWithTeams;
  readonly canManage: boolean;
}

/** Chronological timeline of a match's events (goals, cards, subs, VAR). */
export function MatchEventsPanel({ tournamentId, match, canManage }: MatchEventsPanelProps) {
  const { accessToken } = useAdminAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState<readonly MatchEvent[]>([]);
  const [playersById, setPlayersById] = useState<ReadonlyMap<string, Player>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    // The events API never populates player refs — resolve names from both
    // teams' rosters (the only endpoint that does populate).
    Promise.all([
      listMatchEventsApi(tournamentId, match.id),
      listRosterApi(match.homeTeam.id),
      listRosterApi(match.awayTeam.id),
    ]).then(([eventsResult, homeRoster, awayRoster]) => {
      if (cancelled) return;
      setIsLoading(false);
      if (eventsResult.ok) setEvents(eventsResult.events);

      const players = new Map<string, Player>();
      for (const roster of [homeRoster, awayRoster]) {
        if (!roster.ok) continue;
        for (const member of roster.members) {
          if (member.player) players.set(member.playerId, member.player);
        }
      }
      setPlayersById(players);
    });

    return () => {
      cancelled = true;
    };
  }, [tournamentId, match.id, match.homeTeam.id, match.awayTeam.id]);

  async function handleDelete(event: MatchEvent) {
    if (!accessToken || !window.confirm("Xóa diễn biến này?")) return;
    const result = await deleteMatchEventApi(accessToken, tournamentId, match.id, event.id);
    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }
    setEvents((current) => current.filter((entry) => entry.id !== event.id));
  }

  function playerName(playerId: string | undefined): string | null {
    if (!playerId) return null;
    return playersById.get(playerId)?.name ?? null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h5 className="text-xs font-medium uppercase tracking-label text-muted">Diễn biến trận đấu</h5>
        {canManage ? (
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="text-xs font-medium uppercase tracking-label text-foreground underline-offset-4 hover:cursor-pointer hover:underline"
          >
            + Thêm diễn biến
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Spinner className="size-5" />
        </div>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted">Chưa ghi nhận diễn biến nào.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {[...events]
            .sort((a, b) => a.minute - b.minute)
            .map((event) => {
              const team = event.teamId === match.homeTeam.id ? match.homeTeam : match.awayTeam;
              const player = playerName(event.playerId);
              const relatedPlayer = playerName(event.relatedPlayerId);
              return (
                <li
                  key={event.id}
                  className="flex items-center gap-3 rounded-card border border-border px-3 py-2 text-sm"
                >
                  <span aria-hidden="true">{MATCH_EVENT_ICON[event.type]}</span>
                  <span className="w-10 shrink-0 text-muted">{event.minute}&apos;</span>
                  <span className="flex-1">
                    <span className="font-medium text-foreground">{MATCH_EVENT_LABEL[event.type]}</span>
                    {player ? ` — ${player}` : ""}
                    {relatedPlayer ? ` (${relatedPlayer})` : ""}
                    <span className="text-muted"> · {team.name}</span>
                  </span>
                  {canManage ? (
                    <button
                      type="button"
                      onClick={() => void handleDelete(event)}
                      className="text-xs text-muted hover:cursor-pointer hover:text-foreground"
                    >
                      Xóa
                    </button>
                  ) : null}
                </li>
              );
            })}
        </ul>
      )}

      <MatchEventFormModal
        tournamentId={tournamentId}
        match={match}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onCreated={(event) => setEvents((current) => [...current, event])}
      />
    </div>
  );
}
