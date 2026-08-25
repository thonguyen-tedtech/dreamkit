import { apiFetch } from "./api-client";
import type {
  Match,
  MatchEvent,
  MatchEventType,
  MatchPeriod,
  MatchStatus,
  Paginated,
  ScoreBreakdown,
} from "./tournament-types";

/**
 * The API never populates references on matches/events — every relation is a
 * flat ObjectId string. Team/player names must be resolved client-side by
 * cross-referencing the tournament's teams/roster lists.
 */
interface ApiMatch {
  readonly _id: string;
  readonly tournamentId: string;
  readonly stageId: string;
  readonly groupId?: string;
  readonly round?: number;
  readonly homeTeamId: string;
  readonly awayTeamId: string;
  readonly homeScore?: ScoreBreakdown;
  readonly awayScore?: ScoreBreakdown;
  readonly status: string;
  readonly scheduledAt?: string;
  readonly venue?: string;
  readonly referee?: string;
  readonly attendance?: number;
  readonly notes?: string;
}

interface ApiMatchEvent {
  readonly _id: string;
  readonly matchId: string;
  readonly teamId: string;
  readonly type: string;
  readonly period: string;
  readonly minute: number;
  readonly addedMinute?: number;
  readonly playerId?: string;
  readonly relatedPlayerId?: string;
  readonly notes?: string;
}

function mapApiMatch(api: ApiMatch): Match {
  return {
    id: api._id,
    tournamentId: api.tournamentId,
    stageId: api.stageId,
    groupId: api.groupId,
    round: api.round,
    homeTeamId: api.homeTeamId,
    awayTeamId: api.awayTeamId,
    homeScore: api.homeScore,
    awayScore: api.awayScore,
    status: api.status as MatchStatus,
    scheduledAt: api.scheduledAt,
    venue: api.venue,
    referee: api.referee,
    attendance: api.attendance,
    notes: api.notes,
  };
}

function mapApiMatchEvent(api: ApiMatchEvent): MatchEvent {
  return {
    id: api._id,
    matchId: api.matchId,
    teamId: api.teamId,
    type: api.type as MatchEventType,
    period: api.period as MatchPeriod,
    minute: api.minute,
    addedMinute: api.addedMinute,
    playerId: api.playerId,
    relatedPlayerId: api.relatedPlayerId,
    notes: api.notes,
  };
}

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export interface MatchesFailure {
  readonly ok: false;
  readonly status: number;
  readonly message: string;
}

export interface MatchResult {
  readonly ok: true;
  readonly match: Match;
}

/** Generates the match schedule for a stage: the full round-robin/group fixture list for LEAGUE/GROUP stages, or round 1 for KNOCKOUT. */
export async function generateMatchesApi(
  accessToken: string,
  tournamentId: string,
  stageId: string,
): Promise<{ ok: true; matches: readonly Match[] } | MatchesFailure> {
  const result = await apiFetch<readonly ApiMatch[]>(
    `/api/tournaments/${tournamentId}/stages/${stageId}/matches/generate`,
    { method: "POST", headers: authHeaders(accessToken) },
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, matches: result.data.map(mapApiMatch) };
}

/** Generates the next knockout round from the current round's results. */
export async function generateNextRoundApi(
  accessToken: string,
  tournamentId: string,
  stageId: string,
): Promise<{ ok: true; matches: readonly Match[] } | MatchesFailure> {
  const result = await apiFetch<readonly ApiMatch[]>(
    `/api/tournaments/${tournamentId}/stages/${stageId}/matches/next-round`,
    { method: "POST", headers: authHeaders(accessToken) },
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, matches: result.data.map(mapApiMatch) };
}

export interface MatchListFilters {
  readonly page?: number;
  readonly limit?: number;
  readonly stageId?: string;
  readonly groupId?: string;
  readonly status?: MatchStatus;
}

export interface FetchMatchesSuccess {
  readonly ok: true;
  readonly matches: readonly Match[];
  readonly meta: Paginated<ApiMatch>["meta"];
}

