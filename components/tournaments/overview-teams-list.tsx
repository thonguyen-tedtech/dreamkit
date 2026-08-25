"use client";

import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { useTournamentData } from "./tournament-data-context";

/** Compact list of teams registered in the tournament, shown in the overview's intro section. */
export function OverviewTeamsList() {
  const { teams, isLoadingTeams } = useTournamentData();

  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-label text-muted">
        Đội tham dự{teams.length > 0 ? ` (${teams.length})` : ""}
      </h3>

      {isLoadingTeams ? (
        <div className="mt-3 flex justify-start">
          <Spinner className="size-5" />
        </div>
      ) : teams.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Chưa có đội bóng đăng ký.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {teams.map((team) => (
            <li key={team.id} className="flex items-center gap-2 text-sm text-foreground">
              <div className="relative size-6 shrink-0 overflow-hidden rounded-full border border-border bg-background">
                {team.logo ? (
                  <Image src={team.logo} alt="" fill sizes="24px" className="object-contain" />
                ) : null}
              </div>
              {team.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
