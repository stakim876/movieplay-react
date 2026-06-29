import { fetchMovies } from "@/core/api/tmdb";
import type { CatalogRowParams } from "@/features/browse/model/catalog";

export function buildCatalogUrl(params: CatalogRowParams, page: number): string | null {
  const { category, type, genreId, endpoint } = params;

  if (endpoint) {
    if (endpoint.includes("{page}")) {
      return endpoint.replace("{page}", String(page));
    }
    if (endpoint.includes("page=")) {
      return endpoint.replace(/page=\d+/i, `page=${page}`);
    }
    return `${endpoint}${endpoint.includes("?") ? "&" : "?"}page=${page}`;
  }

  if (category && type) {
    return `/${type}/${category}?language=ko-KR&page=${page}&include_adult=false`;
  }

  if (genreId) {
    return `/discover/movie?with_genres=${genreId}&language=ko-KR&page=${page}&include_adult=false`;
  }

  return null;
}

export async function fetchCatalogPage(params: CatalogRowParams, page: number) {
  const url = buildCatalogUrl(params, page);
  if (!url) {
    return { results: [] };
  }
  return fetchMovies(url);
}
