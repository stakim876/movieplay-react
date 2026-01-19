import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMovies } from "@/services/tmdb.js";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import {
  getPersonalizedRecommendations,
  generateRecommendationReason,
} from "@/services/recommendation";
import "@/styles/components/components.css";

const IMG_W500 = "https://image.tmdb.org/t/p/w500";
const DISLIKE_KEY = "disliked_movie_ids_v1";

function isSafeMovie(m) {
  if (!m) return false;
  if (m.adult === true) return false;
  if (!m.poster_path) return false;
  if (!(m.title || "").trim()) return false;
  return true;
}

function buildReason(m) {
  const score = Number(m?.vote_average || 0);
  const pop = Number(m?.popularity || 0);
  const year = (m?.release_date || "").slice(0, 4);

  if (score >= 8.0) return "평점과 반응이 좋아 오늘 한 편으로 골랐어요.";
  if (pop >= 800) return "지금 가장 많이 보는 흐름이라 먼저 추천해요.";
  if (year) return `${year}년 작품 중 요즘 다시 자주 언급되는 편이에요.`;
  return "오늘 분위기에 부담 없이 보기 좋은 한 편이에요.";
}

function loadDislikedIds() {
  try {
    const raw = localStorage.getItem(DISLIKE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveDislikedIds(set) {
  try {
    localStorage.setItem(DISLIKE_KEY, JSON.stringify([...set]));
  } catch {

  }
}

export default function TodayRecommend() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [disliked, setDisliked] = useState(() => loadDislikedIds());
  const { preferences, loading: preferencesLoading, hasData } = useUserPreferences();

  const navigate = useNavigate();

  const applyFilters = (list, dislikedSet) => {
    const safe = list.filter(isSafeMovie);
    const filtered = safe.filter((m) => !dislikedSet.has(m.id));
    return filtered.slice(0, 10);
  };

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const [trendingRes, popularRes, topRatedRes] = await Promise.all([
        fetchMovies("/trending/movie/day?language=ko-KR"),
        fetchMovies("/movie/popular?language=ko-KR&page=1"),
        fetchMovies("/movie/top_rated?language=ko-KR&page=1"),
      ]);

      const allMovies = [];
      const seenIds = new Set();

      [trendingRes, popularRes, topRatedRes].forEach((res) => {
        if (res?.results && Array.isArray(res.results)) {
          res.results.forEach((movie) => {
            if (!seenIds.has(movie.id) && isSafeMovie(movie)) {
              seenIds.add(movie.id);
              allMovies.push(movie);
            }
          });
        }
      });

      const filtered = allMovies.filter((m) => !disliked.has(m.id));

      let recommendedMovies = filtered;
      if (hasData && !preferencesLoading) {
        recommendedMovies = getPersonalizedRecommendations(
          filtered,
          preferences,
          20
        );
      }

      setMovies(recommendedMovies.slice(0, 10));
    } catch (e) {
      setError(e);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!preferencesLoading) {
      loadRecommendations();
    }
  }, [preferencesLoading, hasData]);

  const handleRefresh = () => {
    setMovies((prev) => {
      if (!prev || prev.length === 0) return prev;
      const copy = [...prev];
      copy.sort(() => Math.random() - 0.5);
      return copy;
    });
  };

  const handleDislike = () => {
    const picked = movies[0];
    if (!picked) return;

    setDisliked((prev) => {
      const next = new Set(prev);
      next.add(picked.id);
      saveDislikedIds(next);
      return next;
    });

    setMovies((prev) => prev.filter((m) => m.id !== picked.id));
  };

  const picked = movies[0] || null;
  const reason = useMemo(() => {
    if (!picked) return "";
    
    if (hasData && !preferencesLoading) {
      return generateRecommendationReason(picked, preferences);
    }
    
    return buildReason(picked);
  }, [picked, hasData, preferencesLoading, preferences]);

  return (
    <section className="today-recommend">
      <h2 className="recommend-title">🎬 오늘 이거 하나</h2>

      {loading && (
        <p className="recommend-reason">추천작을 고르는 중이에요…</p>
      )}

      {!loading && error && (
        <p className="recommend-reason">
          추천을 불러오지 못했어요.
          <button
            type="button"
            className="recommend-refresh"
            onClick={loadRecommendations}
          >
            다시 시도 ↻
          </button>
        </p>
      )}

      {!loading && !error && !picked && (
        <p className="recommend-reason">
          지금은 추천할 작품이 없어요.
          <button
            type="button"
            className="recommend-refresh"
            onClick={loadRecommendations}
          >
            새로고침 ↻
          </button>
        </p>
      )}

      {!loading && !error && picked && (
        <div className="recommend-reason">
          <div className="recommend-text">
            <span className="recommend-slogan">
              오늘은 고민하지 말고 이거 한 편으로 가자.
            </span>
            <span className="recommend-detail"> {reason}</span>
          </div>
          <div className="recommend-buttons">
            <button
              type="button"
              className="recommend-refresh"
              onClick={handleRefresh}
              title="다른 추천 보기"
            >
              다른 추천 ↻
            </button>
            <button
              type="button"
              className="recommend-dislike"
              onClick={handleDislike}
              title="이건 관심없어요"
            >
              관심없음 ✕
            </button>
          </div>
        </div>
      )}

      <div className="recommend-row">
        {!loading && !error && picked && (
          <div
            key={picked.id}
            className="recommend-card"
            onClick={() => navigate(`/movie/${picked.id}`)}
          >
            <div className="poster-wrapper">
              <img
                src={`${IMG_W500}${picked.poster_path}`}
                alt={picked.title}
                className="poster"
                loading="lazy"
              />
            </div>
            <p className="movie-name">{picked.title}</p>
          </div>
        )}
      </div>
    </section>
  );
}
