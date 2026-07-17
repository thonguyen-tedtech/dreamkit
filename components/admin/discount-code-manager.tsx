"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { Button } from "@/components/ui/button";
import { LoadingOverlay, Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import {
  computeDiscountCodeStatus,
  deleteDiscountCode as deleteDiscountCodeInList,
  isDiscountCodeValid,
  normalizeDiscountCode,
  upsertDiscountCode as upsertDiscountCodeInList,
  validateDiscountCode,
  type DiscountCodeFieldErrors,
} from "@/lib/discount-codes";
import {
  createDiscountCodeApi,
  deleteDiscountCodeApi,
  fetchDiscountCodesApi,
  updateDiscountCodeApi,
  type DiscountCodeInput,
} from "@/lib/discount-codes-api";
import { formatPrice } from "@/lib/products";
import type { DiscountCode, DiscountCodeStatus, DiscountType } from "@/lib/types";
import { cn } from "@/lib/cn";

interface DraftState {
  readonly code: string;
  readonly description: string;
  readonly discountType: DiscountType;
  readonly value: number;
  readonly minOrderAmount: string;
  readonly startsAt: string;
  readonly expiresAt: string;
  readonly maxUses: string;
  readonly perCustomerLimit: string;
  readonly isActive: boolean;
}

const EMPTY_DRAFT: DraftState = {
  code: "",
  description: "",
  discountType: "percentage",
  value: 10,
  minOrderAmount: "",
  startsAt: "",
  expiresAt: "",
  maxUses: "",
  perCustomerLimit: "",
  isActive: true,
};

const STATUS_LABELS: Record<DiscountCodeStatus, string> = {
  scheduled: "Lên lịch",
  active: "Đang hoạt động",
  expired: "Hết hạn",
  exhausted: "Hết lượt",
  disabled: "Đã tắt",
};

const STATUS_CLASSES: Record<DiscountCodeStatus, string> = {
  scheduled: "border-border text-muted",
  active: "border-foreground bg-foreground text-background",
  expired: "border-border text-muted",
  exhausted: "border-border text-muted",
  disabled: "border-border text-muted",
};

function parseOptionalNumber(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function draftFromDiscountCode(discountCode: DiscountCode): DraftState {
  return {
    code: discountCode.code,
    description: discountCode.description ?? "",
    discountType: discountCode.discountType,
    value: discountCode.value,
    minOrderAmount: discountCode.minOrderAmount?.toString() ?? "",
    startsAt: discountCode.startsAt ?? "",
    expiresAt: discountCode.expiresAt ?? "",
    maxUses: discountCode.maxUses?.toString() ?? "",
    perCustomerLimit: discountCode.perCustomerLimit?.toString() ?? "",
    isActive: discountCode.isActive,
  };
}

function buildCandidate(
  draft: DraftState,
  existing: DiscountCode | undefined,
): DiscountCode {
  return {
    id: existing?.id ?? "",
    code: normalizeDiscountCode(draft.code),
    description: draft.description.trim() || undefined,
    discountType: draft.discountType,
    value: draft.value,
    minOrderAmount: parseOptionalNumber(draft.minOrderAmount),
    startsAt: draft.startsAt || undefined,
    expiresAt: draft.expiresAt || undefined,
    maxUses: parseOptionalNumber(draft.maxUses),
    perCustomerLimit: parseOptionalNumber(draft.perCustomerLimit),
    isActive: draft.isActive,
    usedCount: existing?.usedCount ?? 0,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}

function toInput(candidate: DiscountCode): DiscountCodeInput {
  return {
    code: candidate.code,
    description: candidate.description,
    discountType: candidate.discountType,
    value: candidate.value,
    minOrderAmount: candidate.minOrderAmount,
    startsAt: candidate.startsAt,
    expiresAt: candidate.expiresAt,
    maxUses: candidate.maxUses,
    perCustomerLimit: candidate.perCustomerLimit,
    isActive: candidate.isActive,
  };
}

export function DiscountCodeManager() {
  const { accessToken } = useAuthModal();
  const { showToast } = useToast();
  const [discountCodes, setDiscountCodes] = useState<readonly DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [originalId, setOriginalId] = useState<string | undefined>();
  const [errors, setErrors] = useState<DiscountCodeFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const isEditing = Boolean(originalId);

  const loadDiscountCodes = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    setIsLoading(true);
    const result = await fetchDiscountCodesApi(accessToken);
    if (result.ok) {
      setDiscountCodes(result.discountCodes);
    } else {
      showToast(result.message, "error");
    }
    setIsLoading(false);
  }, [accessToken, showToast]);

  useEffect(() => {
    void loadDiscountCodes();
  }, [loadDiscountCodes]);

  const visibleDiscountCodes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? discountCodes.filter(
          (entry) =>
            entry.code.toLowerCase().includes(query) ||
            (entry.description ?? "").toLowerCase().includes(query),
        )
      : discountCodes;

    return [...filtered].sort((a, b) => a.code.localeCompare(b.code));
  }, [discountCodes, searchQuery]);

  function startCreate() {
    setDraft(EMPTY_DRAFT);
    setOriginalId(undefined);
    setErrors({});
  }

  function startEdit(discountCode: DiscountCode) {
    setDraft(draftFromDiscountCode(discountCode));
    setOriginalId(discountCode.id);
    setErrors({});
  }

  function updateDraft<K extends keyof DraftState>(field: K, value: DraftState[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) {
      return;
    }

    const existing = originalId
      ? discountCodes.find((entry) => entry.id === originalId)
      : undefined;
    const candidate = buildCandidate(draft, existing);
    const nextErrors = validateDiscountCode(candidate, discountCodes, originalId);
    setErrors(nextErrors);
    if (!isDiscountCodeValid(nextErrors)) {
      return;
    }

    setIsSubmitting(true);
    const input = toInput(candidate);
    const result = originalId
      ? await updateDiscountCodeApi(accessToken, originalId, input)
      : await createDiscountCodeApi(accessToken, input);
    setIsSubmitting(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    setDiscountCodes((current) =>
      upsertDiscountCodeInList(current, result.discountCode, originalId),
    );
    showToast(isEditing ? "Đã cập nhật mã giảm giá." : "Đã thêm mã giảm giá mới.", "success");
    startCreate();
  }

  async function handleDelete(discountCode: DiscountCode) {
    if (!accessToken) {
      return;
    }
    const confirmMessage =
      discountCode.usedCount > 0
        ? `Mã "${discountCode.code}" đã được sử dụng ${discountCode.usedCount} lần. Xoá sẽ mất liên kết lịch sử sử dụng. Tiếp tục xoá?`
        : `Xoá mã giảm giá "${discountCode.code}"?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setPendingId(discountCode.id);
    const result = await deleteDiscountCodeApi(accessToken, discountCode.id);
    if (result.ok) {
      setDiscountCodes((current) => deleteDiscountCodeInList(current, discountCode.id));
      showToast("Đã xoá mã giảm giá.", "success");
      if (originalId === discountCode.id) {
        startCreate();
      }
    } else {
      showToast(result.message, "error");
    }
    setPendingId(null);
  }

  async function handleToggleActive(discountCode: DiscountCode) {
    if (!accessToken) {
      return;
    }
    setPendingId(discountCode.id);
    const result = await updateDiscountCodeApi(accessToken, discountCode.id, {
      isActive: !discountCode.isActive,
    });
    if (result.ok) {
      setDiscountCodes((current) =>
        upsertDiscountCodeInList(current, result.discountCode, discountCode.id),
      );
      showToast(
        result.discountCode.isActive ? "Đã bật mã giảm giá." : "Đã tắt mã giảm giá.",
        "success",
      );
    } else {
      showToast(result.message, "error");
    }
    setPendingId(null);
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Mã giảm giá</h1>
          <p className="mt-2 text-sm text-muted">
            Quản lý các mã giảm giá áp dụng cho toàn bộ đơn hàng.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm theo mã hoặc mô tả…"
            className={cn(INPUT_CLASS, "w-64")}
          />
          <Button type="button" variant="outline" onClick={startCreate}>
            Thêm mới
          </Button>
          <Button type="button" variant="ghost" onClick={() => void loadDiscountCodes()}>
            Tải lại
          </Button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="overflow-hidden rounded-card border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-label text-muted">
                <tr>
                  <th className="px-4 py-3">Mã</th>
                  <th className="px-4 py-3">Giá trị</th>
                  <th className="px-4 py-3">Hiệu lực</th>
                  <th className="px-4 py-3">Đã dùng</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <LoadingOverlay label="Đang tải danh sách mã giảm giá…" />
                    </td>
                  </tr>
                ) : visibleDiscountCodes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                      Chưa có mã giảm giá nào.
                    </td>
                  </tr>
                ) : (
                  visibleDiscountCodes.map((discountCode) => {
                    const status = computeDiscountCodeStatus(discountCode);
                    const isPending = pendingId === discountCode.id;
                    return (
                      <tr key={discountCode.id} className="border-b border-border last:border-b-0">
                        <td className="px-4 py-4">
                          <p className="font-medium text-foreground">{discountCode.code}</p>
                          {discountCode.description ? (
                            <p className="text-xs text-muted">{discountCode.description}</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-4">
                          {discountCode.discountType === "percentage"
                            ? `${discountCode.value}%`
                            : formatPrice(discountCode.value)}
                        </td>
                        <td className="px-4 py-4 text-xs text-muted">
                          {discountCode.startsAt ? discountCode.startsAt : "—"}
                          {" → "}
                          {discountCode.expiresAt ? discountCode.expiresAt : "Không giới hạn"}
                        </td>
                        <td className="px-4 py-4">
                          {discountCode.usedCount}
                          {discountCode.maxUses !== undefined ? ` / ${discountCode.maxUses}` : ""}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              "rounded-card border px-2 py-1 text-xs font-medium uppercase tracking-label",
                              STATUS_CLASSES[status],
                            )}
                          >
                            {STATUS_LABELS[status]}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(discountCode)}
                              className="text-xs font-medium uppercase tracking-label text-foreground underline-offset-4 hover:cursor-pointer hover:underline"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => void handleToggleActive(discountCode)}
                              className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-label text-muted underline-offset-4 hover:cursor-pointer hover:text-foreground hover:underline disabled:opacity-50"
                            >
                              {isPending ? <Spinner className="size-3" /> : null}
                              {discountCode.isActive ? "Tắt" : "Bật"}
                            </button>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => void handleDelete(discountCode)}
                              className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-label text-muted underline-offset-4 hover:cursor-pointer hover:text-foreground hover:underline disabled:opacity-50"
                            >
                              {isPending ? <Spinner className="size-3" /> : null}
                              Xoá
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-card border border-border bg-surface p-6">
          <h2 className="font-display text-xl text-foreground">
            {isEditing ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Field label="Mã giảm giá" error={errors.code}>
              <input
                value={draft.code}
                onChange={(event) => updateDraft("code", event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Mô tả">
              <input
                value={draft.description}
                onChange={(event) => updateDraft("description", event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Loại giảm giá" error={errors.discountType}>
                <select
                  value={draft.discountType}
                  onChange={(event) =>
                    updateDraft("discountType", event.target.value as DiscountType)
                  }
                  className={INPUT_CLASS}
                >
                  <option value="percentage">Phần trăm (%)</option>
                  <option value="fixed">Số tiền cố định (VND)</option>
                </select>
              </Field>
              <Field
                label={draft.discountType === "percentage" ? "Giá trị (%)" : "Giá trị (VND)"}
                error={errors.value}
              >
                <input
                  type="number"
                  min={0}
                  value={draft.value}
                  onChange={(event) => updateDraft("value", Number(event.target.value))}
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
            <Field label="Giá trị đơn hàng tối thiểu (VND)" error={errors.minOrderAmount}>
              <input
                type="number"
                min={0}
                value={draft.minOrderAmount}
                onChange={(event) => updateDraft("minOrderAmount", event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ngày bắt đầu">
                <input
                  type="date"
                  value={draft.startsAt}
                  onChange={(event) => updateDraft("startsAt", event.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Ngày hết hạn" error={errors.expiresAt}>
                <input
                  type="date"
                  value={draft.expiresAt}
                  onChange={(event) => updateDraft("expiresAt", event.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Số lượt sử dụng tối đa" error={errors.maxUses}>
                <input
                  type="number"
                  min={0}
                  value={draft.maxUses}
                  onChange={(event) => updateDraft("maxUses", event.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Giới hạn mỗi khách hàng" error={errors.perCustomerLimit}>
                <input
                  type="number"
                  min={0}
                  value={draft.perCustomerLimit}
                  onChange={(event) => updateDraft("perCustomerLimit", event.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(event) => updateDraft("isActive", event.target.checked)}
                className="size-4 rounded border-border"
              />
              Kích hoạt mã giảm giá
            </label>
            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? <Spinner /> : null}
              {isEditing ? "Cập nhật mã giảm giá" : "Thêm mã giảm giá"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}

const INPUT_CLASS =
  "h-11 w-full rounded-card border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-label text-muted">
        {label}
      </span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
