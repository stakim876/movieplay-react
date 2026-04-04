# movieplay-react

영화 사이트 비슷하게 만들어 본 거. 데이터는 TMDB에서 긁어오고 로그인이랑 db는 firebase 씀. 구독 쪽은 토스 위젯 붙여 놨는데 그냥 UI 연습 수준이라 실제로 결제 다 되는 서비스는 아님.

배포는 안 해둠. 링크 없고 클론해서 로컬로만 보면 됨.

내가 여기서 직접 맞춰 둔 쪽은 대충 이런 거다. PrivateRoute로 로그인 안 한 사람 메인 화면 라우트 막은 거, TMDB에서 온 데이터에 성인·금칙어·키즈 모드 필터 걸어 둔 거, Firestore Config로 홈에 뭐 뜰지랑 네비 일부 바꿀 수 있게 해 둔 거, 구독 페이지에서 토스 위젯이랑 success fail URL까지 이어지는 흐름. 유저 쪽 상태는 Context 여러 개로 나눠 둠.

연습 프로젝트라 토스 시크릿 키 프론트에 둔 거랑 /admin 은 거의 껍데기만 있는 건 그냥 둠. 실서비스면 결제 검증이랑 시크릿은 서버에서 해야 한다는 건 알고 있음. env 쪽에도 한 번 더 적어 둠.

react vite router. css는 src/styles 아래에 쪼개 둠. helmet이랑 firebase, 아이콘은 react-icons. 결제 sdk 이름은 package.json 보면 나옴 @tosspayments/payment-widget-sdk.

import 할 때 @ 쓰는 건 vite.config.js에 alias 해 둠.

홈에 뭐 나오냐면 ConfigContext가 firestore에서 navigation이랑 homeGenres 같은 거 가져옴. 로딩 중이면 스켈레톤 여러 개 뜸. 순서는 FeaturedHero, CategoryCards, TodayTop10, WatchAgain, MyListRow, TodayRecommend, PersonalizedSection 두 개 제목만 다르고 endpoint는 코드에 박아 둔 거, 그 다음 movieCategories tvCategories 돌면서 CategoryGrid, homeGenres 돌면서 CategoryGrid.

상세는 movie tv 같이 쓰고 url로 구분. 성인이거나 금칙어 걸리면 막음. 키즈 모드도 있음 프로필 설정이랑 엮여 있음. TMDB 쓸 때 약관은 지켜야 함 https://www.themoviedb.org/documentation/api/terms-of-use

검색은 debounce랑 SearchSuggestions. 플레이어는 상세 불러온 다음 VideoPlayer. 찜 시청기록 댓글 좋아요 알림 이런 거 Context랑 firestore에 흩어져 있음.

처음에 스플래시 뜨고 ErrorBoundary 있음. 페이지는 lazy suspense 쓰면 PageLoader 나옴.

## 페이지 경로

로그인 안 해도 됨 /login /signup

로그인 해야 함 / /search /movie/:id /tv/:id /person/:id /category/... /discover /new-hot /favorites /player /player/:id /player/:type/:id /profile /who /subscription /subscription/payment/success /subscription/payment/fail

헤더 사이드바 있는 레이아웃은 로그인 회원가입 구독 who 프로필 빼고 들어가게 해 둔 걸로 기억함. 아니면 App.jsx에서 MainLayout 씌인 부분만 보면 됨.

admin은 admin일 때만 /admin 근데 안은 거의 비어 있음

이상한 주소면 /로 튕김

Provider는 맨 밖에 Theme Auth WatchHistory 그 안 AppContent에서 Toast가 제일 바깥이고 그 안에 Config Subscription Movie Favorites UserFeedback Notifications 순. main.jsx는 HelmetProvider랑 Router만 있음. 까먹으면 파일 열어보는 게 나음

## 폴더

components layout home category search player subscription common 잡다한 거

pages context services tmdb firebase payment subscription recommendation storage firestore 쪽 파일들 hooks utils constants

## 돌리는 법

npm install
npm run dev

빌드 npm run build 미리보기 npm run preview node 18 이상이면 될 듯

## env

.env 만들고 깃에 올리지 말 것

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
VITE_TOSS_SECRET_KEY=
```

firestore.rules 보고 콘솔이랑 맞춰서 배포

시크릿 키 프론트에 두면 안 되는 거 알고 있음 연습이라 이렇게 해 둔 거고 실서비스면 서버에서 해야 함

## 클론

```
git clone https://github.com/stakim876/movieplay-react.git
cd movieplay-react
npm install
npm run dev
```

Seungtae Kim
https://github.com/stakim876

