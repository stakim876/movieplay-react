export function analyzeUserPreferences(watchHistory, favorites, comments) {
  const preferences = {
    genres: {},
    years: {},
    ratings: [],
    totalWatched: 0,
    totalLiked: 0,
    avgRating: 0,
  };

  if (watchHistory && Array.isArray(watchHistory)) {
    watchHistory.forEach((item) => {
      if (item.genres && Array.isArray(item.genres)) {
        item.genres.forEach((genre) => {
          const genreName = typeof genre === "string" ? genre : genre.name || genre.id;
          preferences.genres[genreName] = (preferences.genres[genreName] || 0) + 2;
        });
      }
      
      if (item.release_date || item.first_air_date) {
        const year = new Date(item.release_date || item.first_air_date).getFullYear();
        if (year) {
          preferences.years[year] = (preferences.years[year] || 0) + 1;
        }
      }
      
      preferences.totalWatched++;
    });
  }

  if (favorites && Array.isArray(favorites)) {
    favorites.forEach((item) => {
      if (item.genres && Array.isArray(item.genres)) {
        item.genres.forEach((genre) => {
          const genreName = typeof genre === "string" ? genre : genre.name || genre.id;
          preferences.genres[genreName] = (preferences.genres[genreName] || 0) + 3;
        });
      }
      preferences.totalLiked++;
    });
  }

  if (comments && Array.isArray(comments)) {
    const ratings = comments
      .filter((c) => c.rating && c.rating > 0)
      .map((c) => c.rating);
    
    preferences.ratings = ratings;
    if (ratings.length > 0) {
      preferences.avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    }
  }

  return preferences;
}

export function calculateMovieScore(movie, preferences) {
  let score = 0;

  if (movie.vote_average) {
    score += movie.vote_average * 2;
  }

  if (movie.genre_ids && Array.isArray(movie.genre_ids)) {
    const genreMatches = movie.genre_ids.filter((genreId) => {
      const genreMap = {
        28: "액션", 12: "모험", 16: "애니메이션", 35: "코미디", 80: "범죄",
        99: "다큐멘터리", 18: "드라마", 10751: "가족", 14: "판타지", 36: "역사",
        27: "공포", 10402: "음악", 9648: "미스터리", 10749: "로맨스", 878: "SF",
        10770: "TV영화", 53: "스릴러", 10752: "전쟁", 37: "서부"
      };
      const genreName = genreMap[genreId];
      return genreName && preferences.genres[genreName];
    });
    
    genreMatches.forEach(() => {
      score += 5;
    });
  }

  const releaseYear = movie.release_date 
    ? new Date(movie.release_date).getFullYear()
    : (movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : null);
  
  if (releaseYear && preferences.years[releaseYear]) {
    score += 2;
  }

  if (preferences.avgRating > 0 && movie.vote_average) {
    const ratingDiff = Math.abs(movie.vote_average - preferences.avgRating);
    if (ratingDiff <= 1) {
      score += 3;
    }
  }

  if (movie.popularity) {
    score += Math.min(movie.popularity / 100, 5);
  }

  return score;
}

export function getPersonalizedRecommendations(allMovies, preferences, limit = 10) {
  if (!allMovies || allMovies.length === 0) {
    return [];
  }

  const scoredMovies = allMovies.map((movie) => ({
    movie,
    score: calculateMovieScore(movie, preferences),
  }));

  scoredMovies.sort((a, b) => b.score - a.score);

  return scoredMovies.slice(0, limit).map((item) => item.movie);
}

export function generateRecommendationReason(movie, preferences) {
  const reasons = [];

  if (movie.genre_ids && Array.isArray(movie.genre_ids)) {
    const genreMap = {
      28: "액션", 12: "모험", 16: "애니메이션", 35: "코미디", 80: "범죄",
      99: "다큐멘터리", 18: "드라마", 10751: "가족", 14: "판타지", 36: "역사",
      27: "공포", 10402: "음악", 9648: "미스터리", 10749: "로맨스", 878: "SF",
      10770: "TV영화", 53: "스릴러", 10752: "전쟁", 37: "서부"
    };
    
    const matchedGenres = movie.genre_ids
      .map((id) => genreMap[id])
      .filter((name) => name && preferences.genres[name]);
    
    if (matchedGenres.length > 0) {
      reasons.push(`당신이 좋아하는 ${matchedGenres[0]} 장르의 작품이에요.`);
    }
  }

  if (movie.vote_average >= 8.0) {
    reasons.push("높은 평점을 받은 작품이에요.");
  } else if (movie.vote_average >= 7.0) {
    reasons.push("괜찮은 평점을 받은 작품이에요.");
  }

  if (movie.popularity > 500) {
    reasons.push("지금 많은 사람들이 보고 있어요.");
  }

  const releaseYear = movie.release_date 
    ? new Date(movie.release_date).getFullYear()
    : (movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : null);
  
  if (releaseYear && preferences.years[releaseYear]) {
    reasons.push(`${releaseYear}년 작품을 좋아하시는 것 같아요.`);
  }

  if (reasons.length === 0) {
    reasons.push("당신의 취향에 맞을 것 같아요.");
  }

  return reasons[0];
}

export function getGenreBasedRecommendations(allMovies, preferences, genreLimit = 5) {
  const sortedGenres = Object.entries(preferences.genres)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genreName]) => genreName);

  const genreMap = {
    "액션": 28, "모험": 12, "애니메이션": 16, "코미디": 35, "범죄": 80,
    "다큐멘터리": 99, "드라마": 18, "가족": 10751, "판타지": 14, "역사": 36,
    "공포": 27, "음악": 10402, "미스터리": 9648, "로맨스": 10749, "SF": 878,
    "TV영화": 10770, "스릴러": 53, "전쟁": 10752, "서부": 37
  };

  const genreIds = sortedGenres
    .map((name) => genreMap[name])
    .filter((id) => id !== undefined);

  if (genreIds.length === 0) {
    return [];
  }

  const genreMovies = allMovies.filter((movie) => {
    if (!movie.genre_ids || !Array.isArray(movie.genre_ids)) return false;
    return movie.genre_ids.some((id) => genreIds.includes(id));
  });

  return getPersonalizedRecommendations(genreMovies, preferences, genreLimit);
}
