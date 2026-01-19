import { useEffect, useRef, useState } from "react";
import { fetchMovies } from "@/services/tmdb.js";
import MovieCard from "@/components/category/cards/MovieCard";
import { MovieCardSkeleton } from "@/components/common/Skeleton";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import "@/styles/components/components.css";

export default function CategoryGrid({ title, category, type, genreId }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const rowRef = useRef(null);
  
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

  useEffect(() => {
    setPage(1);
    setMovies([]);
    setHasMore(true);
  }, [category, type, genreId]);

  useEffect(() => {
    async function loadMovies() {
      if (!hasMore && page > 1) return;

      try {
        let url = "";

        if (category && type) {
          url = `/${type}/${category}?language=ko-KR&page=${page}&include_adult=false`;
        } else if (genreId) {
          url = `/discover/movie?with_genres=${genreId}&language=ko-KR&page=${page}&include_adult=false`;
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
        console.error("CategoryGrid fetch error:", err);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, [page, category, type, genreId, hasMore]);

  useEffect(() => {
    const scrollWrapper = rowRef.current?.closest(".scroll-wrapper");
    if (!scrollWrapper || !hasMore) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollWrapper;
      const threshold = 200;

      if (scrollWidth - scrollLeft - clientWidth < threshold) {
        setPage((prev) => prev + 1);
      }
    };

    scrollWrapper.addEventListener("scroll", handleScroll);
    return () => scrollWrapper.removeEventListener("scroll", handleScroll);
  }, [hasMore]);

  return (
    <div className="category-grid">
      {title && <h2 className="category-title">{title}</h2>}

      {loading ? (
        <div className="scroll-wrapper">
          <div className="movie-row" ref={rowRef}>
            {[...Array(6)].map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : movies.length > 0 ? (
        <div className="scroll-wrapper">
          <div className="movie-row fade-in" ref={rowRef}>
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
        </div>
      ) : (
        <p className="no-results">영화가 없습니다.</p>
      )}
    </div>
  );
}

