import { useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaExclamationTriangle, FaRedo, FaHome, FaPlay } from "react-icons/fa";
import LikeButton from "@/shared/ui/LikeButton";
import { PORTFOLIO_SCOPE } from "@/shared/constants/portfolioScope";
import TMDBImage from "@/shared/ui/TMDBImage";
import { DetailSkeleton } from "@/shared/ui/Skeleton";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";
import SeasonList from "@/features/browse/components/tv/SeasonList";
import "@/styles/common/common.css";
import CommentsSection from "@/shared/ui/CommentsSection";
import ContentRating from "@/shared/ui/ContentRating";
import { isKidsProfileActive } from "@/shared/lib/activeProfile";
import { getContentPath, getPlayerPath } from "@/shared/lib/contentPath";
import { ROUTES } from "@/core/config/routes";
import { useMovieDetailQuery } from "@/features/browse/hooks/useBrowseQueries";
import type { MovieDetailMediaType } from "@/features/browse/model/catalog";

export default function MovieDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const mediaType = useMemo<MovieDetailMediaType>(() => {
    return location.pathname.startsWith("/tv/") ? "tv" : "movie";
  }, [location.pathname]);

  const { data: movie, isLoading, isError, error, refetch } = useMovieDetailQuery(id, mediaType);

  const trailer = useMemo(() => {
    const trailerData = movie?.videos?.results?.find(
      (v: { type: string; site: string }) =>
        ["Trailer", "Teaser", "Clip"].includes(v.type) && v.site === "YouTube"
    );
    return trailerData?.key || null;
  }, [movie]);

  const cast = useMemo(
    () =>
      movie?.credits?.cast
        ?.filter((c: { name?: string; character?: string }) => c.name && c.character)
        ?.slice(0, 12) || [],
    [movie]
  );

  const seasons = useMemo(() => {
    if (mediaType !== "tv" || !movie?.seasons) return [];
    return movie.seasons.filter(
      (s: { season_number: number; episode_count: number }) =>
        s.season_number >= 0 && s.episode_count > 0
    );
  }, [movie, mediaType]);

  const recommend = useMemo(
    () => (movie?.recommendations?.results || []).filter((item: { adult?: boolean }) => !item.adult),
    [movie]
  );

  const similar = useMemo(
    () => (movie?.similar?.results || []).filter((item: { adult?: boolean }) => !item.adult),
    [movie]
  );

  const handleEpisodeSelect = (episode: { season_number: number; episode_number: number }) => {
    if (movie && episode) {
      navigate(
        `${ROUTES.player("tv", movie.id)}?season=${episode.season_number}&episode=${episode.episode_number}`
      );
    }
  };

  if (isLoading) return <DetailSkeleton />;

  if (isError && !movie) {
    const message = error instanceof Error ? error.message : "콘텐츠 정보를 불러오는데 실패했습니다.";
    return (
      <ErrorBoundary showDetails={import.meta.env.DEV}>
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">
              <FaExclamationTriangle />
            </div>
            <h1 className="error-title">영화 정보를 불러올 수 없습니다</h1>
            <p className="error-message">{message}</p>
            <div className="error-actions">
              <button className="error-btn error-btn-primary" onClick={() => refetch()}>
                <FaRedo /> 다시 시도
              </button>
              <button
                className="error-btn error-btn-secondary"
                onClick={() => navigate(ROUTES.home)}
              >
                <FaHome /> 홈으로 가기
              </button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (!movie) return <DetailSkeleton />;

  const fallbackPosterSvg = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" fill="none"><rect width="300" height="450" fill="#2a2a2e" rx="8"/><g fill="#4a4a52"><path d="M120 180h60v90h-60z"/><circle cx="150" cy="230" r="20"/></g><text x="150" y="320" text-anchor="middle" fill="#6b6b75" font-family="system-ui,sans-serif" font-size="14">이미지 없음</text></svg>'
  )}`;
  const fallbackRecSvg = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 210" fill="none"><rect width="140" height="210" fill="#2a2a2e" rx="6"/><g fill="#4a4a52"><path d="M55 85h30v42h-30z"/><circle cx="70" cy="108" r="10"/></g><text x="70" y="155" text-anchor="middle" fill="#6b6b75" font-family="system-ui,sans-serif" font-size="11">이미지 없음</text></svg>'
  )}`;

  const fallbackPoster = fallbackPosterSvg;
  const fallbackRec = fallbackRecSvg;

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  return (
    <div className="movie-detail fade-in">
      {backdropUrl && (
        <div className="movie-detail-backdrop">
          <img src={backdropUrl} alt={movie.title} className="backdrop-image" />
          <div className="backdrop-gradient"></div>
        </div>
      )}
      <div className="movie-detail-content">
        <div className="detail-header">
          <img
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : fallbackPoster
            }
            alt={movie.title}
            className="detail-poster"
          />
          <div className="detail-info">
            <div className="detail-title-row">
              <h1>{movie.title || movie.name}</h1>
              <ContentRating
                adult={movie.adult}
                voteAverage={movie.vote_average}
                kidsMode={isKidsProfileActive()}
              />
            </div>
            <div className="detail-actions">
              <button
                className="detail-play-btn"
                onClick={() => navigate(getPlayerPath({ ...movie, media_type: mediaType }))}
              >
                <FaPlay /> {PORTFOLIO_SCOPE.cta.watchTrailer}
              </button>
              <LikeButton movie={movie} />
            </div>
            <p className="overview">{movie.overview || "줄거리가 없습니다."}</p>
            <p>
              <strong>{mediaType === "tv" ? "첫 방영일" : "개봉일"}:</strong>{" "}
              {mediaType === "tv"
                ? (movie.first_air_date || "정보 없음")
                : (movie.release_date || "정보 없음")}
            </p>
            {mediaType === "tv" && movie.number_of_seasons && (
              <p>
                <strong>시즌:</strong> {movie.number_of_seasons}개 시즌
              </p>
            )}
            {mediaType === "tv" && movie.number_of_episodes && (
              <p>
                <strong>에피소드:</strong> {movie.number_of_episodes}개 에피소드
              </p>
            )}
            <p>
              <strong>장르:</strong>{" "}
              {movie.genres?.map((g: { name: string }) => g.name).join(", ") || "정보 없음"}
            </p>
          </div>
        </div>

        {cast.length > 0 && (
          <div className="detail-cast">
            <h2>출연진</h2>
            <div className="cast-list">
              {cast.map(
                (c: {
                  cast_id?: number;
                  credit_id?: string;
                  profile_path?: string;
                  name: string;
                  character: string;
                }) => (
                  <div key={c.cast_id || c.credit_id} className="cast-card">
                    <TMDBImage path={c.profile_path} alt={c.name} size="w200" />
                    <p className="actor-name">{c.name}</p>
                    <p className="character">{c.character}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {mediaType === "tv" && seasons.length > 0 && (
          <SeasonList
            tvId={movie.id}
            seasons={seasons}
            onEpisodeSelect={handleEpisodeSelect}
          />
        )}

        <div className="detail-trailer">
          <h2>예고편</h2>
          <div className="trailer-wrapper">
            {trailer ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailer}?autoplay=1&mute=1&controls=1`}
                title="Trailer"
                frameBorder="0"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <p className="no-trailer">등록된 예고편이 없습니다.</p>
            )}
          </div>
        </div>

        {recommend.length > 0 && (
          <div className="detail-recommend">
            <h2>추천작</h2>
            <div className="recommend-list">
              {recommend.map(
                (r: {
                  id: number;
                  poster_path?: string;
                  title?: string;
                  name?: string;
                  media_type?: string;
                }) => (
                  <div
                    key={r.id}
                    className="recommend-card"
                    onClick={() =>
                      navigate(getContentPath({ ...r, media_type: r.media_type || mediaType }))
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={
                        r.poster_path
                          ? `https://image.tmdb.org/t/p/w200${r.poster_path}`
                          : fallbackRec
                      }
                      alt={r.title || r.name}
                    />
                    <p className="rec-title">{r.title || r.name || "제목 없음"}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {similar.length > 0 && (
          <div className="detail-similar">
            <h2>이 영화와 비슷한 콘텐츠</h2>
            <div className="similar-list">
              {similar.map(
                (s: {
                  id: number;
                  poster_path?: string;
                  title?: string;
                  name?: string;
                  media_type?: string;
                }) => (
                  <div
                    key={s.id}
                    className="similar-card"
                    onClick={() =>
                      navigate(getContentPath({ ...s, media_type: s.media_type || mediaType }))
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={
                        s.poster_path
                          ? `https://image.tmdb.org/t/p/w200${s.poster_path}`
                          : fallbackRec
                      }
                      alt={s.title || s.name}
                    />
                    <p className="similar-title">{s.title || s.name || "제목 없음"}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {movie?.id && <CommentsSection movieId={String(movie.id)} />}
      </div>
    </div>
  );
}
