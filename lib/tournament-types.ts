/**
 * Domain types for the Tournament feature (tournaments, stages, groups, teams,
 * rosters, matches, match events and statistics).
 *
 * The API's Swagger docs only publish request DTOs — list/detail responses
 * aren't typed there. These "Api*" shapes are the pragmatic Mongoose-flavoured
 * read model (`_id`, refs that may arrive as a bare id string or a populated
 * object) that mirrors how the rest of this codebase's API layer already
 * handles that ambiguity (see `ApiOrder`/`ApiOrderProductRef` in orders-api.ts).
 * The "clean" types below (without the `Api` prefix) are what components use.
 */

/** Overall competition format for a tournament. */
export type TournamentFormat = "ROUND_ROBIN" | "KNOCKOUT" | "GROUP_KNOCKOUT";

/** Lifecycle status of a tournament. */
export type TournamentStatus =
  | "DRAFT"
  | "REGISTRATION"
  | "UPCOMING"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

/** How a single stage within a tournament is played. */
export type StageType = "LEAGUE" | "GROUP" | "KNOCKOUT";

/** Named knockout round, used to label bracket stages. */
export type KnockoutRound =
  | "ROUND_OF_64"
  | "ROUND_OF_32"
  | "ROUND_OF_16"
  | "QUARTER_FINAL"
  | "SEMI_FINAL"
  | "THIRD_PLACE"
  | "FINAL";

/** Lifecycle status of a single match. */
export type MatchStatus = "SCHEDULED" | "FINISHED" | "POSTPONED" | "CANCELLED";

/** Kind of in-match event recorded on the timeline. */
export type MatchEventType =
  | "GOAL"
  | "OWN_GOAL"
  | "PENALTY_SCORED"
  | "PENALTY_MISSED"
  | "YELLOW_CARD"
  | "SECOND_YELLOW"
  | "RED_CARD"
  | "SUBSTITUTION"
  | "VAR";

/** Match period an event occurred in. */
export type MatchPeriod =
  | "FIRST_HALF"
  | "SECOND_HALF"
  | "EXTRA_TIME_FIRST_HALF"
  | "EXTRA_TIME_SECOND_HALF"
  | "PENALTY_SHOOTOUT";

/** Role of a person on a team's roster. */
export type TeamMemberRole = "PLAYER" | "COACH" | "ASSISTANT_COACH" | "MANAGER" | "STAFF";

/** Playing position for a player profile. */
export type PlayerPosition =
  | "GK"
  | "CB"
  | "LB"
  | "RB"
  | "CDM"
  | "CM"
  | "CAM"
  | "LM"
  | "RM"
  | "LW"
  | "RW"
  | "ST"
  | "CF";

export type PreferredFoot = "LEFT" | "RIGHT" | "BOTH";

/** Points awarded per result under this tournament's standings. */
export interface PointsRule {
  readonly win: number;
  readonly draw: number;
  readonly loss: number;
}

export interface MatchRules {
  readonly matchDuration: number;
  readonly extraTime: boolean;
  readonly penaltyShootout: boolean;
}

export interface RegistrationRules {
  readonly maxTeams?: number;
  readonly maxPlayersPerTeam?: number;
}

export interface Tournament {
  readonly id: string;
  readonly name: string;
  readonly slug?: string;
  readonly description?: string;
  readonly logo?: string;
  readonly format: TournamentFormat;
  readonly status: TournamentStatus;
  readonly startDate: string;
  readonly endDate?: string;
  readonly location?: string;
  readonly venue?: string;
  readonly pointsRule?: PointsRule;
  readonly rankingRules?: readonly string[];
  readonly matchRules?: MatchRules;
  readonly registrationRules?: RegistrationRules;
  readonly isPublic: boolean;
  /** Id of the user who created (and manages) this tournament. */
  readonly organizerId?: string;
  readonly createdAt?: string;
}

export interface StageConfiguration {
  readonly numberOfGroups?: number;
  readonly teamsPerGroup?: number;
  readonly legs?: number;
}

