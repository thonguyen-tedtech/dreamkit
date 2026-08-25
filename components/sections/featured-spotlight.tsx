import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { FEATURED_STORY } from "@/lib/products";

export function FeaturedSpotlight() {
  const story = FEATURED_STORY;

  return (
    <section className="bg-background py-20 lg:py-28">
      <Container>
        <div className="grid items-stretch overflow-hidden rounded-card border border-border lg:grid-cols-2">
          <div className="relative min-h-[20rem] lg:min-h-[28rem]">
            <Image
              src={story.image}
              alt={`${story.club} — ${story.title}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center gap-6 bg-surface p-10 lg:p-14">
            <span className="text-xs font-medium uppercase tracking-label text-highlight">
              {story.club}
            </span>
            <h2 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
              {story.title}
            </h2>
            <p className="text-base leading-relaxed text-muted">{story.body}</p>

            <Button className="mt-2 w-fit">Xem câu chuyện</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
