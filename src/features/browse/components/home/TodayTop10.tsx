import { useNavigate } from "react-router-dom";
import HorizontalScroller from "@/shared/ui/HorizontalScroller";
import { MovieCardSkeleton } from "@/shared/ui/Skeleton";
import { useTop10Query } from "@/features/browse/hooks/useBrowseQueries";
import "@/styles/components/components.css";

export default function TodayTop10() {
  const navigate = useNavigate();
  const { data: movies = [], isLoading } = useTop10Query();

  return (
    <section className="today-top10">
      <h2 className="top10-title">지금 뜨는 작품</h2>
      <HorizontalScroller
        className="top10-scroller"
        scrollClassName="top10-row"
        ariaLabel="trending movies"
      >
        {isLoading
          ? [...Array(5)].map((_, i) => <MovieCardSkeleton key={i} />)
          : movies.map((m, i) => (
              <div
                key={m.id}
                className="top10-card"
                onClick={() => navigate(`/movie/${m.id}`)}
              >
                <div className="rank">{i + 1}</div>
                <img
                  src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                  alt={m.title || m.name}
                  className="poster"
                  loading="lazy"
                />
                <p className="movie-name">{m.title || m.name}</p>
              </div>
            ))}
      </HorizontalScroller>
    </section>
  );
}
