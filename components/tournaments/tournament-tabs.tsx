"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { Tournament } from "@/lib/tournament-types";
import { OverviewTab } from "./overview-tab";
import { StagesTab } from "./stages-tab";
import { TeamsTab } from "./teams-tab";
import { MatchesTab } from "./matches-tab";
import { LeaderboardTab } from "./leaderboard-tab";

const TABS = [
  { key: "overview", label: "Tổng quan", shortLabel: "Tổng quan" },
  { key: "stages", label: "Vòng đấu & Bảng xếp hạng", shortLabel: "Vòng đấu" },
  { key: "teams", label: "Đội bóng", shortLabel: "Đội bóng" },
  { key: "matches", label: "Lịch thi đấu", shortLabel: "Lịch thi đấu" },
  { key: "leaderboard", label: "Cầu thủ nổi bật", shortLabel: "Cầu thủ" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface TournamentTabsProps {
  readonly tournament: Tournament;
  readonly canManage: boolean;
}

/**
 * Tab navigation for a tournament's detail sections.
 *
 * Each tab panel mounts the first time it's opened and then simply stays
 * mounted (hidden via CSS) instead of unmounting — switching tabs never
 * re-triggers that panel's own data fetches, it just toggles visibility.
 */
export function TournamentTabs({ tournament, canManage }: TournamentTabsProps) {
  const [active, setActive] = useState<TabKey>("overview");
  const [visited, setVisited] = useState<ReadonlySet<TabKey>>(() => new Set(["overview"]));

  function handleSelect(key: TabKey) {
    setActive(key);
    setVisited((current) => (current.has(key) ? current : new Set(current).add(key)));
  }

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Nội dung giải đấu" className="overflow-x-auto border-b border-border">
        <ul className="flex min-w-max gap-1">
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            return (
              <li key={tab.key}>
                <button
                  type="button"
                  onClick={() => handleSelect(tab.key)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "border-b-2 px-3 py-3 text-xs font-medium uppercase tracking-label transition-colors hover:cursor-pointer sm:px-4",
                    isActive
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted hover:text-foreground",
                  )}
                >
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {visited.has("overview") ? (
        <div className={active === "overview" ? undefined : "hidden"}>
          <OverviewTab tournament={tournament} />
        </div>
      ) : null}
      {visited.has("stages") ? (
        <div className={active === "stages" ? undefined : "hidden"}>
          <StagesTab tournamentId={tournament.id} canManage={canManage} />
        </div>
      ) : null}
      {visited.has("teams") ? (
        <div className={active === "teams" ? undefined : "hidden"}>
          <TeamsTab tournament={tournament} canManage={canManage} />
        </div>
      ) : null}
      {visited.has("matches") ? (
        <div className={active === "matches" ? undefined : "hidden"}>
          <MatchesTab tournamentId={tournament.id} canManage={canManage} />
        </div>
      ) : null}
      {visited.has("leaderboard") ? (
        <div className={active === "leaderboard" ? undefined : "hidden"}>
          <LeaderboardTab tournamentId={tournament.id} />
        </div>
      ) : null}
    </div>
  );
}
