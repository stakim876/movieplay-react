import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaInfoCircle, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import LikeButton from "@/components/common/LikeButton";
import { useUserFeedback } from "@/context/UserFeedbackContext";
import { useWatchHistory } from "@/context/WatchHistoryContext";
import "@/styles/components/components.css";

const fallbackImage = "https://placehold.co/300x450?text=No+Image&font=roboto";

export default function MovieCard({ movie }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { likedIds, dislikedIds, toggleLike, toggleDislike } = useUserFeedback();
  const { getWatchProgress } = useWatchHistory();

  const imageUrl = useMemo(() => {
    return movie.poster_path || movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path || movie.backdrop_path}`
      : fallbackImage;
  }, [movie.poster_path, movie.backdrop_path]);

  const mediaType = useMemo(() => {
    return movie.media_type || (movie.first_air_date ? "tv" : "movie");
  }, [movie.media_type, movie.first_air_date]);

  const watchProgress = useMemo(() => {
    if (!movie?.id) return null;
    return getWatchProgress(movie.id, mediaType, null, null);
  }, [getWatchProgress, movie?.id, mediaType]);

  const progressPercent = watchProgress?.progressPercent
    ? Math.max(0, Math.min(100, watchProgress.progressPercent))
    : 0;

  const handleCardClick = useCallback((e) => {
    if (e.target.closest(".movie-card-button, .like-btn, .feedback-btn")) {
      return;
    }
    navigate(`/${mediaType}/${movie.id}`);
  }, [navigate, mediaType, movie.id]);

  const handlePlayClick = useCallback((e) => {
    e.stopPropagation();
    if (mediaType === "tv") {
      navigate(`/player/tv/${movie.id}?season=1&episode=1`);
      return;
    }
    navigate(`/player/${movie.id}`);
  }, [navigate, mediaType, movie.id]);

  const handleInfoClick = useCallback((e) => {
    e.stopPropagation();
    navigate(`/${mediaType}/${movie.id}`);
  }, [navigate, mediaType, movie.id]);

  return (
    <div
      className="movie-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <img
        src={imageUrl}
        alt={movie.title || movie.name}
        className="movie-poster"
        loading="lazy"
      />
      {progressPercent > 5 && progressPercent < 95 && (
        <div className="movie-progress">
          <div className="movie-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      )}
      <div className={`movie-card-overlay ${isHovered ? "hovered" : ""}`}>
        <div className="movie-card-info">
          <h3 className="movie-card-title">{movie.title || movie.name}</h3>
          {movie.vote_average > 0 && (
            <p className="movie-card-rating">⭐ {movie.vote_average.toFixed(1)}</p>
          )}
        </div>
        <div className="movie-card-buttons">
          <button
            className="movie-card-button movie-card-play"
            onClick={handlePlayClick}
            title="재생"
          >
            <FaPlay />
          </button>
          <button
            className="movie-card-button movie-card-info"
            onClick={handleInfoClick}
            title="상세 정보"
          >
            <FaInfoCircle />
          </button>
          <button
            type="button"
            className={`feedback-btn like ${likedIds.has(movie.id) ? "active" : ""}`.trim()}
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(movie.id);
            }}
            title="좋아요"
            aria-label="좋아요"
          >
            <FaThumbsUp />
          </button>
          <button
            type="button"
            className={`feedback-btn dislike ${dislikedIds.has(movie.id) ? "active" : ""}`.trim()}
            onClick={(e) => {
              e.stopPropagation();
              toggleDislike(movie.id);
            }}
            title="관심 없음"
            aria-label="관심 없음"
          >
            <FaThumbsDown />
          </button>
          <LikeButton movie={movie} />
        </div>
      </div>
    </div>
  );
}
