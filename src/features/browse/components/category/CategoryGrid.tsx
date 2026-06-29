import { useEffect, useMemo, useRef } from "react";
import MovieCard from "@/features/browse/components/category/cards/MovieCard";
import { MovieCardSkeleton } from "@/shared/ui/Skeleton";
import { useKeyboardNavigation } from "@/shared/hooks/useKeyboardNavigation";
import HorizontalScroller from "@/shared/ui/HorizontalScroller";
import { useUserFeedback } from "@/stores/userFeedbackStore";
import {
  isCatalogItemVisible,
  useCatalogRowQuery,
} from "@/features/browse/hooks/useBrowseQueries";
import type { CatalogItem } from "@/features/browse/model/catalog";
import "@/styles/components/components.css";

function dedupeCatalogItems(items: CatalogItem[]) {
  const seen = new Set<number>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export default function CategoryGrid({
  title,
  category,
  type,
  genreId,
  endpoint,
}: {
  title?: string;
  category?: string;
  type?: string;
  genreId?: number;
  endpoint?: string;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const { dislikedIds } = useUserFeedback();
  const params = useMemo(
    () => ({ category, type, genreId, endpoint }),
    [category, type, genreId, endpoint]
  );

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useCatalogRowQuery(params, dislikedIds);

  const movies = useMemo(() => {
    if (!data?.pages) return [];
    const merged = data.pages.flatMap((page) =>
      (page.results || []).filter((item) => isCatalogItemVisible(item, dislikedIds))
    );
    return dedupeCatalogItems(merged);
  }, [data, dislikedIds]);

  useKeyboardNavigation(rowRef, ".movie-card");

  useEffect(() => {
    const scrollEl = rowRef.current;
    if (!scrollEl || !hasNextPage) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollEl;
      const threshold = 200;

      if (
        scrollWidth - scrollLeft - clientWidth < threshold &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    scrollEl.addEventListener("scroll", handleScroll);
    return () => scrollEl.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="category-grid">
      {title && <h2 className="category-title">{title}</h2>}

      {isLoading ? (
        <HorizontalScroller
          className="category-grid-scroller"
          scrollClassName="scroll-wrapper"
          ariaLabel={title || "movies"}
          ref={rowRef}
        >
          <div className="movie-row">
            {[...Array(6)].map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        </HorizontalScroller>
      ) : movies.length > 0 ? (
        <HorizontalScroller
          className="category-grid-scroller"
          scrollClassName="scroll-wrapper"
          ariaLabel={title || "movies"}
          ref={rowRef}
        >
          <div className="movie-row fade-in">
            {movies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
            {isFetchingNextPage &&
              [...Array(3)].map((_, i) => (
                <MovieCardSkeleton key={`loading-${i}`} />
              ))}
          </div>
        </HorizontalScroller>
      ) : (
        <p className="no-results">영화가 없습니다.</p>
      )}
    </div>
  );
}
