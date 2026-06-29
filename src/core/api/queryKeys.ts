export const queryKeys = {
  movies: {
    all: ["movies"] as const,
    lists: () => [...queryKeys.movies.all, "list"] as const,
    list: (params: Record<string, unknown>) => [...queryKeys.movies.lists(), params] as const,
    details: () => [...queryKeys.movies.all, "detail"] as const,
    detail: (id: string | number | undefined, mediaType: string) =>
      [...queryKeys.movies.details(), mediaType, id] as const,
  },
  catalog: {
    all: ["catalog"] as const,
    row: (params: Record<string, unknown>) => [...queryKeys.catalog.all, "row", params] as const,
  },
  featured: {
    hero: ["featured", "hero"] as const,
  },
  search: {
    all: ["search"] as const,
    results: (query: string, dislikedSize: number) =>
      [...queryKeys.search.all, "results", query, dislikedSize] as const,
    infinite: (query: string, dislikedSize: number) =>
      [...queryKeys.search.all, "infinite", query, dislikedSize] as const,
  },
  person: {
    all: ["person"] as const,
    detail: (id: string | undefined) => [...queryKeys.person.all, id] as const,
  },
} as const;
