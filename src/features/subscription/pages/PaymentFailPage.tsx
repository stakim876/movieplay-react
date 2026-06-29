import { useNavigate, useSearchParams } from "react-router-dom";
import { FaExclamationCircle } from "react-icons/fa";
import "@/styles/subscription/payment-result.css";

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message");

  const getErrorMessage = () => {
    if (errorMessage) return errorMessage;
    
    switch (errorCode) {
      case "USER_CANCEL":
        return "결제가 취소되었습니다.";
      case "INVALID_CARD":
        return "유효하지 않은 카드 정보입니다.";
      case "INSUFFICIENT_FUNDS":
        return "잔액이 부족합니다.";
      default:
        return "결제 처리 중 오류가 발생했습니다.";
    }
  };

  return (
    <div className="payment-result-page">
      <div className="payment-result-container">
        <div className="payment-fail">
          <FaExclamationCircle className="fail-icon" />
          <h1>결제에 실패했습니다</h1>
          <p className="error-message">{getErrorMessage()}</p>
          <div className="payment-actions">
            <button className="btn-primary" onClick={() => navigate("/subscription")}>
              다시 시도
            </button>
            <button className="btn-secondary" onClick={() => navigate("/")}>
              홈으로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
