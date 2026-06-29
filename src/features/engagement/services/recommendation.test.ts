import { describe, it, expect } from "vitest";
import {
  analyzeUserPreferences,
  calculateMovieScore,
  generateRecommendationReason,
  getGenreBasedRecommendations,
  getPersonalizedRecommendations,
} from "@/features/engagement/services/recommendation";

describe("analyzeUserPreferences", () => {
  it("시청 기록과 찜에서 장르 선호도를 집계한다", () => {
    const preferences = analyzeUserPreferences(
      [{ genres: ["액션", "SF"], release_date: "2020-01-01" }],
      [{ genres: ["액션"] }],
      [{ rating: 8 }, { rating: 6 }]
    );

    expect(preferences.genres["액션"]).toBe(5);
    expect(preferences.genres["SF"]).toBe(2);
    expect(preferences.totalWatched).toBe(1);
    expect(preferences.totalLiked).toBe(1);
    expect(preferences.avgRating).toBe(7);
    expect(preferences.years[2020]).toBe(1);
  });

  it("빈 입력에도 기본 구조를 반환한다", () => {
    const preferences = analyzeUserPreferences(null, undefined, []);

    expect(preferences.genres).toEqual({});
    expect(preferences.totalWatched).toBe(0);
    expect(preferences.avgRating).toBe(0);
  });
});

describe("calculateMovieScore", () => {
  const actionFan = analyzeUserPreferences(
    [{ genres: ["액션"], release_date: "2019-06-01" }],
    [],
    [{ rating: 8 }]
  );

  it("선호 장르와 맞을수록 점수가 높다", () => {
    const actionMovie = {
      id: 1,
      genre_ids: [28],
      vote_average: 7.5,
      release_date: "2019-01-01",
      popularity: 200,
    };
    const romanceMovie = {
      id: 2,
      genre_ids: [10749],
      vote_average: 7.5,
      release_date: "2019-01-01",
      popularity: 200,
    };

    expect(calculateMovieScore(actionMovie, actionFan)).toBeGreaterThan(
      calculateMovieScore(romanceMovie, actionFan)
    );
  });
});

describe("getPersonalizedRecommendations", () => {
  it("점수 순으로 limit만큼 반환한다", () => {
    const preferences = analyzeUserPreferences(
      [{ genres: ["액션"] }],
      [],
      []
    );
    const movies = [
      { id: 1, genre_ids: [28], vote_average: 6, popularity: 10 },
      { id: 2, genre_ids: [10749], vote_average: 9, popularity: 10 },
      { id: 3, genre_ids: [28], vote_average: 8, popularity: 10 },
    ];

    const result = getPersonalizedRecommendations(movies, preferences, 2);

    expect(result).toHaveLength(2);
    expect(result[0].genre_ids).toContain(28);
  });

  it("빈 목록이면 빈 배열을 반환한다", () => {
    expect(getPersonalizedRecommendations([], { genres: {} }, 5)).toEqual([]);
  });
});

describe("generateRecommendationReason", () => {
  it("선호 장르가 있으면 장르 기반 이유를 반환한다", () => {
    const preferences = { genres: { 액션: 5 }, years: {}, avgRating: 0 };
    const movie = { genre_ids: [28], vote_average: 6, popularity: 10 };

    expect(generateRecommendationReason(movie, preferences)).toBe(
      "당신이 좋아하는 액션 장르의 작품이에요."
    );
  });

  it("매칭 이유가 없으면 기본 문구를 반환한다", () => {
    const preferences = { genres: {}, years: {}, avgRating: 0 };
    const movie = { genre_ids: [18], vote_average: 5, popularity: 10 };

    expect(generateRecommendationReason(movie, preferences)).toBe(
      "당신의 취향에 맞을 것 같아요."
    );
  });
});

describe("getGenreBasedRecommendations", () => {
  it("상위 선호 장르 영화만 추천한다", () => {
    const preferences = analyzeUserPreferences(
      [{ genres: ["SF", "액션"] }],
      [{ genres: ["SF"] }],
      []
    );
    const movies = [
      { id: 1, genre_ids: [878], vote_average: 7, popularity: 50 },
      { id: 2, genre_ids: [18], vote_average: 9, popularity: 50 },
      { id: 3, genre_ids: [28], vote_average: 7, popularity: 50 },
    ];

    const result = getGenreBasedRecommendations(movies, preferences, 5);

    expect(result.some((m) => m.id === 2)).toBe(false);
    expect(result.length).toBeGreaterThan(0);
  });
});
