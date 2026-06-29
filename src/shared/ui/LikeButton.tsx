import { useFavorites } from "@/stores/favoritesStore";

export default function LikeButton({ movie }) {
  const { favorites, toggleFavorite } = useFavorites();
  const isLiked = favorites.some((f) => f.id === movie.id);

  return (
    <button
      type="button"
      className={`like-btn ${isLiked ? "liked" : ""}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(movie);
      }}
    >
      {isLiked ? "❤️" : "🤍"}
    </button>
  );
}

