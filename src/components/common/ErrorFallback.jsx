import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaRedo, FaHome } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import "@/styles/components/error.css";

export default function ErrorFallback({ error, resetErrorBoundary, showDetails = false }) {
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const handleRetry = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate("/home");
    if (resetErrorBoundary) {
      resetErrorBoundary();
    }
  };

  return (
    <div className="error-boundary">
      <div className="error-content">
        <div className="error-icon">
          <FaExclamationTriangle />
        </div>
        <h1 className="error-title">문제가 발생했습니다</h1>
        <p className="error-message">
          예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>

        {showDetails && error && (
          <details className="error-details">
            <summary>에러 상세 정보</summary>
            <div className="error-details-content">
              <p className="error-stack">
                <strong>에러:</strong> {error.message || error.toString()}
              </p>
              {error.stack && (
                <pre className="error-stack">{error.stack}</pre>
              )}
            </div>
          </details>
        )}

        <div className="error-actions">
          <button className="error-btn error-btn-primary" onClick={handleRetry}>
            <FaRedo /> 다시 시도
          </button>
          <button
            className="error-btn error-btn-secondary"
            onClick={handleGoHome}
          >
            <FaHome /> 홈으로 가기
          </button>
        </div>
      </div>
    </div>
  );
}
