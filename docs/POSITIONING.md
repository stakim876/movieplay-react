# 포지셔닝: 클론 코딩 vs 채용에서 보는 것

> "넷플릭스 따라 만들었나요?" — 면접관도, 채용 담당자도 이렇게 묻습니다.  
> **답은 UI가 아니라, 왜 이렇게 만들었는지**로 해야 합니다.

---

## 솔직한 진단: 지금도 클론처럼 보일 수 있는 이유

| 신호 | 왜 그렇게 느껴지는가 |
|------|---------------------|
| 가로 스크롤 행 + 히어로 배너 | OTT 업계 **공통 IA** (Netflix가 독점한 패턴 아님) |
| 흰색 재생 버튼 | 스트리밍 앱 **접근성·대비 표준** |
| Top N 랭킹 | Netflix 브랜딩과 강하게 연상됨 |
| "재생" 문구 | 본편 스트리밍 서비스처럼 오해 |
| README에 Netflix 언급 | 오히려 "클론 부정"이 클론 연상을 강화 |

**결론:** 레이아웃만으로 클론 여부가 결정되지는 않습니다.  
다만 **설명·카피·차별 기능**이 약하면 무난한 TMDB OTT 클론으로 분류됩니다.

---

## 2024–2026 기업(특히 프론트)이 포트폴리오에서 보는 것

클론 완성도 순이 **아닙니다.**

| 우선순위 | 보는 것 | MoviePlay에서의 근거 |
|:---:|---------|---------------------|
| 1 | **문제를 정의했는가** | 가족 프로필·키즈·추천 사유·예고편만 재생 |
| 2 | **범위 판단** | 본편 제외, `portfolioScope.ts`·로그인 안내 |
| 3 | **상태·데이터 설계** | React Query / Zustand / queryKeys |
| 4 | **코드 구조** | Feature-Sliced, feature barrel |
| 5 | **테스트·CI** | Vitest + Playwright + GitHub Actions |
| 6 | **Live Demo** | ⚠️ 배포 필요 |
| 7 | UI 픽셀 퍼펙트 | 주니어에게 거의 안 봄 |

**안 보는 것:** DRM, ML 추천, 자체 CDN, 라이선스 본편

---

## 이 프로젝트의 정체성 (이렇게 소개할 것)

### ❌ 피할 말

- "넷플릭스 클론 만들었습니다"
- "OTT 앱 따라했습니다"
- "디즈니플러스처럼 꾸몄습니다"

### ✅ 쓸 말

- **"가족 프로필 기반 영화 탐색 클라이언트"**
- **"browse → detail → player 제품 흐름을 TypeScript로 설계한 프론트엔드 사례"**
- **"저작권 범위 안에서 예고편 재생 + 추천·키즈·시청기록까지 연결"**

한 줄:

> TMDB로 메타데이터만 쓰는 한계를 인정하고, **실무 클라이언트가 맡는 영역**(상태, 라우팅, 프로필, 필터, 추천 UX, 플레이어)에 집중했습니다.

---

## 클론과 차별되는 구현 (면접에서 코드로 보여줄 것)

| 차별점 | 파일 |
|--------|------|
| 프로필별 시청·추천 분리 | `shared/lib/activeProfile.ts`, Who 페이지 |
| 키즈 이중 필터 | `core/api/firestore/adultFilter.ts`, `kidsFilter` |
| 추천 **이유** 노출 | `features/engagement/services/recommendation.ts` |
| 재생 소스 **정책** 분리 | `features/playback/lib/playbackSource.ts` + 테스트 |
| 포트폴리오 범위 **코드화** | `shared/constants/portfolioScope.ts` |

---

## 아직 클론 느낌을 주는 요소 → 대응

| 요소 | 대응 |
|------|------|
| "재생" 버튼 | ✅ **"예고편 보기"** (browse CTA) |
| "오늘의 TOP 10" | ✅ **"지금 뜨는 작품"** |
| Netflix/README 언급 | ✅ README·POSITIONING 분리 |
| 구독 "14일 무료 체험" 카피 | ✅ **결제 UI 데모** 포지셔닝 |
| 검색 "인기 검색어" | ✅ **Discover** + 추천 키워드 |
| 레거시 `src/pages` 중복 | ✅ `cleanup-legacy.mjs` 정리 |
| 차별 기능이 눈에 안 띔 | ✅ 홈 ProjectCharter 배너 |
| Live Demo 없음 | ⚠️ [`DEPLOY.md`](./DEPLOY.md) 따라 Vercel 배포 |

---

## 실무로 가면 (면접에서 +α)

- TMDB 키 → BFF/Edge 프록시
- 키즈 필터 → 서버 사이드 정책
- 추천 → 휴리스틱 → 이벤트 로그 + 배치 (팀 인프라)
- 결제 → 서버 webhook 검증

이걸 알고 범위를 나눈 것 자체가 **시니어가 보는 신호**입니다.

---

관련 문서: [ENGINEERING.md](./ENGINEERING.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [INTERVIEW.md](./INTERVIEW.md)
