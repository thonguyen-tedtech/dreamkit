"use client";

import { useState, type FormEvent } from "react";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { createGroupApi, updateGroupApi } from "@/lib/tournament-stages-api";
import type { Group } from "@/lib/tournament-types";
import { Field, INPUT_CLASS } from "./field";

interface GroupFormModalProps {
  readonly tournamentId: string;
  readonly stageId: string;
  readonly group?: Group;
  readonly nextOrder: number;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSaved: (group: Group) => void;
}

/** Modal form to create or edit a stage's group (e.g. "Bảng A"). */
export function GroupFormModal({
  tournamentId,
  stageId,
  group,
  nextOrder,
  isOpen,
  onClose,
  onSaved,
}: GroupFormModalProps) {
  const { accessToken } = useAdminAuth();
  const { showToast } = useToast();
  const isEditing = Boolean(group);

  const [name, setName] = useState(group?.name ?? "");
  const [code, setCode] = useState(group?.code ?? "");
  const [order, setOrder] = useState(group?.order ?? nextOrder);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !name.trim() || !code.trim()) return;

    setIsSubmitting(true);
    const input = { name: name.trim(), code: code.trim(), order };
    const result = group
      ? await updateGroupApi(accessToken, tournamentId, stageId, group.id, input)
      : await createGroupApi(accessToken, tournamentId, stageId, input);
    setIsSubmitting(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    showToast(isEditing ? "Đã cập nhật bảng đấu." : "Đã thêm bảng đấu.", "success");
    onSaved(result.group);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Chỉnh sửa bảng đấu" : "Thêm bảng đấu"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Tên bảng">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={INPUT_CLASS}
            placeholder="Bảng A"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mã bảng">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className={INPUT_CLASS}
              placeholder="A"
            />
          </Field>
          <Field label="Thứ tự">
            <input
              type="number"
              min={1}
              value={order}
              onChange={(event) => setOrder(Number(event.target.value))}
              className={INPUT_CLASS}
            />
          </Field>
        </div>
        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? <Spinner /> : null}
          {isEditing ? "Lưu thay đổi" : "Thêm bảng đấu"}
        </Button>
      </form>
    </Modal>
  );
}
