import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { db } from "@/services/firebase";
import { getActiveProfileKey } from "@/utils/activeProfile";

const WATCH_HISTORY_KEY = "watch_history_v1";
const WATCH_HISTORY_REMOTE_KEY = "watchHistoryByProfile";
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

function pruneWatchHistory(history, limit = 200) {
  try {
    const entries = Object.entries(history || {})
      .map(([key, value]) => ({ key, value }))
      .filter((x) => x?.value && typeof x.value === "object")
      .sort((a, b) => {
        const aT = new Date(a.value.lastWatched || 0).getTime();
        const bT = new Date(b.value.lastWatched || 0).getTime();
        return bT - aT;
      })
      .slice(0, limit);

    return entries.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});
  } catch {
    return history || {};
  }
}

export function WatchHistoryProvider({ children }) {
  const auth = useAuth();
  const user = auth?.user || null;
  const [watchHistory, setWatchHistory] = useState(() => loadWatchHistory());
  const [syncing, setSyncing] = useState(false);

  const profileKeyRef = useRef(getActiveProfileKey());
  const pendingSaveRef = useRef(null);

  useEffect(() => {
    const history = loadWatchHistory();
    setWatchHistory(history);
  }, []);

  useEffect(() => {
    profileKeyRef.current = getActiveProfileKey();
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    async function syncFromRemote() {
      try {
        if (!user || !db) return;

        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) return;

        const data = snap.data() || {};
        const profileKey = getActiveProfileKey();
        const remote = data?.[WATCH_HISTORY_REMOTE_KEY]?.[profileKey]?.history || null;

        if (!remote || typeof remote !== "object") return;

        const local = loadWatchHistory();
        // 원칙: remote를 우선 적용하되, local에만 있는 최신 항목도 합친다(면접용: 충돌 최소화)
        const merged = pruneWatchHistory({ ...local, ...remote });
        saveWatchHistory(merged);

        if (!cancelled) setWatchHistory(merged);
      } catch (err) {
        console.error("시청 기록 동기화 실패:", err);
      }
    }

    syncFromRemote();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const scheduleRemoteSave = (history) => {
    if (!user || !db) return;
    const profileKey = profileKeyRef.current || getActiveProfileKey();

    // 빠른 timeupdate 저장을 Firestore에 다 쏘지 않도록 디바운스
    if (pendingSaveRef.current) clearTimeout(pendingSaveRef.current);

    pendingSaveRef.current = setTimeout(async () => {
      try {
        setSyncing(true);
        const pruned = pruneWatchHistory(history);
        const userRef = doc(db, "users", user.uid);
        await setDoc(
          userRef,
          {
            [WATCH_HISTORY_REMOTE_KEY]: {
              [profileKey]: {
                history: pruned,
                updatedAt: new Date().toISOString(),
              },
            },
          },
          { merge: true }
        );
      } catch (err) {
        console.error("시청 기록 원격 저장 실패:", err);
      } finally {
        setSyncing(false);
      }
    }, 1200);
  };

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
    scheduleRemoteSave(history);
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
        syncing,
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
