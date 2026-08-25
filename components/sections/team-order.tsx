import { Container } from "@/components/ui/container";

interface TeamPerk {
  readonly title: string;
  readonly description: string;
}

interface ContactLink {
  readonly label: string;
  readonly href: string;
}

const CONTACT_LINKS: readonly ContactLink[] = [
  { label: "Facebook", href: "https://www.facebook.com/dreamkitvn" },
  { label: "Zalo", href: "https://zalo.me/0934907570" },
  { label: "Điện thoại", href: "tel:0934907570" },
];

const CONTACT_LINK_CLASSNAME =
  "inline-flex grow h-14 items-center justify-center gap-2 rounded-card bg-accent px-9 text-sm font-medium uppercase tracking-label text-accent-foreground transition-colors duration-200 hover:bg-foreground/85";

const TEAM_PERKS: readonly TeamPerk[] = [
  {
    title: "Liên hệ trực tiếp",
    description: "Hỗ trợ nhanh chóng, tư vấn tận tâm cho từng đội.",
  },
  {
    title: "Xem sản phẩm",
    description: "Khám phá các mẫu kit có sẵn cho đội của bạn.",
  },
  {
    title: "Nhận ưu đãi",
    description: "Ưu đãi đặc biệt dành cho đội từ 5 bộ trở lên.",
  },
];

export function TeamOrder() {
  return (
    <section className="bg-background py-20 lg:py-24">
      <Container>
        <div className="flex flex-col gap-10 rounded-card bg-surface px-8 py-12 lg:px-16">
          <div className="flex flex-col gap-4 text-center">
            <span className="text-xs font-medium uppercase tracking-label text-highlight">
              Liên hệ đặt đội
            </span>
            <h2 className="font-display text-3xl text-foreground sm:text-4xl">
              Sẵn sàng cho mùa giải mới?
            </h2>
          </div>
          <ul className="grid gap-8 md:grid-cols-3">
            {TEAM_PERKS.map((perk) => (
              <li key={perk.title} className="flex flex-col items-center gap-2 text-center">
                <h3 className="text-sm font-semibold uppercase tracking-label text-foreground">
                  {perk.title}
                </h3>
                <p className="max-w-xs text-sm text-muted">{perk.description}</p>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap justify-center gap-4">
            {CONTACT_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("tel:") ? undefined : "_blank"}
                rel={link.href.startsWith("tel:") ? undefined : "noopener noreferrer"}
                className={CONTACT_LINK_CLASSNAME}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
