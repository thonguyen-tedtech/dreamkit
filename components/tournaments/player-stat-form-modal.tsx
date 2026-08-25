"use client";

import { useState, type FormEvent } from "react";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { upsertPlayerMatchStatApi } from "@/lib/tournament-stats-api";
import type { MatchWithTeams, Player, PlayerMatchStat } from "@/lib/tournament-types";
import { Field, INPUT_CLASS } from "./field";
import { PlayerPicker } from "./player-picker";

interface PlayerStatFormModalProps {
  readonly tournamentId: string;
  readonly match: MatchWithTeams;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSaved: (stat: PlayerMatchStat) => void;
}

const NUMERIC_FIELDS = [
  ["goals", "Bàn thắng"],
  ["assists", "Kiến tạo"],
  ["shots", "Dứt điểm"],
  ["shotsOnTarget", "Trúng đích"],
  ["passes", "Chuyền bóng"],
  ["passesCompleted", "Chuyền chính xác"],
  ["fouls", "Phạm lỗi"],
  ["yellowCards", "Thẻ vàng"],
  ["redCards", "Thẻ đỏ"],
  ["ownGoals", "Phản lưới nhà"],
  ["saves", "Cứu thua"],
] as const;

type NumericField = (typeof NUMERIC_FIELDS)[number][0];

/** Modal form to record (or overwrite) one player's stat line for a match. */
export function PlayerStatFormModal({ tournamentId, match, isOpen, onClose, onSaved }: PlayerStatFormModalProps) {
  const { accessToken } = useAdminAuth();
  const { showToast } = useToast();

  const [player, setPlayer] = useState<Player | null>(null);
  const [teamId, setTeamId] = useState(match.homeTeam.id);
  const [values, setValues] = useState<Record<NumericField, string>>({
    goals: "0",
    assists: "0",
    shots: "0",
    shotsOnTarget: "0",
    passes: "0",
    passesCompleted: "0",
    fouls: "0",
    yellowCards: "0",
    redCards: "0",
    ownGoals: "0",
    saves: "0",
  });
  const [rating, setRating] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateValue(field: NumericField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !player) {
      showToast("Vui lòng chọn cầu thủ.", "error");
      return;
    }

    setIsSubmitting(true);
    const result = await upsertPlayerMatchStatApi(accessToken, tournamentId, match.id, {
      playerId: player.id,
      teamId,
      goals: Number(values.goals),
      assists: Number(values.assists),
      shots: Number(values.shots),
      shotsOnTarget: Number(values.shotsOnTarget),
      passes: Number(values.passes),
      passesCompleted: Number(values.passesCompleted),
      fouls: Number(values.fouls),
      yellowCards: Number(values.yellowCards),
      redCards: Number(values.redCards),
      ownGoals: Number(values.ownGoals),
      saves: Number(values.saves),
      rating: rating ? Number(rating) : undefined,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }
    showToast("Đã lưu thống kê cầu thủ.", "success");
    onSaved(result.stat);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thống kê cầu thủ">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Cầu thủ">
          <PlayerPicker selected={player} onSelect={setPlayer} />
        </Field>
        <Field label="Đội">
          <select value={teamId} onChange={(event) => setTeamId(event.target.value)} className={INPUT_CLASS}>
            <option value={match.homeTeam.id}>{match.homeTeam.name}</option>
            <option value={match.awayTeam.id}>{match.awayTeam.name}</option>
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          {NUMERIC_FIELDS.map(([field, label]) => (
            <Field key={field} label={label}>
              <input
                type="number"
                min={0}
                value={values[field]}
                onChange={(event) => updateValue(field, event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
          ))}
          <Field label="Điểm đánh giá" hint="Không bắt buộc">
            <input
              type="number"
              min={0}
              step={0.1}
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? <Spinner /> : null}
          Lưu thống kê
        </Button>
      </form>
    </Modal>
  );
}
