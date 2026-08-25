import { apiFetch } from "./api-client";
import { listTeamsApi } from "./tournament-teams-api";
import type {
  LeaderboardEntry,
  Paginated,
  Player,
  PlayerMatchStat,
  StandingRow,
  Team,
  TeamMatchStat,
  TeamRef,
} from "./tournament-types";

/**
 * Standings/leaderboard rows are computed aggregates, not raw documents: the
 * API denormalizes a display name (`teamName`/`playerName`) instead of
 * populating a ref, and never includes a logo — team logos are resolved
 * client-side against the tournament's teams list.
 */
interface ApiStandingRow {
  readonly team: string;
  readonly teamName: string;
  readonly played: number;
  readonly wins: number;
  readonly draws: number;
  readonly losses: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly goalDifference: number;
  readonly points: number;
  readonly qualified?: boolean;
}

/** A GROUP stage's standings arrive broken down per group; a LEAGUE stage's arrive as one flat table. */
type ApiStageStandings =
  | readonly ApiStandingRow[]
  | readonly { readonly groupId: string; readonly groupName: string; readonly standings: readonly ApiStandingRow[] }[];

function mapApiStandingRow(api: ApiStandingRow, teamsById: ReadonlyMap<string, Team>, groupId?: string): StandingRow {
  const team = teamsById.get(api.team);
  const teamRef: TeamRef = {
    id: api.team,
    name: api.teamName,
    shortName: team?.shortName,
    logo: team?.logo,
  };
  return {
    team: teamRef,
    groupId,
    played: api.played,
    won: api.wins,
    drawn: api.draws,
    lost: api.losses,
    goalsFor: api.goalsFor,
    goalsAgainst: api.goalsAgainst,
    goalDifference: api.goalDifference,
    points: api.points,
  };
}

/** One standings table, optionally labelled with the group it belongs to. */
export interface StandingsTable {
  readonly group?: { readonly id: string; readonly name: string };
  readonly rows: readonly StandingRow[];
}

function isGroupedStandings(
  data: ApiStageStandings,
): data is readonly { readonly groupId: string; readonly groupName: string; readonly standings: readonly ApiStandingRow[] }[] {
  return data.length > 0 && "standings" in data[0];
}

function mapStageStandings(
  data: ApiStageStandings,
  teamsById: ReadonlyMap<string, Team>,
): readonly StandingsTable[] {
  if (isGroupedStandings(data)) {
    return data.map((entry) => ({
      group: { id: entry.groupId, name: entry.groupName },
      rows: entry.standings.map((row) => mapApiStandingRow(row, teamsById, entry.groupId)),
    }));
  }
  return [{ rows: data.map((row) => mapApiStandingRow(row, teamsById)) }];
}

/** Builds an id → team lookup so standings rows can show a logo the standings API itself doesn't return. */
async function loadTeamsById(tournamentId: string): Promise<ReadonlyMap<string, Team>> {
  const result = await listTeamsApi(tournamentId, { limit: 100 });
  return result.ok ? new Map(result.teams.map((team) => [team.id, team])) : new Map();
}

export interface StatsFailure {
  readonly ok: false;
  readonly status: number;
  readonly message: string;
}

/**
 * Gets standings for a stage — one table for LEAGUE, per-group tables for GROUP stages.
 * Pass `knownTeamsById` (e.g. from `useTournamentData()`) to skip the extra
 * teams-list fetch this otherwise needs purely to resolve logos.
 */
export async function getStageStandingsApi(
  tournamentId: string,
  stageId: string,
  knownTeamsById?: ReadonlyMap<string, Team>,
): Promise<{ ok: true; tables: readonly StandingsTable[] } | StatsFailure> {
  const [result, teamsById] = await Promise.all([
    apiFetch<ApiStageStandings>(`/api/tournaments/${tournamentId}/stages/${stageId}/standings`),
    knownTeamsById ?? loadTeamsById(tournamentId),
  ]);
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, tables: mapStageStandings(result.data, teamsById) };
}

