import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Review } from "@/lib/site-data";

export function ReviewsCarousel({ reviews }: { reviews: readonly Review[] }) {
  const [i, setI] = useState(0);
  if (reviews.length === 0) return null;
  const prev = () => setI((v) => (v - 1 + reviews.length) % reviews.length);
  const next = () => setI((v) => (v + 1) % reviews.length);
  const r = reviews[i];

  return (
    <div className="relative mx-auto max-w-4xl text-center">
      <div className="flex justify-center gap-1 text-gold">
        {Array.from({ length: 5 }).map((_, k) => (
          <Star key={k} className="h-5 w-5 fill-current" />
        ))}
      </div>
      <blockquote className="mt-8 font-serif text-2xl md:text-4xl leading-snug text-foreground italic">
        &ldquo;{r.quote}&rdquo;
      </blockquote>
      <p className="mt-8 text-[0.72rem] uppercase tracking-[0.32em] text-muted-foreground">
        — {r.name}
      </p>

      <div className="mt-12 flex items-center justify-center gap-6">
        <button
          onClick={prev}
          aria-label="Previous review"
          className="h-11 w-11 inline-flex items-center justify-center border border-foreground/20 hover:border-gold hover:text-gold-dark transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-2">
          {reviews.map((_, k) => (
            <button
              key={k}
              onClick={() => setI(k)}
              aria-label={`Review ${k + 1}`}
              className={
                "h-1.5 transition-all " +
                (k === i ? "w-8 bg-gold" : "w-1.5 bg-foreground/20 hover:bg-foreground/40")
              }
            />
          ))}
        </div>
        <button
          onClick={next}
          aria-label="Next review"
          className="h-11 w-11 inline-flex items-center justify-center border border-foreground/20 hover:border-gold hover:text-gold-dark transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
