# MoviePlay React

TMDB API로 영화/TV 데이터 가져오고, 로그인·DB는 Firebase 씀.

겉은 OTT 비슷하게 만들었는데, 시간 쓴 건 그쪽보다 **프로필 나누기 · 키즈 필터 · 시청 기록 기반 추천** 쪽임.  
Context 쓰다 Zustand로 바꿨고, TypeScript 전환 + vitest + CI도 붙여둠.

---

## 뭐 되냐

- 로그인/회원가입 (Firebase Auth), `PrivateRoute`로 막아둠
- 로그인 후 프로필 고르기 (`WhoPage`) — PIN, 키즈 프로필
- 홈: 이어보기, 오늘의 추천, 맞춤 추천 (프로필 이름·취향 반영)
- TMDB로 영화/TV 조회, 상세, 검색, 재생(트레일러)
- 성인 + 금칙어 + 키즈 장르 **2차 필터** (`tmdb.ts`)
- 찜, 시청 기록, 좋아요/관심없음 → 추천에 반영
- 추천할 때 **왜 이 작품인지** 한 줄 (`generateRecommendationReason`)
- Firestore Config로 홈 메뉴·장르 구성 (navigation, homeGenres)
- 토스 결제 위젯 — UI·success/fail 흐름만 (검증은 서버 필요)
- lazy load + skeleton

---

## 에러 처리 (대충 이렇게 해둠)

- **ErrorBoundary** — 홈 같은 데서 렌더 터지면 앱 전체 안 죽게. fallback에 다시 시도 버튼
- **TMDB API** — `fetchMovies` 실패하면 throw 안 하고 `{ results: [] }` 돌려줌. 콘솔만 찍고 화면은 빈 상태/재시도 (오늘의 추천에 "다시 시도" 버튼 있음)
- **URL 파라미터** — `language`, `include_adult` 중복 붙어서 400 뜨던 거 `URLSearchParams`로 합쳐서 고침
- **Firestore 금칙어** — 로딩 실패하면 fallback 키워드 배열로 계속 필터링
- **Firestore Config** — 설정 못 불러오면 loading만 false로 두고 빈 상태 (스켈레톤 끝남)
- **로그인** — firebase 에러 코드별로 메시지 (비번 틀림, 너무 많은 시도 등)
- **Toast** — 관심없음 누르면 "비슷한 추천에서 제외" 알림

완벽하진 않음. E2E나 Sentry 같은 건 아직 없음.

---

## 쓴 것

react, vite, typescript, react-router, zustand, firebase (auth/firestore), tmdb api, 토스 결제 위젯, vitest, github actions

`@/` import → `vite.config.ts` alias

---

## 실행

```bash
npm install
npm run dev
```

node 18+ 정도면 됨

```bash
npm run typecheck
npm run test        # recommendation, activeProfile
npm run build
```

push/pr 하면 github actions에서 typecheck → test → build 돌아감

---

## env

루트에 `.env` 만들기. **깃에 올리면 안 됨**

```env
VITE_TMDB_API_KEY=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_TOSS_CLIENT_KEY=
```

`firestore.rules` 보고 firebase 콘솔이랑 맞춰서 배포해야 함

---

Seungtae Kim  
https://github.com/stakim876
