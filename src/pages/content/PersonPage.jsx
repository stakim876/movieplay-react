import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPersonCredits, fetchPersonDetail } from "@/services/tmdb";
import MovieCard from "@/components/category/cards/MovieCard";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import "@/styles/common/common.css";
import "@/styles/pages/search.css";

const IMG_W185 = "https://image.tmdb.org/t/p/w185";

function toMediaType(item) {
  return item?.media_type || (item?.first_air_date ? "tv" : "movie");
}

export default function PersonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [p, c] = await Promise.all([
          fetchPersonDetail(id),
          fetchPersonCredits(id),
        ]);
        if (cancelled) return;
        setPerson(p);
        setCredits(c);
      } catch (e) {
        if (!cancelled) {
          setPerson(null);
          setCredits(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const works = useMemo(() => {
    const list = [
      ...(credits?.cast || []),
      ...(credits?.crew || []),
    ].filter(Boolean);

    const byId = new Map();
    for (const item of list) {
      const mt = toMediaType(item);
      const key = `${mt}-${item.id}`;
      if (!byId.has(key)) {
        byId.set(key, { ...item, media_type: mt });
      }
    }

    return Array.from(byId.values())
      .filter((x) => x.poster_path)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 40);
  }, [credits]);

  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <div className="search-page">
        <div className="search-results-header" style={{ marginBottom: "1.5rem" }}>
          <div className="search-results-count">
            <button
              className="filter-reset-btn"
              onClick={() => navigate(-1)}
              style={{ marginRight: "0.75rem" }}
            >
              ← 뒤로
            </button>
            인물 상세
          </div>
        </div>

        {loading ? (
          <div className="search-empty-state">
            <div className="search-empty-title">불러오는 중…</div>
          </div>
        ) : !person ? (
          <div className="search-empty-state">
            <div className="search-empty-title">인물 정보를 불러오지 못했어요</div>
          </div>
        ) : (
          <div className="search-results-grid">
            <div className="person-header">
              <div className="person-avatar">
                {person.profile_path ? (
                  <img src={`${IMG_W185}${person.profile_path}`} alt={person.name} />
                ) : (
                  <div className="person-avatar-fallback">👤</div>
                )}
              </div>
              <div className="person-meta">
                <h1 className="person-name">{person.name}</h1>
                {person.known_for_department && (
                  <div className="person-sub">
                    {person.known_for_department}
                    {person.birthday ? ` · ${person.birthday.slice(0, 4)}년생` : ""}
                  </div>
                )}
                {person.biography && (
                  <p className="person-bio">{person.biography}</p>
                )}
              </div>
            </div>

            {works.length > 0 && (
              <>
                <div className="search-results-count" style={{ margin: "1.5rem 0 1rem" }}>
                  대표 출연/참여작
                </div>
                <div className="movie-grid fade-in">
                  {works.map((m) => (
                    <MovieCard key={`${m.media_type}-${m.id}`} movie={m} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

