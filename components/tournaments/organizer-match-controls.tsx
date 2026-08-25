"use client";

import { useState, type FormEvent } from "react";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { recordMatchResultApi, updateMatchScheduleApi } from "@/lib/tournament-matches-api";
import type { Match, MatchWithTeams } from "@/lib/tournament-types";
import { Field, INPUT_CLASS } from "./field";

/** Converts an ISO string to the value a <input type="datetime-local"> expects. */
function toLocalInputValue(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

interface OrganizerMatchControlsProps {
  readonly tournamentId: string;
  readonly match: MatchWithTeams;
  readonly onUpdated: (match: Match) => void;
}

/** Organizer-only controls to reschedule a match and to record/correct its final result. */
export function OrganizerMatchControls({ tournamentId, match, onUpdated }: OrganizerMatchControlsProps) {
  const { accessToken } = useAdminAuth();
  const { showToast } = useToast();

  const [scheduledAt, setScheduledAt] = useState(toLocalInputValue(match.scheduledAt));
  const [venue, setVenue] = useState(match.venue ?? "");
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  const [homeRegular, setHomeRegular] = useState(String(match.homeScore?.regular ?? 0));
  const [awayRegular, setAwayRegular] = useState(String(match.awayScore?.regular ?? 0));
  const [homePenalties, setHomePenalties] = useState(String(match.homeScore?.penalties ?? 0));
  const [awayPenalties, setAwayPenalties] = useState(String(match.awayScore?.penalties ?? 0));
  const [referee, setReferee] = useState(match.referee ?? "");
  const [isSavingResult, setIsSavingResult] = useState(false);

  async function handleSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    setIsSavingSchedule(true);
    const result = await updateMatchScheduleApi(accessToken, tournamentId, match.id, {
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      venue: venue.trim() || undefined,
    });
    setIsSavingSchedule(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }
    showToast("Đã cập nhật lịch thi đấu.", "success");
    onUpdated(result.match);
  }

  async function handleResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    setIsSavingResult(true);
    const result = await recordMatchResultApi(accessToken, tournamentId, match.id, {
      homeScore: { regular: Number(homeRegular), penalties: Number(homePenalties) },
      awayScore: { regular: Number(awayRegular), penalties: Number(awayPenalties) },
      referee: referee.trim() || undefined,
    });
    setIsSavingResult(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }
    showToast("Đã ghi nhận kết quả trận đấu.", "success");
    onUpdated(result.match);
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <form onSubmit={handleSchedule} className="flex flex-col gap-3 rounded-card border border-border p-4">
        <h5 className="text-xs font-medium uppercase tracking-label text-muted">Lịch thi đấu</h5>
        <Field label="Thời gian">
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Sân thi đấu">
          <input value={venue} onChange={(event) => setVenue(event.target.value)} className={INPUT_CLASS} />
        </Field>
        <Button type="submit" variant="outline" disabled={isSavingSchedule}>
          {isSavingSchedule ? <Spinner /> : null}
          Lưu lịch thi đấu
        </Button>
      </form>

      <form onSubmit={handleResult} className="flex flex-col gap-3 rounded-card border border-border p-4">
        <h5 className="text-xs font-medium uppercase tracking-label text-muted">Kết quả trận đấu</h5>
        <div className="grid grid-cols-2 gap-3">
          <Field label={`Bàn thắng — ${match.homeTeam.name}`}>
            <input
              type="number"
              min={0}
              value={homeRegular}
              onChange={(event) => setHomeRegular(event.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label={`Bàn thắng — ${match.awayTeam.name}`}>
            <input
              type="number"
              min={0}
              value={awayRegular}
              onChange={(event) => setAwayRegular(event.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Luân lưu (nhà)" hint="Chỉ nhập nếu có luân lưu">
            <input
              type="number"
              min={0}
              value={homePenalties}
              onChange={(event) => setHomePenalties(event.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Luân lưu (khách)" hint="Chỉ nhập nếu có luân lưu">
            <input
              type="number"
              min={0}
              value={awayPenalties}
              onChange={(event) => setAwayPenalties(event.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
        </div>
        <Field label="Trọng tài" hint="Không bắt buộc">
          <input value={referee} onChange={(event) => setReferee(event.target.value)} className={INPUT_CLASS} />
        </Field>
        <Button type="submit" disabled={isSavingResult}>
          {isSavingResult ? <Spinner /> : null}
          Ghi nhận kết quả
        </Button>
      </form>
    </div>
  );
}
