import { fetchPeopleSearch, fetchSearchResults } from "@/core/api/tmdb";

function buildExpandedQueries(q: string) {
  const trimmed = (q || "").trim();
  if (!trimmed) return [];
  const noSpace = trimmed.replace(/\s+/g, "");
  const lowered = trimmed.toLowerCase();
  const set = new Set([trimmed, noSpace, lowered].filter(Boolean));
  return Array.from(set).slice(0, 3);
}

function mergeUniqueResults(
  lists: Array<{ results?: Array<{ id: number }> }>
) {
  const map = new Map<number, { id: number } & Record<string, unknown>>();
  for (const res of lists) {
    for (const item of res?.results || []) {
      if (!item?.id) continue;
      if (!map.has(item.id)) map.set(item.id, item as { id: number } & Record<string, unknown>);
    }
  }
  return Array.from(map.values());
}

export type SearchCatalogPage = {
  movies: Array<Record<string, unknown>>;
  tvs: Array<Record<string, unknown>>;
  people: Array<Record<string, unknown>>;
  movieTotalPages: number;
  tvTotalPages: number;
  peopleTotalPages: number;
};

const EMPTY_PAGE: SearchCatalogPage = {
  movies: [],
  tvs: [],
  people: [],
  movieTotalPages: 0,
  tvTotalPages: 0,
  peopleTotalPages: 0,
};

export async function searchCatalogPage(
  query: string,
  page: number,
  dislikedIds: Set<number>
): Promise<SearchCatalogPage> {
  const trimmed = query.trim();
  if (!trimmed) return EMPTY_PAGE;

  const safePage = Math.max(1, page);

  if (safePage === 1) {
    const queries = buildExpandedQueries(trimmed);
    const [movieResList, tvResList, primaryMovie, primaryTv, peopleRes] = await Promise.all([
      Promise.all(queries.map((q) => fetchSearchResults(q, "movie", 1))),
      Promise.all(queries.map((q) => fetchSearchResults(q, "tv", 1))),
      fetchSearchResults(trimmed, "movie", 1),
      fetchSearchResults(trimmed, "tv", 1),
      fetchPeopleSearch(trimmed, 1),
    ]);

    const movies = mergeUniqueResults(movieResList)
      .filter((m) => !dislikedIds.has(m.id))
      .map((m) => ({ ...m, media_type: "movie" }));
    const tvs = mergeUniqueResults(tvResList)
      .filter((t) => !dislikedIds.has(t.id))
      .map((t) => ({ ...t, media_type: "tv" }));
    const people = (peopleRes.results || []).slice(0, 30);

    return {
      movies,
      tvs,
      people,
      movieTotalPages: primaryMovie.total_pages || 0,
      tvTotalPages: primaryTv.total_pages || 0,
      peopleTotalPages: peopleRes.total_pages || 0,
    };
  }

  const [movieRes, tvRes, peopleRes] = await Promise.all([
    fetchSearchResults(trimmed, "movie", safePage),
    fetchSearchResults(trimmed, "tv", safePage),
    fetchPeopleSearch(trimmed, safePage),
  ]);

  const movies = (movieRes.results || [])
    .filter((m) => !dislikedIds.has(m.id))
    .map((m) => ({ ...m, media_type: "movie" }));
  const tvs = (tvRes.results || [])
    .filter((t) => !dislikedIds.has(t.id))
    .map((t) => ({ ...t, media_type: "tv" }));
  const people = peopleRes.results || [];

  return {
    movies,
    tvs,
    people,
    movieTotalPages: movieRes.total_pages || 0,
    tvTotalPages: tvRes.total_pages || 0,
    peopleTotalPages: peopleRes.total_pages || 0,
  };
}

/** @deprecated use searchCatalogPage with useSearchInfiniteQuery */
export async function searchCatalog(query: string, dislikedIds: Set<number>) {
  const page = await searchCatalogPage(query, 1, dislikedIds);
  return { movies: page.movies, tvs: page.tvs, people: page.people };
}
