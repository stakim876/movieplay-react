import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMovies } from "@/services/tmdb";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import {
  getGenreBasedRecommendations,
  getPersonalizedRecommendations,
} from "@/services/recommendation";
import MovieCard from "@/components/category/cards/MovieCard";
import { MovieCardSkeleton } from "@/components/common/Skeleton";
import "@/styles/components/components.css";

export default function PersonalizedSection({ title, endpoint }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { preferences, loading: preferencesLoading, hasData } = useUserPreferences();
  const navigate = useNavigate();

  useEffect(() => {
    const loadMovies = async () => {
      if (preferencesLoading) return;

      try {
        setLoading(true);
        const res = await fetchMovies(endpoint);
        const allMovies = res?.results || [];

        let recommendedMovies = allMovies;

        if (hasData) {
          if (title.includes("장르")) {
            recommendedMovies = getGenreBasedRecommendations(
              allMovies,
              preferences,
              10
            );
          } else {
            recommendedMovies = getPersonalizedRecommendations(
              allMovies,
              preferences,
              10
            );
          }
        }

        setMovies(recommendedMovies);
      } catch (err) {
        console.error("개인화 섹션 로드 실패:", err);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [endpoint, preferencesLoading, hasData, preferences, title]);

  if (loading || preferencesLoading) {
    return (
      <section className="personalized-section">
        <h2 className="section-title">{title}</h2>
        <div className="movie-row">
          {[...Array(6)].map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <section className="personalized-section">
      <h2 className="section-title">
        {title}
        {hasData && <span className="personalized-badge">맞춤 추천</span>}
      </h2>
      <div className="movie-row fade-in">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
