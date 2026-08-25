import { apiFetch } from "./api-client";
import type {
  Group,
  KnockoutRound,
  Stage,
  StageConfiguration,
  StageQualification,
  StageType,
} from "./tournament-types";

interface ApiStage {
  readonly _id: string;
  readonly tournamentId: string;
  readonly name: string;
  readonly type: string;
  readonly order: number;
  readonly knockoutRound?: string;
  readonly configuration?: StageConfiguration;
  readonly qualification?: StageQualification;
  readonly isActive?: boolean;
}

interface ApiGroup {
  readonly _id: string;
  readonly tournamentId: string;
  readonly stageId: string;
  readonly name: string;
  readonly code: string;
  readonly order: number;
}

function mapApiStage(api: ApiStage): Stage {
  return {
    id: api._id,
    tournamentId: api.tournamentId,
    name: api.name,
    type: api.type as StageType,
    order: api.order,
    knockoutRound: api.knockoutRound as KnockoutRound | undefined,
    configuration: api.configuration,
    qualification: api.qualification,
    isActive: api.isActive,
  };
}

function mapApiGroup(api: ApiGroup): Group {
  return {
    id: api._id,
    stageId: api.stageId,
    name: api.name,
    code: api.code,
    order: api.order,
  };
}

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export interface StageResult {
  readonly ok: true;
  readonly stage: Stage;
}

export interface StagesFailure {
  readonly ok: false;
  readonly status: number;
  readonly message: string;
}

/** Lists a tournament's stages, in play order. Public. */
export async function listStagesApi(
  tournamentId: string,
): Promise<{ ok: true; stages: readonly Stage[] } | StagesFailure> {
  const result = await apiFetch<readonly ApiStage[]>(
    `/api/tournaments/${tournamentId}/stages`,
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, stages: result.data.map(mapApiStage) };
}

export interface StageInput {
  readonly name: string;
  readonly type: StageType;
  readonly order: number;
  readonly knockoutRound?: KnockoutRound;
  readonly configuration?: StageConfiguration;
  readonly qualification?: StageQualification;
}

/** Adds a stage to a tournament. Organizer or admin only. */
export async function createStageApi(
  accessToken: string,
  tournamentId: string,
  input: StageInput,
): Promise<StageResult | StagesFailure> {
  const result = await apiFetch<ApiStage>(`/api/tournaments/${tournamentId}/stages`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
  });
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, stage: mapApiStage(result.data) };
}

/** Updates a stage. Organizer or admin only. */
export async function updateStageApi(
  accessToken: string,
  tournamentId: string,
  stageId: string,
  input: Partial<StageInput> & { readonly isActive?: boolean },
): Promise<StageResult | StagesFailure> {
  const result = await apiFetch<ApiStage>(
    `/api/tournaments/${tournamentId}/stages/${stageId}`,
    { method: "PATCH", headers: authHeaders(accessToken), body: JSON.stringify(input) },
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, stage: mapApiStage(result.data) };
}

/** Removes a stage. Organizer or admin only. */
export async function deleteStageApi(
  accessToken: string,
  tournamentId: string,
  stageId: string,
): Promise<{ ok: true } | StagesFailure> {
  const result = await apiFetch<undefined>(
    `/api/tournaments/${tournamentId}/stages/${stageId}`,
    { method: "DELETE", headers: authHeaders(accessToken) },
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true };
}

export interface GroupResult {
  readonly ok: true;
  readonly group: Group;
}

/** Lists a stage's groups, in play order. Public. */
export async function listGroupsApi(
  tournamentId: string,
  stageId: string,
): Promise<{ ok: true; groups: readonly Group[] } | StagesFailure> {
  const result = await apiFetch<readonly ApiGroup[]>(
    `/api/tournaments/${tournamentId}/stages/${stageId}/groups`,
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, groups: result.data.map(mapApiGroup) };
}

export interface GroupInput {
  readonly name: string;
  readonly code: string;
  readonly order: number;
}

/** Adds a group to a stage. Organizer or admin only. */
export async function createGroupApi(
  accessToken: string,
  tournamentId: string,
  stageId: string,
  input: GroupInput,
): Promise<GroupResult | StagesFailure> {
  const result = await apiFetch<ApiGroup>(
    `/api/tournaments/${tournamentId}/stages/${stageId}/groups`,
    { method: "POST", headers: authHeaders(accessToken), body: JSON.stringify(input) },
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, group: mapApiGroup(result.data) };
}

/** Updates a group. Organizer or admin only. */
export async function updateGroupApi(
  accessToken: string,
  tournamentId: string,
  stageId: string,
  groupId: string,
  input: Partial<GroupInput>,
): Promise<GroupResult | StagesFailure> {
  const result = await apiFetch<ApiGroup>(
    `/api/tournaments/${tournamentId}/stages/${stageId}/groups/${groupId}`,
    { method: "PATCH", headers: authHeaders(accessToken), body: JSON.stringify(input) },
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, group: mapApiGroup(result.data) };
}

/** Removes a group. Organizer or admin only. */
export async function deleteGroupApi(
  accessToken: string,
  tournamentId: string,
  stageId: string,
  groupId: string,
): Promise<{ ok: true } | StagesFailure> {
  const result = await apiFetch<undefined>(
    `/api/tournaments/${tournamentId}/stages/${stageId}/groups/${groupId}`,
    { method: "DELETE", headers: authHeaders(accessToken) },
  );
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true };
}
