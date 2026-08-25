"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { listRosterApi, removeRosterMemberApi } from "@/lib/tournament-teams-api";
import { TEAM_MEMBER_ROLE_LABEL } from "@/lib/tournament-format";
import type { TeamMember } from "@/lib/tournament-types";
import { RosterMemberFormModal } from "./roster-member-form-modal";

interface TeamRosterPanelProps {
  readonly teamId: string;
  readonly canManage: boolean;
}

/** A team's active roster: players/staff with role and jersey number. */
export function TeamRosterPanel({ teamId, canManage }: TeamRosterPanelProps) {
  const { accessToken } = useAdminAuth();
  const { showToast } = useToast();
  const [members, setMembers] = useState<readonly TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalTarget, setModalTarget] = useState<"create" | TeamMember | null>(null);

  const loadRoster = useCallback(async () => {
    setIsLoading(true);
    const result = await listRosterApi(teamId);
    setIsLoading(false);
    if (result.ok) setMembers(result.members);
  }, [teamId]);

  useEffect(() => {
    void loadRoster();
  }, [loadRoster]);

  async function handleRemove(member: TeamMember) {
    if (!accessToken) return;
    const name = member.player?.name ?? "thành viên này";
    if (!window.confirm(`Xóa ${name} khỏi đội hình?`)) return;

    const result = await removeRosterMemberApi(accessToken, teamId, member.id);
    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }
    setMembers((current) => current.filter((entry) => entry.id !== member.id));
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium uppercase tracking-label text-muted">Đội hình</h4>
        {canManage ? (
          <button
            type="button"
            onClick={() => setModalTarget("create")}
            className="text-xs font-medium uppercase tracking-label text-foreground underline-offset-4 hover:cursor-pointer hover:underline"
          >
            + Thêm thành viên
          </button>
        ) : null}
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-muted">Chưa có thành viên nào trong đội hình.</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase tracking-label text-muted">
              <tr>
                <th className="px-3 py-2">Cầu thủ</th>
                <th className="px-3 py-2">Vai trò</th>
                <th className="px-3 py-2 text-center">Số áo</th>
                {canManage ? <th className="px-3 py-2">Thao tác</th> : null}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 font-medium text-foreground">
                    {member.player?.name ?? member.playerId}
                  </td>
                  <td className="px-3 py-2">{TEAM_MEMBER_ROLE_LABEL[member.role]}</td>
                  <td className="px-3 py-2 text-center">{member.jerseyNumber ?? "—"}</td>
                  {canManage ? (
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setModalTarget(member)}
                          className="text-xs text-muted hover:cursor-pointer hover:text-foreground"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRemove(member)}
                          className="text-xs text-muted hover:cursor-pointer hover:text-foreground"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RosterMemberFormModal
        teamId={teamId}
        member={modalTarget !== "create" ? (modalTarget ?? undefined) : undefined}
        isOpen={modalTarget !== null}
        onClose={() => setModalTarget(null)}
        onSaved={() => void loadRoster()}
      />
    </div>
  );
}
