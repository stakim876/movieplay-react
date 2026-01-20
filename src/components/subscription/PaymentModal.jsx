import { useState, useEffect, useRef } from "react";
import { FaTimes, FaCreditCard, FaLock } from "react-icons/fa";
import { requestSubscriptionPayment, executePayment, generateOrderId } from "@/services/payment";
import { getPlanById } from "@/constants/subscriptionPlans";
import "@/styles/subscription/payment-modal.css";

export default function PaymentModal({
  isOpen,
  onClose,
  planId,
  isYearly,
  userId,
  userEmail,
  userName,
  onPaymentSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const paymentWidgetRef = useRef(null);

  useEffect(() => {
    if (isOpen && planId) {
      // DOM이 준비된 후에 위젯 초기화
      const timer = setTimeout(() => {
        initializeWidget();
      }, 100);

      return () => {
        clearTimeout(timer);
        // 위젯 컨테이너 정리
        const widgetContainer = document.getElementById("payment-widget");
        const agreementContainer = document.getElementById("agreement");
        if (widgetContainer) widgetContainer.innerHTML = "";
        if (agreementContainer) agreementContainer.innerHTML = "";
      };
    }
  }, [isOpen, planId, isYearly]);

  const initializeWidget = async () => {
    try {
      setError(null);
      
      // 위젯 컨테이너가 존재하는지 확인
      const widgetContainer = document.getElementById("payment-widget");
      const agreementContainer = document.getElementById("agreement");
      
      if (!widgetContainer || !agreementContainer) {
        throw new Error("결제 위젯 컨테이너를 찾을 수 없습니다.");
      }

      const widget = await requestSubscriptionPayment(planId, isYearly, userId);
      paymentWidgetRef.current = widget;
    } catch (err) {
      console.error("결제 위젯 초기화 실패:", err);
      setError(err.message || "결제 위젯을 초기화할 수 없습니다. 환경 변수를 확인해주세요.");
    }
  };

  const handlePayment = async () => {
    if (!paymentWidgetRef.current) {
      setError("결제 위젯이 초기화되지 않았습니다.");
      return;
    }

    const plan = getPlanById(planId, isYearly);
    if (!plan) {
      setError("플랜 정보를 찾을 수 없습니다.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderId = generateOrderId(userId, planId);
      const orderName = `${plan.name} 플랜 ${isYearly ? "연간" : "월간"} 구독`;

      // 성공/실패 URL 설정
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/subscription/payment/success?orderId=${orderId}`;
      const failUrl = `${baseUrl}/subscription/payment/fail?orderId=${orderId}`;

      await executePayment(
        paymentWidgetRef.current,
        orderId,
        orderName,
        userName || "고객",
        userEmail || "",
        successUrl,
        failUrl
      );

      // 결제 창이 열리면 모달은 닫지 않음 (결제 완료 후 리다이렉트)
    } catch (err) {
      console.error("결제 실행 실패:", err);
      setError(err.message || "결제를 진행할 수 없습니다.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const plan = getPlanById(planId, isYearly);

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>결제 정보</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="payment-modal-content">
          {plan && (
            <div className="payment-summary">
              <h3>주문 내역</h3>
              <div className="summary-item">
                <span>플랜</span>
                <span>{plan.name}</span>
              </div>
              <div className="summary-item">
                <span>구독 기간</span>
                <span>{isYearly ? "연간" : "월간"}</span>
              </div>
              <div className="summary-item total">
                <span>결제 금액</span>
                <span>{plan.price.toLocaleString()}원</span>
              </div>
            </div>
          )}

          <div className="payment-widget-container">
            <div id="payment-widget" style={{ minHeight: "200px" }}></div>
            <div id="agreement" style={{ marginTop: "1rem" }}></div>
          </div>

          {error && (
            <div className="payment-error">
              <p><strong>오류:</strong> {error}</p>
              {error.includes("클라이언트 키") && (
                <p style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
                  .env 파일에 VITE_TOSS_CLIENT_KEY를 설정해주세요.
                </p>
              )}
            </div>
          )}

          <div className="payment-security">
            <FaLock />
            <span>안전한 결제를 위해 토스페이먼츠가 결제를 대행합니다.</span>
          </div>
        </div>

        <div className="payment-modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            취소
          </button>
          <button
            className="btn-pay"
            onClick={handlePayment}
            disabled={loading || !paymentWidgetRef.current}
          >
            {loading ? "처리 중..." : `${plan?.price.toLocaleString()}원 결제하기`}
          </button>
        </div>
      </div>
    </div>
  );
}
