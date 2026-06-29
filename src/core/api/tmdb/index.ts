import { getAdultKeywords } from "@/core/api/firestore/adultFilter";
import { apiCache } from "@/shared/lib/cache";
import { ADULT_FILTER_FALLBACK_KEYWORDS } from "@/shared/constants/adultFilterFallbackKeywords";
import { getActiveProfileKey } from "@/shared/lib/activeProfile";
import { KIDS_BANNED_GENRE_IDS, KIDS_BANNED_KEYWORDS } from "@/shared/constants/kidsFilter";

// Vite는 VITE_ 로 시작하는 env만 브라우저에 노출 → API 키가 번들에 포함됨
// → 진짜 비밀키는 서버에서만 써야 하고, TMDB 키는 클라이언트 노출이 일반적
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

if (!API_KEY || API_KEY === "your_tmdb_api_key_here") {
  console.warn("⚠️ TMDB API 키가 설정되지 않았습니다. .env 파일에 VITE_TMDB_API_KEY를 설정해주세요.");
}

let loadedKeywords = [];
let keywordsLoading = true;

async function loadKeywordFilter() {
  try {
    keywordsLoading = true;
    const dbKeywords = await getAdultKeywords();
    const merged = [...ADULT_FILTER_FALLBACK_KEYWORDS, ...(dbKeywords || [])];
    loadedKeywords = Array.from(
      new Set(
        merged
          .filter(Boolean)
          .map((k) => String(k).trim())
          .filter((k) => k.length > 0)
      )
    );
    console.log("🔥 Firestore 금칙어 로딩됨:", loadedKeywords.length, "개");
  } catch (e) {
    console.error("금칙어 로딩 실패:", e);
    loadedKeywords = [...ADULT_FILTER_FALLBACK_KEYWORDS];
  } finally {
    keywordsLoading = false;
  }
}

// 앱 시작할 때 금칙어 한 번 로드 → 이후 API마다 Firestore 안 읽음
loadKeywordFilter();

const bannedGenreIds = [867];

function isKidsMode() {
  try {
    const key = getActiveProfileKey();
    const raw = localStorage.getItem("mp_profile_settings_v1");
    const parsed = raw ? JSON.parse(raw) : {};
    return !!parsed?.[key]?.kids;
  } catch {
    return false;
  }
}

function isSafeMovie(m) {
  if (!m) return false;

  if (m.adult) return false;

  if (["ja", "zh"].includes(m.original_language)) return false;

  if (m.genre_ids && m.genre_ids.some((id) => bannedGenreIds.includes(id))) {
    return false;
  }

  if (isKidsMode()) {
    const g = m.genre_ids || [];
    if (g.some((id) => KIDS_BANNED_GENRE_IDS.includes(id))) return false;
  }

  const text = `
    ${m.title || ""}
    ${m.name || ""}
    ${m.original_title || ""}
    ${m.original_name || ""}
    ${m.overview || ""}
  `.toLowerCase();

  if (loadedKeywords.some((word) => text.includes(word.toLowerCase()))) return false;

  if (isKidsMode()) {
    if (KIDS_BANNED_KEYWORDS.some((word) => text.includes(String(word).toLowerCase()))) return false;
  }

  return true;
}

function buildMoviesUrl(endpoint: string): string {
  const queryIndex = endpoint.indexOf("?");
  const path = queryIndex >= 0 ? endpoint.slice(0, queryIndex) : endpoint;
  const params = new URLSearchParams(queryIndex >= 0 ? endpoint.slice(queryIndex + 1) : "");

  if (params.get("include_adult") === "true") {
    params.delete("include_adult");
  }

  params.set("api_key", API_KEY);
  params.set("language", params.get("language") || "ko-KR");
  params.set("include_adult", "false");

  return `${BASE_URL}${path}?${params.toString()}`;
}

