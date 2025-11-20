import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import MovieCard from "@/components/category/cards/MovieCard";
import "../../styles/common.css";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favorites } = useFavorites();

  if (!user) {
    return (
      <div className="favorites-page">
        <h2>로그인이 필요합니다.</h2>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <h2>내 찜 목록</h2>
      {favorites.length > 0 ? (
        <div className="favorites-list">
          {favorites.map((movie) => (
            <MovieCard key={movie.tmdbId} movie={movie} /> 
          ))}
        </div>
      ) : (
        <p>아직 찜한 영화가 없습니다.</p>
      )}
    </div>
  );
}

