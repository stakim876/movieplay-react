import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/context/FavoritesContext";
import MovieCard from "@/components/category/cards/MovieCard";
import HorizontalScroller from "@/components/common/HorizontalScroller";
import "@/styles/components/components.css";

export default function MyListRow() {
  const navigate = useNavigate();
  const { favorites, loading } = useFavorites();

  const items = useMemo(() => {
    const list = Array.isArray(favorites) ? favorites : [];
    // FavoritesContext는 추가순이므로 그대로 노출
    return list.slice().reverse().slice(0, 20);
  }, [favorites]);

  if (loading) return null;
  if (!items.length) return null;

  return (
    <section className="category-grid">
      <div className="category-title-row">
        <h2 className="category-title">❤️ 내 찜한 콘텐츠</h2>
        <button
          type="button"
          className="category-more-btn"
          onClick={() => navigate("/favorites")}
        >
          모두 보기
        </button>
      </div>

      <HorizontalScroller
        className="category-grid-scroller"
        scrollClassName="scroll-wrapper"
        ariaLabel="my list"
      >
        <div className="movie-row fade-in">
          {items.map((m) => (
            <MovieCard key={`${m.media_type || "movie"}-${m.id}`} movie={m} />
          ))}
        </div>
      </HorizontalScroller>
    </section>
  );
}

