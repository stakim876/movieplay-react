import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMovies } from "@/services/tmdb.js";
import "@/styles/components.css";

export default function WatchAgain() {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadWatchAgain() {
      try {
        const res = await fetchMovies("/movie/popular?language=ko-KR&page=2");
        setMovies(res.results.slice(0, 10));
      } catch (err) {
        console.error("다시보기 콘텐츠 로드 실패:", err);
      }
    }
    loadWatchAgain();
  }, []);

  return (
    <section className="watch-again">
      <h2 className="watch-title">📺 다시보기 콘텐츠</h2>
      <div className="watch-row">
        {movies.map((m) => (
          <div
            key={m.id}
            className="watch-card"
            onClick={() => navigate(`/movie/${m.id}`)}
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
              alt={m.title}
              className="watch-poster"
            />
            <p className="watch-name">{m.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

