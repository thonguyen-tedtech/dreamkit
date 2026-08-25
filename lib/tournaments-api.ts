import { apiFetch } from "./api-client";
import type {
  MatchRules,
  Paginated,
  PointsRule,
  RegistrationRules,
  Tournament,
  TournamentFormat,
  TournamentStatus,
} from "./tournament-types";

/** Tournament shape returned by the NestJS tournaments API. */
export interface ApiTournament {
  readonly _id: string;
  readonly name: string;
  readonly slug?: string;
  readonly description?: string;
  readonly logo?: string;
  readonly format: string;
  readonly status: string;
  readonly startDate: string;
  readonly endDate?: string;
  readonly location?: string;
  readonly venue?: string;
  readonly pointsRule?: PointsRule;
  readonly rankingRules?: readonly string[];
  readonly matchRules?: MatchRules;
  readonly registrationRules?: RegistrationRules;
  readonly isPublic: boolean;
  readonly organizerId?: string;
  readonly createdAt?: string;
}

export function mapApiTournament(api: ApiTournament): Tournament {
  return {
    id: api._id,
    name: api.name,
    slug: api.slug,
    description: api.description,
    logo: api.logo,
    format: api.format as TournamentFormat,
    status: api.status as TournamentStatus,
    startDate: api.startDate,
    endDate: api.endDate,
    location: api.location,
    venue: api.venue,
    pointsRule: api.pointsRule,
    rankingRules: api.rankingRules,
    matchRules: api.matchRules,
    registrationRules: api.registrationRules,
    isPublic: api.isPublic,
    organizerId: api.organizerId,
    createdAt: api.createdAt,
  };
}

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export interface TournamentListFilters {
  readonly page?: number;
  readonly limit?: number;
  readonly format?: TournamentFormat;
  readonly status?: TournamentStatus;
}

function buildListQuery(filters: TournamentListFilters): string {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.format) params.set("format", filters.format);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export interface FetchTournamentsSuccess {
  readonly ok: true;
  readonly tournaments: readonly Tournament[];
  readonly meta: Paginated<ApiTournament>["meta"];
}

export interface FetchTournamentsFailure {
  readonly ok: false;
  readonly message: string;
}

export type FetchTournamentsResult = FetchTournamentsSuccess | FetchTournamentsFailure;

/** Lists public tournaments, paginated and optionally filtered by format/status. */
export async function listTournamentsApi(
  filters: TournamentListFilters = {},
): Promise<FetchTournamentsResult> {
  const result = await apiFetch<Paginated<ApiTournament>>(
    `/api/tournaments${buildListQuery(filters)}`,
  );
  if (!result.ok) {
    return { ok: false, message: result.message };
  }
  return {
    ok: true,
    tournaments: result.data.data.map(mapApiTournament),
    meta: result.data.meta,
  };
}

/** Lists the signed-in user's own tournaments (as organizer), paginated. */
export async function listMyTournamentsApi(
  accessToken: string,
  filters: TournamentListFilters = {},
): Promise<FetchTournamentsResult> {
  const result = await apiFetch<Paginated<ApiTournament>>(
    `/api/tournaments/mine${buildListQuery(filters)}`,
    { headers: authHeaders(accessToken) },
  );
  if (!result.ok) {
    return { ok: false, message: result.message };
  }
  return {
    ok: true,
    tournaments: result.data.data.map(mapApiTournament),
    meta: result.data.meta,
  };
}

export interface TournamentResultSuccess {
  readonly ok: true;
  readonly tournament: Tournament;
}

export interface TournamentResultFailure {
  readonly ok: false;
  readonly status: number;
  readonly message: string;
}

export type TournamentResult = TournamentResultSuccess | TournamentResultFailure;

/** Fetches a single tournament by id. Public tournaments are visible to anyone. */
export async function getTournamentApi(id: string): Promise<TournamentResult> {
  const result = await apiFetch<ApiTournament>(`/api/tournaments/${id}`);
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, tournament: mapApiTournament(result.data) };
}

/** Fields the create-tournament form submits. `startDate`/`endDate` are ISO strings. */
export interface TournamentInput {
  readonly name: string;
  readonly slug?: string;
  readonly description?: string;
  readonly logo?: string;
  readonly format: TournamentFormat;
  readonly startDate: string;
  readonly endDate?: string;
  readonly location?: string;
  readonly venue?: string;
  readonly pointsRule?: PointsRule;
  readonly rankingRules?: readonly string[];
  readonly matchRules?: MatchRules;
  readonly registrationRules?: RegistrationRules;
  readonly isPublic?: boolean;
}

/** Creates a tournament. The signed-in caller becomes its organizer. */
export async function createTournamentApi(
  accessToken: string,
  input: TournamentInput,
): Promise<TournamentResult> {
  const result = await apiFetch<ApiTournament>("/api/tournaments", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
  });
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, tournament: mapApiTournament(result.data) };
}

/** Updates a tournament. Organizer or admin only. */
export async function updateTournamentApi(
  accessToken: string,
  id: string,
  input: Partial<TournamentInput> & { readonly status?: TournamentStatus },
): Promise<TournamentResult> {
  const result = await apiFetch<ApiTournament>(`/api/tournaments/${id}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
  });
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, tournament: mapApiTournament(result.data) };
}

/** Cancels a tournament. Organizer or admin only. */
export async function cancelTournamentApi(
  accessToken: string,
  id: string,
): Promise<TournamentResult> {
  const result = await apiFetch<ApiTournament>(`/api/tournaments/${id}/cancel`, {
    method: "POST",
    headers: authHeaders(accessToken),
  });
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, tournament: mapApiTournament(result.data) };
}
