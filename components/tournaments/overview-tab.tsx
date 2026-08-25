import { formatTournamentDate } from "@/lib/tournament-format";
import type { Tournament } from "@/lib/tournament-types";
import { OverviewHighlights } from "./overview-highlights";
import { OverviewTeamsList } from "./overview-teams-list";

interface OverviewTabProps {
  readonly tournament: Tournament;
}

/** Read-only summary of a tournament's schedule, rules, description and headline stats. */
export function OverviewTab({ tournament }: OverviewTabProps) {
  const { pointsRule, matchRules, registrationRules } = tournament;

  return (
    <div className="flex flex-col gap-6">
      <OverviewHighlights tournamentId={tournament.id} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="flex flex-col gap-4 rounded-card border border-border p-6">
          <h2 className="font-display text-xl text-foreground">Giới thiệu</h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            {tournament.description || "Chưa có mô tả cho giải đấu này."}
          </p>

          <OverviewTeamsList />
        </section>

        <section className="flex flex-col gap-5">
          <InfoCard title="Thời gian">
            <InfoRow label="Khai mạc" value={formatTournamentDate(tournament.startDate)} />
            <InfoRow label="Kết thúc" value={formatTournamentDate(tournament.endDate)} />
          </InfoCard>

          <InfoCard title="Địa điểm">
            <InfoRow label="Khu vực" value={tournament.location ?? "—"} />
            <InfoRow label="Sân thi đấu" value={tournament.venue ?? "—"} />
          </InfoCard>

          {pointsRule ? (
            <InfoCard title="Điểm số">
              <InfoRow label="Thắng" value={String(pointsRule.win)} />
              <InfoRow label="Hòa" value={String(pointsRule.draw)} />
              <InfoRow label="Thua" value={String(pointsRule.loss)} />
            </InfoCard>
          ) : null}

          {matchRules ? (
            <InfoCard title="Luật trận đấu">
              <InfoRow label="Thời gian thi đấu" value={`${matchRules.matchDuration} phút`} />
              <InfoRow label="Hiệp phụ" value={matchRules.extraTime ? "Có" : "Không"} />
              <InfoRow label="Luân lưu 11m" value={matchRules.penaltyShootout ? "Có" : "Không"} />
            </InfoCard>
          ) : null}

          {registrationRules ? (
            <InfoCard title="Đăng ký">
              <InfoRow label="Số đội tối đa" value={registrationRules.maxTeams?.toString() ?? "Không giới hạn"} />
              <InfoRow
                label="Cầu thủ tối đa/đội"
                value={registrationRules.maxPlayersPerTeam?.toString() ?? "Không giới hạn"}
              />
            </InfoCard>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border p-5">
      <h3 className="text-xs font-medium uppercase tracking-label text-muted">{title}</h3>
      <dl className="mt-3 flex flex-col gap-2">{children}</dl>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
