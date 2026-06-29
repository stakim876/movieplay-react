import { useEffect, useRef, useState, useMemo } from "react";

import { useNavigate } from "react-router-dom";

import { FaPowerOff, FaPlay, FaInfoCircle } from "react-icons/fa";

import { HeroSkeleton } from "@/shared/ui/Skeleton";

import { getContentPath, getPlayerPath } from "@/shared/lib/contentPath";

import { useFeaturedHeroQuery } from "@/features/browse/hooks/useBrowseQueries";

import { pickTrailerKey } from "@/shared/lib/trailer";
import { PORTFOLIO_SCOPE } from "@/shared/constants/portfolioScope";

import "@/styles/components/components.css";



export default function FeaturedHero() {

  const [visible, setVisible] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const navigate = useNavigate();



  const { data, isLoading, isError } = useFeaturedHeroQuery();

  const movie = data?.movie;

  const movieDetail = data?.detail;



  const trailerKey = useMemo(

    () => (movieDetail ? pickTrailerKey(movieDetail) : null),

    [movieDetail]

  );



  useEffect(() => {

    setIsPlaying(false);

  }, [trailerKey]);



  const togglePlay = () => {

    if (!iframeRef.current) return;

    const message = isPlaying

      ? '{"event":"command","func":"pauseVideo","args":""}'

      : '{"event":"command","func":"playVideo","args":""}';

    iframeRef.current.contentWindow?.postMessage(message, "*");

    setIsPlaying(!isPlaying);

  };



  if (isLoading) {

    return <HeroSkeleton />;

  }



  if (isError || !movie) {

    return null;

  }



  if (!visible) {

    return (

      <div className="hero-show-btn-wrapper">

        <button className="hero-show-btn" onClick={() => setVisible(true)} aria-label="히어로 배너 표시">

          <FaPowerOff />

        </button>

      </div>

    );

  }



  const handlePlayClick = () => navigate(getPlayerPath(movie));

  const handleInfoClick = () => navigate(getContentPath(movie));



  const truncateOverview = (text: string, maxLength = 150) => {

    if (!text) return "";

    if (text.length <= maxLength) return text;

    return `${text.substring(0, maxLength)}...`;

  };



  return (

    <section className="featured-hero fade-in" aria-label="추천 콘텐츠">

      <button

        className="hero-toggle-btn"

        onClick={() => setVisible(false)}

        title="배너 끄기"

        aria-label="히어로 배너 끄기"

      >

        <FaPowerOff />

      </button>



      <div className="hero-video-wrapper">

        {trailerKey ? (

          <iframe

            ref={iframeRef}

            src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&enablejsapi=1`}

            title="Featured Trailer"

            className="hero-video"

            referrerPolicy="strict-origin-when-cross-origin"

            allow="autoplay; encrypted-media; picture-in-picture"

            allowFullScreen

          />

        ) : (

          <img

            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`}

            alt={movie.title || movie.name}

            className="hero-video"

          />

        )}

        <div className="hero-gradient-overlay" />

      </div>



      <div className="hero-content">

        <div className="hero-info">

          <h1 className="hero-title">{movie.title || movie.name}</h1>

          <div className="hero-meta">

            {movieDetail?.vote_average > 0 && (

              <span className="hero-rating">⭐ {movieDetail.vote_average.toFixed(1)}</span>

            )}

            {movieDetail?.release_date && (

              <span className="hero-year">

                {new Date(movieDetail.release_date).getFullYear()}

              </span>

            )}

            {movieDetail?.genres && movieDetail.genres.length > 0 && (

              <span className="hero-genres">

                {movieDetail.genres

                  .slice(0, 2)

                  .map((g: { name: string }) => g.name)

                  .join(", ")}

              </span>

            )}

          </div>

          <p className="hero-overview">

            {truncateOverview(movieDetail?.overview || movie.overview || "")}

          </p>

          <div className="hero-buttons">

            <button className="hero-play-btn" onClick={handlePlayClick}>

              <FaPlay /> {PORTFOLIO_SCOPE.cta.watchTrailer}

            </button>

            <button className="hero-info-btn" onClick={handleInfoClick}>

              <FaInfoCircle /> 상세 정보

            </button>

          </div>

        </div>

      </div>



      {trailerKey && (

        <button className="hero-video-toggle" onClick={togglePlay} aria-label={isPlaying ? "일시정지" : "재생"}>

          {isPlaying ? "⏸" : "▶"}

        </button>

      )}

    </section>

  );

}


