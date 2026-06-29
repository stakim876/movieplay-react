import { useEffect, useState, useMemo } from "react";
import { useWatchHistory } from "@/stores/watchHistoryStore";
import { useFavorites } from "@/stores/favoritesStore";
import { useAuth } from "@/stores/authStore";
import { db } from "@/core/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";
import { analyzeUserPreferences } from "@/features/engagement/services/recommendation";
import { fetchMovieDetail } from "@/core/api/tmdb";

// [면접] 커스텀 훅 = "사용자 취향 분석" 로직을 한곳에 모음
// → 컴포넌트는 const { preferences, loading } = useUserPreferences() 만 쓰면 됨
// → 말하기: "데이터 가져오기 + 가공을 훅으로 분리해 UI와 비즈니스 로직을 나눴습니다."
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

  // [면접] useMemo = 시청기록·찜·댓글이 바뀔 때만 취향 분석 재실행
  // → 매 렌더마다 analyzeUserPreferences 돌리면 낭비
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
