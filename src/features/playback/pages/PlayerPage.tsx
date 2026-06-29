import { useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import VideoPlayer from "@/features/playback/components/VideoPlayer";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";
import { DetailSkeleton } from "@/shared/ui/Skeleton";
import { useMovieDetailQuery } from "@/features/browse/hooks/useBrowseQueries";
import { resolvePlaybackSource } from "@/features/playback/lib/playbackSource";
import type { MovieDetailMediaType } from "@/features/browse/model/catalog";
import "@/styles/common/common.css";

export default function PlayerPage() {
  const params = useParams();
  const id = params.id || undefined;
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const typeFromQuery = searchParams.get("type");
  const mediaType = useMemo<MovieDetailMediaType>(() => {
    const type = params.type || typeFromQuery || (location.pathname.startsWith("/tv/") ? "tv" : "movie");
    return type === "tv" ? "tv" : "movie";
  }, [params.type, typeFromQuery, location.pathname]);

  const seasonNumber = searchParams.get("season") ? parseInt(searchParams.get("season")!, 10) : null;
  const episodeNumber = searchParams.get("episode") ? parseInt(searchParams.get("episode")!, 10) : null;

  const { data: movie, isLoading, isError, error } = useMovieDetailQuery(id, mediaType);

  const playbackSource = useMemo(
    () => (movie ? resolvePlaybackSource(movie) : null),
    [movie]
  );

  const handleClose = () => navigate(-1);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isError && !movie) {
    const message = error instanceof Error ? error.message : "콘텐츠 정보를 불러오는데 실패했습니다.";
    return (
      <ErrorBoundary showDetails={import.meta.env.DEV}>
        <div className="error-boundary">
          <div className="error-content">
            <h1 className="error-title">콘텐츠를 재생할 수 없습니다</h1>
            <p className="error-message">{message}</p>
            <div className="error-actions">
              <button className="error-btn error-btn-primary" onClick={handleClose}>
                돌아가기
              </button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (!movie || !playbackSource) {
    return <DetailSkeleton />;
  }

  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <VideoPlayer
        movie={movie}
        mediaType={mediaType}
        seasonNumber={seasonNumber}
        episodeNumber={episodeNumber}
        playbackSource={playbackSource}
        onClose={handleClose}
      />
    </ErrorBoundary>
  );
}
