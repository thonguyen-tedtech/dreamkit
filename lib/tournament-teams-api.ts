import { apiFetch } from "./api-client";
import type { Paginated, Player, PlayerPosition, Team, TeamMember, TeamMemberRole } from "./tournament-types";

interface ApiTeam {
  readonly _id: string;
  readonly tournamentId: string;
  readonly name: string;
  readonly shortName?: string;
  readonly slug?: string;
  readonly logo?: string;
  readonly description?: string;
  readonly groupId?: string;
  readonly seed?: number;
}

interface ApiPlayerRef {
  readonly _id: string;
  readonly name: string;
  readonly slug?: string;
  readonly avatar?: string;
  readonly nationality?: string;
  readonly position?: string;
}

/**
 * `playerId` is populated (a full player sub-document) only by the roster
 * *list* endpoint; add/get-one/update return the plain id string.
 */
interface ApiTeamMember {
  readonly _id: string;
  readonly teamId: string;
  readonly playerId: string | ApiPlayerRef;
  readonly role: string;
  readonly jerseyNumber?: number;
  readonly isActive?: boolean;
}

function mapApiTeam(api: ApiTeam): Team {
  return {
    id: api._id,
    tournamentId: api.tournamentId,
    name: api.name,
    shortName: api.shortName,
    slug: api.slug,
    logo: api.logo,
    description: api.description,
    groupId: api.groupId,
    seed: api.seed,
  };
}

function mapApiPlayerRef(ref: ApiPlayerRef): Player {
  return {
    id: ref._id,
    name: ref.name,
    slug: ref.slug,
    avatar: ref.avatar,
    nationality: ref.nationality,
    position: ref.position as PlayerPosition | undefined,
  };
}

function mapApiTeamMember(api: ApiTeamMember): TeamMember {
  const isPopulated = typeof api.playerId !== "string";
  const playerRef = isPopulated ? (api.playerId as ApiPlayerRef) : undefined;

  return {
    id: api._id,
    teamId: api.teamId,
    playerId: playerRef ? playerRef._id : (api.playerId as string),
    player: playerRef ? mapApiPlayerRef(playerRef) : undefined,
    role: api.role as TeamMemberRole,
    jerseyNumber: api.jerseyNumber,
    isActive: api.isActive,
  };
}

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export interface TeamsFailure {
  readonly ok: false;
  readonly status: number;
  readonly message: string;
}

export interface FetchTeamsSuccess {
  readonly ok: true;
  readonly teams: readonly Team[];
  readonly meta: Paginated<ApiTeam>["meta"];
}

/** Lists teams registered in a tournament, paginated and optionally filtered by group. */
export async function listTeamsApi(
  tournamentId: string,
  options: { readonly page?: number; readonly limit?: number; readonly groupId?: string } = {},
): Promise<FetchTeamsSuccess | TeamsFailure> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  if (options.groupId) params.set("groupId", options.groupId);
  const query = params.toString();

  const result = await apiFetch<Paginated<ApiTeam>>(
    `/api/tournaments/${tournamentId}/teams${query ? `?${query}` : ""}`,
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, teams: result.data.data.map(mapApiTeam), meta: result.data.meta };
}

export interface TeamResult {
  readonly ok: true;
  readonly team: Team;
}

/** Fetches a single team by id. Public. */
export async function getTeamApi(
  tournamentId: string,
  teamId: string,
): Promise<TeamResult | TeamsFailure> {
  const result = await apiFetch<ApiTeam>(`/api/tournaments/${tournamentId}/teams/${teamId}`);
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, team: mapApiTeam(result.data) };
}

export interface TeamInput {
  readonly name: string;
  readonly shortName?: string;
  readonly slug?: string;
  readonly logo?: string;
  readonly description?: string;
  readonly groupId?: string;
  readonly seed?: number;
}

/** Registers a team in a tournament. Organizer or admin only. */
export async function createTeamApi(
  accessToken: string,
  tournamentId: string,
  input: TeamInput,
): Promise<TeamResult | TeamsFailure> {
  const result = await apiFetch<ApiTeam>(`/api/tournaments/${tournamentId}/teams`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
  });
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, team: mapApiTeam(result.data) };
}

/** Updates a team. Organizer or admin only. */
export async function updateTeamApi(
  accessToken: string,
  tournamentId: string,
  teamId: string,
  input: Partial<TeamInput>,
): Promise<TeamResult | TeamsFailure> {
  const result = await apiFetch<ApiTeam>(`/api/tournaments/${tournamentId}/teams/${teamId}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
  });
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, team: mapApiTeam(result.data) };
}

/** Removes a team. Organizer or admin only. */
export async function deleteTeamApi(
  accessToken: string,
  tournamentId: string,
  teamId: string,
): Promise<{ ok: true } | TeamsFailure> {
  const result = await apiFetch<undefined>(`/api/tournaments/${tournamentId}/teams/${teamId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true };
}

/** Lists a team's active roster. Public. Note: scoped by `teamId` only (not under /tournaments). */
export async function listRosterApi(
  teamId: string,
): Promise<{ ok: true; members: readonly TeamMember[] } | TeamsFailure> {
  const result = await apiFetch<readonly ApiTeamMember[]>(`/api/teams/${teamId}/members`);
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, members: result.data.map(mapApiTeamMember) };
}

export interface TeamMemberResult {
  readonly ok: true;
  readonly member: TeamMember;
}

export interface TeamMemberInput {
  readonly playerId: string;
  readonly role: TeamMemberRole;
  readonly jerseyNumber?: number;
}

/** Adds a player to a team's roster. Organizer or admin only. */
export async function addRosterMemberApi(
  accessToken: string,
  teamId: string,
  input: TeamMemberInput,
): Promise<TeamMemberResult | TeamsFailure> {
  const result = await apiFetch<ApiTeamMember>(`/api/teams/${teamId}/members`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ playerId: input.playerId, role: input.role, jerseyNumber: input.jerseyNumber }),
  });
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, member: mapApiTeamMember(result.data) };
}

/** Updates a roster member's role/number/active flag. Organizer or admin only. */
export async function updateRosterMemberApi(
  accessToken: string,
  teamId: string,
  memberId: string,
  input: { readonly role?: TeamMemberRole; readonly jerseyNumber?: number; readonly isActive?: boolean },
): Promise<TeamMemberResult | TeamsFailure> {
  const result = await apiFetch<ApiTeamMember>(`/api/teams/${teamId}/members/${memberId}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
  });
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, member: mapApiTeamMember(result.data) };
}

/** Removes a roster member. Organizer or admin only. */
export async function removeRosterMemberApi(
  accessToken: string,
  teamId: string,
  memberId: string,
): Promise<{ ok: true } | TeamsFailure> {
  const result = await apiFetch<undefined>(`/api/teams/${teamId}/members/${memberId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true };
}
