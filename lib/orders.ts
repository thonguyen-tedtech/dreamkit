import type { Order, OrderStatus, OrderType, PaymentMethod, ProductDesignMode } from "./types";

export const ORDER_STATUS_LABELS: Readonly<Record<OrderStatus, string>> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  in_production: "Đang sản xuất",
  printing: "Đang in ấn",
  shipping: "Đang giao",
  delivered: "Hoàn thành",
  cancelled: "Đã huỷ",
};

export const ORDER_STATUSES: readonly OrderStatus[] = [
  "pending",
  "confirmed",
  "in_production",
  "printing",
  "shipping",
  "delivered",
  "cancelled",
];

export const PAYMENT_METHOD_LABELS: Readonly<Record<PaymentMethod, string>> = {
  bank: "Chuyển khoản",
  cash: "Tiền mặt",
};

export const ORDER_TYPE_LABELS: Readonly<Record<OrderType, string>> = {
  single: "Đơn lẻ",
  team: "Đơn đội",
};

export const ORDER_TYPES: readonly OrderType[] = ["single", "team"];

export const PRODUCT_DESIGN_MODE_LABELS: Readonly<Record<ProductDesignMode, string>> = {
  standard: "Mẫu có sẵn",
  custom: "Thiết kế riêng",
};

export const PRODUCT_DESIGN_MODES: readonly ProductDesignMode[] = ["standard", "custom"];

/** Days the "Printing & Packaging" step is estimated to take, anchored on the previous step's completion. */
export const PRINTING_PACKAGING_DAYS: readonly [number, number] = [2, 3];

/** Days the "Production" step (custom orders only) is estimated to take, anchored on confirmedAt. */
export const PRODUCTION_DAYS: readonly [number, number] = [3, 5];

/** Days the "Shipping" step is estimated to take, anchored on printingCompletedAt. */
export const SHIPPING_DAYS: readonly [number, number] = [2, 3];

export type TimelineStepState = "done" | "active" | "upcoming";

export interface OrderTimelineStep {
  readonly key: string;
  readonly title: string;
  readonly state: TimelineStepState;
  readonly detail: string;
  /** "dd/mm - dd/mm" estimate, present while the step isn't done yet. */
  readonly estimateLabel?: string;
  readonly images?: readonly string[];
  readonly trackingNumber?: string;
}

const STANDARD_FLOW: readonly OrderStatus[] = ["pending", "confirmed", "printing", "shipping", "delivered"];
const CUSTOM_FLOW: readonly OrderStatus[] = [
  "in_production",
  "confirmed",
  "printing",
  "shipping",
  "delivered",
];

