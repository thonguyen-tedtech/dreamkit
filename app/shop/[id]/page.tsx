import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductDetailView } from "@/components/product/product-detail-view";

export const metadata: Metadata = {
  title: "Chi tiết sản phẩm — Dreamkit",
  description: "Thông tin chi tiết, màu sắc và kích cỡ sản phẩm áo đấu Dreamkit.",
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <SiteHeader />
      <main>
        <ProductDetailView id={id} />
      </main>
      <SiteFooter />
    </>
  );
}
