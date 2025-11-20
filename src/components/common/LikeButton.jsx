import { useFavorites } from "@/context/FavoritesContext";

export default function LikeButton({ movie }) {
  const { favorites, toggleFavorite } = useFavorites();
  const isLiked = favorites.some((f) => f.id === movie.id);

  return (
    <button
      className={`like-btn ${isLiked ? "liked" : ""}`}
      onClick={() => toggleFavorite(movie)}
    >
      {isLiked ? "❤️" : "🤍"}
    </button>
  );
}

