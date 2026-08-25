import { apiFetch } from "./api-client";
import type { Paginated, Player, PlayerPosition, PreferredFoot } from "./tournament-types";

/** Player shape returned by the NestJS players API. */
interface ApiPlayer {
  readonly _id: string;
  readonly name: string;
  readonly slug?: string;
  readonly avatar?: string;
  readonly nationality?: string;
  readonly position?: string;
  readonly preferredFoot?: string;
}

function mapApiPlayer(apiPlayer: ApiPlayer): Player {
  return {
    id: apiPlayer._id,
    name: apiPlayer.name,
    slug: apiPlayer.slug,
    avatar: apiPlayer.avatar,
    nationality: apiPlayer.nationality,
    position: apiPlayer.position as PlayerPosition | undefined,
    preferredFoot: apiPlayer.preferredFoot as PreferredFoot | undefined,
  };
}

export interface SearchPlayersResult {
  readonly ok: true;
  readonly players: readonly Player[];
}

export interface PlayersFailure {
  readonly ok: false;
  readonly message: string;
}

/** Searches the shared player directory by name, for roster/event/stat pickers. */
export async function searchPlayersApi(
  search: string,
): Promise<SearchPlayersResult | PlayersFailure> {
  const query = new URLSearchParams({ limit: "10" });
  if (search.trim()) {
    query.set("search", search.trim());
  }

  const result = await apiFetch<Paginated<ApiPlayer>>(`/api/players?${query.toString()}`);
  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true, players: result.data.data.map(mapApiPlayer) };
}

export interface CreatePlayerInput {
  readonly name: string;
  readonly nationality?: string;
  readonly position?: PlayerPosition;
}

export interface CreatePlayerResult {
  readonly ok: true;
  readonly player: Player;
}

/** Creates a new player profile. Any authenticated user may do this. */
export async function createPlayerApi(
  accessToken: string,
  input: CreatePlayerInput,
): Promise<CreatePlayerResult | PlayersFailure> {
  const result = await apiFetch<ApiPlayer>("/api/players", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(input),
  });

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true, player: mapApiPlayer(result.data) };
}
