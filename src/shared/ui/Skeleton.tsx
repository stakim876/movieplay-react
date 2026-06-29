import "@/styles/common/skeleton.css";

export function MovieCardSkeleton() {
  return (
    <div className="skeleton-movie-card">
      <div className="skeleton-poster"></div>
      <div className="skeleton-title"></div>
      <div className="skeleton-rating"></div>
    </div>
  );
}

export function CategoryGridSkeleton() {
  return (
    <div className="skeleton-category-grid">
      <div className="skeleton-title-bar"></div>
      <div className="skeleton-scroll-row">
        {[...Array(6)].map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="skeleton-hero">
      <div className="skeleton-hero-content"></div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="skeleton-detail">
      <div className="skeleton-detail-header">
        <div className="skeleton-detail-poster"></div>
        <div className="skeleton-detail-info">
          <div className="skeleton-detail-title"></div>
          <div className="skeleton-detail-text"></div>
          <div className="skeleton-detail-text"></div>
          <div className="skeleton-detail-text short"></div>
        </div>
      </div>
    </div>
  );
}
