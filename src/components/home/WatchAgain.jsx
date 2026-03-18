import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWatchHistory } from "@/context/WatchHistoryContext";
import { fetchMovieDetail } from "@/services/tmdb.js";
import { FaPlay, FaCheckCircle } from "react-icons/fa";
import HorizontalScroller from "@/components/common/HorizontalScroller";
import "@/styles/components/components.css";

export default function WatchAgain() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("in_progress");
  const navigate = useNavigate();
  const { getWatchHistoryList, getWatchProgress } = useWatchHistory();

  useEffect(() => {
    async function loadWatchAgain() {
      try {
        setLoading(true);
        const historyList = getWatchHistoryList(filter);
        
        if (historyList.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }

        const contentPromises = historyList.map(async (item) => {
          try {
            const mediaType = item.mediaType || "movie";
            const detail = await fetchMovieDetail(item.movieId, mediaType);
            
            let episodeInfo = null;
            if (mediaType === "tv" && item.lastEpisode) {
              episodeInfo = {
                season: item.lastEpisode.seasonNumber,
                episode: item.lastEpisode.episodeNumber,
              };
            }
            
            return {
              ...detail,
              watchProgress: item,
              episodeInfo,
            };
          } catch (err) {
            console.error(`콘텐츠 ${item.movieId} 정보 로드 실패:`, err);
            return null;
          }
        });

        const contentResults = await Promise.all(contentPromises);
        const validItems = contentResults.filter((item) => item !== null);
        
        setItems(validItems);
      } catch (err) {
        console.error("다시보기 콘텐츠 로드 실패:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    loadWatchAgain();
  }, [getWatchHistoryList, filter]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aTime = new Date(a.watchProgress?.lastWatched || 0);
      const bTime = new Date(b.watchProgress?.lastWatched || 0);
      return bTime - aTime;
    });
  }, [items]);

  if (loading) {
    return (
      <section className="watch-again">
        <h2 className="watch-title">📺 계속 보기</h2>
        <p style={{ color: "#fff", padding: "1rem" }}>로딩 중...</p>
      </section>
    );
  }

  if (sortedItems.length === 0) {
    return null;
  }

  return (
    <section className="watch-again">
      <div className="watch-again-header">
        <h2 className="watch-title">📺 계속 보기</h2>
        <div className="watch-filters">
          <button
            className={`watch-filter-btn ${filter === "in_progress" ? "active" : ""}`}
            onClick={() => setFilter("in_progress")}
          >
            진행중
          </button>
          <button
            className={`watch-filter-btn ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            완료
          </button>
          <button
            className={`watch-filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            전체
          </button>
        </div>
      </div>
      <HorizontalScroller
        className="watch-scroller"
        scrollClassName="watch-row"
        ariaLabel="continue watching"
      >
        {sortedItems.map((item) => {
          const progress = item.watchProgress;
          const isCompleted = progress?.progressPercent >= 90;
          const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");
          const startSeason = item.episodeInfo?.season ?? 1;
          const startEpisode = item.episodeInfo?.episode ?? 1;
          const playHref =
            mediaType === "tv"
              ? `/player/tv/${item.id}?season=${startSeason}&episode=${startEpisode}`
              : `/player/${item.id}`;
          
          return (
            <div
              key={item.id}
              className={`watch-card ${isCompleted ? "completed" : ""}`}
              onClick={() => navigate(playHref)}
            >
              <div className="watch-poster-wrapper">
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title || item.name}
                  className="watch-poster"
                />
                <button
                  type="button"
                  className="watch-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(playHref);
                  }}
                  aria-label="이어보기"
                  title="이어보기"
                >
                  <FaPlay />
                </button>
                {isCompleted && (
                  <div className="watch-completed-badge">
                    <FaCheckCircle />
                  </div>
                )}
                {progress && progress.progressPercent > 5 && !isCompleted && (
                  <div className="watch-progress-bar">
                    <div
                      className="watch-progress-fill"
                      style={{ width: `${progress.progressPercent}%` }}
                    />
                  </div>
                )}
                {item.episodeInfo && (
                  <div className="watch-episode-info">
                    시즌 {item.episodeInfo.season} · 에피소드 {item.episodeInfo.episode}
                  </div>
                )}
              </div>
              <div className="watch-card-info">
                <p className="watch-name">{item.title || item.name}</p>
                {progress && (
                  <div className="watch-progress-info">
                    {isCompleted ? (
                      <span className="watch-completed-text">시청 완료</span>
                    ) : (
                      <span className="watch-progress-text">
                        {Math.round(progress.progressPercent)}% 시청함
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </HorizontalScroller>
    </section>
  );
}

