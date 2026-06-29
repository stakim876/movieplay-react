import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/core/api/queryKeys";
import { fetchPersonCredits, fetchPersonDetail } from "@/core/api/tmdb";
import { fetchCatalogPage } from "@/features/browse/api/catalogApi";
import { getMovieDetail } from "@/features/browse/api/detailApi";
import { fetchFeaturedHero } from "@/features/browse/api/featuredApi";
import { searchCatalog, searchCatalogPage } from "@/features/browse/api/searchApi";
import type { CatalogItem, CatalogRowParams, MovieDetailMediaType } from "@/features/browse/model/catalog";

const BLOCKED_KEYWORDS = [
  "porn", "pornographic", "erotic", "fetish", "hardcore", "sex", "sexual", "nude", "naked",
  "xvideo", "xhamster", "zwinger", "escort", "adult video", "strip", "lust",
  "야동", "야사", "에로", "성인", "노출", "19금", "음란", "포르노", "섹스", "불륜",
  "エロ", "レイプ", "アダルト", "爆乳", "セックス",
];

export function isCatalogItemVisible(item: CatalogItem, dislikedIds: Set<number>) {
  const text = `${item.title || ""} ${item.original_title || ""} ${item.overview || ""}`.toLowerCase();
  return (
    !item.adult &&
    !!item.poster_path &&
    !BLOCKED_KEYWORDS.some((kw) => text.includes(kw)) &&
    !dislikedIds.has(item.id)
  );
}

export function useMovieDetailQuery(id: string | undefined, mediaType: MovieDetailMediaType) {
  return useQuery({
    queryKey: queryKeys.movies.detail(id, mediaType),
    queryFn: () => getMovieDetail(id!, mediaType),
    enabled: Boolean(id),
  });
}

export function useCatalogRowQuery(params: CatalogRowParams, dislikedIds: Set<number>) {
  return useInfiniteQuery({
    queryKey: queryKeys.catalog.row({ ...params, dislikedSize: dislikedIds.size }),
    queryFn: ({ pageParam }) => fetchCatalogPage(params, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      if (!lastPage.results?.length) return undefined;
      const filtered = lastPage.results.filter((item) => isCatalogItemVisible(item, dislikedIds));
      if (!filtered.length) return undefined;
      return lastPageParam + 1;
    },
  });
}

export function useFeaturedHeroQuery() {
  return useQuery({
    queryKey: queryKeys.featured.hero,
    queryFn: fetchFeaturedHero,
    staleTime: 1000 * 60 * 30,
  });
}

export function useSearchQuery(query: string, dislikedIds: Set<number>, enabled = true) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: queryKeys.search.results(trimmed, dislikedIds.size),
    queryFn: () => searchCatalog(trimmed, dislikedIds),
    enabled: enabled && trimmed.length > 0,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSearchInfiniteQuery(query: string, dislikedIds: Set<number>, enabled = true) {
  const trimmed = query.trim();
  return useInfiniteQuery({
    queryKey: queryKeys.search.infinite(trimmed, dislikedIds.size),
    queryFn: ({ pageParam }) => searchCatalogPage(trimmed, pageParam, dislikedIds),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      const hasMore =
        lastPageParam < lastPage.movieTotalPages ||
        lastPageParam < lastPage.tvTotalPages ||
        lastPageParam < lastPage.peopleTotalPages;
      return hasMore ? lastPageParam + 1 : undefined;
    },
    enabled: enabled && trimmed.length > 0,
    staleTime: 1000 * 60 * 2,
  });
}

export function usePersonQuery(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.person.detail(id),
    queryFn: async () => {
      const [person, credits] = await Promise.all([
        fetchPersonDetail(id!),
        fetchPersonCredits(id!),
      ]);
      return { person, credits };
    },
    enabled: Boolean(id),
  });
}

export function useTop10Query() {
  return useQuery({
    queryKey: queryKeys.catalog.row({ top10: true, endpoint: "/movie/popular?language=ko-KR&page=1" }),
    queryFn: () => fetchCatalogPage({ endpoint: "/movie/popular?language=ko-KR&page=1" }, 1),
    select: (data) => (data.results || []).filter((item) => !item.adult).slice(0, 10),
    staleTime: 1000 * 60 * 15,
  });
}

/** CategoryPage vertical grid — same catalog API as CategoryGrid rows */
export function useCategoryPageQuery(params: CatalogRowParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.catalog.row({ ...params, layout: "page" }),
    queryFn: ({ pageParam }) => fetchCatalogPage(params, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      if (!lastPage.results?.length) return undefined;
      return lastPageParam + 1;
    },
  });
}
