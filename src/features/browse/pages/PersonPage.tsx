import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MovieCard from "@/features/browse/components/category/cards/MovieCard";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";
import { usePersonQuery } from "@/features/browse/hooks/useBrowseQueries";
import "@/styles/common/common.css";
import "@/styles/pages/search.css";

const IMG_W185 = "https://image.tmdb.org/t/p/w185";

function toMediaType(item: { media_type?: string; first_air_date?: string }) {
  return item?.media_type || (item?.first_air_date ? "tv" : "movie");
}

export default function PersonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = usePersonQuery(id);

  const person = data?.person;
  const credits = data?.credits;

  const works = useMemo(() => {
    const list = [...(credits?.cast || []), ...(credits?.crew || [])].filter(Boolean);

    const byId = new Map<string, Record<string, unknown>>();
    for (const item of list) {
      const mt = toMediaType(item);
      const key = `${mt}-${item.id}`;
      if (!byId.has(key)) {
        byId.set(key, { ...item, media_type: mt });
      }
    }

    return Array.from(byId.values())
      .filter((x) => x.poster_path)
      .sort((a, b) => Number(b.popularity || 0) - Number(a.popularity || 0))
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

        {isLoading ? (
          <p>로딩 중...</p>
        ) : isError || !person ? (
          <p>인물 정보를 불러올 수 없습니다.</p>
        ) : (
          <>
            <div className="person-header" style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}>
              {person.profile_path && (
                <img
                  src={`${IMG_W185}${person.profile_path}`}
                  alt={person.name}
                  style={{ width: 120, borderRadius: 8 }}
                />
              )}
              <div>
                <h1 style={{ margin: 0 }}>{person.name}</h1>
                {person.birthday && <p>생년월일: {person.birthday}</p>}
                {person.place_of_birth && <p>출생: {person.place_of_birth}</p>}
                {person.biography && (
                  <p style={{ maxWidth: 720, lineHeight: 1.6 }}>{person.biography.slice(0, 500)}</p>
                )}
              </div>
            </div>

            <h2>출연·참여 작품</h2>
            <div className="search-results-grid">
              {works.map((item) => (
                <MovieCard
                  key={`${item.media_type}-${item.id}`}
                  movie={item as Parameters<typeof MovieCard>[0]["movie"]}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
