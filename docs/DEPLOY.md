# Vercel 배포 가이드

Live Demo URL이 있으면 채용 리뷰 통과율이 가장 크게 올라갑니다. 아래 순서대로 진행하세요.

## 1. 사전 준비

- GitHub에 `movieplay-react` 저장소 push 완료
- [TMDB API 키](https://www.themoviedb.org/settings/api) 발급
- [Firebase](https://console.firebase.google.com/) 프로젝트 생성 (Authentication Email/Password + Firestore)
- (선택) [토스페이먼츠](https://developers.tosspayments.com/) 테스트 클라이언트 키

## 2. Vercel 프로젝트 생성

1. [vercel.com](https://vercel.com) 로그인 → **Add New Project**
2. GitHub 저장소 `movieplay-react` Import
3. Framework Preset: **Vite** (자동 감지)
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Install Command: `npm ci` (기본값 유지)

`vercel.json`에 SPA rewrite가 이미 포함되어 있습니다:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## 3. Environment Variables

Vercel **Settings → Environment Variables**에 아래를 **Production**에 등록:

| 변수 | 필수 | 비고 |
|------|:---:|------|
| `VITE_TMDB_API_KEY` | ✅ | TMDB v3 API key |
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase 웹 앱 설정 |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | `xxx.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | |
| `VITE_FIREBASE_APP_ID` | ✅ | |
| `VITE_FIREBASE_MEASUREMENT_ID` | | Analytics 사용 시 |
| `VITE_TOSS_CLIENT_KEY` | | 결제 UI 데모 (없으면 구독 모달만 에러) |

> `VITE_` 접두사가 있어야 Vite 빌드에 클라이언트 번들로 주입됩니다.

## 4. Firebase 배포 후 설정

### Authentication

- Sign-in method: **이메일/비밀번호** 활성화
- (선택) 테스트용 계정 1개 생성 — 리뷰어용

### Authorized domains

Firebase Console → Authentication → Settings → **Authorized domains**에 추가:

```
your-project.vercel.app
```

커스텀 도메인 사용 시 해당 도메인도 추가합니다.

### Firestore

- `firestore.rules`가 저장소에 있음 — Firebase Console에서 배포 또는 CLI로 적용
- 첫 로그인 시 프로필·찜·시청기록 컬렉션이 생성되는 구조

## 5. Deploy & 확인

1. Vercel **Deploy** 실행
2. 배포 URL에서 체크리스트:

| # | 확인 |
|---|------|
| 1 | `/login` 렌더 |
| 2 | 회원가입 → `/who` 프로필 선택 |
| 3 | `/home` 히어로·카테고리 로드 (TMDB) |
| 4 | 상세 → **예고편 보기** |
| 5 | 검색 · 찜 · 키즈 프로필 |

## 6. README 업데이트

배포 URL을 README 맨 위에 반영:

```markdown
**Live Demo** — https://your-project.vercel.app
```

이력서·지원서에도 **동일 URL**을 첫 줄에 넣습니다.

## 7. 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| 로그인 후 빈 화면 | Firebase authorized domain 미등록 | Vercel 도메인 추가 |
| TMDB 이미지/목록 안 나옴 | `VITE_TMDB_API_KEY` 누락 | env 재설정 후 Redeploy |
| 새로고침 404 | SPA rewrite 없음 | `vercel.json` 확인 |
| 결제 위젯 실패 | Toss 키 없음/테스트 키 | env 또는 구독 페이지 스킵 안내 |

## 8. (선택) 리뷰어용 데모 계정

README에 테스트 계정을 공개할 경우:

```markdown
### Demo account (read-only review)
- Email: demo@example.com
- Password: (비공개 — 지원서에 기재)
```

공개 저장소에는 비밀번호를 올리지 마세요.

---

배포 후 [`docs/POSITIONING.md`](./POSITIONING.md)의 소개 멘트와 함께 URL을 제출하면 됩니다.
