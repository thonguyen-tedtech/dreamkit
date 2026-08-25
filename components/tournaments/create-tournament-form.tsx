"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { createTournamentApi, type TournamentInput } from "@/lib/tournaments-api";
import { TOURNAMENT_FORMAT_LABEL } from "@/lib/tournament-format";
import type { TournamentFormat } from "@/lib/tournament-types";
import { Field, INPUT_CLASS } from "./field";

const FORMAT_OPTIONS = Object.keys(TOURNAMENT_FORMAT_LABEL) as TournamentFormat[];

interface DraftState {
  readonly name: string;
  readonly format: TournamentFormat;
  readonly startDate: string;
  readonly endDate: string;
  readonly description: string;
  readonly location: string;
  readonly venue: string;
  readonly isPublic: boolean;
}

const EMPTY_DRAFT: DraftState = {
  name: "",
  format: "GROUP_KNOCKOUT",
  startDate: "",
  endDate: "",
  description: "",
  location: "",
  venue: "",
  isPublic: true,
};

function validate(draft: DraftState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!draft.name.trim()) errors.name = "Vui lòng nhập tên giải đấu.";
  if (!draft.startDate) errors.startDate = "Vui lòng chọn ngày khai mạc.";
  if (draft.endDate && draft.startDate && draft.endDate < draft.startDate) {
    errors.endDate = "Ngày kết thúc phải sau ngày khai mạc.";
  }
  return errors;
}

/** Admin form for creating a new tournament (the signed-in admin becomes its organizer). */
export function CreateTournamentForm() {
  const { accessToken } = useAdminAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof DraftState>(field: K, value: DraftState[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) {
      showToast("Phiên đăng nhập đã hết hạn.", "error");
      return;
    }

    const nextErrors = validate(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input: TournamentInput = {
      name: draft.name.trim(),
      format: draft.format,
      startDate: new Date(draft.startDate).toISOString(),
      endDate: draft.endDate ? new Date(draft.endDate).toISOString() : undefined,
      description: draft.description.trim() || undefined,
      location: draft.location.trim() || undefined,
      venue: draft.venue.trim() || undefined,
      isPublic: draft.isPublic,
    };

    setIsSubmitting(true);
    const result = await createTournamentApi(accessToken, input);
    setIsSubmitting(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    showToast("Đã tạo giải đấu.", "success");
    router.push(`/admin/tournaments/${result.tournament.id}`);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Field label="Tên giải đấu" error={errors.name}>
        <input
          value={draft.name}
          onChange={(event) => update("name", event.target.value)}
          className={INPUT_CLASS}
          placeholder="Giải bóng đá Dreamkit Cup 2026"
        />
      </Field>

      <Field label="Thể thức">
        <select
          value={draft.format}
          onChange={(event) => update("format", event.target.value as TournamentFormat)}
          className={INPUT_CLASS}
        >
          {FORMAT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {TOURNAMENT_FORMAT_LABEL[option]}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ngày khai mạc" error={errors.startDate}>
          <input
            type="date"
            value={draft.startDate}
            onChange={(event) => update("startDate", event.target.value)}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Ngày kết thúc" error={errors.endDate} hint="Không bắt buộc">
          <input
            type="date"
            value={draft.endDate}
            onChange={(event) => update("endDate", event.target.value)}
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Khu vực / Thành phố" hint="Không bắt buộc">
          <input
            value={draft.location}
            onChange={(event) => update("location", event.target.value)}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Sân thi đấu" hint="Không bắt buộc">
          <input
            value={draft.venue}
            onChange={(event) => update("venue", event.target.value)}
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <Field label="Mô tả" hint="Không bắt buộc">
        <textarea
          value={draft.description}
          onChange={(event) => update("description", event.target.value)}
          rows={4}
          className={`${INPUT_CLASS} h-auto py-2`}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={draft.isPublic}
          onChange={(event) => update("isPublic", event.target.checked)}
          className="size-4 rounded border-border"
        />
        Công khai giải đấu (mọi người đều xem được)
      </label>

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? <Spinner /> : null}
        Tạo giải đấu
      </Button>
    </form>
  );
}
