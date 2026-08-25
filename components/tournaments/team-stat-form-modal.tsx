"use client";

import { useState, type FormEvent } from "react";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { upsertTeamMatchStatApi } from "@/lib/tournament-stats-api";
import type { MatchWithTeams, TeamMatchStat } from "@/lib/tournament-types";
import { Field, INPUT_CLASS } from "./field";

interface TeamStatFormModalProps {
  readonly tournamentId: string;
  readonly match: MatchWithTeams;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSaved: (stat: TeamMatchStat) => void;
}

/** Modal form to record (or overwrite) one team's aggregate stat line for a match. */
export function TeamStatFormModal({ tournamentId, match, isOpen, onClose, onSaved }: TeamStatFormModalProps) {
  const { accessToken } = useAdminAuth();
  const { showToast } = useToast();

  const [teamId, setTeamId] = useState(match.homeTeam.id);
  const [shots, setShots] = useState("0");
  const [shotsOnTarget, setShotsOnTarget] = useState("0");
  const [passes, setPasses] = useState("0");
  const [passesCompleted, setPassesCompleted] = useState("0");
  const [fouls, setFouls] = useState("0");
  const [yellowCards, setYellowCards] = useState("0");
  const [redCards, setRedCards] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    setIsSubmitting(true);
    const result = await upsertTeamMatchStatApi(accessToken, tournamentId, match.id, {
      teamId,
      shots: Number(shots),
      shotsOnTarget: Number(shotsOnTarget),
      passes: Number(passes),
      passesCompleted: Number(passesCompleted),
      fouls: Number(fouls),
      yellowCards: Number(yellowCards),
      redCards: Number(redCards),
    });
    setIsSubmitting(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }
    showToast("Đã lưu thống kê đội bóng.", "success");
    onSaved(result.stat);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thống kê đội bóng">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Đội">
          <select value={teamId} onChange={(event) => setTeamId(event.target.value)} className={INPUT_CLASS}>
            <option value={match.homeTeam.id}>{match.homeTeam.name}</option>
            <option value={match.awayTeam.id}>{match.awayTeam.name}</option>
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Dứt điểm">
            <input type="number" min={0} value={shots} onChange={(e) => setShots(e.target.value)} className={INPUT_CLASS} />
          </Field>
          <Field label="Trúng đích">
            <input type="number" min={0} value={shotsOnTarget} onChange={(e) => setShotsOnTarget(e.target.value)} className={INPUT_CLASS} />
          </Field>
          <Field label="Chuyền bóng">
            <input type="number" min={0} value={passes} onChange={(e) => setPasses(e.target.value)} className={INPUT_CLASS} />
          </Field>
          <Field label="Chuyền chính xác">
            <input type="number" min={0} value={passesCompleted} onChange={(e) => setPassesCompleted(e.target.value)} className={INPUT_CLASS} />
          </Field>
          <Field label="Phạm lỗi">
            <input type="number" min={0} value={fouls} onChange={(e) => setFouls(e.target.value)} className={INPUT_CLASS} />
          </Field>
          <Field label="Thẻ vàng">
            <input type="number" min={0} value={yellowCards} onChange={(e) => setYellowCards(e.target.value)} className={INPUT_CLASS} />
          </Field>
          <Field label="Thẻ đỏ">
            <input type="number" min={0} value={redCards} onChange={(e) => setRedCards(e.target.value)} className={INPUT_CLASS} />
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
