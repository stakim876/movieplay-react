import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import { useAuth } from "@/context/AuthContext";
import { getActiveProfileKey } from "@/utils/activeProfile";

const UserFeedbackContext = createContext(null);

function normalizeId(id) {
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
}

export function UserFeedbackProvider({ children }) {
  const { user } = useAuth();
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [dislikedIds, setDislikedIds] = useState(() => new Set());
  const [loading, setLoading] = useState(true);

  const profileKeyRef = useRef(getActiveProfileKey());

  useEffect(() => {
    profileKeyRef.current = getActiveProfileKey();
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        if (!user || !db) {
          if (!cancelled) {
            setLikedIds(new Set());
            setDislikedIds(new Set());
          }
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        const profileKey = getActiveProfileKey();
        const data = snap.exists() ? snap.data() : {};
        const byProfile = data?.feedbackByProfile || {};
        const fb = byProfile?.[profileKey] || {};
        const likes = Array.isArray(fb.likedIds) ? fb.likedIds : [];
        const dislikes = Array.isArray(fb.dislikedIds) ? fb.dislikedIds : [];

        if (!cancelled) {
          setLikedIds(new Set(likes.map(normalizeId).filter(Boolean)));
          setDislikedIds(new Set(dislikes.map(normalizeId).filter(Boolean)));
        }
      } catch {
        if (!cancelled) {
          setLikedIds(new Set());
          setDislikedIds(new Set());
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

  const persist = async (nextLiked, nextDisliked) => {
    if (!user || !db) return;
    const profileKey = profileKeyRef.current || getActiveProfileKey();
    const userRef = doc(db, "users", user.uid);

    const payload = {
      feedbackByProfile: {
        [profileKey]: {
          likedIds: Array.from(nextLiked),
          dislikedIds: Array.from(nextDisliked),
          updatedAt: new Date().toISOString(),
        },
      },
    };

    await setDoc(userRef, payload, { merge: true });
  };

  const toggleLike = async (movieId) => {
    const id = normalizeId(movieId);
    if (!id) return;

    setLikedIds((prev) => {
      const nextLiked = new Set(prev);
      const nextDisliked = new Set(dislikedIds);

      if (nextLiked.has(id)) nextLiked.delete(id);
      else {
        nextLiked.add(id);
        nextDisliked.delete(id);
      }

      persist(nextLiked, nextDisliked);
      setDislikedIds(nextDisliked);
      return nextLiked;
    });
  };

  const toggleDislike = async (movieId) => {
    const id = normalizeId(movieId);
    if (!id) return;

    setDislikedIds((prev) => {
      const nextDisliked = new Set(prev);
      const nextLiked = new Set(likedIds);

      if (nextDisliked.has(id)) nextDisliked.delete(id);
      else {
        nextDisliked.add(id);
        nextLiked.delete(id);
      }

      persist(nextLiked, nextDisliked);
      setLikedIds(nextLiked);
      return nextDisliked;
    });
  };

  const value = useMemo(() => {
    return {
      likedIds,
      dislikedIds,
      loading,
      toggleLike,
      toggleDislike,
    };
  }, [likedIds, dislikedIds, loading]);

  return <UserFeedbackContext.Provider value={value}>{children}</UserFeedbackContext.Provider>;
}

export function useUserFeedback() {
  const ctx = useContext(UserFeedbackContext);
  if (!ctx) {
    return {
      likedIds: new Set(),
      dislikedIds: new Set(),
      loading: false,
      toggleLike: async () => {},
      toggleDislike: async () => {},
    };
  }
  return ctx;
}