/** Gets the standings table for a single group. See `getStageStandingsApi` re: `knownTeamsById`. */
export async function getGroupStandingsApi(
  tournamentId: string,
  stageId: string,
  groupId: string,
  knownTeamsById?: ReadonlyMap<string, Team>,
): Promise<{ ok: true; rows: readonly StandingRow[] } | StatsFailure> {
  const [result, teamsById] = await Promise.all([
    apiFetch<readonly ApiStandingRow[]>(
      `/api/tournaments/${tournamentId}/stages/${stageId}/groups/${groupId}/standings`,
    ),
    knownTeamsById ?? loadTeamsById(tournamentId),
  ]);
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, rows: result.data.map((row) => mapApiStandingRow(row, teamsById, groupId)) };
}

interface ApiPlayerRef {
  readonly _id: string;
  readonly name: string;
  readonly avatar?: string;
}

/** `playerId` is populated only by the match player-stats GET; the PUT (upsert) response leaves it a plain id. */
interface ApiPlayerMatchStat {
  readonly playerId: string | ApiPlayerRef;
  readonly teamId: string;
  readonly goals: number;
  readonly assists: number;
  readonly shots: number;
  readonly shotsOnTarget: number;
  readonly passes: number;
  readonly passesCompleted: number;
  readonly fouls: number;
  readonly yellowCards: number;
  readonly redCards: number;
  readonly ownGoals: number;
  readonly saves: number;
  readonly rating?: number;
}

function mapApiPlayerMatchStat(api: ApiPlayerMatchStat): PlayerMatchStat {
  const isPopulated = typeof api.playerId !== "string";
  const playerRef = isPopulated ? (api.playerId as ApiPlayerRef) : undefined;

  return {
    playerId: playerRef ? playerRef._id : (api.playerId as string),
    player: playerRef ? { id: playerRef._id, name: playerRef.name, avatar: playerRef.avatar } : undefined,
    teamId: api.teamId,
    goals: api.goals,
    assists: api.assists,
    shots: api.shots,
    shotsOnTarget: api.shotsOnTarget,
    passes: api.passes,
    passesCompleted: api.passesCompleted,
    fouls: api.fouls,
    yellowCards: api.yellowCards,
    redCards: api.redCards,
    ownGoals: api.ownGoals,
    saves: api.saves,
    rating: api.rating,
  };
}

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

/** Lists a match's recorded player stat lines (with player names populated). Public. */
export async function getPlayerMatchStatsApi(
  tournamentId: string,
  matchId: string,
): Promise<{ ok: true; stats: readonly PlayerMatchStat[] } | StatsFailure> {
  const result = await apiFetch<readonly ApiPlayerMatchStat[]>(
    `/api/tournaments/${tournamentId}/matches/${matchId}/player-stats`,
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, stats: result.data.map(mapApiPlayerMatchStat) };
}

export interface PlayerMatchStatInput {
  readonly playerId: string;
  readonly teamId: string;
  readonly goals?: number;
  readonly assists?: number;
  readonly shots?: number;
  readonly shotsOnTarget?: number;
  readonly passes?: number;
  readonly passesCompleted?: number;
  readonly fouls?: number;
  readonly yellowCards?: number;
  readonly redCards?: number;
  readonly ownGoals?: number;
  readonly saves?: number;
  readonly rating?: number;
}

/** Records (or overwrites) one player's stat line for a match. Organizer or admin only. */
export async function upsertPlayerMatchStatApi(
  accessToken: string,
  tournamentId: string,
  matchId: string,
  input: PlayerMatchStatInput,
): Promise<{ ok: true; stat: PlayerMatchStat } | StatsFailure> {
  const result = await apiFetch<ApiPlayerMatchStat>(
    `/api/tournaments/${tournamentId}/matches/${matchId}/player-stats`,
    { method: "PUT", headers: authHeaders(accessToken), body: JSON.stringify(input) },
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, stat: mapApiPlayerMatchStat(result.data) };
}

