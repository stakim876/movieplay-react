import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchPeopleSearch, fetchSearchResults } from "@/services/tmdb.js";
import { fetchMovies } from "@/services/tmdb.js";
import MovieCard from "@/components/category/cards/MovieCard";
import { MovieCardSkeleton } from "@/components/common/Skeleton";
import SearchSuggestions from "@/components/search/SearchSuggestions";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { useToast } from "@/context/ToastContext";
import { useUserFeedback } from "@/context/UserFeedbackContext";
import { FaSearch, FaTimes } from "react-icons/fa";
import "@/styles/pages/search.css";
import "@/styles/common/common.css";

const SEARCH_HISTORY_KEY = "search_history_v1";
const POPULAR_SEARCHES = [
  "액션", "로맨스", "코미디", "스릴러", "공포", "SF", "드라마", "애니메이션"
];

function loadSearchHistory() {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(history) {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
  } catch (err) {
    console.error("검색 히스토리 저장 실패:", err);
  }
}

export default function SearchPage() {
  const { error: showError } = useToast();
  const { dislikedIds } = useUserFeedback();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [movieResults, setMovieResults] = useState([]);
  const [tvResults, setTvResults] = useState([]);
  const [peopleResults, setPeopleResults] = useState([]);
  const [rawMovieResults, setRawMovieResults] = useState([]);
  const [rawTvResults, setRawTvResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState(loadSearchHistory);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const buildExpandedQueries = (q) => {
    const trimmed = (q || "").trim();
    if (!trimmed) return [];
    const noSpace = trimmed.replace(/\s+/g, "");
    const lowered = trimmed.toLowerCase();
    const set = new Set([trimmed, noSpace, lowered].filter(Boolean));
    return Array.from(set).slice(0, 3);
  };

  const performSearch = useCallback(async (searchQuery, applyFilters = true) => {
    if (!searchQuery.trim()) {
      setMovieResults([]);
      setTvResults([]);
      setPeopleResults([]);
      return;
    }

    setLoading(true);
    try {
      console.log("🔍 검색 시작:", searchQuery);
      const queries = buildExpandedQueries(searchQuery);
      const [movieResList, tvResList, peopleRes] = await Promise.all([
        Promise.all(queries.map((q) => fetchSearchResults(q, "movie"))),
        Promise.all(queries.map((q) => fetchSearchResults(q, "tv"))),
        fetchPeopleSearch(searchQuery),
      ]);

      const mergeUnique = (list) => {
        const map = new Map();
        for (const res of list) {
          for (const item of res?.results || []) {
            if (!item?.id) continue;
            if (!map.has(item.id)) map.set(item.id, item);
          }
        }
        return Array.from(map.values());
      };

      const movieRes = { results: mergeUnique(movieResList) };
      const tvRes = { results: mergeUnique(tvResList) };

      console.log("📊 검색 결과:", {
        movies: movieRes.results?.length || 0,
        tvs: tvRes.results?.length || 0,
        people: peopleRes.results?.length || 0,
      });

      let movies = movieRes.results || [];
      let tvs = tvRes.results || [];
      const people = (peopleRes.results || []).slice(0, 30);

      if (dislikedIds.size > 0) {
        movies = movies.filter((m) => !dislikedIds.has(m.id));
        tvs = tvs.filter((t) => !dislikedIds.has(t.id));
      }

      setRawMovieResults(movies);
      setRawTvResults(tvs);
      setPeopleResults(people);

      if (applyFilters) {
        if (selectedGenre) {
          movies = movies.filter((m) => m.genre_ids?.includes(Number(selectedGenre)));
          tvs = tvs.filter((t) => t.genre_ids?.includes(Number(selectedGenre)));
        }

        if (selectedYear) {
          const year = Number(selectedYear);
          movies = movies.filter((m) => {
            const releaseYear = m.release_date
              ? new Date(m.release_date).getFullYear()
              : null;
            return releaseYear === year;
          });
          tvs = tvs.filter((t) => {
            const airYear = t.first_air_date
              ? new Date(t.first_air_date).getFullYear()
              : null;
            return airYear === year;
          });
        }
      }

      setMovieResults(movies);
      setTvResults(tvs);

      if (searchQuery.trim()) {
        const history = loadSearchHistory();
        const newHistory = [
          searchQuery.trim(),
          ...history.filter((h) => h !== searchQuery.trim()),
        ].slice(0, 10);
        setSearchHistory(newHistory);
        saveSearchHistory(newHistory);
      }
    } catch (err) {
      console.error("❌ 검색 오류:", err);
      setMovieResults([]);
      setTvResults([]);
      setPeopleResults([]);
      showError("검색 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
      setShowSuggestions(false);
    }
  }, [selectedGenre, selectedYear, showError]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("query");
    if (q) {
      setQuery(q);
      performSearch(q, true);
    } else {
      setQuery("");
      setMovieResults([]);
      setTvResults([]);
      setPeopleResults([]);
    }
  }, [location.search, performSearch]);

  useEffect(() => {
    if (rawMovieResults.length === 0 && rawTvResults.length === 0) {
      return;
    }

    let filteredMovies = [...rawMovieResults];
    let filteredTvs = [...rawTvResults];

    if (selectedGenre) {
      filteredMovies = filteredMovies.filter((m) => m.genre_ids?.includes(Number(selectedGenre)));
      filteredTvs = filteredTvs.filter((t) => t.genre_ids?.includes(Number(selectedGenre)));
    }

    if (selectedYear) {
      const year = Number(selectedYear);
      filteredMovies = filteredMovies.filter((m) => {
        const releaseYear = m.release_date
          ? new Date(m.release_date).getFullYear()
          : null;
        return releaseYear === year;
      });
      filteredTvs = filteredTvs.filter((t) => {
        const airYear = t.first_air_date
          ? new Date(t.first_air_date).getFullYear()
          : null;
        return airYear === year;
      });
    }

    setMovieResults(filteredMovies);
    setTvResults(filteredTvs);
  }, [selectedGenre, selectedYear, rawMovieResults, rawTvResults]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleSuggestionSelect = (item) => {
    navigate(`/${item.media_type}/${item.id}`);
  };

  const handleHistoryClick = (historyQuery) => {
    setQuery(historyQuery);
    navigate(`/search?query=${encodeURIComponent(historyQuery)}`);
  };

  const handleHistoryRemove = (e, historyQuery) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter((h) => h !== historyQuery);
    setSearchHistory(newHistory);
    saveSearchHistory(newHistory);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    saveSearchHistory([]);
  };

  const currentResults =
    activeTab === "people"
      ? peopleResults
      : activeTab === "movie"
      ? movieResults
      : activeTab === "tv"
      ? tvResults
      : [...movieResults, ...tvResults];

  const hasResults = currentResults.length > 0;
  const hasQuery = query.trim().length > 0;

  const years = Array.from({ length: 30 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <div className="search-page">
      <div className="search-header">
        <form onSubmit={handleSearch} className="search-input-wrapper">
          <div className="search-input-container" ref={suggestionsRef}>
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="제목, 사람, 장르로 검색"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            <FaSearch className="search-icon" />
            {showSuggestions && (
              <SearchSuggestions
                query={query}
                onSelect={handleSuggestionSelect}
                onClose={() => setShowSuggestions(false)}
              />
            )}
          </div>
        </form>
      </div>

      {hasQuery && (
        <>
          <div className="search-tabs">
            <button
              className={`search-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              전체 ({movieResults.length + tvResults.length})
            </button>
            <button
              className={`search-tab ${activeTab === "movie" ? "active" : ""}`}
              onClick={() => setActiveTab("movie")}
            >
              영화 ({movieResults.length})
            </button>
            <button
              className={`search-tab ${activeTab === "tv" ? "active" : ""}`}
              onClick={() => setActiveTab("tv")}
            >
              드라마 ({tvResults.length})
            </button>
            <button
              className={`search-tab ${activeTab === "people" ? "active" : ""}`}
              onClick={() => setActiveTab("people")}
            >
              인물 ({peopleResults.length})
            </button>
          </div>

          {activeTab !== "people" && hasResults && (
          <div className="search-results-header">
            <div className="search-results-count">
              "{query}"에 대한 검색 결과 {currentResults.length}개
            </div>
            <div className="search-filters">
              <select
                className="filter-select"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <option value="">모든 장르</option>
                <option value="28">액션</option>
                <option value="35">코미디</option>
                <option value="18">드라마</option>
                <option value="10749">로맨스</option>
                <option value="27">공포</option>
                <option value="878">SF</option>
                <option value="16">애니메이션</option>
              </select>
              <select
                className="filter-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">모든 연도</option>
                {years.map((year) => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </select>
              {(selectedGenre || selectedYear) && (
                <button
                  className="filter-reset-btn"
                  onClick={() => {
                    setSelectedGenre("");
                    setSelectedYear("");
                  }}
                  title="필터 초기화"
                >
                  필터 초기화
                </button>
              )}
            </div>
          </div>
          )}
        </>
      )}

      {loading ? (
        <div className="search-results-grid">
          <div className="movie-grid">
            {[...Array(12)].map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : hasQuery && hasResults ? (
        <div className="search-results-grid">
          {activeTab === "people" ? (
            <div className="people-grid fade-in">
              {peopleResults.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="person-card"
                  onClick={() => navigate(`/person/${p.id}`)}
                >
                  <div className="person-photo">
                    {p.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${p.profile_path}`}
                        alt={p.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="person-photo-fallback">👤</div>
                    )}
                  </div>
                  <div className="person-info">
                    <div className="person-title">{p.name}</div>
                    {p.known_for_department && (
                      <div className="person-subtitle">{p.known_for_department}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="movie-grid fade-in">
              {currentResults.map((item) => (
                <MovieCard
                  key={`${item.media_type || "movie"}-${item.id}`}
                  movie={{ ...item, media_type: item.media_type || activeTab || "movie" }}
                />
              ))}
            </div>
          )}
        </div>
      ) : hasQuery && !hasResults ? (
        <div className="search-empty-state">
          <div className="search-empty-title">
            "{query}"에 대한 검색 결과가 없습니다
          </div>
          <div className="search-empty-text">
            {(selectedGenre || selectedYear) && (
              <div style={{ marginBottom: "1rem", color: "#00e0ff" }}>
                필터가 적용되어 있습니다. 필터를 초기화해보세요.
              </div>
            )}
            다른 검색어를 시도해보세요
          </div>
          {(selectedGenre || selectedYear) && (
            <button
              className="popular-tag"
              onClick={() => {
                setSelectedGenre("");
                setSelectedYear("");
                performSearch(query, false);
              }}
              style={{ marginTop: "1rem" }}
            >
              필터 초기화하고 다시 검색
            </button>
          )}
        </div>
      ) : (
        <div className="search-empty-state">
          <div className="search-empty-title">검색어를 입력해주세요</div>
          <div className="search-empty-text">
            영화, 드라마 제목이나 장르로 검색할 수 있습니다
          </div>

          {searchHistory.length > 0 && (
            <div className="search-history">
              <div className="search-history-title">
                최근 검색어
                <button
                  className="history-clear-btn"
                  onClick={clearHistory}
                  style={{
                    marginLeft: "1rem",
                    background: "transparent",
                    border: "none",
                    color: "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  전체 삭제
                </button>
              </div>
              <div className="history-items">
                {searchHistory.map((historyQuery, idx) => (
                  <div
                    key={idx}
                    className="history-item"
                    onClick={() => handleHistoryClick(historyQuery)}
                  >
                    <span>{historyQuery}</span>
                    <button
                      className="history-remove"
                      onClick={(e) => handleHistoryRemove(e, historyQuery)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="popular-searches">
            <div className="popular-searches-title">인기 검색어</div>
            <div className="popular-tags">
              {POPULAR_SEARCHES.map((tag) => (
                <button
                  key={tag}
                  className="popular-tag"
                  onClick={() => {
                    setQuery(tag);
                    navigate(`/search?query=${encodeURIComponent(tag)}`);
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
}

