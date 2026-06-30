import { PORTFOLIO_SCOPE } from "@/shared/constants/portfolioScope";
import "@/styles/components/playback-notice.css";

/**
 * 홈 상단 — 채용 리뷰어가 Live Demo에서 차별점을 바로 볼 수 있도록 노출
 * (로컬 개발 시에는 상세 문제 정의까지 추가 표시)
 */
export default function ProjectCharter() {
  const isDev = import.meta.env.DEV;

  return (
    <aside
      className={`project-charter${isDev ? "" : " project-charter--compact"}`}
      aria-label="프로젝트 안내"
    >
      <p className="project-charter-kicker">Frontend engineering case study</p>
      <p className="project-charter-title">{PORTFOLIO_SCOPE.headline}</p>

      <ul className="project-charter-chips" aria-label="차별 포인트">
        {PORTFOLIO_SCOPE.highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      {isDev && (
        <>
          <ul className="project-charter-list">
            {PORTFOLIO_SCOPE.problems.slice(0, 2).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="project-charter-foot">
            본편 스트리밍 없음 · 공식 예고편 + 플레이어 UI로 클라이언트 역량 검증
          </p>
        </>
      )}
    </aside>
  );
}
