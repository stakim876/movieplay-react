import { useState, useMemo, useCallback } from "react";

import { Link, useNavigate } from "react-router-dom";

import { FaPlay, FaInfoCircle, FaThumbsUp, FaThumbsDown } from "react-icons/fa";

import LikeButton from "@/shared/ui/LikeButton";

import ContentRating from "@/shared/ui/ContentRating";

import TMDBImage from "@/shared/ui/TMDBImage";

import { isKidsProfileActive } from "@/shared/lib/activeProfile";

import { getContentPath, getPlayerPath } from "@/shared/lib/contentPath";
import { PORTFOLIO_SCOPE } from "@/shared/constants/portfolioScope";

import { useUserFeedback } from "@/stores/userFeedbackStore";

import { useWatchHistory } from "@/stores/watchHistoryStore";

import { useToast } from "@/stores/toastStore";

import "@/styles/components/components.css";



function getReleaseYear(movie: {

  release_date?: string;

  first_air_date?: string;

}) {

  const date = movie.release_date || movie.first_air_date;

  if (!date) return null;

  const year = new Date(date).getFullYear();

  return Number.isNaN(year) ? null : year;

}



export default function MovieCard({

  movie,

  recommendationReason = undefined,

}: {

  movie: Record<string, unknown> & {

    id: number;

    title?: string;

    name?: string;

    poster_path?: string;

    backdrop_path?: string;

    adult?: boolean;

    vote_average?: number;

    media_type?: string;

    first_air_date?: string;

    release_date?: string;

  };

  recommendationReason?: string;

}) {

  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);

  const { likedIds, dislikedIds, toggleLike, toggleDislike } = useUserFeedback();

  const { getWatchProgress } = useWatchHistory();

  const { info } = useToast();



  const detailPath = useMemo(() => getContentPath(movie), [movie]);

  const mediaType = useMemo(

    () =>

      movie.media_type === "tv"

        ? "tv"

        : movie.media_type === "movie"

          ? "movie"

          : movie.first_air_date && !movie.title

            ? "tv"

            : "movie",

    [movie]

  );



  const posterPath = (movie.poster_path || movie.backdrop_path) as string | undefined;

  const watchProgress = useMemo(() => {

    if (!movie?.id) return null;

    return getWatchProgress(movie.id, mediaType, null, null);

  }, [getWatchProgress, movie?.id, mediaType]);



  const progressPercent = watchProgress?.progressPercent

    ? Math.max(0, Math.min(100, watchProgress.progressPercent))

    : 0;



  const title = movie.title || movie.name || "제목 없음";

  const year = getReleaseYear(movie);

  const showOverlay = isHovered || isExpanded;



  const handlePlayClick = useCallback(

    (e: React.MouseEvent) => {

      e.preventDefault();

      e.stopPropagation();

      navigate(getPlayerPath(movie));

    },

    [navigate, movie]

  );



  const handleCardTap = useCallback(

    (e: React.MouseEvent) => {

      if (window.matchMedia("(hover: none)").matches) {

        if (!isExpanded) {

          e.preventDefault();

          setIsExpanded(true);

        }

      }

    },

    [isExpanded]

  );



  return (

    <article

      className={`movie-card${isExpanded ? " is-expanded" : ""}`}

      onMouseEnter={() => setIsHovered(true)}

      onMouseLeave={() => setIsHovered(false)}

      onBlur={(e) => {

        if (!e.currentTarget.contains(e.relatedTarget as Node)) {

          setIsExpanded(false);

        }

      }}

    >

      <Link

        to={detailPath}

        className="movie-card-hit-area"

        aria-label={`${title} 상세보기`}

        onClick={handleCardTap}

      >

        <TMDBImage path={posterPath} alt="" size="w342" className="movie-poster" />

        {progressPercent > 5 && progressPercent < 95 && (

          <div className="movie-progress">

            <div className="movie-progress-fill" style={{ width: `${progressPercent}%` }} />

          </div>

        )}

        <div className="movie-card-meta">

          {year && <span className="movie-card-year">{year}</span>}

          {movie.vote_average > 0 && (
            <span className="movie-card-match">★ {Number(movie.vote_average).toFixed(1)}</span>
          )}

        </div>

        <ContentRating

          adult={movie.adult}

          voteAverage={movie.vote_average}

          kidsMode={isKidsProfileActive()}

          compact

        />

      </Link>



      <div className={`movie-card-overlay ${showOverlay ? "hovered" : ""}`}>

        <div className="movie-card-info">

          <h3 className="movie-card-title">{title}</h3>

          {recommendationReason && <p className="movie-card-reason">{recommendationReason}</p>}

          {movie.vote_average > 0 && (

            <p className="movie-card-rating">⭐ {movie.vote_average.toFixed(1)}</p>

          )}

        </div>

        <div className="movie-card-buttons">

          <button

            type="button"

            className="movie-card-button movie-card-play"

            onClick={handlePlayClick}

            title={PORTFOLIO_SCOPE.cta.watchTrailer}

            aria-label={`${title} ${PORTFOLIO_SCOPE.cta.watchTrailer}`}

          >

            <FaPlay />

          </button>

          <Link

            to={detailPath}

            className="movie-card-button movie-card-info"

            title="상세 정보"

            aria-label={`${title} 상세 정보`}

            onClick={(e) => e.stopPropagation()}

          >

            <FaInfoCircle />

          </Link>

          <button

            type="button"

            className={`feedback-btn like ${likedIds.has(movie.id) ? "active" : ""}`.trim()}

            onClick={(e) => {

              e.preventDefault();

              e.stopPropagation();

              toggleLike(movie.id);

            }}

            title="좋아요"

            aria-label="좋아요"

          >

            <FaThumbsUp />

          </button>

          <button

            type="button"

            className={`feedback-btn dislike ${dislikedIds.has(movie.id) ? "active" : ""}`.trim()}

            onClick={(e) => {

              e.preventDefault();

              e.stopPropagation();

              const wasDisliked = dislikedIds.has(movie.id);

              toggleDislike(movie.id);

              if (!wasDisliked) info("비슷한 추천에서 제외했어요");

            }}

            title="관심 없음"

            aria-label="관심 없음"

          >

            <FaThumbsDown />

          </button>

          <LikeButton movie={movie} />

        </div>

      </div>

    </article>

  );

}


