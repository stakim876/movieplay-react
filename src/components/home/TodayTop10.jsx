import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMovies } from "@/services/tmdb.js";
import "@/styles/components.css";

export default function TodayTop10() {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTop10() {
      const res = await fetchMovies("/movie/popular?language=ko-KR&page=1");
      setMovies(res.results.slice(0, 10));
    }
    loadTop10();
  }, []);

  return (
    <section className="today-top10">
      <h2 className="top10-title">오늘의 TOP 10</h2>
      <div className="top10-row">
        {movies.map((m, i) => (
          <div
            key={m.id}
            className="top10-card"
            onClick={() => navigate(`/movie/${m.id}`)}
          >
            <div className="rank">{i + 1}</div>
            <img
              src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
              alt={m.title}
              className="poster"
            />
            <p className="movie-name">{m.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

