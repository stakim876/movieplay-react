import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { db } from "@/services/firebase";
import { collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";

function normalizeMovie(movie: any) {
  return {
    id: movie.id,
    tmdbId: movie.id.toString(),
    title: movie.title ?? movie.name ?? "",
    name: movie.name ?? null,
    poster_path: movie.poster_path ?? null,
    backdrop_path: movie.backdrop_path ?? null,
    overview: movie.overview ?? "",
    vote_average: movie.vote_average ?? 0,
    media_type: movie.media_type ?? (movie.name ? "tv" : "movie"),
    release_date: movie.release_date ?? movie.first_air_date ?? null,
    first_air_date: movie.first_air_date ?? null,
  };
}

interface FavoritesState {
  favorites: any[];
  loading: boolean;
  fetchFavorites: (user: { uid: string } | null) => Promise<void>;
  toggleFavorite: (movie: any) => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  loading: true,

  fetchFavorites: async (user) => {
    if (!user || !db) {
      set({ favorites: [], loading: false });
      return;
    }

    set({ loading: true });
    try {
      const snapshot = await getDocs(collection(db, "users", user.uid, "favorites"));
      set({
        favorites: snapshot.docs.map((d) => ({
          id: parseInt(d.id),
          ...d.data(),
        })),
        loading: false,
      });
    } catch (error) {
      console.error("찜 목록 불러오기 실패:", error);
      set({ favorites: [], loading: false });
    }
  },

  toggleFavorite: async (movie) => {
    const user = useAuthStore.getState().user;
    const { error: showError, success: showSuccess } = useToastStore.getState();

    if (!user || !db) {
      showError("로그인이 필요합니다.");
      return;
    }

    const normalized = normalizeMovie(movie);
    const ref = doc(db, "users", user.uid, "favorites", normalized.id.toString());
    const { favorites } = get();
    const exists = favorites.find((f) => f.id === normalized.id);

    try {
      if (exists) {
        await deleteDoc(ref);
        set({ favorites: favorites.filter((f) => f.id !== normalized.id) });
        showSuccess("찜 목록에서 제거되었습니다.");
      } else {
        await setDoc(ref, normalized);
        set({ favorites: [...favorites, normalized] });
        showSuccess("찜 목록에 추가되었습니다.");
      }
    } catch (err) {
      console.error("찜 목록 업데이트 실패:", err);
      showError("찜 목록 업데이트에 실패했습니다.");
    }
  },
}));

let favoritesUnsubscribe: (() => void) | null = null;

export function initFavoritesStore() {
  if (favoritesUnsubscribe) return;

  const user = useAuthStore.getState().user;
  useFavoritesStore.getState().fetchFavorites(user);

  favoritesUnsubscribe = useAuthStore.subscribe((state, prev) => {
    if (state.user?.uid !== prev.user?.uid) {
      useFavoritesStore.getState().fetchFavorites(state.user);
    }
  });
}

export function useFavorites() {
  return useFavoritesStore(
    useShallow((s) => ({
      favorites: s.favorites,
      toggleFavorite: s.toggleFavorite,
      loading: s.loading,
    }))
  );
}
