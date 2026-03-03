import { getAdultKeywords as loadAdultKeywords } from "@/services/adultFilter";

// 앱 로드 시 금칙어 미리 로드 (캐시 채워 두기)
loadAdultKeywords();

const HARDCODED_BLOCK_KEYWORDS = [
  "sex", "섹스", "sensual", "erotic", "fetish",
  "porn", "porno", "pornography",
  "av ", "av-", " jav", "nude", "누드", "노출",
  "19금", "19", "18+", "성인", "에로"
];

function isSafeMovie(m, bannedKeywords = []) {
  if (!m) return false;

  if (m.adult === true) return false;

  const dangerousLang = ["ja", "zh", "jp", "cn"];
  if (dangerousLang.includes(m.original_language)) return false;

  if (!m.poster_path && !m.backdrop_path) return false;

  const text = `
    ${m.title || ""}
    ${m.name || ""}
    ${m.original_title || ""}
    ${m.original_name || ""}
    ${m.overview || ""}
  `.toLowerCase();

  if (HARDCODED_BLOCK_KEYWORDS.some(k => text.includes(k))) return false;
  if (bannedKeywords.some(k => text.includes(k.toLowerCase()))) return false;

  return true;
}

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function fetchMovies(endpoint) {
  try {
    const bannedKeywords = await loadAdultKeywords();

    const cleanEndpoint = endpoint.replace(/(\?|&)include_adult=true/g, "");
    const url = `${BASE_URL}${cleanEndpoint}${
      cleanEndpoint.includes("?") ? "&" : "?"
    }api_key=${API_KEY}&language=ko-KR&include_adult=false`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDb API 실패: ${res.status}`);

    const data = await res.json();
    data.results = (data.results || []).filter((m) => isSafeMovie(m, bannedKeywords));

    return data;
  } catch (err) {
    console.error("fetchMovies error:", err);
    return { results: [] };
  }
}

export async function fetchMovieDetail(id, type = "movie") {
  try {
    const bannedKeywords = await loadAdultKeywords();

    const url = `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=ko-KR&append_to_response=videos`;
    const res = await fetch(url);

    if (!res.ok) throw new Error("상세 정보 로딩 실패");

    const data = await res.json();
    if (!isSafeMovie(data, bannedKeywords)) throw new Error("성인 콘텐츠 차단됨");

    return data;
  } catch (e) {
    console.error("fetchMovieDetail error:", e);
    throw e;
  }
}

export async function fetchSearchResults(query, type = "movie") {
  try {
    const bannedKeywords = await loadAdultKeywords();

    const clean = encodeURIComponent(query.trim());
    if (!clean) return { results: [] };

    const url = `${BASE_URL}/search/${type}?api_key=${API_KEY}&language=ko-KR&query=${clean}&include_adult=false`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`TMDb 검색 실패: ${res.status}`);

    const data = await res.json();
    data.results = (data.results || []).filter((m) => isSafeMovie(m, bannedKeywords));

    return data;
  } catch (err) {
    console.error("fetchSearchResults error:", err);
    return { results: [] };
  }
}
