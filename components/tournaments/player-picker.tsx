"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { useToast } from "@/components/ui/toast-context";
import { createPlayerApi, searchPlayersApi } from "@/lib/players-api";
import type { Player } from "@/lib/tournament-types";
import { INPUT_CLASS } from "./field";

interface PlayerPickerProps {
  readonly selected: Player | null;
  readonly onSelect: (player: Player) => void;
}

/**
 * Typeahead search over the shared player directory (debounced), with a
 * quick "create new player" fallback when no existing profile matches.
 */
export function PlayerPicker({ selected, onSelect }: PlayerPickerProps) {
  const { accessToken } = useAdminAuth();
  const { showToast } = useToast();
  const [query, setQuery] = useState(selected?.name ?? "");
  const [results, setResults] = useState<readonly Player[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isOpen || query.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      void searchPlayersApi(query).then((result) => {
        if (!cancelled && result.ok) setResults(result.players);
      });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  function handleSelect(player: Player) {
    onSelect(player);
    setQuery(player.name);
    setIsOpen(false);
  }

  async function handleCreate() {
    if (!accessToken || !query.trim()) return;
    setIsCreating(true);
    const result = await createPlayerApi(accessToken, { name: query.trim() });
    setIsCreating(false);
    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }
    handleSelect(result.player);
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder="Nhập tên cầu thủ để tìm…"
        className={INPUT_CLASS}
      />

      {isOpen && query.trim().length >= 2 ? (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-card border border-border bg-background shadow-lg">
          {results.map((player) => (
            <button
              key={player.id}
              type="button"
              onMouseDown={() => handleSelect(player)}
              className="block w-full px-3 py-2 text-left text-sm text-foreground hover:cursor-pointer hover:bg-surface"
            >
              {player.name}
              {player.nationality ? <span className="text-muted"> · {player.nationality}</span> : null}
            </button>
          ))}
          {/* The backend's search does loose text matching, so an unrelated
              player can show up even when the typed name doesn't exist yet —
              always offer "create new" unless one result is an exact name match. */}
          {!results.some((player) => player.name.trim().toLowerCase() === query.trim().toLowerCase()) ? (
            <button
              type="button"
              disabled={isCreating}
              onMouseDown={(event) => {
                event.preventDefault();
                void handleCreate();
              }}
              className="block w-full border-t border-border px-3 py-2 text-left text-sm text-foreground hover:cursor-pointer hover:bg-surface disabled:opacity-50"
            >
              + Tạo cầu thủ mới “{query.trim()}”
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
