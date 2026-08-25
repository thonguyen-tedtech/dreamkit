"use client";

import { useState, type FormEvent } from "react";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { addRosterMemberApi, updateRosterMemberApi } from "@/lib/tournament-teams-api";
import { TEAM_MEMBER_ROLE_LABEL } from "@/lib/tournament-format";
import type { Player, TeamMember, TeamMemberRole } from "@/lib/tournament-types";
import { Field, INPUT_CLASS } from "./field";
import { PlayerPicker } from "./player-picker";

const ROLE_OPTIONS = Object.keys(TEAM_MEMBER_ROLE_LABEL) as TeamMemberRole[];

interface RosterMemberFormModalProps {
  readonly teamId: string;
  /** When provided, the modal edits this roster member instead of adding a new one. */
  readonly member?: TeamMember;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  /** Called after a successful add/edit; the caller refetches (the roster list is the only endpoint that populates player names). */
  readonly onSaved: () => void;
}

/** Modal form to add a player to a team's roster, or edit their role/jersey number. */
export function RosterMemberFormModal({
  teamId,
  member,
  isOpen,
  onClose,
  onSaved,
}: RosterMemberFormModalProps) {
  const { accessToken } = useAdminAuth();
  const { showToast } = useToast();
  const isEditing = Boolean(member);

  const [player, setPlayer] = useState<Player | null>(member?.player ?? null);
  const [role, setRole] = useState<TeamMemberRole>(member?.role ?? "PLAYER");
  const [jerseyNumber, setJerseyNumber] = useState<string>(
    member?.jerseyNumber !== undefined ? String(member.jerseyNumber) : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    if (!isEditing && !player) {
      showToast("Vui lòng chọn một cầu thủ.", "error");
      return;
    }

    setIsSubmitting(true);
    const result = isEditing
      ? await updateRosterMemberApi(accessToken, teamId, member!.id, {
          role,
          jerseyNumber: jerseyNumber ? Number(jerseyNumber) : undefined,
        })
      : await addRosterMemberApi(accessToken, teamId, {
          playerId: player!.id,
          role,
          jerseyNumber: jerseyNumber ? Number(jerseyNumber) : undefined,
        });
    setIsSubmitting(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    showToast(isEditing ? "Đã cập nhật thành viên." : "Đã thêm thành viên.", "success");
    onSaved();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Chỉnh sửa thành viên" : "Thêm thành viên"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Cầu thủ">
          {isEditing ? (
            <input value={member?.player?.name ?? member?.playerId ?? ""} disabled className={INPUT_CLASS} />
          ) : (
            <PlayerPicker selected={player} onSelect={setPlayer} />
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Vai trò">
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as TeamMemberRole)}
              className={INPUT_CLASS}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {TEAM_MEMBER_ROLE_LABEL[option]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Số áo" hint="Không bắt buộc">
            <input
              type="number"
              min={0}
              value={jerseyNumber}
              onChange={(event) => setJerseyNumber(event.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? <Spinner /> : null}
          {isEditing ? "Lưu thay đổi" : "Thêm thành viên"}
        </Button>
      </form>
    </Modal>
  );
}
