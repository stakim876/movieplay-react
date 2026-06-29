import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MovieCard from "@/features/browse/components/category/cards/MovieCard";
import { MovieCardSkeleton } from "@/shared/ui/Skeleton";
import SearchSuggestions from "@/features/search/components/SearchSuggestions";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";
import { useToast } from "@/stores/toastStore";
import { useUserFeedback } from "@/stores/userFeedbackStore";
import { useSearchInfiniteQuery } from "@/features/browse/hooks/useBrowseQueries";
import { PORTFOLIO_SCOPE } from "@/shared/constants/portfolioScope";
import { FaSearch, FaTimes } from "react-icons/fa";
import "@/styles/pages/search.css";
import "@/styles/common/common.css";

const SEARCH_HISTORY_KEY = "search_history_v1";
const POPULAR_SEARCHES = [
  "액션", "로맨스", "코미디", "스릴러", "공포", "SF", "드라마", "애니메이션",
];

function loadSearchHistory() {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(history: string[]) {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
  } catch (err) {
    console.error("검색 히스토리 저장 실패:", err);
  }
}

function applyClientFilters(
  items: Array<Record<string, unknown>>,
  selectedGenre: string,
  selectedYear: string
) {
  let filtered = [...items];

  if (selectedGenre) {
    filtered = filtered.filter((m) =>
      (m.genre_ids as number[] | undefined)?.includes(Number(selectedGenre))
    );
  }

  if (selectedYear) {
    const year = Number(selectedYear);
    filtered = filtered.filter((m) => {
      const date = (m.release_date || m.first_air_date) as string | undefined;
      if (!date) return false;
      return new Date(date).getFullYear() === year;
    });
  }

  return filtered;
}

export default function SearchPage() {
  const { error: showError } = useToast();
  const { dislikedIds } = useUserFeedback();
  const location = useLocation();
  const navigate = useNavigate();

  const submittedQuery = useMemo(() => {
    return new URLSearchParams(location.search).get("query")?.trim() || "";
  }, [location.search]);

  const [query, setQuery] = useState(submittedQuery);
  const [activeTab, setActiveTab] = useState("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(loadSearchHistory);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useSearchInfiniteQuery(submittedQuery, dislikedIds, Boolean(submittedQuery));

  const { movies: rawMovies, tvs: rawTvs, people: rawPeople } = useMemo(() => {
    if (!data?.pages?.length) {
      return { movies: [] as Array<Record<string, unknown>>, tvs: [], people: [] };
    }
    const seenMovie = new Set<number>();
    const seenTv = new Set<number>();
    const seenPerson = new Set<number>();
    const movies: Array<Record<string, unknown>> = [];
    const tvs: Array<Record<string, unknown>> = [];
    const people: Array<{ id: number; profile_path?: string; name: string; known_for_department?: string }> = [];

    for (const page of data.pages) {
      for (const item of page.movies) {
        const id = item.id as number;
        if (!seenMovie.has(id)) {
          seenMovie.add(id);
          movies.push(item);
        }
      }
      for (const item of page.tvs) {
        const id = item.id as number;
        if (!seenTv.has(id)) {
          seenTv.add(id);
          tvs.push(item);
        }
      }
      for (const person of page.people) {
        const id = person.id as number;
        if (!seenPerson.has(id)) {
          seenPerson.add(id);
          people.push(person as typeof people[number]);
        }
      }
    }

    return { movies, tvs, people };
  }, [data]);

  useEffect(() => {
    setQuery(submittedQuery);
    if (!submittedQuery) {
      setSelectedGenre("");
      setSelectedYear("");
    }
  }, [submittedQuery]);

  useEffect(() => {
    if (isError) {
      showError("검색 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }, [isError, showError]);

  useEffect(() => {
    if (!submittedQuery || !data?.pages?.length) return;
    const history = loadSearchHistory();
    const newHistory = [
      submittedQuery,
      ...history.filter((h) => h !== submittedQuery),
    ].slice(0, 10);
    setSearchHistory(newHistory);
    saveSearchHistory(newHistory);
  }, [submittedQuery, data]);

  const movieResults = useMemo(
    () => applyClientFilters(rawMovies, selectedGenre, selectedYear),
    [rawMovies, selectedGenre, selectedYear]
  );

  const tvResults = useMemo(
    () => applyClientFilters(rawTvs, selectedGenre, selectedYear),
    [rawTvs, selectedGenre, selectedYear]
  );

  const peopleResults = rawPeople;

  useEffect(() => {
    if (!submittedQuery) return;

    const handleScroll = () => {
      const threshold = 500;
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;

      if (
        pageHeight - scrollPosition < threshold &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [submittedQuery, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (item: { media_type: string; id: number }) => {
    navigate(`/${item.media_type}/${item.id}`);
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    navigate(`/search?query=${encodeURIComponent(historyQuery)}`);
  };

  const handleHistoryRemove = (e: React.MouseEvent, historyQuery: string) => {
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
  const hasQuery = submittedQuery.length > 0;

  const years = Array.from({ length: 30 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <div className="search-page">
        <div className="search-discovery-intro">
          <p className="search-discovery-kicker">Discover</p>
          <p className="search-discovery-text">{PORTFOLIO_SCOPE.search.discoveryTitle}</p>
        </div>
        <div className="search-header">
          <form onSubmit={handleSearch} className="search-input-wrapper">
            <div className="search-input-container" ref={suggestionsRef}>
              <input
                ref={inputRef}
                type="text"
                className="search-input"
                placeholder={PORTFOLIO_SCOPE.search.placeholder}
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
                  "{submittedQuery}"에 대한 검색 결과 {currentResults.length}개
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

        {isLoading && hasQuery ? (
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
                {peopleResults.map((p: { id: number; profile_path?: string; name: string; known_for_department?: string }) => (
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
                {isFetchingNextPage &&
                  [...Array(4)].map((_, i) => (
                    <div key={`person-loading-${i}`} className="person-card person-card--skeleton" aria-hidden />
                  ))}
              </div>
            ) : (
              <div className="movie-grid fade-in">
                {currentResults.map((item) => (
                  <MovieCard
                    key={`${item.media_type || "movie"}-${item.id}`}
                    movie={{
                      ...item,
                      media_type: (item.media_type as string) || activeTab || "movie",
                    }}
                  />
                ))}
                {isFetchingNextPage &&
                  [...Array(6)].map((_, i) => <MovieCardSkeleton key={`more-${i}`} />)}
              </div>
            )}
          </div>
        ) : hasQuery && !hasResults && !isLoading ? (
          <div className="search-empty-state">
            <div className="search-empty-title">
              "{submittedQuery}"에 대한 검색 결과가 없습니다
            </div>
            <div className="search-empty-text">
              {(selectedGenre || selectedYear) && (
                <div className="search-loading-hint" style={{ marginBottom: "1rem", color: "var(--accent-primary)" }}>
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
                }}
                style={{ marginTop: "1rem" }}
              >
                필터 초기화
              </button>
            )}
          </div>
        ) : (
          <div className="search-empty-state">
            <div className="search-empty-title">{PORTFOLIO_SCOPE.search.discoveryTitle}</div>
            <div className="search-empty-text">{PORTFOLIO_SCOPE.search.emptyHint}</div>

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
                      color: "rgba(255, 255, 255, 0.5)",
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
              <div className="popular-searches-title">추천 키워드</div>
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
