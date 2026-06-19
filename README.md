# MoviePlay React

TMDB + Firebase로 만든 영화/TV 탐색 웹앱입니다.  
로그인 → 프로필 선택 → 홈에서 추천·이어보기·탐색까지 이어지는 **시청 경험**을 구현했습니다.

**포커스:** 가족 프로필 · 키즈 안전 필터 · 시청 이력 기반 추천 · 설명 가능한 추천 이유

## Quick Start

```bash
npm install
npm run dev
```

Node.js 18+

## Scripts

```bash
npm run dev         # 개발 서버
npm run typecheck   # TypeScript 검사
npm run test        # Vitest
npm run build       # 프로덕션 빌드
```

## Tech Stack

React · TypeScript · Vite · React Router · Zustand · Firebase (Auth, Firestore) · TMDB API · Toss Payments Widget · Vitest · GitHub Actions

## Environment

프로젝트 루트에 `.env` 파일 생성 (Git에 커밋하지 않음)

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

Firestore 보안 규칙: `firestore.rules` 참고

## Interview Prep

면접에서 말할 내용(Q&A, 기술 이슈, 차별점)은 **[docs/INTERVIEW.md](./docs/INTERVIEW.md)** 에 정리해 두었습니다.

## Author

Seungtae Kim · [GitHub](https://github.com/stakim876)
