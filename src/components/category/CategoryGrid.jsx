import { useEffect, useRef, useState } from "react";
import { fetchMovies } from "@/services/tmdb.js";
import MovieCard from "@/components/category/cards/MovieCard";
import "@/styles/components.css";

export default function CategoryGrid({ title, category, type, genreId }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const rowRef = useRef(null);

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
    async function loadMovies() {
      try {
        let url = "";

        if (category && type) {
          url = `/${type}/${category}?language=ko-KR&page=1&include_adult=false`;
        } else if (genreId) {
          url = `/discover/movie?with_genres=${genreId}&language=ko-KR&page=1&include_adult=false`;
        }

        if (!url) return;

        setLoading(true);
        const res = await fetchMovies(url);

        const filtered = (res.results || []).filter(isSafeContent);

        setMovies(filtered.slice(0, 20));
      } catch (err) {
        console.error("CategoryGrid fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, [category, type, genreId]);

  return (
    <div className="category-grid">
      {title && <h2 className="category-title">{title}</h2>}

      {loading ? (
        <p className="loading-text">불러오는 중...</p>
      ) : movies.length > 0 ? (
        <div className="scroll-wrapper">
          <div className="movie-row" ref={rowRef}>
            {movies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </div>
      ) : (
        <p className="no-results">영화가 없습니다.</p>
      )}
    </div>
  );
}

