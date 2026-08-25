"use client";

import { useState, type FormEvent } from "react";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { createStageApi, updateStageApi, type StageInput } from "@/lib/tournament-stages-api";
import { KNOCKOUT_ROUND_LABEL, STAGE_TYPE_LABEL } from "@/lib/tournament-format";
import type { KnockoutRound, Stage, StageType } from "@/lib/tournament-types";
import { Field, INPUT_CLASS } from "./field";

const TYPE_OPTIONS = Object.keys(STAGE_TYPE_LABEL) as StageType[];
const KNOCKOUT_ROUND_OPTIONS = Object.keys(KNOCKOUT_ROUND_LABEL) as KnockoutRound[];

interface StageFormModalProps {
  readonly tournamentId: string;
  /** When provided, the modal edits this stage instead of creating a new one. */
  readonly stage?: Stage;
  readonly nextOrder: number;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSaved: (stage: Stage) => void;
}

/** Modal form to create or edit a tournament stage. */
export function StageFormModal({
  tournamentId,
  stage,
  nextOrder,
  isOpen,
  onClose,
  onSaved,
}: StageFormModalProps) {
  const { accessToken } = useAdminAuth();
  const { showToast } = useToast();
  const isEditing = Boolean(stage);

  const [name, setName] = useState(stage?.name ?? "");
  const [type, setType] = useState<StageType>(stage?.type ?? "GROUP");
  const [order, setOrder] = useState(stage?.order ?? nextOrder);
  const [knockoutRound, setKnockoutRound] = useState<KnockoutRound | "">(
    stage?.knockoutRound ?? "",
  );
  const [numberOfGroups, setNumberOfGroups] = useState(stage?.configuration?.numberOfGroups ?? 2);
  const [teamsPerGroup, setTeamsPerGroup] = useState(stage?.configuration?.teamsPerGroup ?? 4);
  const [legs, setLegs] = useState(stage?.configuration?.legs ?? 1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !name.trim()) return;

    const input: StageInput = {
      name: name.trim(),
      type,
      order,
      knockoutRound: type === "KNOCKOUT" ? knockoutRound || undefined : undefined,
      configuration:
        type === "GROUP"
          ? { numberOfGroups, teamsPerGroup, legs }
          : type === "LEAGUE"
            ? { legs }
            : undefined,
    };

    setIsSubmitting(true);
    const result = stage
      ? await updateStageApi(accessToken, tournamentId, stage.id, input)
      : await createStageApi(accessToken, tournamentId, input);
    setIsSubmitting(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    showToast(isEditing ? "Đã cập nhật vòng đấu." : "Đã thêm vòng đấu.", "success");
    onSaved(result.stage);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Chỉnh sửa vòng đấu" : "Thêm vòng đấu"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Tên vòng đấu">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={INPUT_CLASS}
            placeholder="Vòng bảng"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Loại vòng đấu">
            <select
              value={type}
              onChange={(event) => setType(event.target.value as StageType)}
              className={INPUT_CLASS}
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {STAGE_TYPE_LABEL[option]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Thứ tự" hint="Vị trí trong giải, bắt đầu từ 1">
            <input
              type="number"
              min={1}
              value={order}
              onChange={(event) => setOrder(Number(event.target.value))}
              className={INPUT_CLASS}
            />
          </Field>
        </div>

        {type === "KNOCKOUT" ? (
          <Field label="Vòng loại trực tiếp">
            <select
              value={knockoutRound}
              onChange={(event) => setKnockoutRound(event.target.value as KnockoutRound)}
              className={INPUT_CLASS}
            >
              <option value="">Chọn vòng</option>
              {KNOCKOUT_ROUND_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {KNOCKOUT_ROUND_LABEL[option]}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        {type === "GROUP" ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Số bảng">
              <input
                type="number"
                min={1}
                value={numberOfGroups}
                onChange={(event) => setNumberOfGroups(Number(event.target.value))}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Đội/bảng">
              <input
                type="number"
                min={2}
                value={teamsPerGroup}
                onChange={(event) => setTeamsPerGroup(Number(event.target.value))}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Số lượt">
              <input
                type="number"
                min={1}
                value={legs}
                onChange={(event) => setLegs(Number(event.target.value))}
                className={INPUT_CLASS}
              />
            </Field>
          </div>
        ) : null}

        {type === "LEAGUE" ? (
          <Field label="Số lượt" hint="1 = vòng tròn 1 lượt, 2 = lượt đi lượt về">
            <input
              type="number"
              min={1}
              value={legs}
              onChange={(event) => setLegs(Number(event.target.value))}
              className={INPUT_CLASS}
            />
          </Field>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? <Spinner /> : null}
          {isEditing ? "Lưu thay đổi" : "Thêm vòng đấu"}
        </Button>
      </form>
    </Modal>
  );
}
