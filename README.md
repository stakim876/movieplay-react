# MoviePlay React

tmdb api로 영화 데이터 가져오고 로그인·db는 firebase.

ui는 ott 비슷하게 만들었는데 그게 전부는 아니고, 프로필 나누기 / 키즈 필터 / 시청기록 기반 추천 쪽에 더 시간 썼음. context 쓰다 zustand로 바꿨고 typescript 전환함. vitest랑 github actions ci도 붙여둠.

## 기능

- 로그인, 회원가입. PrivateRoute로 막음
- who 페이지에서 프로필 고름 (pin, 키즈)
- 홈 — 이어보기, 오늘 추천, 맞춤 추천. 프로필 이름 뜸
- tmdb로 영화·tv 조회, 상세, 검색. 재생은 트레일러 수준
- tmdb.ts에서 성인 + 금칙어 + 키즈 장르 한번 더 거름
- 찜, 시청기록, 좋아요/관심없음 → 추천 반영
- 추천할 때 왜 이 작품인지 한 줄 (recommendation.ts)
- firestore config로 홈 메뉴·장르 (navigation, homeGenres)
- 토스 결제 위젯 — ui랑 success/fail 페이지만. 승인 검증은 서버 필요한거 알고있음
- lazy load, skeleton

## 에러 처리

완벽하진 않음. 대충 이렇게 해둠.

ErrorBoundary — 홈 등에서 렌더 터지면 fallback + 다시시도

tmdb fetchMovies 실패하면 throw 안하고 results 빈배열. 오늘 추천에 다시시도 버튼

api url에 language, include_adult 중복 붙어서 400 뜨던거 URLSearchParams로 고침

firestore 금칙어 로딩 실패하면 fallback 키워드로 필터 계속

config 못 불러오면 loading false하고 빈 상태

로그인 firebase 에러 코드별 메시지

관심없음 누르면 toast

e2e, sentry 같은건 아직 없음

## 스택

react, vite, typescript, react-router, zustand, firebase, tmdb, 토스 위젯, vitest, github actions

@ import는 vite.config.ts alias

## 실행

```
npm install
npm run dev
```

node 18 이상

```
npm run typecheck
npm run test
npm run build
```

push/pr 하면 ci에서 typecheck → test → build

## env

.env 루트에 만들기. 깃에 올리지 말 것

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

firestore.rules 보고 콘솔이랑 맞춰서 배포

---

Seungtae Kim  
https://github.com/stakim876