/** Lists matches in a tournament, paginated and filterable by stage/group/status. Public. */
export async function listMatchesApi(
  tournamentId: string,
  filters: MatchListFilters = {},
): Promise<FetchMatchesSuccess | MatchesFailure> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.stageId) params.set("stageId", filters.stageId);
  if (filters.groupId) params.set("groupId", filters.groupId);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();

  const result = await apiFetch<Paginated<ApiMatch>>(
    `/api/tournaments/${tournamentId}/matches${query ? `?${query}` : ""}`,
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, matches: result.data.data.map(mapApiMatch), meta: result.data.meta };
}

/** Fetches a single match by id. Public. */
export async function getMatchApi(
  tournamentId: string,
  matchId: string,
): Promise<MatchResult | MatchesFailure> {
  const result = await apiFetch<ApiMatch>(`/api/tournaments/${tournamentId}/matches/${matchId}`);
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, match: mapApiMatch(result.data) };
}

/** Reschedules a match's date/time and/or venue. Organizer or admin only. */
export async function updateMatchScheduleApi(
  accessToken: string,
  tournamentId: string,
  matchId: string,
  input: { readonly scheduledAt?: string; readonly venue?: string },
): Promise<MatchResult | MatchesFailure> {
  const result = await apiFetch<ApiMatch>(
    `/api/tournaments/${tournamentId}/matches/${matchId}/schedule`,
    { method: "PATCH", headers: authHeaders(accessToken), body: JSON.stringify(input) },
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, match: mapApiMatch(result.data) };
}

export interface RecordMatchResultInput {
  readonly homeScore: ScoreBreakdown;
  readonly awayScore: ScoreBreakdown;
  readonly referee?: string;
  readonly attendance?: number;
  readonly notes?: string;
}

/** Records or corrects a match's final result. Organizer or admin only. */
export async function recordMatchResultApi(
  accessToken: string,
  tournamentId: string,
  matchId: string,
  input: RecordMatchResultInput,
): Promise<MatchResult | MatchesFailure> {
  const result = await apiFetch<ApiMatch>(
    `/api/tournaments/${tournamentId}/matches/${matchId}/result`,
    { method: "PUT", headers: authHeaders(accessToken), body: JSON.stringify(input) },
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, match: mapApiMatch(result.data) };
}

/** Lists a match's events in chronological order. Public. */
export async function listMatchEventsApi(
  tournamentId: string,
  matchId: string,
): Promise<{ ok: true; events: readonly MatchEvent[] } | MatchesFailure> {
  const result = await apiFetch<readonly ApiMatchEvent[]>(
    `/api/tournaments/${tournamentId}/matches/${matchId}/events`,
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, events: result.data.map(mapApiMatchEvent) };
}

export interface MatchEventInput {
  readonly teamId: string;
  readonly type: MatchEventType;
  readonly period: MatchPeriod;
  readonly minute: number;
  readonly addedMinute?: number;
  readonly playerId?: string;
  readonly relatedPlayerId?: string;
  readonly notes?: string;
}

/** Adds a match event — goal, card, substitution, VAR. Organizer or admin only. */
export async function createMatchEventApi(
  accessToken: string,
  tournamentId: string,
  matchId: string,
  input: MatchEventInput,
): Promise<{ ok: true; event: MatchEvent } | MatchesFailure> {
  const result = await apiFetch<ApiMatchEvent>(
    `/api/tournaments/${tournamentId}/matches/${matchId}/events`,
    { method: "POST", headers: authHeaders(accessToken), body: JSON.stringify(input) },
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, event: mapApiMatchEvent(result.data) };
}

/** Removes a match event. Organizer or admin only. */
export async function deleteMatchEventApi(
  accessToken: string,
  tournamentId: string,
  matchId: string,
  eventId: string,
): Promise<{ ok: true } | MatchesFailure> {
  const result = await apiFetch<undefined>(
    `/api/tournaments/${tournamentId}/matches/${matchId}/events/${eventId}`,
    { method: "DELETE", headers: authHeaders(accessToken) },
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true };
}
