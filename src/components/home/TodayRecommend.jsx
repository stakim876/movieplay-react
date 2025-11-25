import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMovies } from "@/services/tmdb.js";
import "@/styles/components.css";

export default function TodayRecommend() {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadRecommendations() {
      const res = await fetchMovies("/trending/movie/day?language=ko-KR");
      setMovies(res.results.slice(0, 10));
    }
    loadRecommendations();
  }, []);

  return (
    <section className="today-recommend">
      <h2 className="recommend-title">🎬 오늘의 추천작</h2>
      <div className="recommend-row">
        {movies.map((m) => (
          <div
            key={m.id}
            className="recommend-card"
            onClick={() => navigate(`/movie/${m.id}`)}
          >
            <div className="poster-wrapper">
              <img
                src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                alt={m.title}
                className="poster"
              />
            </div>
            <p className="movie-name">{m.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

