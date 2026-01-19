import { getAdultKeywords } from "@/services/adultFilter";
import { apiCache } from "@/utils/cache";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

let loadedKeywords = [];
let keywordsLoading = true;

async function loadKeywordFilter() {
  try {
    keywordsLoading = true;
    loadedKeywords = await getAdultKeywords();
    console.log("🔥 Firestore 금칙어 로딩됨:", loadedKeywords.length, "개");
  } catch (e) {
    console.error("금칙어 로딩 실패:", e);
    loadedKeywords = [];
  } finally {
    keywordsLoading = false;
  }
}

loadKeywordFilter();

const bannedGenreIds = [867];

function isSafeMovie(m) {
  if (!m) return false;

  if (m.adult) return false;

  if (["ja", "zh"].includes(m.original_language)) return false;

  if (m.genre_ids && m.genre_ids.some((id) => bannedGenreIds.includes(id))) {
    return false;
  }

  const text = `
    ${m.title || ""}
    ${m.name || ""}
    ${m.original_title || ""}
    ${m.original_name || ""}
    ${m.overview || ""}
  `.toLowerCase();

  if (loadedKeywords.some((word) => text.includes(word.toLowerCase()))) return false;

  return true;
}

export async function fetchMovies(endpoint) {
  try {
    const cleanEndpoint = endpoint.replace(/(\?|&)include_adult=true/g, "");

    const url = `${BASE_URL}${cleanEndpoint}${
      cleanEndpoint.includes("?") ? "&" : "?"
    }api_key=${API_KEY}&language=ko-KR&include_adult=false`;

    const cacheKey = `movies_${cleanEndpoint}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDb API 호출 실패: ${res.status}`);

    const data = await res.json();

    data.results = (data.results || []).filter(isSafeMovie);

    apiCache.set(cacheKey, data);

    return data;
  } catch (err) {
    console.error("fetchMovies error:", err);
    return { results: [] };
  }
}

export async function fetchMovieDetail(id, type = "movie") {
  try {
    const cacheKey = `detail_${type}_${id}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const appendToResponse = type === "tv" 
      ? "videos,credits,recommendations,similar" 
      : "videos";

    const response = await fetch(
      `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=ko-KR&append_to_response=${appendToResponse}`
    );

    if (!response.ok) {
      throw new Error("상세 정보를 불러올 수 없습니다.");
    }

    const data = await response.json();

    if (!isSafeMovie(data)) throw new Error("성인 콘텐츠 차단됨");

    apiCache.set(cacheKey, data);

    return data;
  } catch (err) {
    console.error("fetchMovieDetail error:", err);
    throw err;
  }
}

export async function fetchTVSeason(tvId, seasonNumber) {
  try {
    const cacheKey = `season_${tvId}_${seasonNumber}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await fetch(
      `${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=ko-KR`
    );

    if (!response.ok) {
      throw new Error("시즌 정보를 불러올 수 없습니다.");
    }

    const data = await response.json();

    apiCache.set(cacheKey, data);

    return data;
  } catch (err) {
    console.error("fetchTVSeason error:", err);
    throw err;
  }
}

export async function fetchSearchResults(query, type = "movie") {
  try {
    if (keywordsLoading) {
      console.warn("⏳ 금칙어 로딩 중 → 검색 차단");
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (keywordsLoading) {
        return { results: [] };
      }
    }

    const lowerQuery = query.toLowerCase().trim();

    if (loadedKeywords.length > 0 && loadedKeywords.some((kw) => lowerQuery.includes(kw.toLowerCase()))) {
      console.warn("🚫 금칙어 검색 차단됨:", query);
      return { results: [] };
    }

    const cleanQuery = encodeURIComponent(query.trim());
    if (!cleanQuery) return { results: [] };

    const cacheKey = `search_${type}_${cleanQuery}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const url = `${BASE_URL}/search/${type}?api_key=${API_KEY}&language=ko-KR&query=${cleanQuery}&include_adult=false`;

    const res = await fetch(url);
    if (!res.ok) {
      console.error(`❌ TMDB API 오류: ${res.status}`, await res.text());
      throw new Error(`TMDb 검색 실패: ${res.status}`);
    }

    const data = await res.json();

    const beforeFilter = data.results?.length || 0;
    
    const filteredResults = (data.results || []).filter((item) => {
      const isSafe = isSafeMovie(item);
      return isSafe;
    });
    
    data.results = filteredResults;
    const afterFilter = data.results.length;

    apiCache.set(cacheKey, data);

    return data;
  } catch (err) {
    console.error("❌ fetchSearchResults error:", err);
    return { results: [] };
  }
}
