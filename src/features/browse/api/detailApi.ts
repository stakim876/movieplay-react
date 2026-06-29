import { fetchMovieDetail } from "@/core/api/tmdb";
import type { MovieDetailMediaType } from "@/features/browse/model/catalog";

export async function getMovieDetail(id: string, mediaType: MovieDetailMediaType) {
  const data = await fetchMovieDetail(id, mediaType);
  if (data.adult) {
    throw new Error("해당 콘텐츠는 이용할 수 없습니다.");
  }
  return data;
}
