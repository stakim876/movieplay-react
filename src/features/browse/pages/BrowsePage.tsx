import { Link } from "react-router-dom";
import { ROUTES } from "@/core/config/routes";
import "@/styles/pages/browse.css";

const GENRES = [
  { id: 28, label: "액션", emoji: "💥" },
  { id: 12, label: "모험", emoji: "🗺️" },
  { id: 16, label: "애니메이션", emoji: "🎨" },
  { id: 35, label: "코미디", emoji: "😂" },
  { id: 18, label: "드라마", emoji: "🎭" },
  { id: 10751, label: "가족", emoji: "👨‍👩‍👧" },
  { id: 14, label: "판타지", emoji: "🐉" },
  { id: 27, label: "공포", emoji: "👻" },
  { id: 10749, label: "로맨스", emoji: "💕" },
  { id: 878, label: "SF", emoji: "🚀" },
  { id: 53, label: "스릴러", emoji: "🔪" },
  { id: 99, label: "다큐", emoji: "📽️" },
];

export default function BrowsePage() {
  return (
    <div className="browse-page">
      <header className="browse-header">
        <h1 className="browse-title">둘러보기</h1>
        <p className="browse-subtitle">장르·카테고리별로 콘텐츠를 탐색하세요</p>
      </header>

      <section className="browse-section">
        <h2 className="browse-section-title">장르</h2>
        <div className="browse-genre-grid">
          {GENRES.map((genre) => (
            <Link
              key={genre.id}
              to={ROUTES.genre(genre.id)}
              className="browse-genre-card"
            >
              <span className="browse-genre-emoji">{genre.emoji}</span>
              <span className="browse-genre-label">{genre.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="browse-section">
        <h2 className="browse-section-title">바로가기</h2>
        <div className="browse-link-row">
          <Link to={ROUTES.newHot} className="browse-link-chip">🔥 신작 & 인기</Link>
          <Link to={ROUTES.discover} className="browse-link-chip">🎬 장르별 전체</Link>
          <Link to={ROUTES.favorites} className="browse-link-chip">❤️ 내가 찜한 목록</Link>
        </div>
      </section>
    </div>
  );
}
