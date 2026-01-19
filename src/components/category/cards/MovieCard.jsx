import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaInfoCircle } from "react-icons/fa";
import "@/styles/components/components.css";

const fallbackImage = "https://placehold.co/300x450?text=No+Image&font=roboto";

export default function MovieCard({ movie }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const imageUrl = useMemo(() => {
    return movie.poster_path || movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path || movie.backdrop_path}`
      : fallbackImage;
  }, [movie.poster_path, movie.backdrop_path]);

  const mediaType = useMemo(() => {
    return movie.media_type || (movie.first_air_date ? "tv" : "movie");
  }, [movie.media_type, movie.first_air_date]);

  const handleCardClick = useCallback((e) => {
    if (e.target.closest(".movie-card-button")) {
      return;
    }
    navigate(`/${mediaType}/${movie.id}`);
  }, [navigate, mediaType, movie.id]);

  const handlePlayClick = useCallback((e) => {
    e.stopPropagation();
    navigate(`/${mediaType}/${movie.id}`);
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
        </div>
      </div>
    </div>
  );
}