// fetchMovies: TMDB API에 endpoint(예: /movie/popular, /discover/movie?with_genres=28) 요청해서 영화 목록 가져옴. 캐시 사용, 성인 필터 적용 후 { results: [...] } 반환
export async function fetchMovies(endpoint) {
  try {
    const url = buildMoviesUrl(endpoint);
    const cacheKey = `movies_${endpoint.replace(/(\?|&)include_adult=true/g, "")}`;
    // 1) 캐시 있으면 바로 반환  2) 없으면 API 호출 후 캐시에 저장
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

    const appendToResponse =
      type === "tv"
        ? "videos,credits,recommendations,similar"
        : "videos,credits,recommendations,similar";

    const response = await fetch(
      `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=ko-KR&append_to_response=${appendToResponse}`
    );

    if (!response.ok) {
      throw new Error("상세 정보를 불러올 수 없습니다.");
    }

    const data = await response.json();

    if (data.adult) throw new Error("성인 콘텐츠 차단됨");

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

export async function fetchSearchResults(query, type = "movie", page = 1) {
  try {
    if (keywordsLoading) {
      console.warn("⏳ 금칙어 로딩 중 → 검색 차단");
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (keywordsLoading) {
        return { results: [], total_pages: 0, page: 1 };
      }
    }

    const lowerQuery = query.toLowerCase().trim();

    if (loadedKeywords.length > 0 && loadedKeywords.some((kw) => lowerQuery.includes(kw.toLowerCase()))) {
      console.warn("🚫 금칙어 검색 차단됨:", query);
      return { results: [], total_pages: 0, page: 1 };
    }

    const cleanQuery = encodeURIComponent(query.trim());
    if (!cleanQuery) return { results: [], total_pages: 0, page: 1 };

    const safePage = Math.max(1, Number(page) || 1);
    const cacheKey = `search_${type}_${cleanQuery}_p${safePage}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const url = `${BASE_URL}/search/${type}?api_key=${API_KEY}&language=ko-KR&query=${cleanQuery}&include_adult=false&page=${safePage}`;

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
    return { results: [], total_pages: 0, page: 1 };
  }
}

export async function fetchPeopleSearch(query, page = 1) {
  try {
    const cleanQuery = encodeURIComponent(query.trim());
    if (!cleanQuery) return { results: [], total_pages: 0, page: 1 };

    const safePage = Math.max(1, Number(page) || 1);
    const cacheKey = `search_person_${cleanQuery}_p${safePage}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const url = `${BASE_URL}/search/person?api_key=${API_KEY}&language=ko-KR&query=${cleanQuery}&include_adult=false&page=${safePage}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDb 인물 검색 실패: ${res.status}`);

    const data = await res.json();
    data.results = (data.results || []).filter((p) => !!p?.id);
    apiCache.set(cacheKey, data);
    return data;
  } catch (err) {
    console.error("fetchPeopleSearch error:", err);
    return { results: [], total_pages: 0, page: 1 };
  }
}

export async function fetchPersonDetail(personId) {
  const id = Number(personId);
  if (!Number.isFinite(id)) throw new Error("invalid person id");

  const cacheKey = `person_${id}`;
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  const res = await fetch(
    `${BASE_URL}/person/${id}?api_key=${API_KEY}&language=ko-KR`
  );
  if (!res.ok) throw new Error("인물 정보를 불러올 수 없습니다.");

  const data = await res.json();
  apiCache.set(cacheKey, data);
  return data;
}

export async function fetchPersonCredits(personId) {
  const id = Number(personId);
  if (!Number.isFinite(id)) throw new Error("invalid person id");

  const cacheKey = `person_credits_${id}`;
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  const res = await fetch(
    `${BASE_URL}/person/${id}/combined_credits?api_key=${API_KEY}&language=ko-KR`
  );
  if (!res.ok) throw new Error("출연/참여작 정보를 불러올 수 없습니다.");

  const data = await res.json();
  apiCache.set(cacheKey, data);
  return data;
}
