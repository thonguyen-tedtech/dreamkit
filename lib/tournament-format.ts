/** Vietnamese display labels and formatting helpers for the tournament feature. */
import type {
  KnockoutRound,
  MatchEventType,
  MatchPeriod,
  MatchStatus,
  PlayerPosition,
  ScoreBreakdown,
  StageType,
  TeamMemberRole,
  TournamentFormat,
  TournamentStatus,
} from "./tournament-types";

export const TOURNAMENT_FORMAT_LABEL: Record<TournamentFormat, string> = {
  ROUND_ROBIN: "Vòng tròn",
  KNOCKOUT: "Loại trực tiếp",
  GROUP_KNOCKOUT: "Vòng bảng + Loại trực tiếp",
};

export const TOURNAMENT_STATUS_LABEL: Record<TournamentStatus, string> = {
  DRAFT: "Bản nháp",
  REGISTRATION: "Đang mở đăng ký",
  UPCOMING: "Sắp diễn ra",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã kết thúc",
  CANCELLED: "Đã hủy",
};

/** Badge colour tone per tournament status, mapped to Tailwind utility fragments. */
export const TOURNAMENT_STATUS_TONE: Record<TournamentStatus, string> = {
  DRAFT: "bg-surface-strong text-muted",
  REGISTRATION: "bg-highlight/15 text-highlight",
  UPCOMING: "bg-highlight/15 text-highlight",
  ONGOING: "bg-accent text-accent-foreground",
  COMPLETED: "bg-surface-strong text-foreground",
  CANCELLED: "bg-red-100 text-red-700",
};

export const STAGE_TYPE_LABEL: Record<StageType, string> = {
  LEAGUE: "Vòng tròn",
  GROUP: "Vòng bảng",
  KNOCKOUT: "Loại trực tiếp",
};

export const KNOCKOUT_ROUND_LABEL: Record<KnockoutRound, string> = {
  ROUND_OF_64: "Vòng 1/32",
  ROUND_OF_32: "Vòng 1/16",
  ROUND_OF_16: "Vòng 1/8",
  QUARTER_FINAL: "Tứ kết",
  SEMI_FINAL: "Bán kết",
  THIRD_PLACE: "Tranh hạng 3",
  FINAL: "Chung kết",
};

export const MATCH_STATUS_LABEL: Record<MatchStatus, string> = {
  SCHEDULED: "Chưa đá",
  FINISHED: "Đã kết thúc",
  POSTPONED: "Hoãn",
  CANCELLED: "Hủy",
};

export const MATCH_STATUS_TONE: Record<MatchStatus, string> = {
  SCHEDULED: "bg-surface-strong text-muted",
  FINISHED: "bg-accent text-accent-foreground",
  POSTPONED: "bg-highlight/15 text-highlight",
  CANCELLED: "bg-red-100 text-red-700",
};

export const MATCH_EVENT_LABEL: Record<MatchEventType, string> = {
  GOAL: "Bàn thắng",
  OWN_GOAL: "Phản lưới nhà",
  PENALTY_SCORED: "Phạt đền thành công",
  PENALTY_MISSED: "Phạt đền hỏng",
  YELLOW_CARD: "Thẻ vàng",
  SECOND_YELLOW: "Thẻ vàng thứ 2",
  RED_CARD: "Thẻ đỏ",
  SUBSTITUTION: "Thay người",
  VAR: "VAR",
};

export const MATCH_EVENT_ICON: Record<MatchEventType, string> = {
  GOAL: "⚽",
  OWN_GOAL: "⚽",
  PENALTY_SCORED: "🎯",
  PENALTY_MISSED: "❌",
  YELLOW_CARD: "🟨",
  SECOND_YELLOW: "🟨🟥",
  RED_CARD: "🟥",
  SUBSTITUTION: "🔄",
  VAR: "📺",
};

export const MATCH_PERIOD_LABEL: Record<MatchPeriod, string> = {
  FIRST_HALF: "Hiệp 1",
  SECOND_HALF: "Hiệp 2",
  EXTRA_TIME_FIRST_HALF: "Hiệp phụ 1",
  EXTRA_TIME_SECOND_HALF: "Hiệp phụ 2",
  PENALTY_SHOOTOUT: "Luân lưu",
};

export const TEAM_MEMBER_ROLE_LABEL: Record<TeamMemberRole, string> = {
  PLAYER: "Cầu thủ",
  COACH: "HLV trưởng",
  ASSISTANT_COACH: "HLV phó",
  MANAGER: "Quản lý",
  STAFF: "Nhân sự",
};

export const PLAYER_POSITION_LABEL: Record<PlayerPosition, string> = {
  GK: "Thủ môn",
  CB: "Trung vệ",
  LB: "Hậu vệ trái",
  RB: "Hậu vệ phải",
  CDM: "Tiền vệ phòng ngự",
  CM: "Tiền vệ trung tâm",
  CAM: "Tiền vệ tấn công",
  LM: "Tiền vệ trái",
  RM: "Tiền vệ phải",
  LW: "Tiền đạo cánh trái",
  RW: "Tiền đạo cánh phải",
  ST: "Tiền đạo cắm",
  CF: "Tiền đạo trung tâm",
};

/** Formats an ISO date string as a short Vietnamese date, e.g. "24 thg 8, 2026". */
export function formatTournamentDate(iso: string | undefined): string {
  if (!iso) return "Chưa xác định";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Chưa xác định";
  return date.toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" });
}

/** Formats an ISO date-time string as a short Vietnamese date + time, e.g. "24 thg 8, 18:00". */
export function formatTournamentDateTime(iso: string | undefined): string {
  if (!iso) return "Chưa xếp lịch";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Chưa xếp lịch";
  return date.toLocaleString("vi-VN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Total goals for a score breakdown (regulation + extra time); penalties are shown separately. */
export function scoreTotal(score: ScoreBreakdown | undefined): number {
  if (!score) return 0;
  return score.regular + (score.extraTime ?? 0);
}

/** Renders "2 - 1" for a finished match, with a penalties suffix when applicable, or "—" otherwise. */
export function formatMatchScoreLine(
  homeScore: ScoreBreakdown | undefined,
  awayScore: ScoreBreakdown | undefined,
): string {
  if (!homeScore || !awayScore) return "—";
  const base = `${scoreTotal(homeScore)} - ${scoreTotal(awayScore)}`;
  const hasPenalties = (homeScore.penalties ?? 0) > 0 || (awayScore.penalties ?? 0) > 0;
  return hasPenalties
    ? `${base} (pen. ${homeScore.penalties ?? 0} - ${awayScore.penalties ?? 0})`
    : base;
}
