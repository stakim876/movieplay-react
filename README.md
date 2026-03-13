# 🎬 MoviePlay React

React와 Firebase를 활용하여 만든 **영화 스트리밍 웹 애플리케이션**입니다.  
사용자는 영화 목록을 탐색하고 추천 영화 및 Top10 콘텐츠를 확인할 수 있으며, Firebase 인증을 통해 로그인 후 서비스를 이용할 수 있습니다.

---

# 🚀 프로젝트 소개

MoviePlay는 영화 스트리밍 서비스 UI를 구현한 웹 애플리케이션입니다.  
React 기반 SPA 구조로 제작되었으며 Firebase를 활용하여 인증 및 데이터 관리를 처리했습니다.

주요 목표는 다음과 같습니다.

- React 기반 컴포넌트 구조 설계
- Firebase Authentication 활용
- 영화 콘텐츠 UI 구현
- 실제 서비스 형태의 웹 애플리케이션 구현

---

# 🛠 Tech Stack

### Frontend
- React
- Vite
- React Router
- CSS

### Backend / Database
- Firebase Authentication
- Firebase Firestore

### Version Control
- Git
- GitHub

---

# ✨ 주요 기능

### 🔐 사용자 로그인
- 이메일 / 비밀번호 로그인
- Firebase Authentication 사용
- 로그인 실패 시 에러 메시지 표시

### 🏠 홈 추천 영화
- 추천 영화 리스트 표시
- 영화 포스터 기반 UI 구성

### 🔝 Top10 영화
- 인기 영화 Top10 목록 제공

### 💳 구독 페이지
- 구독 서비스 UI 구현
- 사용자에게 구독 안내 제공

### 🎥 영화 목록 탐색
- 영화 카드 UI
- 영화 콘텐츠 목록 표시

---

# 📂 프로젝트 구조

```
movieplay-react
│
├── public
│   └── assets
│
├── src
│   ├── components
│   │   ├── Banner
│   │   ├── Header
│   │   └── MovieCard
│   │
│   ├── pages
│   │   ├── Home
│   │   ├── Login
│   │   └── Subscription
│   │
│   ├── firebase
│   │   └── firebaseConfig.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── firestore.rules
├── package.json
└── vite.config.js
```

---

# ⚙️ 설치 및 실행 방법

### 1. 프로젝트 클론

```bash
git clone https://github.com/stakim876/movieplay-react.git
```

### 2. 프로젝트 폴더 이동

```bash
cd movieplay-react
```

### 3. 패키지 설치

```bash
npm install
```

### 4. 개발 서버 실행

```bash
npm run dev
```

---

# 🔥 Firebase 환경 설정

프로젝트 루트에 `.env` 파일을 생성합니다.

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

# 📸 Screenshots

추후 프로젝트 UI 스크린샷 추가 예정

- Home Page
- Login Page
- Subscription Page

---

# 📈 프로젝트 목적

이 프로젝트는 다음 기술을 학습하고 실습하기 위해 제작되었습니다.

- React 기반 SPA 개발
- Firebase 인증 및 데이터 관리
- 컴포넌트 기반 UI 설계
- 실제 서비스 형태의 웹 애플리케이션 구현

---

# 👨‍💻 Author

**Seungtae Kim**

GitHub  
https://github.com/stakim876
