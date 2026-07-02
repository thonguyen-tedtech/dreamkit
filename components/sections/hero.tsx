import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HERO_IMAGE, PRODUCTS } from "@/lib/products";

const HERO_PRODUCTS = PRODUCTS.slice(0, 3);

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-accent text-accent-foreground">
      <Image
        src={HERO_IMAGE}
        alt="Bộ sưu tập áo đấu Dreamkit"
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover opacity-55"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-accent via-accent/80 to-accent/30"
        aria-hidden="true"
      />

      <Container className="flex min-h-[80vh] flex-col justify-center gap-10 py-24">
        <div className="flex max-w-2xl flex-col gap-7">
          <span className="text-xs font-medium uppercase tracking-label text-highlight">
            Bộ sưu tập 2024 · Thiết kế áo đấu
          </span>
          <h1 className="font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
            Áo đấu riêng, kể câu chuyện đội bóng của bạn.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-accent-foreground/75">
            Dreamkit thiết kế và sản xuất từng bộ kit theo bản sắc riêng của đội —
            từ ý tưởng, phối màu đến sản phẩm hoàn thiện, tất cả tại Việt Nam.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/catalogue"
              className="inline-flex h-14 items-center justify-center rounded-card bg-background px-9 text-sm font-medium uppercase tracking-label text-foreground transition-colors duration-200 hover:bg-surface"
            >
              Xem catalogue
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent"
            >
              Liên hệ thiết kế
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-12 gap-y-6 border-t border-accent-foreground/15 pt-8">
          <Stat value="120+" label="Đội bóng đồng hành" />
          <Stat value="100%" label="Made in Vietnam" />
          <Stat value="7 ngày" label="Giao mẫu thiết kế" />
          <ul className="ml-auto hidden items-center gap-3 md:flex">
            {HERO_PRODUCTS.map((product) => (
              <li
                key={product.id}
                className="relative size-16 overflow-hidden rounded-card border border-accent-foreground/20"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl">{value}</p>
      <p className="text-xs uppercase tracking-label text-accent-foreground/60">{label}</p>
    </div>
  );
}
