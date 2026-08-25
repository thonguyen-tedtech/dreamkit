"use client";

import { useState, type FormEvent } from "react";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { updateTournamentApi } from "@/lib/tournaments-api";
import { TOURNAMENT_FORMAT_LABEL, TOURNAMENT_STATUS_LABEL } from "@/lib/tournament-format";
import type { Tournament, TournamentFormat, TournamentStatus } from "@/lib/tournament-types";
import { Field, INPUT_CLASS } from "./field";

const FORMAT_OPTIONS = Object.keys(TOURNAMENT_FORMAT_LABEL) as TournamentFormat[];
const STATUS_OPTIONS = Object.keys(TOURNAMENT_STATUS_LABEL) as TournamentStatus[];

interface EditTournamentModalProps {
  readonly tournament: Tournament;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onUpdated: (tournament: Tournament) => void;
}

/** Modal form for the organizer/admin to edit a tournament's details and lifecycle status. */
export function EditTournamentModal({
  tournament,
  isOpen,
  onClose,
  onUpdated,
}: EditTournamentModalProps) {
  const { accessToken } = useAdminAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(tournament.name);
  const [format, setFormat] = useState(tournament.format);
  const [status, setStatus] = useState(tournament.status);
  const [description, setDescription] = useState(tournament.description ?? "");
  const [location, setLocation] = useState(tournament.location ?? "");
  const [venue, setVenue] = useState(tournament.venue ?? "");
  const [isPublic, setIsPublic] = useState(tournament.isPublic);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    setIsSubmitting(true);
    const result = await updateTournamentApi(accessToken, tournament.id, {
      name: name.trim(),
      format,
      status,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      venue: venue.trim() || undefined,
      isPublic,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    showToast("Đã cập nhật giải đấu.", "success");
    onUpdated(result.tournament);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa giải đấu">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Tên giải đấu">
          <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLASS} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Thể thức">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as TournamentFormat)}
              className={INPUT_CLASS}
            >
              {FORMAT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {TOURNAMENT_FORMAT_LABEL[option]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Trạng thái">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TournamentStatus)}
              className={INPUT_CLASS}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {TOURNAMENT_STATUS_LABEL[option]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Khu vực / Thành phố">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Sân thi đấu">
            <input value={venue} onChange={(e) => setVenue(e.target.value)} className={INPUT_CLASS} />
          </Field>
        </div>

        <Field label="Mô tả">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={`${INPUT_CLASS} h-auto py-2`}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="size-4 rounded border-border"
          />
          Công khai giải đấu
        </label>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? <Spinner /> : null}
          Lưu thay đổi
        </Button>
      </form>
    </Modal>
  );
}
