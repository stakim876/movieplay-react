import { useEffect, useState } from "react";
import { fetchMovies } from "@/services/tmdb";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import {
  getGenreBasedRecommendations,
  getPersonalizedRecommendations,
  generateRecommendationReason,
} from "@/services/recommendation";
import MovieCard from "@/components/category/cards/MovieCard";
import { MovieCardSkeleton } from "@/components/common/Skeleton";
import { useUserFeedback } from "@/stores/userFeedbackStore";
import "@/styles/components/components.css";

export default function PersonalizedSection({ title, endpoint }) {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const { preferences, loading: preferencesLoading, hasData } = useUserPreferences();
  const { dislikedIds } = useUserFeedback();

  useEffect(() => {
    const loadMovies = async () => {
      if (preferencesLoading) return;

      try {
        setLoading(true);
        setError(false);
        const res = await fetchMovies(endpoint);
        const allMovies = (res?.results || []).filter((m) => !dislikedIds.has(m.id));

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
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [endpoint, preferencesLoading, hasData, preferences, title, dislikedIds]);

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

  if (error) {
    return (
      <section className="personalized-section">
        <h2 className="section-title">{title}</h2>
        <p className="section-empty-message">맞춤 추천을 불러오지 못했어요.</p>
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
          <MovieCard
            key={movie.id}
            movie={movie}
            recommendationReason={
              hasData
                ? generateRecommendationReason(movie, preferences)
                : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}
