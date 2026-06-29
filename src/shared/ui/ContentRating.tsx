import "@/styles/components/content-rating.css";

type ContentRatingProps = {
  adult?: boolean;
  voteAverage?: number;
  kidsMode?: boolean;
  compact?: boolean;
};

export default function ContentRating({
  adult,
  voteAverage,
  kidsMode = false,
  compact = false,
}: ContentRatingProps) {
  if (kidsMode) {
    return <span className={`content-rating content-rating--kids${compact ? " compact" : ""}`}>전체</span>;
  }

  if (adult) {
    return <span className={`content-rating content-rating--adult${compact ? " compact" : ""}`}>19+</span>;
  }

  const score = Number(voteAverage || 0);
  if (score >= 8) {
    return <span className={`content-rating content-rating--high${compact ? " compact" : ""}`}>12+</span>;
  }

  if (score >= 6) {
    return <span className={`content-rating content-rating--mid${compact ? " compact" : ""}`}>15+</span>;
  }

  return <span className={`content-rating content-rating--all${compact ? " compact" : ""}`}>ALL</span>;
}
