/**
 * 프로젝트 포지셔닝 — "넷플릭스 클론"이 아닌 "클라이언트 엔지니어링 사례"
 *
 * UI 패턴(가로 스크롤·히어로)은 OTT 업계 공통 언어이지만,
 * 이 프로젝트의 평가 축은 화면 유사도가 아니라 문제 정의·상태 설계·테스트·범위 판단이다.
 */
export const PORTFOLIO_SCOPE = {
  name: "MoviePlay",
  /** 이력서·README 첫 줄에 쓸 포지션 */
  headline: "가족 프로필 기반 영화 탐색 클라이언트 (프론트엔드 엔지니어링 사례)",
  tagline: "TMDB 메타데이터 + 공식 예고편 · 멀티 프로필 · 키즈 필터 · 추천 사유",
  /** 해결한 제품 문제 — 클론 기능 나열이 아님 */
  problems: [
    "가족이 한 계정을 쓸 때 시청 기록·추천이 섞이는 문제 → 프로필별 분리",
    "키즈 프로필에서 성인 콘텐츠 노출 위험 → TMDB + 클라이언트 이중 필터",
    "추천이 블랙박스처럼 느껴지는 문제 → 장르·시청 패턴 기반 추천 사유 노출",
    "저작권 없이 재생 UX를 검증하는 문제 → 예고편 우선 playbackSource 설계",
  ] as const,
  content: {
    metadata: "TMDB API — 포스터, 줄거리, 출연, 장르",
    playback: "공식 YouTube 예고편 우선 · 없으면 저작권-free 샘플 영상",
    excluded: "본편 라이선스 스트리밍, DRM, CDN, 자체 인코딩",
  },
  /** 채용 리뷰어가 Live Demo에서 바로 볼 차별 포인트 */
  highlights: [
    "멀티 프로필",
    "키즈 필터",
    "추천 사유",
    "예고편 재생",
  ] as const,
  /** 신입 포트폴리오에서 기업이 우선 확인하는 역량 (README·홈 배너와 동기화) */
  hiringFocus: [
    "문제 정의",
    "범위 판단",
    "상태 설계",
    "코드 구조",
    "테스트·CI",
  ] as const,
  /** 채용에서 검증하려는 엔지니어링 역량 (코드·문서용) */
  validates: [
    "도메인 경계 (browse / playback / engagement 분리)",
    "서버·클라이언트 상태 분리 (React Query + Zustand)",
    "순수 로직 테스트 (playbackSource, recommendation)",
    "CI·E2E smoke·문서화된 트레이드오프",
  ] as const,
  /** 사용자-facing CTA — '재생' 대신 범위를 드러냄 */
  cta: {
    watchTrailer: "예고편 보기",
    watchDemo: "데모 영상 보기",
  },
  /** 구독·검색 — OTT 클론 카피 대신 포트폴리오 범위 노출 */
  subscription: {
    kicker: "Portfolio · 결제 UI",
    title: "플랜 비교 & 결제 흐름",
    subtitle:
      "토스페이먼츠 위젯 연동과 구독 상태 UI를 검증합니다. 서버 승인·webhook 검증은 실무 범위로 남겨두었습니다.",
    ctaPopular: "결제 UI 체험",
    ctaDefault: "플랜 살펴보기",
    demoBadge: "결제 데모",
  },
  search: {
    placeholder: "작품 제목, 배우, 감독 검색",
    emptyHint: "장르·연도 필터로 취향에 맞는 작품을 찾아보세요",
    discoveryTitle: "무엇을 찾고 계세요?",
  },
} as const;

export const PLAYBACK_LABELS = {
  trailer: "공식 예고편",
  demo: "데모 영상",
} as const;
