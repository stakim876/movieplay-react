# Contributing

개인 포트폴리오 프로젝트이지만, 구조·품질 기준은 팀 레포와 동일하게 유지합니다.

## 브랜치

- `main` — 배포 가능 상태
- `feature/*` — 기능 단위 작업

## PR 전 체크리스트

```bash
npm run typecheck
npm run test
npm run build
npm run test:e2e   # 선택
```

## 코드 규칙

1. **Feature-Sliced** — 새 화면·도메인은 `src/features/<domain>/`에 추가
2. **서버 데이터** — TMDB/Firestore 읽기는 React Query hook으로 (`core/api/queryKeys.ts` 사용)
3. **공개 API** — feature 외부 노출은 `features/<name>/index.ts` barrel로
4. **스타일** — 디자인 토큰(`tokens.css`)·버튼(`buttons.css`) 우선, 하드코드 색상 금지
5. **범위** — 본편 스트리밍 추가 금지 (저작권). 재생은 `playbackSource.ts` 경유

## 문서

- 아키텍처 변경 → `docs/ARCHITECTURE.md` 업데이트
- 기술 판단·트레이드오프 → `docs/ENGINEERING.md` 보강

## 커밋 메시지 (권장)

```
feat(browse): add person credits pagination
fix(playback): handle missing trailer on TV detail
docs: update README deploy section
```
