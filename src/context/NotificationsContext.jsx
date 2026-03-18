import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { getActiveProfileKey } from "@/utils/activeProfile";
import { fetchMovieDetail } from "@/services/tmdb";
import { useToast } from "@/context/ToastContext";

const NotificationsContext = createContext(null);

const ROOT_KEY = "notificationsByProfile";

function nowIso() {
  return new Date().toISOString();
}

function safeArr(v) {
  return Array.isArray(v) ? v : [];
}

function limitItems(items, limit = 50) {
  return safeArr(items).slice(0, limit);
}

function makeId(prefix = "n") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const { info: toastInfo } = useToast();

  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const profileKeyRef = useRef(getActiveProfileKey());
  const lastSeenTvEpisodeRef = useRef({});

  useEffect(() => {
    profileKeyRef.current = getActiveProfileKey();
  }, [user]);

  const recomputeUnread = (list) => {
    const c = safeArr(list).filter((x) => !x?.read).length;
    setUnreadCount(c);
  };

  const persist = async (nextItems, nextLastSeenMap) => {
    if (!user || !db) return;
    const profileKey = profileKeyRef.current || getActiveProfileKey();
    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        [ROOT_KEY]: {
          [profileKey]: {
            items: limitItems(nextItems),
            lastSeenTvEpisode: nextLastSeenMap || {},
            updatedAt: nowIso(),
          },
        },
      },
      { merge: true }
    );
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        if (!user || !db) {
          if (!cancelled) {
            setItems([]);
            setUnreadCount(0);
          }
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        const profileKey = getActiveProfileKey();
        const data = snap.exists() ? snap.data() : {};
        const stored = data?.[ROOT_KEY]?.[profileKey] || {};
        const nextItems = safeArr(stored.items);
        const lastSeen = stored.lastSeenTvEpisode || {};

        if (!cancelled) {
          lastSeenTvEpisodeRef.current = lastSeen;
          setItems(nextItems);
          recomputeUnread(nextItems);
        }
      } catch (e) {
        if (!cancelled) {
          setItems([]);
          setUnreadCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // 새 에피소드 감지(찜한 TV 기준) — 너무 무겁지 않게 상위 10개만
  useEffect(() => {
    let cancelled = false;
    async function detect() {
      if (!user || !db) return;
      const tvs = safeArr(favorites).filter((f) => (f.media_type || (f.name ? "tv" : "movie")) === "tv");
      if (!tvs.length) return;

      const top = tvs.slice(0, 10);
      const nextLastSeen = { ...(lastSeenTvEpisodeRef.current || {}) };
      const newNotifs = [];

      for (const t of top) {
        if (cancelled) return;
        try {
          const detail = await fetchMovieDetail(t.id, "tv");
          const lastEp = detail?.last_episode_to_air;
          if (!lastEp?.id) continue;

          const key = `${detail.id}`;
          const prev = nextLastSeen[key];
          const cur = String(lastEp.id);
          if (!prev) {
            nextLastSeen[key] = cur;
            continue;
          }
          if (prev !== cur) {
            nextLastSeen[key] = cur;
            newNotifs.push({
              id: makeId("ep"),
              type: "new_episode",
              title: detail.name || detail.title || "새 에피소드",
              message: `새 에피소드가 업데이트됐어요: ${detail.name || ""}`.trim(),
              createdAt: nowIso(),
              read: false,
              payload: {
                media_type: "tv",
                id: detail.id,
              },
            });
          }
        } catch {
          // ignore per item
        }
      }

      if (!newNotifs.length) {
        // 최초 스냅샷 저장만
        await persist(items, nextLastSeen);
        lastSeenTvEpisodeRef.current = nextLastSeen;
        return;
      }

      const nextItems = limitItems([...newNotifs, ...items]);
      if (!cancelled) {
        setItems(nextItems);
        recomputeUnread(nextItems);
        toastInfo(`새 소식 ${newNotifs.length}개가 도착했어요`, 2500);
      }

      await persist(nextItems, nextLastSeen);
      lastSeenTvEpisodeRef.current = nextLastSeen;
    }

    // 로그인 + favorites 로드 후 1회만 실행(면접용: “알림 동작” 보여주기)
    detect();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, favorites]);

  const markAllRead = async () => {
    const next = items.map((x) => ({ ...x, read: true }));
    setItems(next);
    recomputeUnread(next);
    await persist(next, lastSeenTvEpisodeRef.current);
  };

  const markRead = async (id) => {
    const next = items.map((x) => (x.id === id ? { ...x, read: true } : x));
    setItems(next);
    recomputeUnread(next);
    await persist(next, lastSeenTvEpisodeRef.current);
  };

  const value = useMemo(() => {
    return {
      items,
      unreadCount,
      loading,
      markAllRead,
      markRead,
    };
  }, [items, unreadCount, loading]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    return {
      items: [],
      unreadCount: 0,
      loading: false,
      markAllRead: async () => {},
      markRead: async () => {},
    };
  }
  return ctx;
}

