"use client";

import { useState } from "react";
import Image from "next/image";
import { MATCH_STATUS_LABEL, MATCH_STATUS_TONE, formatMatchScoreLine, formatTournamentDateTime } from "@/lib/tournament-format";
import type { Match, MatchWithTeams, TeamRef } from "@/lib/tournament-types";
import { Badge } from "./badge";
import { MatchEventsPanel } from "./match-events-panel";
import { MatchStatsPanel } from "./match-stats-panel";
import { OrganizerMatchControls } from "./organizer-match-controls";

interface MatchRowProps {
  readonly tournamentId: string;
  readonly match: MatchWithTeams;
  readonly canManage: boolean;
  readonly onUpdated: (match: Match) => void;
}

/** One match's summary row, expandable into schedule/result controls, events and stats. */
export function MatchRow({ tournamentId, match, canManage, onUpdated }: MatchRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-card border border-border">
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        className="flex w-full flex-wrap items-center gap-3 p-4 text-left hover:cursor-pointer"
      >
        <Badge label={MATCH_STATUS_LABEL[match.status]} tone={MATCH_STATUS_TONE[match.status]} className="w-32 justify-center" />

        <div className="flex flex-1 items-center justify-center gap-3 text-center">
          <span className="flex flex-1 items-center justify-end gap-2 text-right font-medium text-foreground whitespace-nowrap">
            {match.homeTeam.name}
            <TeamLogo team={match.homeTeam} />
          </span>
          <span className="rounded-card bg-surface-strong px-3 py-1 font-display text-lg text-foreground">
            {formatMatchScoreLine(match.homeScore, match.awayScore)}
          </span>
          <span className="flex flex-1 items-center justify-start gap-2 text-left font-medium text-foreground whitespace-nowrap">
            <TeamLogo team={match.awayTeam} />
            {match.awayTeam.name}
          </span>
        </div>

        <span className="w-40 shrink-0 text-right text-xs text-muted">
          {formatTournamentDateTime(match.scheduledAt)}
        </span>
      </button>

      {isExpanded ? (
        <div className="flex flex-col gap-6 border-t border-border p-4">
          {canManage ? (
            <OrganizerMatchControls tournamentId={tournamentId} match={match} onUpdated={onUpdated} />
          ) : null}
          <MatchEventsPanel tournamentId={tournamentId} match={match} canManage={canManage} />
          <MatchStatsPanel tournamentId={tournamentId} match={match} canManage={canManage} />
        </div>
      ) : null}
    </div>
  );
}

function TeamLogo({ team }: { team: TeamRef }) {
  return (
    <span className="relative size-6 shrink-0 overflow-hidden rounded-full border border-border bg-background">
      {team.logo ? (
        <Image src={team.logo} alt="" fill sizes="24px" className="object-contain" />
      ) : null}
    </span>
  );
}
