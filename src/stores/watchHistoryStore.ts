import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/core/firebase";
import { getActiveProfileKey } from "@/shared/lib/activeProfile";
import { useAuthStore } from "@/stores/authStore";

const WATCH_HISTORY_KEY = "watch_history_v1";
const WATCH_HISTORY_REMOTE_KEY = "watchHistoryByProfile";

interface WatchHistoryListItem {
  key: string;
  progressPercent?: number;
  lastWatched?: string | number;
  [key: string]: unknown;
}

function loadWatchHistory() {
  try {
    const raw = localStorage.getItem(WATCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveWatchHistory(history: Record<string, any>) {
  try {
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.error("시청 기록 저장 실패:", err);
  }
}

function pruneWatchHistory(history: Record<string, any>, limit = 200) {
  try {
    const entries = Object.entries(history || {})
      .map(([key, value]) => ({ key, value }))
      .filter((x) => x?.value && typeof x.value === "object")
      .sort((a, b) => {
        const aT = new Date((a.value as any).lastWatched || 0).getTime();
        const bT = new Date((b.value as any).lastWatched || 0).getTime();
        return bT - aT;
      })
      .slice(0, limit);

    return entries.reduce((acc: Record<string, any>, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});
  } catch {
    return history || {};
  }
}

interface WatchHistoryState {
  watchHistory: Record<string, any>;
  syncing: boolean;
  updateWatchProgress: (
    movieId: string | number,
    progress: number,
    duration: number,
    mediaType?: string,
    seasonNumber?: number | null,
    episodeNumber?: number | null
  ) => void;
  getWatchProgress: (
    movieId: string | number,
    mediaType?: string,
    seasonNumber?: number | null,
    episodeNumber?: number | null
  ) => any;
  getTVWatchProgress: (tvId: string | number) => any;
  getNextEpisode: (tvId: string | number, currentSeason: number, currentEpisode: number) => any;
  removeFromHistory: (movieId: string | number) => void;
  getWatchHistoryList: (filter?: string) => WatchHistoryListItem[];
  getWatchStats: () => Record<string, number>;
}

let profileKeyRef = getActiveProfileKey();
let pendingSaveTimer: ReturnType<typeof setTimeout> | null = null;

// [면접] 시청 기록을 Firestore에 바로 안 쓰고 1.2초 모아서 한 번에 저장
// → 재생 중 timeupdate가 초당 여러 번 와서, 매번 쓰면 비용·속도 문제
// → localStorage는 즉시 저장 → "이어보기"는 바로 됨 (로컬 우선)
function scheduleRemoteSave(history: Record<string, any>) {
  const user = useAuthStore.getState().user;
  if (!user || !db) return;
  const profileKey = profileKeyRef || getActiveProfileKey();

  if (pendingSaveTimer) clearTimeout(pendingSaveTimer);

  pendingSaveTimer = setTimeout(async () => {
    try {
      useWatchHistoryStore.setState({ syncing: true });
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
        // merge: true = 유저 문서 전체를 덮어쓰지 않고 watchHistory 필드만 합침
        { merge: true }
      );
    } catch (err) {
      console.error("시청 기록 원격 저장 실패:", err);
    } finally {
      useWatchHistoryStore.setState({ syncing: false });
    }
  }, 1200);
}

export const useWatchHistoryStore = create<WatchHistoryState>((set, get) => ({
  watchHistory: loadWatchHistory(),
  syncing: false,

  updateWatchProgress: (movieId, progress, duration, mediaType = "movie", seasonNumber = null, episodeNumber = null) => {
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
    set({ watchHistory: { ...history } });
    scheduleRemoteSave(history);
  },

  getWatchProgress: (movieId, mediaType = "movie", seasonNumber = null, episodeNumber = null) => {
    const { watchHistory } = get();
    if (mediaType === "tv" && seasonNumber !== null && episodeNumber !== null) {
      const episodeKey = `tv_${movieId}_s${seasonNumber}_e${episodeNumber}`;
      return watchHistory[episodeKey] || null;
    }
    return watchHistory[movieId] || null;
  },

  getTVWatchProgress: (tvId) => {
    return get().watchHistory[`tv_${tvId}`] || null;
  },

  getNextEpisode: (tvId) => {
    const { watchHistory, getTVWatchProgress } = get();
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
  },

  removeFromHistory: (movieId) => {
    const history = loadWatchHistory();
    delete history[movieId];
    saveWatchHistory(history);
    set({ watchHistory: { ...history } });
  },

  getWatchHistoryList: (filter = "all") => {
    const { watchHistory } = get();
    let historyList: WatchHistoryListItem[] = Object.entries(watchHistory).map(([key, value]) => ({
      key,
      ...(value as Record<string, unknown>),
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
      .sort(
        (a, b) =>
          new Date(b.lastWatched as string | number).getTime() -
          new Date(a.lastWatched as string | number).getTime()
      )
      .slice(0, 50);
  },

  getWatchStats: () => {
    const { watchHistory } = get();
    const allHistory = Object.values(watchHistory);
    const movies = allHistory.filter((h: any) => h.mediaType === "movie" || !h.mediaType);
    const tvs = allHistory.filter((h: any) => h.mediaType === "tv" && !h.seasonNumber);

    const totalWatchTime = allHistory.reduce((total: number, item: any) => {
      if (item.duration && item.progress) {
        return total + item.progress;
      }
      return total;
    }, 0);

    const completedCount = allHistory.filter(
      (item: any) => item.progressPercent && item.progressPercent >= 90
    ).length;

    const inProgressCount = allHistory.filter(
      (item: any) => item.progressPercent && item.progressPercent > 0 && item.progressPercent < 90
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
  },
}));

let watchHistoryAuthUnsubscribe: (() => void) | null = null;

async function syncWatchHistoryFromRemote(user: { uid: string }) {
  try {
    if (!db) return;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;

    const data = snap.data() || {};
    const profileKey = getActiveProfileKey();
    const remote = data?.[WATCH_HISTORY_REMOTE_KEY]?.[profileKey]?.history || null;

    if (!remote || typeof remote !== "object") return;

    const local = loadWatchHistory();
    // 로그인 시 로컬 + 서버 기록 합침 (같은 키면 서버 값이 덮어씀)
    const merged = pruneWatchHistory({ ...local, ...remote });
    saveWatchHistory(merged);
    useWatchHistoryStore.setState({ watchHistory: merged });
  } catch (err) {
    console.error("시청 기록 동기화 실패:", err);
  }
}

export function initWatchHistoryStore() {
  useWatchHistoryStore.setState({ watchHistory: loadWatchHistory() });

  if (watchHistoryAuthUnsubscribe) return;

  const user = useAuthStore.getState().user;
  profileKeyRef = getActiveProfileKey();
  if (user) syncWatchHistoryFromRemote(user);

  watchHistoryAuthUnsubscribe = useAuthStore.subscribe((state, prev) => {
    profileKeyRef = getActiveProfileKey();
    if (state.user?.uid !== prev.user?.uid) {
      if (state.user) {
        syncWatchHistoryFromRemote(state.user);
      } else {
        useWatchHistoryStore.setState({ watchHistory: loadWatchHistory() });
      }
    }
  });
}

export function useWatchHistory() {
  return useWatchHistoryStore(
    useShallow((s) => ({
      watchHistory: s.watchHistory,
      updateWatchProgress: s.updateWatchProgress,
      getWatchProgress: s.getWatchProgress,
      getTVWatchProgress: s.getTVWatchProgress,
      getNextEpisode: s.getNextEpisode,
      removeFromHistory: s.removeFromHistory,
      getWatchHistoryList: s.getWatchHistoryList,
      getWatchStats: s.getWatchStats,
      syncing: s.syncing,
    }))
  );
}
