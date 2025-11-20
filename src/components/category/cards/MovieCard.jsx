import { useNavigate } from "react-router-dom";
import "@/styles/components.css";

const fallbackImage = "https://placehold.co/300x450?text=No+Image&font=roboto";

export default function MovieCard({ movie }) {
  const navigate = useNavigate();

  const imageUrl =
    movie.poster_path || movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path || movie.backdrop_path}`
      : fallbackImage;

  const mediaType = movie.media_type || (movie.first_air_date ? "tv" : "movie");

  return (
    <div
      className="movie-card"
      onClick={() => {
        navigate(`/${mediaType}/${movie.id}`);
      }}
    >
      <img
        src={imageUrl}
        alt={movie.title || movie.name}
        className="movie-poster"
      />
      <div className="overlay">
        {movie.vote_average > 0 && (
          <p className="movie-rating">⭐ {movie.vote_average.toFixed(1)}</p>
        )}
      </div>
    </div>
  );
}

