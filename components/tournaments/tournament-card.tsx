import Image from "next/image";
import Link from "next/link";
import { Badge } from "./badge";
import {
  TOURNAMENT_FORMAT_LABEL,
  TOURNAMENT_STATUS_LABEL,
  TOURNAMENT_STATUS_TONE,
  formatTournamentDate,
} from "@/lib/tournament-format";
import type { Tournament } from "@/lib/tournament-types";

interface TournamentCardProps {
  readonly tournament: Tournament;
  /** Route prefix for the detail link — "/tournaments" (public) or "/admin/tournaments". */
  readonly hrefBase?: string;
}

/** Summary card for a tournament, linking to its detail page. */
export function TournamentCard({ tournament, hrefBase = "/tournaments" }: TournamentCardProps) {
  return (
    <Link
      href={`${hrefBase}/${tournament.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-foreground"
    >
      <div className="relative flex h-32 items-center justify-center border-b border-border bg-background">
        {tournament.logo ? (
          <Image
            src={tournament.logo}
            alt={tournament.name}
            fill
            sizes="320px"
            className="object-contain p-6"
          />
        ) : (
          <span className="font-display text-3xl text-muted">
            {tournament.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            label={TOURNAMENT_STATUS_LABEL[tournament.status]}
            tone={TOURNAMENT_STATUS_TONE[tournament.status]}
          />
          <Badge label={TOURNAMENT_FORMAT_LABEL[tournament.format]} />
        </div>

        <h3 className="font-display text-xl leading-snug text-foreground transition-colors group-hover:text-accent">
          {tournament.name}
        </h3>

        <p className="text-sm text-muted">
          {formatTournamentDate(tournament.startDate)}
          {tournament.endDate ? ` — ${formatTournamentDate(tournament.endDate)}` : ""}
        </p>

        {tournament.location ? (
          <p className="mt-auto text-xs uppercase tracking-label text-muted">
            {tournament.location}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
