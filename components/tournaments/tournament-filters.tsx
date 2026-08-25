import { TOURNAMENT_FORMAT_LABEL, TOURNAMENT_STATUS_LABEL } from "@/lib/tournament-format";
import type { TournamentFormat, TournamentStatus } from "@/lib/tournament-types";
import { FILTER_SELECT_CLASS } from "./field";

const FORMAT_OPTIONS = Object.keys(TOURNAMENT_FORMAT_LABEL) as TournamentFormat[];
const STATUS_OPTIONS = Object.keys(TOURNAMENT_STATUS_LABEL) as TournamentStatus[];

interface TournamentFiltersProps {
  readonly format: TournamentFormat | "";
  readonly status: TournamentStatus | "";
  readonly onFormatChange: (format: TournamentFormat | "") => void;
  readonly onStatusChange: (status: TournamentStatus | "") => void;
}

/** Format/status filter controls for the tournament browsing list, highlighted in a single row. */
export function TournamentFilters({
  format,
  status,
  onFormatChange,
  onStatusChange,
}: TournamentFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-card border border-highlight/40 bg-surface-strong p-3 sm:flex-nowrap">
      <select
        aria-label="Lọc theo thể thức"
        value={format}
        onChange={(event) => onFormatChange(event.target.value as TournamentFormat | "")}
        className={`${FILTER_SELECT_CLASS} w-full sm:w-auto sm:min-w-[180px] sm:shrink-0`}
      >
        <option value="">Mọi thể thức</option>
        {FORMAT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {TOURNAMENT_FORMAT_LABEL[option]}
          </option>
        ))}
      </select>

      <select
        aria-label="Lọc theo trạng thái"
        value={status}
        onChange={(event) => onStatusChange(event.target.value as TournamentStatus | "")}
        className={`${FILTER_SELECT_CLASS} w-full sm:w-auto sm:min-w-[180px] sm:shrink-0`}
      >
        <option value="">Mọi trạng thái</option>
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {TOURNAMENT_STATUS_LABEL[option]}
          </option>
        ))}
      </select>
    </div>
  );
}