export interface StageQualification {
  readonly qualifiedTeamsPerGroup?: number;
  readonly totalQualifiedTeams?: number;
}

export interface Stage {
  readonly id: string;
  readonly tournamentId: string;
  readonly name: string;
  readonly type: StageType;
  readonly order: number;
  readonly knockoutRound?: KnockoutRound;
  readonly configuration?: StageConfiguration;
  readonly qualification?: StageQualification;
  readonly isActive?: boolean;
}

export interface Group {
  readonly id: string;
  readonly stageId: string;
  readonly name: string;
  readonly code: string;
  readonly order: number;
}

export interface Team {
  readonly id: string;
  readonly tournamentId: string;
  readonly name: string;
  readonly shortName?: string;
  readonly slug?: string;
  readonly logo?: string;
  readonly description?: string;
  readonly groupId?: string;
  readonly seed?: number;
}

/** Reusable player profile (shared across tournaments), used for rosters/events/stats. */
export interface Player {
  readonly id: string;
  readonly name: string;
  readonly slug?: string;
  readonly avatar?: string;
  readonly nationality?: string;
  readonly position?: PlayerPosition;
  readonly preferredFoot?: PreferredFoot;
}

export interface TeamMember {
  readonly id: string;
  readonly teamId: string;
  readonly playerId: string;
  /** Populated player profile — only present when the endpoint populates it (roster list does; add/update/get-one don't). */
  readonly player?: Player;
  readonly role: TeamMemberRole;
  readonly jerseyNumber?: number;
  readonly isActive?: boolean;
}

export interface ScoreBreakdown {
  readonly regular: number;
  readonly extraTime?: number;
  readonly penalties?: number;
}

/** Lightweight team reference embedded in matches/standings. */
export interface TeamRef {
  readonly id: string;
  readonly name: string;
  readonly shortName?: string;
  readonly logo?: string;
}

export interface Match {
  readonly id: string;
  readonly tournamentId: string;
  readonly stageId: string;
  readonly groupId?: string;
  readonly round?: number;
  /** The API never populates these — just the raw team ids. */
  readonly homeTeamId: string;
  readonly awayTeamId: string;
  readonly homeScore?: ScoreBreakdown;
  readonly awayScore?: ScoreBreakdown;
  readonly status: MatchStatus;
  readonly scheduledAt?: string;
  readonly venue?: string;
  readonly referee?: string;
  readonly attendance?: number;
  readonly notes?: string;
}

/** A `Match` with its team ids resolved to display refs (name/logo) — built client-side. */
export interface MatchWithTeams extends Match {
  readonly homeTeam: TeamRef;
  readonly awayTeam: TeamRef;
}

export interface MatchEvent {
  readonly id: string;
  readonly matchId: string;
  readonly teamId: string;
  readonly type: MatchEventType;
  readonly period: MatchPeriod;
  readonly minute: number;
  readonly addedMinute?: number;
  readonly playerId?: string;
  readonly player?: Player;
  readonly relatedPlayerId?: string;
  readonly relatedPlayer?: Player;
  readonly notes?: string;
}

export interface PlayerMatchStat {
  readonly playerId: string;
  readonly player?: Player;
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

export interface TeamMatchStat {
  readonly teamId: string;
  readonly shots: number;
  readonly shotsOnTarget: number;
  readonly passes: number;
  readonly passesCompleted: number;
  readonly fouls: number;
  readonly yellowCards: number;
  readonly redCards: number;
}

/** One row of a stage/group standings table. */
export interface StandingRow {
  readonly team: TeamRef;
  readonly groupId?: string;
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly goalDifference: number;
  readonly points: number;
}

/** One row of the tournament's player statistics leaderboard. Aggregated across all of the player's recorded match stats — the API has no team info here. */
export interface LeaderboardEntry {
  readonly player: Player;
  readonly matchesPlayed: number;
  readonly goals: number;
  readonly assists: number;
  readonly yellowCards: number;
  readonly redCards: number;
  readonly rating?: number;
}

export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
}

export interface Paginated<T> {
  readonly data: readonly T[];
  readonly meta: PaginationMeta;
}
