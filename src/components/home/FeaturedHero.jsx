import { useEffect, useRef, useState } from "react";
import { fetchMovies, fetchMovieDetail } from "@/api/tmdb";
import { FaPowerOff } from "react-icons/fa";
import "@/styles/components.css";

export default function FeaturedHero() {
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [visible, setVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    async function loadFeatured() {
      try {
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

  if (!visible) {
    return (
      <div className="hero-show-btn-wrapper">
        <button className="hero-show-btn" onClick={() => setVisible(true)}>
          <FaPowerOff />
        </button>
      </div>
    );
  }

  return (
    <section className="featured-hero">
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
      </div>

      {trailerKey && (
        <button className="play-btn" onClick={togglePlay}>
          {isPlaying ? "⏸ 멈춤" : "▶ 재생"}
        </button>
      )}
    </section>
  );
}