interface ApiTeamMatchStat {
  readonly teamId: string;
  readonly shots: number;
  readonly shotsOnTarget: number;
  readonly passes: number;
  readonly passesCompleted: number;
  readonly fouls: number;
  readonly yellowCards: number;
  readonly redCards: number;
}

function mapApiTeamMatchStat(api: ApiTeamMatchStat): TeamMatchStat {
  return {
    teamId: api.teamId,
    shots: api.shots,
    shotsOnTarget: api.shotsOnTarget,
    passes: api.passes,
    passesCompleted: api.passesCompleted,
    fouls: api.fouls,
    yellowCards: api.yellowCards,
    redCards: api.redCards,
  };
}

/** Lists a match's recorded team stat lines. Public. */
export async function getTeamMatchStatsApi(
  tournamentId: string,
  matchId: string,
): Promise<{ ok: true; stats: readonly TeamMatchStat[] } | StatsFailure> {
  const result = await apiFetch<readonly ApiTeamMatchStat[]>(
    `/api/tournaments/${tournamentId}/matches/${matchId}/team-stats`,
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, stats: result.data.map(mapApiTeamMatchStat) };
}

export interface TeamMatchStatInput {
  readonly teamId: string;
  readonly shots?: number;
  readonly shotsOnTarget?: number;
  readonly passes?: number;
  readonly passesCompleted?: number;
  readonly fouls?: number;
  readonly yellowCards?: number;
  readonly redCards?: number;
}

/** Records (or overwrites) one team's stat line for a match. Organizer or admin only. */
export async function upsertTeamMatchStatApi(
  accessToken: string,
  tournamentId: string,
  matchId: string,
  input: TeamMatchStatInput,
): Promise<{ ok: true; stat: TeamMatchStat } | StatsFailure> {
  const result = await apiFetch<ApiTeamMatchStat>(
    `/api/tournaments/${tournamentId}/matches/${matchId}/team-stats`,
    { method: "PUT", headers: authHeaders(accessToken), body: JSON.stringify(input) },
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, stat: mapApiTeamMatchStat(result.data) };
}

interface ApiLeaderboardRow {
  readonly playerId: string;
  readonly playerName: string;
  readonly matchesPlayed: number;
  readonly goals: number;
  readonly assists: number;
  readonly yellowCards: number;
  readonly redCards: number;
  readonly rating: number | null;
}

function mapApiLeaderboardRow(api: ApiLeaderboardRow): LeaderboardEntry {
  const player: Player = { id: api.playerId, name: api.playerName };
  return {
    player,
    matchesPlayed: api.matchesPlayed,
    goals: api.goals,
    assists: api.assists,
    yellowCards: api.yellowCards,
    redCards: api.redCards,
    rating: api.rating ?? undefined,
  };
}

export type LeaderboardSortKey = "goals" | "assists" | "rating";

export interface FetchLeaderboardSuccess {
  readonly ok: true;
  readonly entries: readonly LeaderboardEntry[];
  readonly meta: Paginated<ApiLeaderboardRow>["meta"];
}

/** Fetches the tournament's player statistics leaderboard, paginated and sortable. Public. */
export async function getPlayerLeaderboardApi(
  tournamentId: string,
  options: { readonly page?: number; readonly limit?: number; readonly sortBy?: LeaderboardSortKey } = {},
): Promise<FetchLeaderboardSuccess | StatsFailure> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  if (options.sortBy) params.set("sortBy", options.sortBy);
  const query = params.toString();

  const result = await apiFetch<Paginated<ApiLeaderboardRow>>(
    `/api/tournaments/${tournamentId}/players/leaderboard${query ? `?${query}` : ""}`,
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return {
    ok: true,
    entries: result.data.data.map(mapApiLeaderboardRow),
    meta: result.data.meta,
  };
}
