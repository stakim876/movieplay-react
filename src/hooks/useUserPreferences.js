import { useEffect, useState, useMemo } from "react";
import { useWatchHistory } from "@/context/WatchHistoryContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/services/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";
import { analyzeUserPreferences } from "@/services/recommendation";
import { fetchMovieDetail } from "@/services/tmdb";

export function useUserPreferences() {
  const { user } = useAuth();
  const watchHistory = useWatchHistory();
  const getWatchHistoryList = watchHistory?.getWatchHistoryList || (() => []);
  const { favorites = [] } = useFavorites();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchHistoryDetails, setWatchHistoryDetails] = useState([]);

  useEffect(() => {
    if (!user) {
      setComments([]);
      setLoading(false);
      return;
    }

    const fetchUserComments = async () => {
      try {
        const commentsList = [];
        
        const historyList = getWatchHistoryList();
        const movieIds = historyList.map((h) => h.movieId).slice(0, 20);

        for (const movieId of movieIds) {
          try {
            const commentsRef = collection(db, "comments", String(movieId), "items");
            const q = query(commentsRef, where("userId", "==", user.uid));
            const snapshot = await getDocs(q);
            snapshot.docs.forEach((doc) => {
              commentsList.push({
                movieId: parseInt(movieId),
                ...doc.data(),
              });
            });
          } catch (err) {
            console.error(`댓글 가져오기 실패 (${movieId}):`, err);
          }
        }

        setComments(commentsList);
      } catch (err) {
        console.error("사용자 댓글 가져오기 실패:", err);
        setComments([]);
      }
    };

    fetchUserComments();
  }, [user, getWatchHistoryList]);

  useEffect(() => {
    const loadWatchHistoryDetails = async () => {
      try {
        const historyList = getWatchHistoryList();
        const details = await Promise.all(
          historyList.slice(0, 20).map(async (item) => {
            try {
              const detail = await fetchMovieDetail(item.movieId, "movie");
              return {
                ...detail,
                watchProgress: item,
              };
            } catch (err) {
              return null;
            }
          })
        );
        setWatchHistoryDetails(details.filter((d) => d !== null));
      } catch (err) {
        console.error("시청 기록 상세 정보 가져오기 실패:", err);
        setWatchHistoryDetails([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadWatchHistoryDetails();
    } else {
      setLoading(false);
    }
  }, [user, getWatchHistoryList]);

  const preferences = useMemo(() => {
    if (!user) {
      return {
        genres: {},
        years: {},
        ratings: [],
        totalWatched: 0,
        totalLiked: 0,
        avgRating: 0,
      };
    }

    return analyzeUserPreferences(
      watchHistoryDetails,
      favorites || [],
      comments
    );
  }, [user, watchHistoryDetails, favorites, comments]);

  return {
    preferences,
    loading,
    hasData: (preferences.totalWatched > 0 || preferences.totalLiked > 0 || preferences.ratings.length > 0),
  };
}
