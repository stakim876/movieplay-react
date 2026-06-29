import { Link } from "react-router-dom";
import { ROUTES } from "@/core/config/routes";
import "@/styles/common/common.css";

export default function NotFoundPage() {
  return (
    <div className="error-boundary" style={{ minHeight: "60vh" }}>
      <div className="error-content">
        <h1 className="error-title">페이지를 찾을 수 없습니다</h1>
        <p className="error-message">요청하신 주소가 없거나 이동되었습니다.</p>
        <div className="error-actions">
          <Link to={ROUTES.home} className="error-btn error-btn-primary">
            홈으로 가기
          </Link>
          <Link to={ROUTES.browse} className="error-btn error-btn-secondary">
            둘러보기
          </Link>
        </div>
      </div>
    </div>
  );
}
