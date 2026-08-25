"use client";

import { useState, type FormEvent } from "react";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { createMatchEventApi } from "@/lib/tournament-matches-api";
import { MATCH_EVENT_LABEL, MATCH_PERIOD_LABEL } from "@/lib/tournament-format";
import type { MatchEvent, MatchEventType, MatchPeriod, MatchWithTeams, Player } from "@/lib/tournament-types";
import { Field, INPUT_CLASS } from "./field";
import { PlayerPicker } from "./player-picker";

const TYPE_OPTIONS = Object.keys(MATCH_EVENT_LABEL) as MatchEventType[];
const PERIOD_OPTIONS = Object.keys(MATCH_PERIOD_LABEL) as MatchPeriod[];

interface MatchEventFormModalProps {
  readonly tournamentId: string;
  readonly match: MatchWithTeams;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onCreated: (event: MatchEvent) => void;
}

/** Modal form to add one event to a match's timeline (goal, card, substitution, VAR). */
export function MatchEventFormModal({ tournamentId, match, isOpen, onClose, onCreated }: MatchEventFormModalProps) {
  const { accessToken } = useAdminAuth();
  const { showToast } = useToast();

  const [teamId, setTeamId] = useState(match.homeTeam.id);
  const [type, setType] = useState<MatchEventType>("GOAL");
  const [period, setPeriod] = useState<MatchPeriod>("FIRST_HALF");
  const [minute, setMinute] = useState("1");
  const [player, setPlayer] = useState<Player | null>(null);
  const [relatedPlayer, setRelatedPlayer] = useState<Player | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const relatedPlayerLabel = type === "SUBSTITUTION" ? "Cầu thủ vào sân" : "Kiến tạo";
  const showRelatedPlayer = type === "GOAL" || type === "SUBSTITUTION";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    setIsSubmitting(true);
    const result = await createMatchEventApi(accessToken, tournamentId, match.id, {
      teamId,
      type,
      period,
      minute: Number(minute),
      playerId: player?.id,
      relatedPlayerId: showRelatedPlayer ? relatedPlayer?.id : undefined,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }
    showToast("Đã thêm diễn biến trận đấu.", "success");
    onCreated(result.event);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm diễn biến trận đấu">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Đội">
          <select value={teamId} onChange={(event) => setTeamId(event.target.value)} className={INPUT_CLASS}>
            <option value={match.homeTeam.id}>{match.homeTeam.name}</option>
            <option value={match.awayTeam.id}>{match.awayTeam.name}</option>
          </select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Loại diễn biến">
            <select
              value={type}
              onChange={(event) => setType(event.target.value as MatchEventType)}
              className={INPUT_CLASS}
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {MATCH_EVENT_LABEL[option]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Hiệp">
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value as MatchPeriod)}
              className={INPUT_CLASS}
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {MATCH_PERIOD_LABEL[option]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Phút" hint="Ví dụ: 45+2 → nhập 45, phần bù giờ nhập ở trường riêng nếu cần">
          <input
            type="number"
            min={0}
            value={minute}
            onChange={(event) => setMinute(event.target.value)}
            className={INPUT_CLASS}
          />
        </Field>

        <Field label={type === "SUBSTITUTION" ? "Cầu thủ ra sân" : "Cầu thủ"} hint="Không bắt buộc">
          <PlayerPicker selected={player} onSelect={setPlayer} />
        </Field>

        {showRelatedPlayer ? (
          <Field label={relatedPlayerLabel} hint="Không bắt buộc">
            <PlayerPicker selected={relatedPlayer} onSelect={setRelatedPlayer} />
          </Field>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? <Spinner /> : null}
          Thêm diễn biến
        </Button>
      </form>
    </Modal>
  );
}
