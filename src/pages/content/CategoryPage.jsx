import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMovies } from "../../api/tmdb";
import MovieCard from "@/components/category/cards/MovieCard";
import "../../styles/common.css";

export default function CategoryPage() {
  const { type, category, genreId } = useParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    async function loadMovies() {
      try {
        let url = "";

        if (type && category) {
          url = `/${type}/${category}?language=ko-KR&page=1`;
        } else if (genreId) {
          url = `/discover/movie?with_genres=${genreId}&language=ko-KR&page=1`;
        }

        if (!url) return;

        setLoading(true);
        const res = await fetchMovies(url);

        const filtered = (res.results || []).filter(isSafeContent);

        setMovies(filtered);
      } catch (err) {
        console.error("CategoryPage fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, [type, category, genreId]);

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
    <div className="category-page">
      {loading ? (
        <p className="loading-text">불러오는 중...</p>
      ) : movies.length > 0 ? (
        <>
          <h2 className="page-title">{pageTitle}</h2>
          <div className="movie-grid">
            {movies.slice(0, 10).map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </>
      ) : (
        <p className="no-results">콘텐츠가 없습니다.</p>
      )}
    </div>
  );
}

