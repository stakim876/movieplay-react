import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const WATCH_HISTORY_KEY = "watch_history_v1";
const WatchHistoryContext = createContext();

function loadWatchHistory() {
  try {
    const raw = localStorage.getItem(WATCH_HISTORY_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data;
  } catch {
    return {};
  }
}

function saveWatchHistory(history) {
  try {
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.error("시청 기록 저장 실패:", err);
  }
}

export function WatchHistoryProvider({ children }) {
  const auth = useAuth();
  const user = auth?.user || null;
  const [watchHistory, setWatchHistory] = useState(() => loadWatchHistory());

  useEffect(() => {
    const history = loadWatchHistory();
    setWatchHistory(history);
  }, []);

  const updateWatchProgress = (movieId, progress, duration, mediaType = "movie", seasonNumber = null, episodeNumber = null) => {
    const history = loadWatchHistory();
    const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
    
    if (mediaType === "tv" && seasonNumber !== null && episodeNumber !== null) {
      const episodeKey = `tv_${movieId}_s${seasonNumber}_e${episodeNumber}`;
      history[episodeKey] = {
        movieId,
        mediaType: "tv",
        seasonNumber,
        episodeNumber,
        progress,
        duration,
        progressPercent: Math.min(progressPercent, 100),
        lastWatched: new Date().toISOString(),
      };
      
      const tvKey = `tv_${movieId}`;
      if (!history[tvKey]) {
        history[tvKey] = {
          movieId,
          mediaType: "tv",
          lastEpisode: { seasonNumber, episodeNumber },
          lastWatched: new Date().toISOString(),
        };
      } else {
        history[tvKey].lastEpisode = { seasonNumber, episodeNumber };
        history[tvKey].lastWatched = new Date().toISOString();
      }
    } else {
      history[movieId] = {
        movieId,
        mediaType: "movie",
        progress,
        duration,
        progressPercent: Math.min(progressPercent, 100),
        lastWatched: new Date().toISOString(),
      };
    }

    saveWatchHistory(history);
    setWatchHistory({ ...history });
  };

  const getWatchProgress = (movieId, mediaType = "movie", seasonNumber = null, episodeNumber = null) => {
    if (mediaType === "tv" && seasonNumber !== null && episodeNumber !== null) {
      const episodeKey = `tv_${movieId}_s${seasonNumber}_e${episodeNumber}`;
      return watchHistory[episodeKey] || null;
    }
    return watchHistory[movieId] || null;
  };

  const getTVWatchProgress = (tvId) => {
    const tvKey = `tv_${tvId}`;
    return watchHistory[tvKey] || null;
  };

  const getNextEpisode = (tvId, currentSeason, currentEpisode) => {
    const tvProgress = getTVWatchProgress(tvId);
    if (!tvProgress || !tvProgress.lastEpisode) return null;
    
    const lastEpisodeKey = `tv_${tvId}_s${tvProgress.lastEpisode.seasonNumber}_e${tvProgress.lastEpisode.episodeNumber}`;
    const lastEpisodeProgress = watchHistory[lastEpisodeKey];
    
    if (lastEpisodeProgress && lastEpisodeProgress.progressPercent >= 90) {
      return {
        seasonNumber: tvProgress.lastEpisode.seasonNumber,
        episodeNumber: tvProgress.lastEpisode.episodeNumber + 1,
      };
    }
    
    return null;
  };

  const removeFromHistory = (movieId) => {
    const history = loadWatchHistory();
    delete history[movieId];
    saveWatchHistory(history);
    setWatchHistory({ ...history });
  };

  const getWatchHistoryList = (filter = "all") => {
    let historyList = Object.entries(watchHistory).map(([key, value]) => ({
      key,
      ...value,
    }));

    if (filter === "in_progress") {
      historyList = historyList.filter(
        (item) => item.progressPercent && item.progressPercent > 0 && item.progressPercent < 90
      );
    } else if (filter === "completed") {
      historyList = historyList.filter(
        (item) => item.progressPercent && item.progressPercent >= 90
      );
    }

    historyList = historyList.filter(
      (item) => !item.key.includes("_s") || !item.key.includes("_e") || item.key.match(/^tv_\d+$/)
    );

    return historyList
      .sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched))
      .slice(0, 50);
  };

  const getWatchStats = () => {
    const allHistory = Object.values(watchHistory);
    const movies = allHistory.filter((h) => h.mediaType === "movie" || !h.mediaType);
    const tvs = allHistory.filter((h) => h.mediaType === "tv" && !h.seasonNumber);
    
    const totalWatchTime = allHistory.reduce((total, item) => {
      if (item.duration && item.progress) {
        return total + item.progress;
      }
      return total;
    }, 0);

    const completedCount = allHistory.filter(
      (item) => item.progressPercent && item.progressPercent >= 90
    ).length;

    const inProgressCount = allHistory.filter(
      (item) => item.progressPercent && item.progressPercent > 0 && item.progressPercent < 90
    ).length;

    return {
      totalItems: movies.length + tvs.length,
      moviesCount: movies.length,
      tvsCount: tvs.length,
      completedCount,
      inProgressCount,
      totalWatchTimeMinutes: Math.floor(totalWatchTime / 60),
      totalWatchTimeHours: Math.floor(totalWatchTime / 3600),
    };
  };

  return (
    <WatchHistoryContext.Provider
      value={{
        watchHistory,
        updateWatchProgress,
        getWatchProgress,
        getTVWatchProgress,
        getNextEpisode,
        removeFromHistory,
        getWatchHistoryList,
        getWatchStats,
      }}
    >
      {children}
    </WatchHistoryContext.Provider>
  );
}

export function useWatchHistory() {
  const context = useContext(WatchHistoryContext);
  if (!context) {
    throw new Error("useWatchHistory must be used within WatchHistoryProvider");
  }
  return context;
}
