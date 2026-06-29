import { fetchMovies } from "@/core/api/tmdb";
import { getMovieDetail } from "@/features/browse/api/detailApi";
import { pickTrailerKey } from "@/shared/lib/trailer";

export { pickTrailerKey };

const BLOCKED_PATTERN = /adult|porn|sex|섹스|에로|성인|19금|av/i;

export async function fetchFeaturedHero() {
  const data = await fetchMovies("/movie/now_playing?language=ko-KR&page=1");

  const filtered = (data.results || []).filter(
    (m: { adult?: boolean; title?: string; name?: string }) =>
      !m.adult && !BLOCKED_PATTERN.test(m.title || m.name || "")
  );

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  if (!random) {
    throw new Error("추천 콘텐츠를 불러올 수 없습니다.");
  }

  const detail = await getMovieDetail(String(random.id), "movie");
  return { movie: random, detail };
}
