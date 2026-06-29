import { useMemo } from "react";
import { useWatchHistory } from "@/stores/watchHistoryStore";
import { FaClock, FaCheckCircle, FaPlayCircle, FaFilm, FaTv } from "react-icons/fa";
import "@/styles/components/watch-stats.css";

export default function WatchStats() {
  const { getWatchStats } = useWatchHistory();
  const stats = getWatchStats();

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes}분`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours}시간`;
    }
    return `${hours}시간 ${mins}분`;
  };

  if (stats.totalItems === 0) {
    return null;
  }

  return (
    <div className="watch-stats">
      <h3 className="stats-title">📊 시청 통계</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaFilm />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.moviesCount}</div>
            <div className="stat-label">영화</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaTv />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.tvsCount}</div>
            <div className="stat-label">드라마</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.completedCount}</div>
            <div className="stat-label">완료</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaPlayCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.inProgressCount}</div>
            <div className="stat-label">진행중</div>
          </div>
        </div>

        <div className="stat-card stat-card-large">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatTime(stats.totalWatchTimeMinutes)}</div>
            <div className="stat-label">총 시청 시간</div>
          </div>
        </div>
      </div>
    </div>
  );
}
