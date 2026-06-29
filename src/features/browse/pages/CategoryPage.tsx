import { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import MovieCard from "@/features/browse/components/category/cards/MovieCard";
import { MovieCardSkeleton } from "@/shared/ui/Skeleton";
import { useKeyboardNavigation } from "@/shared/hooks/useKeyboardNavigation";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";
import {
  isCatalogItemVisible,
  useCategoryPageQuery,
} from "@/features/browse/hooks/useBrowseQueries";
import { useUserFeedback } from "@/stores/userFeedbackStore";
import "@/styles/common/common.css";

const CATEGORY_LABELS: Record<string, string> = {
  popular: "인기작",
  now_playing: "현재 상영작",
  top_rated: "평점 높은 작품",
  upcoming: "개봉 예정작",
};

export default function CategoryPage() {
  const { type, category, genreId } = useParams();
  const { dislikedIds } = useUserFeedback();
  const gridRef = useRef<HTMLDivElement | null>(null);

  const params = useMemo(() => {
    if (type && category) {
      return { type, category };
    }
    if (genreId) {
      return { genreId: Number(genreId) };
    }
    return {};
  }, [type, category, genreId]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    error,
    refetch,
  } = useCategoryPageQuery(params);

  const movies = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      (page.results || []).filter((item) => isCatalogItemVisible(item, dislikedIds))
    );
  }, [data, dislikedIds]);

  useKeyboardNavigation(gridRef, ".movie-card");

  useEffect(() => {
    const handleScroll = () => {
      const threshold = 500;
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;

      if (
        pageHeight - scrollPosition < threshold &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const pageTitle =
    type && category
      ? `${type === "movie" ? "영화" : "드라마"} - ${CATEGORY_LABELS[category] || category}`
      : "장르별 영화";

  const errorMessage =
    error instanceof Error ? error.message : "콘텐츠를 불러오는데 실패했습니다.";

  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <div className="category-page">
        <h2 className="page-title">{pageTitle}</h2>
        {isError && movies.length === 0 && !isLoading && (
          <div className="error-state">
            <p className="error-message">{errorMessage}</p>
            <button className="retry-btn" onClick={() => refetch()}>
              다시 시도
            </button>
          </div>
        )}
        {isLoading ? (
          <div className="movie-grid" ref={gridRef}>
            {[...Array(10)].map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="movie-grid fade-in" ref={gridRef}>
            {movies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
            {isFetchingNextPage &&
              [...Array(6)].map((_, i) => (
                <MovieCardSkeleton key={`loading-${i}`} />
              ))}
          </div>
        ) : !isError ? (
          <p className="no-results">콘텐츠가 없습니다.</p>
        ) : null}
      </div>
    </ErrorBoundary>
  );
}
