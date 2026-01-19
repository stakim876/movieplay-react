import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaExclamationTriangle, FaRedo, FaHome, FaPlay } from "react-icons/fa";
import LikeButton from "@/components/common/LikeButton";
import TMDBImage from "@/components/common/TMDBImage";
import { DetailSkeleton } from "@/components/common/Skeleton";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { useToast } from "@/context/ToastContext";
import { fetchMovieDetail } from "@/services/tmdb";
import SeasonList from "@/components/tv/SeasonList";
import "../../styles/common/common.css";
import CommentsSection from "@/components/common/CommentsSection";

export default function MovieDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const mediaType = useMemo(() => {
    return location.pathname.startsWith("/tv/") ? "tv" : "movie";
  }, [location.pathname]);

  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [recommend, setRecommend] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMovieDetail(id, mediaType);

        const blockKeywords = [
          "porn","pornographic","xvideo","xhamster","zwinger","fetish","hardcore",
          "nude","erotic","explicit sex","adult video","pornstar",
          "야동","에로","성인","음란","포르노","19금","노골적",
        ];
        const text = `${data.title || data.name || ""} ${data.overview || ""}`.toLowerCase();
        if (data.adult || blockKeywords.some((kw) => text.includes(kw))) {
          setMovie(null);
          setError("해당 콘텐츠는 이용할 수 없습니다.");
          return;
        }

        setMovie(data);

        const trailerData = data.videos?.results?.find(
          (v) =>
            ["Trailer", "Teaser", "Clip"].includes(v.type) &&
            v.site === "YouTube"
        );
        setTrailer(trailerData?.key || null);

        const castData =
          data.credits?.cast
            ?.filter((c) => c.name && c.character)
            ?.slice(0, 12) || [];
        setCast(castData);

        if (mediaType === "tv" && data.seasons) {
          const validSeasons = data.seasons.filter(
            (s) => s.season_number >= 0 && s.episode_count > 0
          );
          setSeasons(validSeasons);
        }

        const filteredRecommend = (data.recommendations?.results || []).filter(
          (item) => {
            const t = `${item.title || item.name || ""} ${
              item.overview || ""
            }`.toLowerCase();
            return !item.adult && !blockKeywords.some((kw) => t.includes(kw));
          }
        );
        setRecommend(filteredRecommend);

        const filteredSimilar = (data.similar?.results || []).filter((item) => {
          const t = `${item.title || item.name || ""} ${
            item.overview || ""
          }`.toLowerCase();
          return !item.adult && !blockKeywords.some((kw) => t.includes(kw));
        });
        setSimilar(filteredSimilar);
      } catch (err) {
        console.error("콘텐츠 상세 불러오기 실패:", err);
        setError(err.message || "콘텐츠 정보를 불러오는데 실패했습니다.");
        showError(err.message || "콘텐츠 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, mediaType, showError]);

  const handleEpisodeSelect = (episode) => {
    if (movie && episode) {
      navigate(`/play/tv/${movie.id}?season=${episode.season_number}&episode=${episode.episode_number}`);
    }
  };

  if (loading) return <DetailSkeleton />;
  
  if (error && !movie) {
    return (
      <ErrorBoundary showDetails={import.meta.env.DEV}>
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">
              <FaExclamationTriangle />
            </div>
            <h1 className="error-title">영화 정보를 불러올 수 없습니다</h1>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <button
                className="error-btn error-btn-primary"
                onClick={() => window.location.reload()}
              >
                <FaRedo /> 다시 시도
              </button>
              <button
                className="error-btn error-btn-secondary"
                onClick={() => navigate("/home")}
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

  const fallbackPoster =
    "https://via.placeholder.com/300x450.png?text=No+Image";
  const fallbackRec = "https://placehold.co/140x210?text=No+Image";

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
          <h1>{movie.title || movie.name}</h1>
          <div className="detail-actions">
            <button
              className="detail-play-btn"
              onClick={() => navigate(`/play/${mediaType}/${movie.id}`)}
            >
              <FaPlay /> 재생
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
            {movie.genres?.map((g) => g.name).join(", ") || "정보 없음"}
          </p>
        </div>
      </div>

      {cast.length > 0 && (
        <div className="detail-cast">
          <h2>출연진</h2>
          <div className="cast-list">
            {cast.map((c) => (
              <div key={c.cast_id || c.credit_id} className="cast-card">
                <TMDBImage
                  path={c.profile_path}
                  alt={c.name}
                  size="w200"
                />
                <p className="actor-name">{c.name}</p>
                <p className="character">{c.character}</p>
              </div>
            ))}
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
              src={`https://www.youtube.com/embed/${trailer}?autoplay=1&mute=1&controls=1`}
              title="Trailer"
              frameBorder="0"
              allow="autoplay; encrypted-media"
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
            {recommend.map((r) => (
              <div
                key={r.id}
                className="recommend-card"
                onClick={() => navigate(`/${r.media_type || mediaType}/${r.id}`)}   
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
            ))}
          </div>
        </div>
      )}

      {similar.length > 0 && (
        <div className="detail-similar">
          <h2>이 영화와 비슷한 콘텐츠</h2>
          <div className="similar-list">
            {similar.map((s) => (
              <div
                key={s.id}
                className="similar-card"
                onClick={() => navigate(`/${s.media_type || mediaType}/${s.id}`)}   
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
            ))}
          </div>
        </div>
      )}

      {movie?.id && <CommentsSection movieId={String(movie.id)} />}
      </div>
    </div>
  );
}

