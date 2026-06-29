# Engineering Notes

> 채용 담당자·시니어 엔지니어가 코드 리뷰 전에 읽는 기술 메모입니다.

## 이 프로젝트가 검증하는 역량

| 역량 | 구현 근거 |
|------|-----------|
| **제품 사고** | 본편 스트리밍 대신 TMDB+예고편으로 범위를 명시 (`portfolioScope.ts`) |
| **도메인 설계** | browse / playback / engagement / auth 분리, feature barrel export |
| **서버 상태** | React Query — 캐시·중복 요청 제거·로딩/에러 일관 처리 |
| **클라이언트 상태** | Zustand — auth, watchlist, theme 등 UI·세션 |
| **테스트** | 순수 함수 단위 테스트 (playback, recommendation, contentPath) |
| **배포·CI** | GitHub Actions — typecheck → unit → build → E2E smoke |
| **접근성** | skip link, 시맨틱 랜드마크, 키보드 포커스 링 |

## 상태 관리 기준

```
서버에서 오는 데이터 (TMDB, Firestore 읽기)  →  React Query
사용자 세션·UI·로컬 선호 (auth, theme, toast)  →  Zustand
한 컴포넌트 안에서만 쓰는 UI 상태              →  useState
```

**왜 Zustand + React Query인가**

- Redux 대비 보일러플레이트가 적고, 포트폴리오 규모에 맞음
- React Query 없이 `useEffect` fetch를 쓰면 페이지마다 로딩/에러/캐시가 분산됨
- `queryKeys.ts`로 키를 중앙 관리해 invalidate·prefetch 확장이 쉬움

## Feature 경계

| Feature | 들어가면 안 되는 것 |
|---------|-------------------|
| `browse` | YouTube iframe 재생 로직 |
| `playback` | TMDB 목록 fetch |
| `engagement` | React 컴포넌트 (순수 추천 로직만) |
| `shared` | TMDB API 직접 호출 |

재생 소스 결정은 `playback/lib/playbackSource.ts`에 **순수 함수**로 분리해 단위 테스트 가능하게 했습니다.

## 라우팅·성능

- `React.lazy` + `Suspense` — 라우트 단위 코드 스플리팅
- Vite `manualChunks` — vendor / react-query / firebase 분리
- TMDB 이미지 — `TMDBImage`로 lazy loading·placeholder

## 에러 처리

- 루트 `ErrorBoundary` — 예기치 않은 렌더 오류
- React Query `isError` — 데이터 fetch 실패 시 재시도 UI
- Firebase 미설정 — 로그인 화면에서 명시적 안내

## 보안·운영 (현실적 한계)

| 항목 | 현재 | 실무에서 |
|------|------|----------|
| TMDB API 키 | 클라이언트 `.env` | BFF/Edge proxy로 이전 |
| 결제 승인 | 클라이언트 위젯 데모 | 서버 webhook 검증 필수 |
| Firestore | `firestore.rules` | 프로덕션 규칙 감사 |

포트폴리오 규모에서는 **클라이언트 아키텍처**에 집중했고, 키 노출은 README·문서에 명시했습니다.

## 디자인 시스템

- `styles/themes/tokens.css` — Cinema Noir 팔레트 (Disney+/Netflix 클론 회피)
- `styles/themes/buttons.css` — OTT 표준 버튼 (Primary 흰색 재생, Secondary 글래스)
- 다크/라이트 `data-theme` 토글

## 테스트 전략

| 레이어 | 도구 | 범위 |
|--------|------|------|
| Unit | Vitest | playbackSource, recommendation, activeProfile, contentPath |
| E2E smoke | Playwright | 로그인·회원가입·비인증 리다이렉트 |
| E2E browse | Playwright | 로그인 → 홈 → 상세 (선택, 테스트 계정 필요) |
| CI | GitHub Actions | PR마다 quality + e2e job |

## 실무 확장 로드맵

1. BFF로 TMDB 프록시 + API 키 서버 보관
2. PersonalizedSection·WatchAgain React Query 마이그레이션
3. GitHub Secrets로 인증 E2E CI 상시 실행
4. Vercel Live Demo + README URL 고정
5. Storybook으로 shared UI 카탈로그

## 면접에서 한 줄로

> "본편 라이선스는 범위 밖이고, browse → detail → player 제품 흐름과 서버/클라이언트 상태 분리, 테스트·CI까지 실무 클라이언트 기준으로 설계했습니다."
