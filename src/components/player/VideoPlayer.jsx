import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useWatchHistory } from "@/context/WatchHistoryContext";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaBackward, FaForward } from "react-icons/fa";
import "@/styles/components/player.css";

export default function VideoPlayer({ 
  movie, 
  mediaType = "movie", 
  seasonNumber = null, 
  episodeNumber = null,
  onClose,
  videoUrl = null 
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  
  const navigate = useNavigate();
  const { updateWatchProgress, getWatchProgress } = useWatchHistory();
  
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    if (!movie) return;
    
    const savedProgress = getWatchProgress(
      movie.id,
      mediaType,
      seasonNumber,
      episodeNumber
    );
    
    if (savedProgress && savedProgress.progress > 0 && videoRef.current) {
      videoRef.current.currentTime = savedProgress.progress;
    }
  }, [movie, mediaType, seasonNumber, episodeNumber, getWatchProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      if (video.currentTime % 5 < 0.5 && movie) {
        updateWatchProgress(
          movie.id,
          video.currentTime,
          video.duration,
          mediaType,
          seasonNumber,
          episodeNumber
        );
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (movie) {
        updateWatchProgress(
          movie.id,
          duration,
          duration,
          mediaType,
          seasonNumber,
          episodeNumber
        );
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [movie, mediaType, seasonNumber, episodeNumber, duration, updateWatchProgress]);

  useEffect(() => {
    if (!showControls) return;

    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    resetControlsTimeout();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }, [isPlaying]);

  const handleProgressClick = (e) => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * duration;
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    video.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const skip = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const changePlaybackRate = (rate) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          const newVolume = Math.min(1, volume + 0.1);
          handleVolumeChange({ target: { value: newVolume } });
          break;
        case "ArrowDown":
          e.preventDefault();
          const lowerVolume = Math.max(0, volume - 0.1);
          handleVolumeChange({ target: { value: lowerVolume } });
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;
        case "Escape":
          if (isFullscreen) {
            toggleFullscreen();
          } else if (onClose) {
            onClose();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, volume, isFullscreen, onClose]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const defaultVideoUrl = videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  if (!movie) {
    return (
      <div className="video-player-container">
        <div className="video-player-error">
          <p>콘텐츠 정보를 불러올 수 없습니다.</p>
          {onClose && (
            <button onClick={onClose} className="player-close-btn">
              닫기
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="video-player-container"
      ref={containerRef}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => {
        if (isPlaying) {
          setTimeout(() => setShowControls(false), 2000);
        }
      }}
    >
      {isLoading && (
        <div className="video-player-loading">
          <div className="player-spinner"></div>
          <p>로딩 중...</p>
        </div>
      )}

      <video
        ref={videoRef}
        src={defaultVideoUrl}
        className="video-player"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {showControls && (
        <div className="video-player-controls">
          <div className="player-controls-top">
            {onClose && (
              <button
                className="player-close-btn"
                onClick={onClose}
                aria-label="닫기"
              >
                ✕
              </button>
            )}
            <div className="player-title">
              <h3>{movie.title || movie.name}</h3>
              {mediaType === "tv" && seasonNumber !== null && episodeNumber !== null && (
                <span className="player-episode">
                  시즌 {seasonNumber} · 에피소드 {episodeNumber}
                </span>
              )}
            </div>
          </div>

          <div className="player-controls-center">
            <button
              className="player-play-btn-large"
              onClick={togglePlay}
              aria-label={isPlaying ? "일시정지" : "재생"}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
          </div>

          <div className="player-controls-bottom">
            <div
              className="player-progress-container"
              ref={progressBarRef}
              onClick={handleProgressClick}
            >
              <div className="player-progress-bar">
                <div
                  className="player-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
                <div
                  className="player-progress-handle"
                  style={{ left: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="player-controls-row">
              <div className="player-controls-left">
                <button
                  className="player-control-btn"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "일시정지" : "재생"}
                >
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>

                <button
                  className="player-control-btn"
                  onClick={() => skip(-10)}
                  aria-label="10초 뒤로"
                >
                  <FaBackward />
                </button>

                <button
                  className="player-control-btn"
                  onClick={() => skip(10)}
                  aria-label="10초 앞으로"
                >
                  <FaForward />
                </button>

                <div className="player-volume-control">
                  <button
                    className="player-control-btn"
                    onClick={toggleMute}
                    aria-label={isMuted ? "음소거 해제" : "음소거"}
                  >
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="player-volume-slider"
                  />
                </div>

                <div className="player-time">
                  <span>{formatTime(currentTime)}</span>
                  <span> / </span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="player-controls-right">
                <div className="player-settings">
                  <button
                    className="player-control-btn"
                    onClick={() => setShowSettings(!showSettings)}
                    aria-label="설정"
                  >
                    ⚙️
                  </button>
                  {showSettings && (
                    <div className="player-settings-menu">
                      <div className="settings-section">
                        <span className="settings-label">재생 속도</span>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                          <button
                            key={rate}
                            className={`settings-option ${playbackRate === rate ? "active" : ""}`}
                            onClick={() => changePlaybackRate(rate)}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className="player-control-btn"
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? "전체화면 해제" : "전체화면"}
                >
                  {isFullscreen ? <FaCompress /> : <FaExpand />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
