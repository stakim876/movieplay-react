import { pickTrailerKey } from "@/shared/lib/trailer";
import { PORTFOLIO_SCOPE, PLAYBACK_LABELS } from "@/shared/constants/portfolioScope";

const DEMO_SAMPLE_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export type PlaybackSource =
  | {
      mode: "youtube-trailer";
      youtubeId: string;
      label: string;
      description: string;
    }
  | {
      mode: "demo-sample";
      url: string;
      label: string;
      description: string;
    };

export function resolvePlaybackSource(detail: {
  videos?: { results?: Array<{ type: string; site: string; key: string; iso_639_1?: string }> };
}): PlaybackSource {
  const trailerKey = pickTrailerKey(detail);

  if (trailerKey) {
    return {
      mode: "youtube-trailer",
      youtubeId: trailerKey,
      label: PLAYBACK_LABELS.trailer,
      description: PORTFOLIO_SCOPE.content.playback,
    };
  }

  return {
    mode: "demo-sample",
    url: DEMO_SAMPLE_URL,
    label: PLAYBACK_LABELS.demo,
    description: `${PORTFOLIO_SCOPE.content.excluded} — 플레이어 UI 시연용 샘플 영상`,
  };
}
