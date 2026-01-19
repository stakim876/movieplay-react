import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMovies, fetchMovieDetail } from "@/services/tmdb.js";
import { FaPowerOff, FaPlay, FaInfoCircle } from "react-icons/fa";
import { HeroSkeleton } from "@/components/common/Skeleton";
import "@/styles/components/components.css";

export default function FeaturedHero() {
  const [movie, setMovie] = useState(null);
  const [movieDetail, setMovieDetail] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [visible, setVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadFeatured() {
      try {
        setLoading(true);
        const data = await fetchMovies("/movie/now_playing?language=ko-KR&page=1");

        const filtered = (data.results || []).filter(
          (m) =>
            !m.adult &&
            !/adult|porn|sex|섹스|에로|성인|19금|av/i.test(m.title || m.name || "")
        );

        const random = filtered[Math.floor(Math.random() * filtered.length)];
        if (!random) return;
        setMovie(random);

        const detail = await fetchMovieDetail(random.id, "movie");
        setMovieDetail(detail);

        const trailer =
          detail.videos?.results.find(
            (v) =>
              (v.type === "Trailer" || v.type === "Teaser") &&
              v.site === "YouTube" &&
              v.iso_639_1 === "ko"
          ) ||
          detail.videos?.results.find(
            (v) =>
              (v.type === "Trailer" || v.type === "Teaser") &&
              v.site === "YouTube" &&
              v.iso_639_1 === "en"
          ) ||
          detail.videos?.results.find(
            (v) =>
              ["Trailer", "Teaser", "Clip"].includes(v.type) &&
              v.site === "YouTube"
          );

        if (trailer) setTrailerKey(trailer.key);
      } catch (err) {
        console.error("FeaturedHero load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const togglePlay = () => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;
    const message = isPlaying
      ? '{"event":"command","func":"pauseVideo","args":""}'
      : '{"event":"command","func":"playVideo","args":""}';
    iframe.contentWindow.postMessage(message, "*");
    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return <HeroSkeleton />;
  }

  if (!visible) {
    return (
      <div className="hero-show-btn-wrapper">
        <button className="hero-show-btn" onClick={() => setVisible(true)}>
          <FaPowerOff />
        </button>
      </div>
    );
  }

  const handlePlayClick = () => {
    if (movie) {
      navigate(`/movie/${movie.id}`);
    }
  };

  const handleInfoClick = () => {
    if (movie) {
      navigate(`/movie/${movie.id}`);
    }
  };

  const truncateOverview = (text, maxLength = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <section className="featured-hero fade-in">
      <button
        className="hero-toggle-btn"
        onClick={() => setVisible(false)}
        title="배너 끄기"
      >
        <FaPowerOff />
      </button>

      <div className="hero-video-wrapper">
        {trailerKey ? (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&enablejsapi=1`}
            title="Featured Trailer"
            className="hero-video"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          movie && (
            <img
              src={`https://image.tmdb.org/t/p/original${
                movie.backdrop_path || movie.poster_path
              }`}
              alt={movie.title}
              className="hero-video"
            />
          )
        )}
        <div className="hero-gradient-overlay"></div>
      </div>

      {movie && (
        <div className="hero-content">
          <div className="hero-info">
            <h1 className="hero-title">{movie.title || movie.name}</h1>
            <div className="hero-meta">
              {movieDetail?.vote_average && (
                <span className="hero-rating">
                  ⭐ {movieDetail.vote_average.toFixed(1)}
                </span>
              )}
              {movieDetail?.release_date && (
                <span className="hero-year">
                  {new Date(movieDetail.release_date).getFullYear()}
                </span>
              )}
              {movieDetail?.genres && movieDetail.genres.length > 0 && (
                <span className="hero-genres">
                  {movieDetail.genres.slice(0, 2).map((g) => g.name).join(", ")}
                </span>
              )}
            </div>
            <p className="hero-overview">
              {truncateOverview(movieDetail?.overview || movie.overview || "")}
            </p>
            <div className="hero-buttons">
              <button className="hero-play-btn" onClick={handlePlayClick}>
                <FaPlay /> 재생
              </button>
              <button className="hero-info-btn" onClick={handleInfoClick}>
                <FaInfoCircle /> 상세 정보
              </button>
            </div>
          </div>
        </div>
      )}

      {trailerKey && (
        <button className="hero-video-toggle" onClick={togglePlay}>
          {isPlaying ? "⏸" : "▶"}
        </button>
      )}
    </section>
  );
}
