"use client";

import { createContext, useContext } from "react";
import type { Stage, Team } from "@/lib/tournament-types";

export interface TournamentDataContextValue {
  readonly tournamentId: string;
  readonly stages: readonly Stage[];
  readonly isLoadingStages: boolean;
  readonly stagesError: string | null;
  readonly refreshStages: () => Promise<void>;
  readonly teams: readonly Team[];
  readonly teamsById: ReadonlyMap<string, Team>;
  readonly isLoadingTeams: boolean;
  readonly teamsError: string | null;
  readonly refreshTeams: () => Promise<void>;
}

export const TournamentDataContext = createContext<TournamentDataContextValue | null>(null);

/**
 * Shared, tournament-scoped reference data (stages, teams) fetched once by
 * `TournamentDataProvider` and reused by every tab/panel that needs it —
 * instead of each one independently re-fetching the same lists.
 */
export function useTournamentData(): TournamentDataContextValue {
  const context = useContext(TournamentDataContext);
  if (context === null) {
    throw new Error("useTournamentData must be used within a TournamentDataProvider");
  }
  return context;
}