function addDays(iso: string, days: number): Date {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * `toLocaleDateString("vi-VN", ...)` only produces day/month-first output
 * when the runtime ships full ICU data; Node's default small-icu build falls
 * back to en-US ordering (or throws), silently breaking the dd/mm format.
 * Build the strings by hand instead so they're locale-independent.
 */
function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function formatShortDate(date: Date): string {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}`;
}

function formatFullDate(date: Date): string {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** e.g. "14:30 18/09/2026". */
function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const time = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  return `${time} ${formatFullDate(date)}`;
}

/** e.g. "18/09 - 21/09". */
function formatDateRange(anchorIso: string, [min, max]: readonly [number, number]): string {
  const from = formatShortDate(addDays(anchorIso, min));
  const to = formatShortDate(addDays(anchorIso, max));
  return from === to ? from : `${from} - ${to}`;
}

function stepState(flowIndex: number, currentIndex: number): TimelineStepState {
  if (currentIndex < 0) return "upcoming";
  if (flowIndex < currentIndex) return "done";
  if (flowIndex === currentIndex) return "active";
  return "upcoming";
}

/** Unique, defined product images across an order's lines. */
function orderProductImages(order: Order): readonly string[] {
  const images = order.lines.map((line) => line.productImage).filter((image): image is string => Boolean(image));
  return Array.from(new Set(images));
}

/**
 * Builds the timeline steps shown on the order tracker. Callers should handle
 * `order.status === "cancelled"` separately; this always maps against the
 * order's normal (non-cancelled) lifecycle.
 *
 * The backend stamps a timestamp the moment an order's status is set to
 * confirmed/in_production/printing/shipping (`confirmedAt`,
 * `productionCompletedAt`, `printingCompletedAt`, `shippingCompletedAt`).
 * Each step's estimate anchors directly on the immediately preceding step's
 * timestamp and only appears once that timestamp is set.
 */
export function buildOrderTimeline(order: Order): readonly OrderTimelineStep[] {
  if (order.productDesignMode === "custom") {
    const currentIndex = CUSTOM_FLOW.indexOf(order.status);
    const productionState = stepState(0, currentIndex);
    const printingState = stepState(2, currentIndex);
    const shippingState = stepState(3, currentIndex);

    const confirmTimeIso = order.confirmedAt ?? order.createdAt;

    return [
      {
        key: "confirmed",
        title: "Đã xác nhận",
        state: currentIndex < 0 ? "upcoming" : "done",
        detail: `Hệ thống đã ghi nhận đơn thiết kế riêng cùng ảnh thiết kế cuối cùng lúc ${formatDateTime(confirmTimeIso)}.`,
        images: order.customDesignImages,
      },
      {
        key: "production",
        title: "Sản xuất",
        state: productionState,
        detail: "Dự kiến 3–5 ngày, tính từ lúc quản trị viên xác nhận.",
        estimateLabel:
          productionState !== "done" && order.confirmedAt
            ? formatDateRange(order.confirmedAt, PRODUCTION_DAYS)
            : undefined,
      },
      {
        key: "printing",
        title: "In ấn & đóng gói",
        state: printingState,
        detail: "Dự kiến 2–3 ngày, tính từ lúc hoàn tất sản xuất.",
        estimateLabel:
          printingState !== "done" && order.productionCompletedAt
            ? formatDateRange(order.productionCompletedAt, PRINTING_PACKAGING_DAYS)
            : undefined,
      },
      {
        key: "shipping",
        title: "Vận chuyển",
        state: shippingState,
        detail: "Dự kiến 2–3 ngày, tính từ lúc hoàn tất in ấn.",
        estimateLabel:
          shippingState !== "done" && order.printingCompletedAt
            ? formatDateRange(order.printingCompletedAt, SHIPPING_DAYS)
            : undefined,
        trackingNumber: order.trackingNumber,
      },
    ];
  }

  const currentIndex = STANDARD_FLOW.indexOf(order.status);
  const pendingState: TimelineStepState = order.confirmedAt ? "done" : "active";
  const confirmedState: TimelineStepState = order.confirmedAt ? "done" : "upcoming";
  const printingState = stepState(2, currentIndex);
  const shippingState = stepState(3, currentIndex);

  return [
    {
      key: "pending",
      title: "Chờ xác nhận",
      state: pendingState,
      detail: order.confirmedAt
        ? "Đơn hàng đã được tiếp nhận."
        : "Đơn hàng đang chờ quản trị viên xác nhận.",
    },
    {
      key: "confirmed",
      title: "Đã xác nhận",
      state: confirmedState,
      detail: order.confirmedAt
        ? `Đơn hàng đã được hệ thống xác nhận lúc ${formatDateTime(order.confirmedAt)}.`
        : "Đơn hàng đã được hệ thống xác nhận.",
      images: orderProductImages(order),
    },
    {
      key: "printing",
      title: "In ấn & đóng gói",
      state: printingState,
      detail: "Dự kiến 2–3 ngày, tính từ lúc quản trị viên xác nhận.",
      estimateLabel:
        printingState !== "done" && order.confirmedAt
          ? formatDateRange(order.confirmedAt, PRINTING_PACKAGING_DAYS)
          : undefined,
    },
    {
      key: "shipping",
      title: "Vận chuyển",
      state: shippingState,
      detail: "Dự kiến 2–3 ngày, tính từ lúc hoàn tất in ấn.",
      estimateLabel:
        shippingState !== "done" && order.printingCompletedAt
          ? formatDateRange(order.printingCompletedAt, SHIPPING_DAYS)
          : undefined,
      trackingNumber: order.trackingNumber,
    },
  ];
}
