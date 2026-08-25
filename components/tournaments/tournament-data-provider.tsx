"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { listStagesApi } from "@/lib/tournament-stages-api";
import { listTeamsApi } from "@/lib/tournament-teams-api";
import type { Stage, Team } from "@/lib/tournament-types";
import { TournamentDataContext, type TournamentDataContextValue } from "./tournament-data-context";

/** The backend's own max page size — every consumer treats this as "all teams" for lookup purposes. */
const TEAMS_FETCH_LIMIT = 100;

interface TournamentDataProviderProps {
  readonly tournamentId: string;
  readonly children: ReactNode;
}

/** Fetches a tournament's stages and teams once and shares them with every descendant via context. */
export function TournamentDataProvider({ tournamentId, children }: TournamentDataProviderProps) {
  const [stages, setStages] = useState<readonly Stage[]>([]);
  const [isLoadingStages, setIsLoadingStages] = useState(true);
  const [stagesError, setStagesError] = useState<string | null>(null);
  const [teams, setTeams] = useState<readonly Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [teamsError, setTeamsError] = useState<string | null>(null);

  const refreshStages = useCallback(async () => {
    setIsLoadingStages(true);
    const result = await listStagesApi(tournamentId);
    setIsLoadingStages(false);
    if (result.ok) {
      setStagesError(null);
      setStages([...result.stages].sort((a, b) => a.order - b.order));
    } else {
      setStagesError(result.message);
    }
  }, [tournamentId]);

  const refreshTeams = useCallback(async () => {
    setIsLoadingTeams(true);
    const result = await listTeamsApi(tournamentId, { limit: TEAMS_FETCH_LIMIT });
    setIsLoadingTeams(false);
    if (result.ok) {
      setTeamsError(null);
      setTeams(result.teams);
    } else {
      setTeamsError(result.message);
    }
  }, [tournamentId]);

  useEffect(() => {
    void refreshStages();
    void refreshTeams();
  }, [refreshStages, refreshTeams]);

  const teamsById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);

  const value = useMemo<TournamentDataContextValue>(
    () => ({
      tournamentId,
      stages,
      isLoadingStages,
      stagesError,
      refreshStages,
      teams,
      teamsById,
      isLoadingTeams,
      teamsError,
      refreshTeams,
    }),
    [
      tournamentId,
      stages,
      isLoadingStages,
      stagesError,
      refreshStages,
      teams,
      teamsById,
      isLoadingTeams,
      teamsError,
      refreshTeams,
    ],
  );

  return <TournamentDataContext.Provider value={value}>{children}</TournamentDataContext.Provider>;
}
