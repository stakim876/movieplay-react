# MoviePlay — 면접 준비

> 면접 전에 **소리 내서** 연습하세요. README와 달리 여기는 말로 풀어낼 내용입니다.

---

## 한 줄 소개

> Netflix처럼 콘텐츠 라이브러리를 만든 게 아니라, **가족 프로필·키즈 안전·시청 이력 기반 추천**까지 포함한 시청 경험을 React + Firebase로 end-to-end 구현한 프로젝트입니다.

---

## 자주 나올 질문

### Q. 왜 OTT UI 형태로 만들었나요?

> TMDB API로 실제 스트리밍 라이선스 없이도 **사용자 흐름 전체**를 검증할 수 있어서입니다.  
> 로그인, 프로필 분리, 필터링, 추천, 결제 UI까지 — 실서비스에서 중요한 **프론트엔드 설계 문제**를 같은 맥락에서 다루려고 했습니다.

### Q. 혼자서 뭘 했나요?

> 기획·설계·프론트 전부 1인 개발입니다.  
> Firebase Auth/Firestore 연동, TMDB API + 캐시, 추천 로직, Zustand 상태관리, TypeScript 전환, Vitest 테스트, CI까지 포함합니다.

### Q. 다른 OTT 클론과 뭐가 다른가요?

| 일반적인 클론 | 이 프로젝트 |
|---|---|
| TMDB 목록 + 카드 UI | 프로필 단위 시청 경험 분리 |
| `include_adult=false` 한 줄 | 성인 + 금칙어 + 키즈 장르 **다층 필터** |
| 인기순 row 나열 | 시청·찜·피드백 기반 추천 + **추천 이유 표시** |
| 결제 붙이기 | 프론트 UI만 — **서버 검증 필요** 경계 명시 |

### Q. 추천은 어떻게 동작하나요?

> `recommendation.ts`에서 시청 기록·찜·평점으로 장르 선호도를 만들고, 영화마다 점수를 매깁니다.  
> 상위 N개를 추천하고, `generateRecommendationReason`으로 "당신이 좋아하는 ○○ 장르" 같은 **이유 한 줄**을 카드에 붙입니다.  
> 관심없음을 누르면 이후 추천에서 제외됩니다. Vitest로 테스트해 두었습니다.

### Q. 키즈 모드는 어떻게 처리했나요?

> `WhoPage`에서 프로필 선택 시 kids 플래그를 저장하고, `tmdb.ts`의 `isSafeMovie`에서 키즈 프로필이면 금지 장르·키워드를 추가 검사합니다.  
> TMDB API 필터만으로는 부족해서 **클라이언트 2차 필터**를 넣었고, 키즈 프로필일 때 홈에 안내 문구를 띄웁니다.  
> 완벽한 차단은 서버 검증이 필요하다는 한계는 알고 있습니다.

### Q. 결제는 어디까지 구현했나요?

> Toss Payments Widget으로 결제 UI, success/fail URL 분기, 구독 상태 반영 **화면 흐름**까지 구현했습니다.  
> 승인 검증과 시크릿 키는 프론트에 두면 안 되므로 **서버에서 처리해야 한다**고 명시했습니다.

### Q. 테스트는 뭘 했나요?

> Vitest로 `recommendation.ts`(점수·이유·장르 필터)와 `activeProfile.ts`(프로필 키·키즈 판별)를 테스트합니다.  
> GitHub Actions에서 push/PR마다 `typecheck → test → build`를 돌립니다.  
> E2E는 아직 없고, **핵심 비즈니스 로직**부터 테스트했습니다.

### Q. 아쉬운 점 / 개선한다면?

- 결제 승인 검증 → 서버(API Route 또는 Cloud Functions)로 이전
- 콘텐츠 필터 → 클라이언트만으론 우회 가능, 서버 2차 검증 필요
- 추천 → 현재 장르·평점 휴리스틱, 협업 필터링 등으로 고도화 가능
- E2E 테스트(Playwright)로 로그인→홈→상세 플로우 추가

### Q. 이 프로젝트로 뭘 보여주고 싶나요?

> React + TypeScript로 **사용자 흐름을 끝까지** 만들 수 있다는 것,  
> 외부 API·BaaS 연동에서 **실제로 터지는 문제**를 직접 고친 경험,  
> "기능 많이 붙이기"보다 **필터·프로필·추천처럼 제품 판단이 필요한 부분**에 시간을 썼다는 것입니다.

---

## 기술 이슈 — STAR 형식

면접관이 "어려웠던 점"을 물을 때 이렇게 답하세요.

### 1) Context API → Zustand 마이그레이션

- **Situation:** Zustand selector가 매 렌더마다 새 객체를 반환 → ErrorBoundary까지 터지는 무한 리렌더
- **Task:** Context 10개 중첩 제거 + 안정적인 전역 상태 필요
- **Action:** `useShallow` 적용, 스토어를 관심사별 분리(auth, watchHistory, config …)
- **Result:** Provider 제거, 로그인·홈·추천 흐름 안정화

### 2) TMDB API 400 에러

- **Situation:** 홈 진입 시 `fetchMovies` 400 — 콘솔 에러 60개+
- **Task:** TMDB 호출 정상화
- **Action:** endpoint에 이미 있는 `language`, `include_adult` 중복 붙이던 로직 → `URLSearchParams`로 병합
- **Result:** 모든 목록 API 200, 캐시·필터 정상 동작

### 3) 로그인 후 홈 진입 실패

- **Situation:** Firebase login 성공 직후 PrivateRoute에서 튕김
- **Task:** 인증 → 프로필 선택 → 홈 흐름 연결
- **Action:** login/signup 후 `user` 동기 설정, PrivateRoute에서 `loading === false`까지 대기
- **Result:** 로그인 직후 `/who` → `/home` 정상 이동

---

## 30초 버전 (프로젝트 소개)

> MoviePlay는 TMDB와 Firebase로 만든 영화 탐색 앱입니다.  
> OTT 클론이 아니라 **가족 프로필, 키즈 필터, 시청 이력 기반 추천**에 집중했습니다.  
> Context에서 Zustand로 마이그레이션하고, 추천 로직은 Vitest로 테스트했으며, CI도 GitHub Actions로 돌립니다.

## 2분 버전 (깊게)

1. **문제:** TMDB API만 쓰면 성인/부적절 콘텐츠가 섞이고, 가족이 쓰면 기록·추천이 섞임
2. **해결:** 프로필 분리 + 다층 필터 + 프로필별 추천 + 추천 이유 UI
3. **기술:** React TS, Zustand, Firebase, Vitest, CI
4. **한계:** 결제 검증·콘텐츠 필터 완전 차단은 서버 필요 — 알고 있음
