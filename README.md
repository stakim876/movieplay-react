# MoviePlay React

TMDB API로 영화/TV 데이터 가져오고, 로그인·DB는 Firebase 씀.  
넷플릭스 비슷하게 생겼지만 그냥 UI 따라한 게 전부는 아니고, 프로필 나누기·키즈 필터·시청 기록 기반 추천 쪽에 좀 더 신경 썼음.

## 실행

```bash
npm install
npm run dev
```

node 18 이상이면 될 듯

```bash
npm run typecheck
npm run test
npm run build
```

## 쓴 것

react, vite, typescript, react-router, zustand, firebase(auth/firestore), tmdb api, 토스 결제 위젯, vitest, github actions

import `@/` 쓰는 건 vite.config.ts에 alias 해둠

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

firestore.rules 파일 있으니까 firebase 콘솔이랑 맞춰서 배포해야 함

---

Seungtae Kim  
https://github.com/stakim876
