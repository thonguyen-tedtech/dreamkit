"use client";

import { useState, type FormEvent } from "react";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { createTeamApi, updateTeamApi } from "@/lib/tournament-teams-api";
import type { Team } from "@/lib/tournament-types";
import { Field, INPUT_CLASS } from "./field";

export interface GroupOption {
  readonly id: string;
  readonly label: string;
}

interface TeamFormModalProps {
  readonly tournamentId: string;
  readonly team?: Team;
  /** Groups available across the tournament's GROUP-type stages, for optional assignment. */
  readonly groupOptions: readonly GroupOption[];
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSaved: (team: Team) => void;
}

/** Modal form to register a new team, or edit an existing one. */
export function TeamFormModal({
  tournamentId,
  team,
  groupOptions,
  isOpen,
  onClose,
  onSaved,
}: TeamFormModalProps) {
  const { accessToken } = useAdminAuth();
  const { showToast } = useToast();
  const isEditing = Boolean(team);

  const [name, setName] = useState(team?.name ?? "");
  const [shortName, setShortName] = useState(team?.shortName ?? "");
  const [logo, setLogo] = useState(team?.logo ?? "");
  const [description, setDescription] = useState(team?.description ?? "");
  const [groupId, setGroupId] = useState(team?.groupId ?? "");
  const [seed, setSeed] = useState<string>(team?.seed !== undefined ? String(team.seed) : "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !name.trim()) return;

    const input = {
      name: name.trim(),
      shortName: shortName.trim() || undefined,
      logo: logo.trim() || undefined,
      description: description.trim() || undefined,
      groupId: groupId || undefined,
      seed: seed ? Number(seed) : undefined,
    };

    setIsSubmitting(true);
    const result = team
      ? await updateTeamApi(accessToken, tournamentId, team.id, input)
      : await createTeamApi(accessToken, tournamentId, input);
    setIsSubmitting(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    showToast(isEditing ? "Đã cập nhật đội bóng." : "Đã đăng ký đội bóng.", "success");
    onSaved(result.team);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Chỉnh sửa đội bóng" : "Đăng ký đội bóng"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Tên đội">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={INPUT_CLASS}
            placeholder="Falcons FC"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên viết tắt" hint="Không bắt buộc">
            <input
              value={shortName}
              onChange={(event) => setShortName(event.target.value)}
              className={INPUT_CLASS}
              placeholder="FAL"
            />
          </Field>
          <Field label="Hạt giống" hint="Không bắt buộc">
            <input
              type="number"
              min={1}
              value={seed}
              onChange={(event) => setSeed(event.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
        </div>

        <Field label="Logo (URL)" hint="Không bắt buộc">
          <input
            type="url"
            value={logo}
            onChange={(event) => setLogo(event.target.value)}
            className={INPUT_CLASS}
            placeholder="https://cdn.example.com/falcons.webp"
          />
        </Field>

        {groupOptions.length > 0 ? (
          <Field label="Bảng đấu" hint="Không bắt buộc">
            <select
              value={groupId}
              onChange={(event) => setGroupId(event.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Chưa xếp bảng</option>
              {groupOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        <Field label="Mô tả" hint="Không bắt buộc">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className={`${INPUT_CLASS} h-auto py-2`}
          />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? <Spinner /> : null}
          {isEditing ? "Lưu thay đổi" : "Đăng ký đội"}
        </Button>
      </form>
    </Modal>
  );
}
