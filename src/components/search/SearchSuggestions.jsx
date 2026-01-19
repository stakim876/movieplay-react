import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSearchResults } from "@/services/tmdb.js";
import { useDebounce } from "@/hooks/useDebounce";
import "@/styles/pages/search.css";

export default function SearchSuggestions({ query, onSelect, onClose }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const [movieRes, tvRes] = await Promise.all([
          fetchSearchResults(debouncedQuery, "movie"),
          fetchSearchResults(debouncedQuery, "tv"),
        ]);

        const movieResults = (movieRes.results || []).slice(0, 3);
        const tvResults = (tvRes.results || []).slice(0, 3);

        const combined = [
          ...movieResults.map((item) => ({ ...item, media_type: "movie" })),
          ...tvResults.map((item) => ({ ...item, media_type: "tv" })),
        ].slice(0, 5);

        setSuggestions(combined);
      } catch (err) {
        console.error("검색 제안 오류:", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  if (!debouncedQuery || debouncedQuery.length < 2 || (suggestions.length === 0 && !loading)) {
    return null;
  }

  return (
    <div className="search-suggestions">
      {loading && <div className="suggestions-loading">검색 중...</div>}
      {!loading && suggestions.length > 0 && (
        <div className="suggestions-list">
          {suggestions.map((item) => (
            <div
              key={`${item.media_type}-${item.id}`}
              className="suggestion-item"
              onClick={() => {
                onSelect(item);
                onClose();
              }}
            >
              <div className="suggestion-poster">
                {item.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                    alt={item.title || item.name}
                  />
                ) : (
                  <div className="suggestion-placeholder">🎬</div>
                )}
              </div>
              <div className="suggestion-info">
                <div className="suggestion-title">
                  {item.title || item.name}
                </div>
                <div className="suggestion-meta">
                  <span className="suggestion-type">
                    {item.media_type === "movie" ? "영화" : "드라마"}
                  </span>
                  {item.release_date && (
                    <span className="suggestion-year">
                      {new Date(item.release_date || item.first_air_date).getFullYear()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
