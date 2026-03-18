import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMovies } from "@/services/tmdb.js";
import HorizontalScroller from "@/components/common/HorizontalScroller";
import "@/styles/components/components.css";

export default function TodayTop10() {
  // 영화 데이터 상태 저장 (TOP 10)
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  // 페이지 로드 시 영화 데이터 가져오기
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
      <HorizontalScroller
        className="top10-scroller"
        scrollClassName="top10-row"
        ariaLabel="today top 10"
      >
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
      </HorizontalScroller>
    </section>
  );
}

