import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MovieCard from "@/components/category/cards/MovieCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("query");
    if (q) {
      setQuery(q);
      fetchSearchResults(q);
    }
  }, [location.search]);

  const fetchSearchResults = async (q) => {
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=ko-KR&query=${encodeURIComponent(
      q
    )}&include_adult=false`;

    const res = await fetch(url);
    const data = await res.json();
    setResults((data.results || []).filter((m) => !m.adult));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchSearchResults(query);
    }
  };

  return (
    <div className="search-page">
      <form onSubmit={handleSearch} className="search-box">
        <input
          type="text"
          placeholder="영화 제목 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button>검색</button>
      </form>

      {results.length > 0 && (
        <div className="movie-grid">
          {results.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      )}
    </div>
  );
}

