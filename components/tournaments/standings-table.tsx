import Image from "next/image";
import type { StandingsTable as StandingsTableData } from "@/lib/tournament-stats-api";

interface StandingsTableProps {
  readonly tables: readonly StandingsTableData[];
}

/** Renders one or more (per-group) standings tables. */
export function StandingsTable({ tables }: StandingsTableProps) {
  if (tables.every((table) => table.rows.length === 0)) {
    return <p className="text-sm text-muted">Chưa có dữ liệu bảng xếp hạng.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {tables.map((table) => (
        <div key={table.group?.id ?? "overall"} className="overflow-hidden rounded-card border border-border">
          {table.group ? (
            <div className="border-b border-border bg-surface px-4 py-2 text-xs font-medium uppercase tracking-label text-muted">
              {table.group.name}
            </div>
          ) : null}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-label text-muted">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Đội</th>
                  <th className="px-3 py-2 text-center">Trận</th>
                  <th className="px-3 py-2 text-center">Thắng</th>
                  <th className="px-3 py-2 text-center">Hòa</th>
                  <th className="px-3 py-2 text-center">Thua</th>
                  <th className="px-3 py-2 text-center">Hiệu số</th>
                  <th className="px-3 py-2 text-center">Điểm</th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, index) => (
                  <tr key={row.team.id} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2 text-muted">{index + 1}</td>
                    <td className="px-3 py-2 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="relative size-6 shrink-0 overflow-hidden rounded-full border border-border bg-background">
                          {row.team.logo ? (
                            <Image
                              src={row.team.logo}
                              alt=""
                              fill
                              sizes="24px"
                              className="object-contain"
                            />
                          ) : null}
                        </div>
                        {row.team.name}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">{row.played}</td>
                    <td className="px-3 py-2 text-center">{row.won}</td>
                    <td className="px-3 py-2 text-center">{row.drawn}</td>
                    <td className="px-3 py-2 text-center">{row.lost}</td>
                    <td className="px-3 py-2 text-center">
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </td>
                    <td className="px-3 py-2 text-center font-semibold text-foreground">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
