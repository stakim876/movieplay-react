import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/core/firebase";
import { getActiveProfileKey } from "@/shared/lib/activeProfile";
import { fetchMovieDetail } from "@/core/api/tmdb";
import { useAuthStore } from "@/stores/authStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useToastStore } from "@/stores/toastStore";

const ROOT_KEY = "notificationsByProfile";

function nowIso() {
  return new Date().toISOString();
}

function safeArr(v: unknown) {
  return Array.isArray(v) ? v : [];
}

function limitItems(items: any[], limit = 50) {
  return safeArr(items).slice(0, limit);
}

function makeId(prefix = "n") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

interface NotificationsState {
  items: any[];
  unreadCount: number;
  loading: boolean;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
}

let profileKeyRef = getActiveProfileKey();
let lastSeenTvEpisodeRef: Record<string, string> = {};

function recomputeUnread(list: any[]) {
  return safeArr(list).filter((x) => !x?.read).length;
}

async function persistNotifications(nextItems: any[], nextLastSeenMap: Record<string, string>) {
  const user = useAuthStore.getState().user;
  if (!user || !db) return;
  const profileKey = profileKeyRef || getActiveProfileKey();
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
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  unreadCount: 0,
  loading: true,

  markAllRead: async () => {
    const next = get().items.map((x) => ({ ...x, read: true }));
    set({ items: next, unreadCount: 0 });
    await persistNotifications(next, lastSeenTvEpisodeRef);
  },

  markRead: async (id) => {
    const next = get().items.map((x) => (x.id === id ? { ...x, read: true } : x));
    set({ items: next, unreadCount: recomputeUnread(next) });
    await persistNotifications(next, lastSeenTvEpisodeRef);
  },
}));

async function loadNotifications(user: { uid: string } | null) {
  if (!user || !db) {
    useNotificationsStore.setState({ items: [], unreadCount: 0, loading: false });
    return;
  }

  useNotificationsStore.setState({ loading: true });
  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const profileKey = getActiveProfileKey();
    const data = snap.exists() ? snap.data() : {};
    const stored = data?.[ROOT_KEY]?.[profileKey] || {};
    const nextItems = safeArr(stored.items);
    const lastSeen = stored.lastSeenTvEpisode || {};

    lastSeenTvEpisodeRef = lastSeen;
    useNotificationsStore.setState({
      items: nextItems,
      unreadCount: recomputeUnread(nextItems),
      loading: false,
    });
  } catch {
    useNotificationsStore.setState({ items: [], unreadCount: 0, loading: false });
  }
}

async function detectNewEpisodes() {
  const user = useAuthStore.getState().user;
  if (!user || !db) return;

  const favorites = useFavoritesStore.getState().favorites;
  const tvs = safeArr(favorites).filter(
    (f: any) => (f.media_type || (f.name ? "tv" : "movie")) === "tv"
  );
  if (!tvs.length) return;

  const { items } = useNotificationsStore.getState();
  const top = tvs.slice(0, 10);
  const nextLastSeen = { ...lastSeenTvEpisodeRef };
  const newNotifs: any[] = [];

  for (const t of top) {
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
      /* ignore */
    }
  }

  if (!newNotifs.length) {
    await persistNotifications(items, nextLastSeen);
    lastSeenTvEpisodeRef = nextLastSeen;
    return;
  }

  const nextItems = limitItems([...newNotifs, ...items]);
  useNotificationsStore.setState({
    items: nextItems,
    unreadCount: recomputeUnread(nextItems),
  });
  useToastStore.getState().info(`새 소식 ${newNotifs.length}개가 도착했어요`, 2500);

  await persistNotifications(nextItems, nextLastSeen);
  lastSeenTvEpisodeRef = nextLastSeen;
}

let notificationsAuthUnsubscribe: (() => void) | null = null;
let notificationsFavoritesUnsubscribe: (() => void) | null = null;

export function initNotificationsStore() {
  if (notificationsAuthUnsubscribe) return;

  profileKeyRef = getActiveProfileKey();
  loadNotifications(useAuthStore.getState().user);

  notificationsAuthUnsubscribe = useAuthStore.subscribe((state, prev) => {
    profileKeyRef = getActiveProfileKey();
    if (state.user?.uid !== prev.user?.uid) {
      loadNotifications(state.user);
    }
  });

  notificationsFavoritesUnsubscribe = useFavoritesStore.subscribe((state, prev) => {
    if (state.favorites !== prev.favorites && state.favorites.length > 0) {
      detectNewEpisodes();
    }
  });
}

export function useNotifications() {
  return useNotificationsStore(
    useShallow((s) => ({
      items: s.items,
      unreadCount: s.unreadCount,
      loading: s.loading,
      markAllRead: s.markAllRead,
      markRead: s.markRead,
    }))
  );
}
