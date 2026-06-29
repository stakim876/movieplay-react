import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/core/firebase";
import { getActiveProfileKey } from "@/shared/lib/activeProfile";
import { useAuthStore } from "@/stores/authStore";

function normalizeId(id: unknown) {
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
}

interface UserFeedbackState {
  likedIds: Set<number>;
  dislikedIds: Set<number>;
  loading: boolean;
  toggleLike: (movieId: unknown) => Promise<void>;
  toggleDislike: (movieId: unknown) => Promise<void>;
}

let profileKeyRef = getActiveProfileKey();

async function persistFeedback(likedIds: Set<number>, dislikedIds: Set<number>) {
  const user = useAuthStore.getState().user;
  if (!user || !db) return;
  const profileKey = profileKeyRef || getActiveProfileKey();
  const userRef = doc(db, "users", user.uid);

  await setDoc(
    userRef,
    {
      feedbackByProfile: {
        [profileKey]: {
          likedIds: Array.from(likedIds),
          dislikedIds: Array.from(dislikedIds),
          updatedAt: new Date().toISOString(),
        },
      },
    },
    { merge: true }
  );
}

export const useUserFeedbackStore = create<UserFeedbackState>((set, get) => ({
  likedIds: new Set(),
  dislikedIds: new Set(),
  loading: true,

  toggleLike: async (movieId) => {
    const id = normalizeId(movieId);
    if (!id) return;

    const { likedIds, dislikedIds } = get();
    const nextLiked = new Set(likedIds);
    const nextDisliked = new Set(dislikedIds);

    if (nextLiked.has(id)) nextLiked.delete(id);
    else {
      nextLiked.add(id);
      nextDisliked.delete(id);
    }

    set({ likedIds: nextLiked, dislikedIds: nextDisliked });
    await persistFeedback(nextLiked, nextDisliked);
  },

  toggleDislike: async (movieId) => {
    const id = normalizeId(movieId);
    if (!id) return;

    const { likedIds, dislikedIds } = get();
    const nextLiked = new Set(likedIds);
    const nextDisliked = new Set(dislikedIds);

    if (nextDisliked.has(id)) nextDisliked.delete(id);
    else {
      nextDisliked.add(id);
      nextLiked.delete(id);
    }

    set({ likedIds: nextLiked, dislikedIds: nextDisliked });
    await persistFeedback(nextLiked, nextDisliked);
  },
}));

async function loadUserFeedback(user: { uid: string } | null) {
  if (!user || !db) {
    useUserFeedbackStore.setState({
      likedIds: new Set(),
      dislikedIds: new Set(),
      loading: false,
    });
    return;
  }

  useUserFeedbackStore.setState({ loading: true });
  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const profileKey = getActiveProfileKey();
    const data = snap.exists() ? snap.data() : {};
    const byProfile = data?.feedbackByProfile || {};
    const fb = byProfile?.[profileKey] || {};
    const likes = Array.isArray(fb.likedIds) ? fb.likedIds : [];
    const dislikes = Array.isArray(fb.dislikedIds) ? fb.dislikedIds : [];

    useUserFeedbackStore.setState({
      likedIds: new Set(likes.map(normalizeId).filter(Boolean) as number[]),
      dislikedIds: new Set(dislikes.map(normalizeId).filter(Boolean) as number[]),
      loading: false,
    });
  } catch {
    useUserFeedbackStore.setState({
      likedIds: new Set(),
      dislikedIds: new Set(),
      loading: false,
    });
  }
}

let userFeedbackAuthUnsubscribe: (() => void) | null = null;

export function initUserFeedbackStore() {
  if (userFeedbackAuthUnsubscribe) return;

  profileKeyRef = getActiveProfileKey();
  loadUserFeedback(useAuthStore.getState().user);

  userFeedbackAuthUnsubscribe = useAuthStore.subscribe((state, prev) => {
    profileKeyRef = getActiveProfileKey();
    if (state.user?.uid !== prev.user?.uid) {
      loadUserFeedback(state.user);
    }
  });
}

export function useUserFeedback() {
  return useUserFeedbackStore(
    useShallow((s) => ({
      likedIds: s.likedIds,
      dislikedIds: s.dislikedIds,
      loading: s.loading,
      toggleLike: s.toggleLike,
      toggleDislike: s.toggleDislike,
    }))
  );
}
