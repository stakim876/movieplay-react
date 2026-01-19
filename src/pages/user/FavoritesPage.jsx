import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useToast } from "@/context/ToastContext";
import MovieCard from "@/components/category/cards/MovieCard";
import { MovieCardSkeleton } from "@/components/common/Skeleton";
import { FaTrash, FaSort, FaFilter } from "react-icons/fa";
import "../../styles/common/common.css";
import "../../styles/pages/favorites.css";

const SORT_OPTIONS = [
  { value: "recent", label: "최근 추가순" },
  { value: "title", label: "제목순" },
  { value: "rating", label: "평점순" },
];

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favorites, toggleFavorite, loading: favoritesLoading } = useFavorites();
  const { success: showSuccess, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const categorizedFavorites = useMemo(() => {
    const movies = favorites.filter((item) => {
      if (item.media_type) {
        return item.media_type === "movie";
      }
      return !item.name;
    });

    const tvs = favorites.filter((item) => {
      if (item.media_type) {
        return item.media_type === "tv";
      }
      return !!item.name;
    });

    return { movies, tvs };
  }, [favorites]);

  const sortedFavorites = useMemo(() => {
    let items = [];
    if (activeTab === "movie") {
      items = categorizedFavorites.movies;
    } else if (activeTab === "tv") {
      items = categorizedFavorites.tvs;
    } else {
      items = favorites;
    }

    const sorted = [...items];
    switch (sortBy) {
      case "title":
        sorted.sort((a, b) => {
          const titleA = (a.title || a.name || "").toLowerCase();
          const titleB = (b.title || b.name || "").toLowerCase();
          return titleA.localeCompare(titleB, "ko");
        });
        break;
      case "rating":
        sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        break;
      case "recent":
      default:
        break;
    }
    return sorted;
  }, [favorites, activeTab, sortBy, categorizedFavorites]);

  const handleToggleSelect = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === sortedFavorites.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(sortedFavorites.map((item) => item.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) {
      showInfo("삭제할 항목을 선택해주세요.");
      return;
    }

    if (!window.confirm(`선택한 ${selectedItems.size}개 항목을 삭제하시겠습니까?`)) {
      return;
    }

    setDeleting(true);
    try {
      for (const itemId of selectedItems) {
        const item = favorites.find((f) => f.id === itemId);
        if (item) {
          await toggleFavorite(item);
        }
      }
      setSelectedItems(new Set());
      setIsSelectMode(false);
      showSuccess(`${selectedItems.size}개 항목이 삭제되었습니다.`);
    } catch (error) {
      console.error("삭제 오류:", error);
      showError("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="favorites-page">
        <div className="favorites-empty-state">
          <h2>로그인이 필요합니다</h2>
          <p>찜 목록을 보려면 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page fade-in">
      <div className="favorites-header">
        <h1 className="favorites-title">내 찜 목록</h1>
        <div className="favorites-actions">
          {sortedFavorites.length > 0 && (
            <>
              {!isSelectMode ? (
                <button
                  className="favorites-action-btn"
                  onClick={() => setIsSelectMode(true)}
                  title="선택 모드"
                >
                  <FaFilter /> 선택
                </button>
              ) : (
                <>
                  <button
                    className="favorites-action-btn"
                    onClick={handleSelectAll}
                  >
                    {selectedItems.size === sortedFavorites.length
                      ? "전체 해제"
                      : "전체 선택"}
                  </button>
                  <button
                    className="favorites-action-btn delete-btn"
                    onClick={handleDeleteSelected}
                    disabled={selectedItems.size === 0 || deleting}
                  >
                    <FaTrash /> 삭제 ({selectedItems.size})
                  </button>
                  <button
                    className="favorites-action-btn"
                    onClick={() => {
                      setIsSelectMode(false);
                      setSelectedItems(new Set());
                    }}
                  >
                    취소
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {favorites.length > 0 && (
        <>
          <div className="favorites-tabs">
            <button
              className={`favorites-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              전체 ({favorites.length})
            </button>
            <button
              className={`favorites-tab ${activeTab === "movie" ? "active" : ""}`}
              onClick={() => setActiveTab("movie")}
            >
              영화 ({categorizedFavorites.movies.length})
            </button>
            <button
              className={`favorites-tab ${activeTab === "tv" ? "active" : ""}`}
              onClick={() => setActiveTab("tv")}
            >
              드라마 ({categorizedFavorites.tvs.length})
            </button>
          </div>

          <div className="favorites-controls">
            <div className="favorites-sort">
              <FaSort className="sort-icon" />
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="favorites-count">
              총 {sortedFavorites.length}개
            </div>
          </div>
        </>
      )}

      {favoritesLoading ? (
        <div className="favorites-grid">
          {[...Array(12)].map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : sortedFavorites.length > 0 ? (
        <div className="favorites-grid">
          {sortedFavorites.map((item) => (
            <div
              key={item.id}
              className={`favorites-card-wrapper ${
                isSelectMode ? "select-mode" : ""
              } ${selectedItems.has(item.id) ? "selected" : ""}`}
            >
              {isSelectMode && (
                <div className="favorites-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleToggleSelect(item.id)}
                  />
                </div>
              )}
              <MovieCard
                movie={{
                  ...item,
                  media_type: item.media_type || (item.name ? "tv" : "movie"),
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="favorites-empty-state">
          <div className="empty-icon">❤️</div>
          <h2>
            {activeTab === "movie"
              ? "찜한 영화가 없습니다"
              : activeTab === "tv"
              ? "찜한 드라마가 없습니다"
              : "아직 찜한 콘텐츠가 없습니다"}
          </h2>
          <p>마음에 드는 영화나 드라마를 찜해보세요!</p>
        </div>
      )}
    </div>
  );
}

