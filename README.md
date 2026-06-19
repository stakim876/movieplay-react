# MoviePlay React

MoviePlay는 OTT 클론이 아니라, **가족 프로필·키즈 안전·시청 이력 기반 추천**까지 포함한 시청 경험 프로토타입입니다.  
TMDB/Firebase로 빠르게 검증하고, 상태관리·필터·결제 경계는 **실서비스 기준**으로 설계했습니다.

## 한 줄 소개 (면접용)

> "콘텐츠 라이브러리 경쟁 대신, **누가 / 어떤 기준으로 / 무엇을 볼지**를 설계한 React + Firebase 프로젝트입니다."

## 주요 기능

- 사용자 인증 및 접근 제어 (`PrivateRoute`)
- 프로필 선택 후 홈 개인화 (이어보기, 오늘의 추천, 맞춤 추천)
- 영화/TV 콘텐츠 조회 (`TMDB API`)
- 키즈 모드 및 성인/금칙어 콘텐츠 필터링
- 찜, 시청 기록, 좋아요/관심없음 피드백 → 추천 반영
- **설명 가능한 추천** (`generateRecommendationReason`)
- 구독 및 결제 UI 흐름 (`Toss Payments Widget`)
- Lazy Loading + Skeleton UI

## 아키텍처 & 기술 선택

```
src/
├── pages/        라우트 단위 화면
├── components/   UI 컴포넌트
├── stores/       Zustand 전역 상태 (Context API에서 마이그레이션)
├── services/     TMDB, Firebase, 추천 로직
├── hooks/        사용자 취향 등
└── utils/        프로필, 캐시
```

| 선택 | 이유 |
|------|------|
| **Zustand** | Context API 사용 시 selector 객체 반환으로 인한 리렌더 이슈를 해결. Provider 중첩 제거 |
| **프로필 단위 경험** | 계정(인증)과 시청자(프로필) 분리 — 가족 사용 시 기록·추천·키즈 필터가 섞이지 않음 |
| **다층 콘텐츠 필터** | TMDB `include_adult`만으로 부족 — 금칙어·키즈 장르·언어까지 클라이언트에서 2차 필터 |
| **Config 기반 홈** | Firestore에서 navigation/homeGenres 로드 — 운영 변경 시 코드 수정 최소화 |
| **결제는 프론트 UI만** | Toss Widget으로 UX 흐름 구현, **승인 검증은 서버 필요** (README·코드 주석에 명시) |

## 구현 포인트

### 1) 콘텐츠 필터링

외부 API를 쓰다 보니 성인 콘텐츠나 부적절한 텍스트가 섞여 들어오는 케이스가 있었습니다.  
성인 여부, 금칙어, 키즈 모드 설정을 같이 보는 방식으로 필터를 설계했습니다.

### 2) 설명 가능한 추천

시청·찜·평점 데이터로 장르 선호도를 분석하고, 추천 카드에 **왜 이 작품인지** 한 줄로 표시합니다.  
(`recommendation.ts` — 유닛 테스트 포함)

### 3) 인증 이후 사용자 경험 분리

로그인 → 프로필 선택(`WhoPage`) → 홈에서 `{프로필}님, 오늘 뭐 볼까요?`  
이어보기·오늘의 추천·맞춤 추천이 활성 프로필 기준으로 동작합니다.

### 4) 결제 흐름 (프론트 기준)

`Toss Payments Widget`으로 success/fail URL 흐름을 구현했습니다.  
실운영 시 결제 승인 검증과 시크릿 키는 **반드시 서버**에서 처리해야 합니다.

## 기술 스택

- Frontend: React (Vite), React Router, TypeScript
- State Management: Zustand
- Backend (BaaS): Firebase (Auth, Firestore)
- API: TMDB API
- Payment: Toss Payments Widget
- Test: Vitest
- CI: GitHub Actions (typecheck → test → build)

## 품질 관리

```bash
npm run typecheck   # TypeScript 검사
npm run test        # Vitest (추천 로직, 프로필 유틸)
npm run build       # 프로덕션 빌드
```

GitHub Actions에서 push/PR 시 위 명령을 자동 실행합니다.

## 실행 방법

```bash
npm install
npm run dev
```

Node.js 18 이상 권장

### 환경 변수

`.env` 파일을 프로젝트 루트에 생성하세요. (Git에 업로드하지 마세요)

```
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

## Author

Seungtae Kim  
[https://github.com/stakim876](https://github.com/stakim876)
