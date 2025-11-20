import { useEffect, useState } from "react";
import { fetchMovies } from "@/services/tmdb";
import { useNavigate } from "react-router-dom";
import "@/styles/components.css";

export default function CategoryList({ title, genreId }) {
  const [movies, setMovies] = useState([]);
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadMovies() {
      try {
        const res = await fetchMovies(
          `/discover/movie?with_genres=${genreId}&language=ko-KR&page=1&include_adult=false`
        );
        setMovies(res.results.slice(0, 8));
      } catch (err) {
        console.error("CategoryList fetch error:", err);
      }
    }
    loadMovies();
  }, [genreId]);

  return (
    <section className="category-list">
      <h2 className="category-list-title">{title}</h2>

      <div className="category-grid">
        {movies.map((m, i) => (
          <div
            key={m.id}
            className="category-card"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => navigate(`/movie/${m.id}`)}
          >
            {hovered === i ? (
              <iframe
                src={`https://www.youtube.com/embed/${m.trailerKey || ""}?autoplay=1&mute=1&controls=0`}
                title={m.title}
                allow="autoplay; encrypted-media"
                frameBorder="0"
              />
            ) : (
              <img
                src={
                  m.poster_path
                    ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                    : "https://placehold.co/300x450?text=No+Image"
                }
                alt={m.title}
              />
            )}
            <div className="card-overlay">
              <p className="movie-title">{m.title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

