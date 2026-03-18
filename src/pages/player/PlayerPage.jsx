import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchMovieDetail } from "@/services/tmdb";
import VideoPlayer from "@/components/player/VideoPlayer";
import { useToast } from "@/context/ToastContext";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { DetailSkeleton } from "@/components/common/Skeleton";
import "@/styles/common/common.css";

export default function PlayerPage() {
  const params = useParams();
  const id = params.id || null;
  const location = useLocation();
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const typeFromQuery = searchParams.get("type");
  const mediaType = (params.type || typeFromQuery || (location.pathname.startsWith("/tv/") ? "tv" : "movie")) === "tv"
    ? "tv"
    : "movie";
  
  const seasonNumber = searchParams.get("season") ? parseInt(searchParams.get("season"), 10) : null;
  const episodeNumber = searchParams.get("episode") ? parseInt(searchParams.get("episode"), 10) : null;

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) throw new Error("재생할 콘텐츠가 없습니다.");
        const data = await fetchMovieDetail(id, mediaType);
        
        const blockKeywords = [
          "porn", "pornographic", "xvideo", "xhamster", "zwinger", "fetish", "hardcore",
          "nude", "erotic", "explicit sex", "adult video", "pornstar",
          "야동", "에로", "성인", "음란", "포르노", "19금", "노골적",
        ];
        const text = `${data.title || data.name || ""} ${data.overview || ""}`.toLowerCase();
        
        if (data.adult || blockKeywords.some((kw) => text.includes(kw))) {
          setError("해당 콘텐츠는 이용할 수 없습니다.");
          setMovie(null);
          return;
        }

        setMovie(data);
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

  const handleClose = () => {
    navigate(-1);
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error && !movie) {
    return (
      <ErrorBoundary showDetails={import.meta.env.DEV}>
        <div className="error-boundary">
          <div className="error-content">
            <h1 className="error-title">콘텐츠를 재생할 수 없습니다</h1>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <button
                className="error-btn error-btn-primary"
                onClick={handleClose}
              >
                돌아가기
              </button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (!movie) {
    return <DetailSkeleton />;
  }

  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <VideoPlayer
        movie={movie}
        mediaType={mediaType}
        seasonNumber={seasonNumber}
        episodeNumber={episodeNumber}
        onClose={handleClose}
      />
    </ErrorBoundary>
  );
}
