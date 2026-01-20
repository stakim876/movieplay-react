import { useState, useEffect } from "react";
import { fetchTVSeason } from "@/services/tmdb";
import { FaChevronDown, FaChevronUp, FaPlay } from "react-icons/fa";
import "@/styles/components/tv.css";

export default function SeasonList({ tvId, seasons, onEpisodeSelect }) {
  const [expandedSeason, setExpandedSeason] = useState(null);
  const [seasonData, setSeasonData] = useState({});
  const [loading, setLoading] = useState({});

  const handleSeasonClick = async (seasonNumber) => {
    if (expandedSeason === seasonNumber) {
      setExpandedSeason(null);
      return;
    }

    setExpandedSeason(seasonNumber);

    // 이미 로드된 시즌 데이터가 있으면 다시 로드하지 않음
    if (seasonData[seasonNumber]) {
      return;
    }

    setLoading((prev) => ({ ...prev, [seasonNumber]: true }));
    try {
      const data = await fetchTVSeason(tvId, seasonNumber);
      setSeasonData((prev) => ({
        ...prev,
        [seasonNumber]: data.episodes || [],
      }));
    } catch (error) {
      console.error(`시즌 ${seasonNumber} 로드 실패:`, error);
    } finally {
      setLoading((prev) => ({ ...prev, [seasonNumber]: false }));
    }
  };

  const handleEpisodeClick = (episode) => {
    if (onEpisodeSelect) {
      onEpisodeSelect(episode);
    }
  };

  if (!seasons || seasons.length === 0) {
    return null;
  }

  return (
    <div className="seasons-container">
      <h2 className="seasons-title">시즌 및 에피소드</h2>
      <div className="seasons-list">
        {seasons.map((season) => {
          const isExpanded = expandedSeason === season.season_number;
          const episodes = seasonData[season.season_number] || [];
          const isLoading = loading[season.season_number];

          return (
            <div key={season.season_number} className="season-item">
              <button
                className="season-header"
                onClick={() => handleSeasonClick(season.season_number)}
                aria-expanded={isExpanded}
              >
                <div className="season-info">
                  <h3 className="season-name">
                    {season.name || `시즌 ${season.season_number}`}
                  </h3>
                  <span className="season-episode-count">
                    {season.episode_count}개 에피소드
                  </span>
                </div>
                <div className="season-toggle">
                  {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </button>

              {isExpanded && (
                <div className="episodes-list">
                  {isLoading ? (
                    <div className="episodes-loading">로딩 중...</div>
                  ) : episodes.length > 0 ? (
                    <>
                      {episodes.map((episode) => (
                        <div
                          key={episode.id}
                          className="episode-item"
                          onClick={() => handleEpisodeClick(episode)}
                        >
                          <div className="episode-number">
                            {episode.episode_number}
                          </div>
                          <div className="episode-content">
                            <div className="episode-header">
                              <h4 className="episode-name">
                                {episode.name || `에피소드 ${episode.episode_number}`}
                              </h4>
                              {episode.runtime && (
                                <span className="episode-runtime">
                                  {episode.runtime}분
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
                                방영일: {new Date(episode.air_date).toLocaleDateString("ko-KR")}
                              </span>
                            )}
                          </div>
                          <button
                            className="episode-play"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEpisodeClick(episode);
                            }}
                            aria-label={`에피소드 ${episode.episode_number} 재생`}
                          >
                            <FaPlay />
                          </button>
                        </div>
                      ))}
                    </>
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
