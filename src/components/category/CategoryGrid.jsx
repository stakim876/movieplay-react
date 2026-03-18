import { useEffect, useRef, useState } from "react";
import { fetchMovies } from "@/services/tmdb.js";
import MovieCard from "@/components/category/cards/MovieCard";
import { MovieCardSkeleton } from "@/components/common/Skeleton";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import HorizontalScroller from "@/components/common/HorizontalScroller";
import { useUserFeedback } from "@/context/UserFeedbackContext";
import "@/styles/components/components.css";

export default function CategoryGrid({ title, category, type, genreId, endpoint }) {
  // 영화 데이터 상태 저장
  const [movies, setMovies] = useState([]);
  // 로딩 상태 저장
  const [loading, setLoading] = useState(true);
  // 현재 페이지 번호 상태 저장
  const [page, setPage] = useState(1);
  // 더 불러올 데이터 존재 여부 상태 저장
  const [hasMore, setHasMore] = useState(true);
  const rowRef = useRef(null);
  const { dislikedIds } = useUserFeedback();
  
  useKeyboardNavigation(rowRef, ".movie-card");

  function isSafeContent(item) {
    const text = `${item.title || ""} ${item.original_title || ""} ${
      item.overview || ""
    }`.toLowerCase();

    return (
      !item.adult &&
      item.poster_path &&
      ![
        "porn",
        "pornographic",
        "erotic",
        "fetish",
        "hardcore",
        "sex",
        "sexual",
        "nude",
        "naked",
        "xvideo",
        "xhamster",
        "zwinger",
        "escort",
        "adult video",
        "strip",
        "lust",
        "야동",
        "야사",
        "에로",
        "성인",
        "노출",
        "19금",
        "음란",
        "포르노",
        "섹스",
        "불륜",
        "エロ",
        "レイプ",
        "アダルト",
        "爆乳",
        "セックス",
      ].some((kw) => text.includes(kw))
    );
  }

  // 카테고리/장르 변경 시 페이지·목록 초기화
  useEffect(() => {
    setPage(1);
    setMovies([]);
    setHasMore(true);
  }, [category, type, genreId]);

  // 페이지/카테고리 변경 시 영화 데이터 가져오기
  useEffect(() => {
    async function loadMovies() {
      if (!hasMore && page > 1) return;

      try {
        let url = "";

        if (endpoint) {
          if (endpoint.includes("{page}")) {
            url = endpoint.replace("{page}", String(page));
          } else if (endpoint.includes("page=")) {
            url = endpoint.replace(/page=\d+/i, `page=${page}`);
          } else {
            url = `${endpoint}${endpoint.includes("?") ? "&" : "?"}page=${page}`;
          }
        } else if (category && type) {
          url = `/${type}/${category}?language=ko-KR&page=${page}&include_adult=false`;
        } else if (genreId) {
          url = `/discover/movie?with_genres=${genreId}&language=ko-KR&page=${page}&include_adult=false`;
        }

        if (!url) return;

        setLoading(page === 1);
        const res = await fetchMovies(url);

        const filtered = (res.results || [])
          .filter(isSafeContent)
          .filter((m) => !dislikedIds.has(m.id));

        if (page === 1) {
          setMovies(filtered);
        } else {
          setMovies((prev) => [...prev, ...filtered]);
        }

        setHasMore(res.results && res.results.length > 0 && filtered.length > 0);
      } catch (err) {
        console.error("CategoryGrid fetch error:", err);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, [page, category, type, genreId, endpoint, hasMore]);

  // 가로 스크롤 끝 도달 시 다음 페이지 로드 (setPage 증가 → 위 useEffect에서 fetchMovies)
  useEffect(() => {
    const scrollEl = rowRef.current;
    if (!scrollEl || !hasMore) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollEl;
      const threshold = 200;

      if (scrollWidth - scrollLeft - clientWidth < threshold) {
        setPage((prev) => prev + 1);
      }
    };

    scrollEl.addEventListener("scroll", handleScroll);
    return () => scrollEl.removeEventListener("scroll", handleScroll);
  }, [hasMore]);

  return (
    <div className="category-grid">
      {title && <h2 className="category-title">{title}</h2>}

      {loading ? (
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
            {loading && page > 1 && (
              <>
                {[...Array(3)].map((_, i) => (
                  <MovieCardSkeleton key={`loading-${i}`} />
                ))}
              </>
            )}
          </div>
        </HorizontalScroller>
      ) : (
        <p className="no-results">영화가 없습니다.</p>
      )}
    </div>
  );
}

