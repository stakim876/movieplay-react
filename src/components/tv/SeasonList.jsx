import { useState } from "react";
import { FaPlay, FaChevronDown, FaChevronUp, FaClock } from "react-icons/fa";
import { fetchTVSeason } from "@/services/tmdb";
import { useWatchHistory } from "@/context/WatchHistoryContext";
import "@/styles/components/tv.css";

export default function SeasonList({ tvId, seasons, onEpisodeSelect }) {
  const [expandedSeasons, setExpandedSeasons] = useState(new Set());
  const [seasonEpisodes, setSeasonEpisodes] = useState({});
  const [loadingSeasons, setLoadingSeasons] = useState(new Set());
  const { getWatchProgress } = useWatchHistory();

  const toggleSeason = async (seasonNumber) => {
    const newExpanded = new Set(expandedSeasons);
    
    if (newExpanded.has(seasonNumber)) {
      newExpanded.delete(seasonNumber);
    } else {
      newExpanded.add(seasonNumber);
      
      if (!seasonEpisodes[seasonNumber]) {
        setLoadingSeasons(prev => new Set(prev).add(seasonNumber));
        try {
          const seasonData = await fetchTVSeason(tvId, seasonNumber);
          setSeasonEpisodes(prev => ({
            ...prev,
            [seasonNumber]: seasonData.episodes || []
          }));
        } catch (err) {
          console.error("시즌 정보 불러오기 실패:", err);
          setSeasonEpisodes(prev => ({
            ...prev,
            [seasonNumber]: []
          }));
        } finally {
          setLoadingSeasons(prev => {
            const next = new Set(prev);
            next.delete(seasonNumber);
            return next;
          });
        }
      }
    }
    
    setExpandedSeasons(newExpanded);
  };

  const handleEpisodeClick = (episode) => {
    if (onEpisodeSelect) {
      onEpisodeSelect(episode);
    }
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  return (
    <div className="seasons-container">
      <h2 className="seasons-title">시즌 및 에피소드</h2>
      <div className="seasons-list">
        {seasons.map((season) => {
          const isExpanded = expandedSeasons.has(season.season_number);
          const episodes = seasonEpisodes[season.season_number] || [];
          const isLoading = loadingSeasons.has(season.season_number);

          return (
            <div key={season.id} className="season-item">
              <div
                className="season-header"
                onClick={() => toggleSeason(season.season_number)}
              >
                <div className="season-info">
                  <h3 className="season-name">
                    {season.name || `시즌 ${season.season_number}`}
                  </h3>
                  <div className="season-meta">
                    <span className="season-episode-count">
                      {season.episode_count}개 에피소드
                    </span>
                    {season.air_date && (
                      <span className="season-year">
                        {new Date(season.air_date).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="season-toggle">
                  {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>

              {isExpanded && (
                <div className="episodes-list">
                  {isLoading ? (
                    <div className="episodes-loading">로딩 중...</div>
                  ) : episodes.length > 0 ? (
                    episodes.map((episode) => {
                      const episodeProgress = getWatchProgress(
                        tvId,
                        "tv",
                        season.season_number,
                        episode.episode_number
                      );
                      const progressPercent = episodeProgress?.progressPercent || 0;
                      const isCompleted = progressPercent >= 90;

                      return (
                        <div
                          key={episode.id}
                          className={`episode-item ${isCompleted ? "completed" : ""}`}
                          onClick={() => handleEpisodeClick(episode)}
                        >
                          <div className={`episode-number ${isCompleted ? "completed" : ""}`}>
                            {isCompleted ? "✓" : episode.episode_number}
                          </div>
                          <div className="episode-content">
                            <div className="episode-header">
                              <h4 className="episode-name">
                                {episode.name || `에피소드 ${episode.episode_number}`}
                              </h4>
                              {episode.runtime && (
                                <span className="episode-runtime">
                                  <FaClock /> {formatRuntime(episode.runtime)}
                                </span>
                              )}
                            </div>
                            {episode.overview && (
                              <p className="episode-overview">
                                {episode.overview.length > 150
                                  ? `${episode.overview.substring(0, 150)}...`
                                  : episode.overview}
                              </p>
                            )}
                            {episode.air_date && (
                              <span className="episode-air-date">
                                {new Date(episode.air_date).toLocaleDateString("ko-KR")}
                              </span>
                            )}
                            {progressPercent > 0 && (
                              <div className="episode-progress">
                                <div className="episode-progress-bar-container">
                                  <div
                                    className="episode-progress-bar"
                                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="episode-progress-text">
                                  {isCompleted
                                    ? "완료"
                                    : `${Math.round(progressPercent)}% 시청함`}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="episode-play">
                            <FaPlay />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="episodes-empty">에피소드 정보가 없습니다.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
