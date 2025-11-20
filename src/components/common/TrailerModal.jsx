import { useEffect } from "react";

export default function TrailerModal({ isOpen, onClose, movie }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !movie) return null;

  const trailerUrl =
    movie.trailerUrl ||
    `https://www.youtube.com/embed/${movie.trailerKey || "dQw4w9WgXcQ"}?autoplay=1&rel=0`;

  return (
    <div className="trailer-modal-overlay" onClick={onClose}>
      <div className="trailer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="trailer-close-btn" onClick={onClose}>
          ×
        </button>

        <div className="trailer-content">
          <div className="trailer-header">
            <h2>{movie.title || movie.name}</h2>
            <p className="trailer-description">{movie.overview}</p>
          </div>

          <div className="trailer-video">
            <iframe
              src={trailerUrl}
              title={`${movie.title || movie.name} 예고편`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          <div className="trailer-info">
            <div className="movie-details">
              <span className="rating">
                ⭐ {movie.vote_average?.toFixed(1) || "8.5"}
              </span>
              <span className="year">
                {new Date(movie.release_date || movie.first_air_date).getFullYear() ||
                  "2023"}
              </span>
              <span className="genre">
                {movie.genre_names?.join(", ") || "액션, 드라마"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

