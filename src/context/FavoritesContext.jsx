import { createContext, useContext, useEffect, useState } from "react";
import { db } from "@/services/firebase";
import { collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";
import { useToast } from "@/context/ToastContext";

import { useAuth } from "../context/AuthContext";

const FavoritesContext = createContext();

function normalizeMovie(movie) {
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

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const { error: showError, success: showSuccess } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(
          collection(db, "users", user.uid, "favorites")
        );
        setFavorites(
          snapshot.docs.map((doc) => ({
            id: parseInt(doc.id),
            ...doc.data(),
          }))
        );
      } catch (error) {
        console.error("찜 목록 불러오기 실패:", error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (movie) => {
    if (!user) {
      showError("로그인이 필요합니다.");
      return;
    }

    const normalized = normalizeMovie(movie);
    const ref = doc(
      db,
      "users",
      user.uid,
      "favorites",
      normalized.id.toString()
    );

    const exists = favorites.find((f) => f.id === normalized.id);

    try {
      if (exists) {
        await deleteDoc(ref);
        setFavorites(favorites.filter((f) => f.id !== normalized.id));
        showSuccess("찜 목록에서 제거되었습니다.");
      } else {
        await setDoc(ref, normalized);
        setFavorites([...favorites, normalized]);
        showSuccess("찜 목록에 추가되었습니다.");
      }
    } catch (err) {
      console.error("찜 목록 업데이트 실패:", err);
      showError("찜 목록 업데이트에 실패했습니다.");
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
