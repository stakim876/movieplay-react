import { PORTFOLIO_SCOPE } from "@/shared/constants/portfolioScope";
import "@/styles/components/playback-notice.css";

/**
 * 홈 상단 — 로컬 개발 시에만 포트폴리오 맥락 노출 (배포 데모는 OTT UI 유지)
 */
export default function ProjectCharter() {
  if (!import.meta.env.DEV) return null;

  return (
    <aside className="project-charter" aria-label="프로젝트 안내">
      <p className="project-charter-kicker">Frontend case study</p>
      <p className="project-charter-title">{PORTFOLIO_SCOPE.headline}</p>
      <ul className="project-charter-list">
        {PORTFOLIO_SCOPE.problems.slice(0, 2).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="project-charter-foot">
        본편 스트리밍 없음 · 공식 예고편 + 플레이어 UI로 클라이언트 역량 검증
      </p>
    </aside>
  );
}
