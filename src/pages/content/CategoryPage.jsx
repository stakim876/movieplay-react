import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchMovies } from "@/services/tmdb.js";
import MovieCard from "@/components/category/cards/MovieCard";
import { MovieCardSkeleton } from "@/components/common/Skeleton";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { useToast } from "@/context/ToastContext";
import "../../styles/common/common.css";

export default function CategoryPage() {
  const { type, category, genreId } = useParams();
  const { error: showError } = useToast();
  // 영화 데이터 상태 저장
  const [movies, setMovies] = useState([]);
  // 로딩 상태 저장
  const [loading, setLoading] = useState(true);
  // 현재 페이지 번호 상태 저장
  const [page, setPage] = useState(1);
  // 더 불러올 데이터 존재 여부 상태 저장
  const [hasMore, setHasMore] = useState(true);
  // 에러 메시지 상태 저장
  const [error, setError] = useState(null);
  const gridRef = useRef(null);

  useKeyboardNavigation(gridRef, ".movie-card");

  function isSafeContent(item) {
    const text = `${item.title || item.name || ""} ${item.overview || ""}`.toLowerCase();
    return (
      !item.adult &&
      ![
        "porn", "pornographic", "zwinger", "erotic", "fetish",
        "xvideo", "xhamster", "adult video", "hardcore", "nude",
        "야동", "에로", "성인", "노출", "19금", "음란", "포르노"
      ].some((kw) => text.includes(kw))
    );
  }

  // 카테고리/장르 변경 시 페이지·목록 초기화
  useEffect(() => {
    setPage(1);
    setMovies([]);
    setHasMore(true);
  }, [type, category, genreId]);

  // 페이지/카테고리 변경 시 영화 데이터 가져오기
  useEffect(() => {
    async function loadMovies() {
      if (!hasMore && page > 1) return;

      try {
        let url = "";

        if (type && category) {
          url = `/${type}/${category}?language=ko-KR&page=${page}`;
        } else if (genreId) {
          url = `/discover/movie?with_genres=${genreId}&language=ko-KR&page=${page}`;
        }

        if (!url) return;

        setLoading(page === 1);
        const res = await fetchMovies(url);

        const filtered = (res.results || []).filter(isSafeContent);

        if (page === 1) {
          setMovies(filtered);
        } else {
          setMovies((prev) => [...prev, ...filtered]);
        }

        setHasMore(res.results && res.results.length > 0 && filtered.length > 0);
      } catch (err) {
        console.error("CategoryPage fetch error:", err);
        const errorMessage = err.message || "콘텐츠를 불러오는데 실패했습니다.";
        setError(errorMessage);
        setHasMore(false);
        if (page === 1) {
          showError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, [page, type, category, genreId, hasMore, showError]);

  // 스크롤 하단 도달 시 다음 페이지 로드 (setPage 증가 → 위 useEffect에서 fetchMovies)
  useEffect(() => {
    const handleScroll = () => {
      const threshold = 500;
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;

      if (pageHeight - scrollPosition < threshold && hasMore && !loading) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading]);

  const categoryMap = {
    popular: "인기작",
    now_playing: "현재 상영작",
    top_rated: "평점 높은 작품",
    upcoming: "개봉 예정작",
  };

  const pageTitle =
    type && category
      ? `${type === "movie" ? "영화" : "드라마"} - ${
          categoryMap[category] || category
        }`
      : "장르별 영화";

  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <div className="category-page">
        <h2 className="page-title">{pageTitle}</h2>
        {error && movies.length === 0 && !loading && (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button
              className="retry-btn"
              onClick={() => {
                setPage(1);
                setError(null);
                setHasMore(true);
              }}
            >
              다시 시도
            </button>
          </div>
        )}
        {loading && page === 1 ? (
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
            {loading && page > 1 && (
              <>
                {[...Array(6)].map((_, i) => (
                  <MovieCardSkeleton key={`loading-${i}`} />
                ))}
              </>
            )}
          </div>
        ) : !error ? (
          <p className="no-results">콘텐츠가 없습니다.</p>
        ) : null}
      </div>
    </ErrorBoundary>
  );
}

