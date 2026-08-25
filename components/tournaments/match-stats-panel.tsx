"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { getPlayerMatchStatsApi, getTeamMatchStatsApi } from "@/lib/tournament-stats-api";
import type { MatchWithTeams, PlayerMatchStat, TeamMatchStat } from "@/lib/tournament-types";
import { PlayerStatFormModal } from "./player-stat-form-modal";
import { TeamStatFormModal } from "./team-stat-form-modal";

interface MatchStatsPanelProps {
  readonly tournamentId: string;
  readonly match: MatchWithTeams;
  readonly canManage: boolean;
}

/** Recorded team and player stat lines for a match, with organizer entry forms. */
export function MatchStatsPanel({ tournamentId, match, canManage }: MatchStatsPanelProps) {
  const [teamStats, setTeamStats] = useState<readonly TeamMatchStat[]>([]);
  const [playerStats, setPlayerStats] = useState<readonly PlayerMatchStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamFormOpen, setTeamFormOpen] = useState(false);
  const [playerFormOpen, setPlayerFormOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      getTeamMatchStatsApi(tournamentId, match.id),
      getPlayerMatchStatsApi(tournamentId, match.id),
    ]).then(([teamResult, playerResult]) => {
      if (cancelled) return;
      setIsLoading(false);
      if (teamResult.ok) setTeamStats(teamResult.stats);
      if (playerResult.ok) setPlayerStats(playerResult.stats);
    });

    return () => {
      cancelled = true;
    };
  }, [tournamentId, match.id]);

  function teamName(teamId: string): string {
    if (teamId === match.homeTeam.id) return match.homeTeam.name;
    if (teamId === match.awayTeam.id) return match.awayTeam.name;
    return teamId;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner className="size-5" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-medium uppercase tracking-label text-muted">Thống kê đội bóng</h5>
          {canManage ? (
            <button
              type="button"
              onClick={() => setTeamFormOpen(true)}
              className="text-xs font-medium uppercase tracking-label text-foreground underline-offset-4 hover:cursor-pointer hover:underline"
            >
              + Nhập thống kê
            </button>
          ) : null}
        </div>
        {teamStats.length === 0 ? (
          <p className="text-sm text-muted">Chưa có thống kê đội bóng.</p>
        ) : (
          <div className="overflow-x-auto rounded-card border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-label text-muted">
                <tr>
                  <th className="px-3 py-2">Đội</th>
                  <th className="px-3 py-2 text-center">Dứt điểm</th>
                  <th className="px-3 py-2 text-center">Trúng đích</th>
                  <th className="px-3 py-2 text-center">Chuyền bóng</th>
                  <th className="px-3 py-2 text-center">Phạm lỗi</th>
                  <th className="px-3 py-2 text-center">🟨</th>
                  <th className="px-3 py-2 text-center">🟥</th>
                </tr>
              </thead>
              <tbody>
                {teamStats.map((stat) => (
                  <tr key={stat.teamId} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2 font-medium text-foreground">{teamName(stat.teamId)}</td>
                    <td className="px-3 py-2 text-center">{stat.shots}</td>
                    <td className="px-3 py-2 text-center">{stat.shotsOnTarget}</td>
                    <td className="px-3 py-2 text-center">
                      {stat.passesCompleted}/{stat.passes}
                    </td>
                    <td className="px-3 py-2 text-center">{stat.fouls}</td>
                    <td className="px-3 py-2 text-center">{stat.yellowCards}</td>
                    <td className="px-3 py-2 text-center">{stat.redCards}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-medium uppercase tracking-label text-muted">Thống kê cầu thủ</h5>
          {canManage ? (
            <button
              type="button"
              onClick={() => setPlayerFormOpen(true)}
              className="text-xs font-medium uppercase tracking-label text-foreground underline-offset-4 hover:cursor-pointer hover:underline"
            >
              + Nhập thống kê
            </button>
          ) : null}
        </div>
        {playerStats.length === 0 ? (
          <p className="text-sm text-muted">Chưa có thống kê cầu thủ.</p>
        ) : (
          <div className="overflow-x-auto rounded-card border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-label text-muted">
                <tr>
                  <th className="px-3 py-2">Cầu thủ</th>
                  <th className="px-3 py-2">Đội</th>
                  <th className="px-3 py-2 text-center">Bàn thắng</th>
                  <th className="px-3 py-2 text-center">Kiến tạo</th>
                  <th className="px-3 py-2 text-center">🟨</th>
                  <th className="px-3 py-2 text-center">🟥</th>
                  <th className="px-3 py-2 text-center">Điểm</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.map((stat) => (
                  <tr key={stat.playerId} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2 font-medium text-foreground">
                      {stat.player?.name ?? stat.playerId}
                    </td>
                    <td className="px-3 py-2">{teamName(stat.teamId)}</td>
                    <td className="px-3 py-2 text-center">{stat.goals}</td>
                    <td className="px-3 py-2 text-center">{stat.assists}</td>
                    <td className="px-3 py-2 text-center">{stat.yellowCards}</td>
                    <td className="px-3 py-2 text-center">{stat.redCards}</td>
                    <td className="px-3 py-2 text-center">{stat.rating ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TeamStatFormModal
        tournamentId={tournamentId}
        match={match}
        isOpen={teamFormOpen}
        onClose={() => setTeamFormOpen(false)}
        onSaved={(stat) =>
          setTeamStats((current) => {
            const exists = current.some((entry) => entry.teamId === stat.teamId);
            return exists
              ? current.map((entry) => (entry.teamId === stat.teamId ? stat : entry))
              : [...current, stat];
          })
        }
      />
      <PlayerStatFormModal
        tournamentId={tournamentId}
        match={match}
        isOpen={playerFormOpen}
        onClose={() => setPlayerFormOpen(false)}
        onSaved={(stat) =>
          setPlayerStats((current) => {
            const exists = current.some((entry) => entry.playerId === stat.playerId);
            return exists
              ? current.map((entry) => (entry.playerId === stat.playerId ? stat : entry))
              : [...current, stat];
          })
        }
      />
    </div>
  );
}
