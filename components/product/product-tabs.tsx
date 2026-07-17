"use client";

import { useState } from "react";
import { CONTACT_PHONE, CONTACT_ZALO_URL } from "@/lib/contact-info";
import { COLOR_META, TYPE_LABELS } from "@/lib/products";
import { PRODUCT_SIZES } from "@/lib/product-sizes";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/cn";

interface ProductTabsProps {
  product: Product;
}

type TabId = "description" | "guide" | "policy";

const TABS: ReadonlyArray<{ id: TabId; label: string }> = [
  { id: "description", label: "Mô tả" },
  { id: "guide", label: "Hướng dẫn mua hàng" },
  { id: "policy", label: "Chính sách đổi trả" },
];

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");

  return (
    <section className="border-t border-border pb-16 pt-10">
      <div role="tablist" aria-label="Thông tin sản phẩm" className="flex flex-wrap gap-8 border-b border-border">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`product-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`product-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "-mb-px border-b-2 pb-4 text-xs font-medium uppercase tracking-label transition-colors hover:cursor-pointer",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="pt-8">
        {activeTab === "description" ? (
          <div
            id="product-panel-description"
            role="tabpanel"
            aria-labelledby="product-tab-description"
          >
            <DescriptionPanel product={product} />
          </div>
        ) : null}
        {activeTab === "guide" ? (
          <div id="product-panel-guide" role="tabpanel" aria-labelledby="product-tab-guide">
            <GuidePanel />
          </div>
        ) : null}
        {activeTab === "policy" ? (
          <div id="product-panel-policy" role="tabpanel" aria-labelledby="product-tab-policy">
            <PolicyPanel />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DescriptionPanel({ product }: { product: Product }) {
  const colorLabels = product.colors.map((color) => COLOR_META[color].label).join(", ");

  return (
    <div className="max-w-2xl text-sm leading-relaxed text-muted">
      <p>
        {product.name} thuộc dòng {product.category.toLowerCase()}, chất liệu thể thao co
        giãn tốt và thấm hút mồ hôi — phù hợp thi đấu lẫn tập luyện cường độ cao. Đây là mẫu{" "}
        {TYPE_LABELS[product.type].toLowerCase()} có thể tuỳ biến theo bản sắc riêng của đội
        bóng bạn.
      </p>
      <p className="mt-4">
        Hiện có {product.colors.length} màu sắc: {colorLabels}. Đầy đủ kích cỡ từ{" "}
        {PRODUCT_SIZES[0]} đến {PRODUCT_SIZES[PRODUCT_SIZES.length - 1]}.
      </p>
    </div>
  );
}

function GuidePanel() {
  return (
    <div className="grid gap-10 sm:grid-cols-2">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-label text-foreground">
          Mua tại cửa hàng
        </h3>
        <ol className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-muted">
          <li>1. Ghé cửa hàng hoặc gọi hotline để được tư vấn kích cỡ, thiết kế.</li>
          <li>2. Chọn màu sắc, kích cỡ và số lượng phù hợp với đội bóng.</li>
          <li>3. Thanh toán trực tiếp và nhận sản phẩm hoặc hẹn ngày giao khi hoàn tất.</li>
        </ol>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-label text-foreground">
          Đặt hàng online
        </h3>
        <ol className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-muted">
          <li>1. Chọn màu sắc, kích cỡ, số lượng rồi thêm vào giỏ hàng.</li>
          <li>2. Điền thông tin giao hàng và chọn phương thức thanh toán.</li>
          <li>3. Dreamkit xác nhận đơn hàng qua điện thoại hoặc Zalo và tiến hành sản xuất.</li>
          <li>4. Giao hàng tận nơi, thời gian tuỳ theo số lượng và yêu cầu thiết kế.</li>
        </ol>
      </div>

      <p className="text-sm text-muted sm:col-span-2">
        Cần hỗ trợ thêm? Gọi hotline{" "}
        <a href={`tel:${CONTACT_PHONE}`} className="font-medium text-foreground underline underline-offset-4">
          {CONTACT_PHONE}
        </a>{" "}
        hoặc nhắn{" "}
        <a
          href={CONTACT_ZALO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Zalo
        </a>
        .
      </p>
    </div>
  );
}

function PolicyPanel() {
  return (
    <ul className="max-w-2xl list-disc pl-5 text-sm leading-relaxed text-muted [&>li]:mt-3 [&>li]:first:mt-0">
      <li>
        Đổi trả trong vòng 3 ngày kể từ khi nhận hàng nếu sản phẩm lỗi do nhà sản xuất (in
        sai, lỗi vải, đường may).
      </li>
      <li>Sản phẩm đổi trả cần còn nguyên tem, nhãn, chưa qua sử dụng hoặc giặt.</li>
      <li>
        Không áp dụng đổi trả với sản phẩm đã tuỳ chỉnh theo yêu cầu riêng (in tên, số áo,
        logo đội), trừ trường hợp lỗi từ phía Dreamkit.
      </li>
      <li>Chi phí vận chuyển đổi trả do lỗi sản xuất được Dreamkit hỗ trợ toàn bộ.</li>
    </ul>
  );
}
