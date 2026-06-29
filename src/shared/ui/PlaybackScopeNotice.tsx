import "@/styles/components/playback-notice.css";

type PlaybackScopeNoticeProps = {
  label: string;
  description: string;
  compact?: boolean;
};

export default function PlaybackScopeNotice({
  label,
  description,
  compact = false,
}: PlaybackScopeNoticeProps) {
  return (
    <div className={`playback-scope-notice${compact ? " compact" : ""}`} role="note">
      <span className="playback-scope-badge">{label}</span>
      <p className="playback-scope-text">{description}</p>
    </div>
  );
}
