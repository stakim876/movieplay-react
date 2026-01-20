import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { handlePaymentSuccess } from "@/services/payment";
import { activateSubscription } from "@/services/subscription";
import { FaCheckCircle } from "react-icons/fa";
import "@/styles/subscription/payment-result.css";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      const orderId = searchParams.get("orderId");
      const paymentKey = searchParams.get("paymentKey");
      const amount = searchParams.get("amount");

      if (!orderId || !paymentKey || !amount) {
        showError("결제 정보가 올바르지 않습니다.");
        navigate("/subscription");
        return;
      }

      try {
        // 결제 확인
        const result = await handlePaymentSuccess(orderId, paymentKey, parseInt(amount));
        setPaymentData(result);

        // 주문 ID에서 플랜 정보 추출
        const orderParts = orderId.split("_");
        const planId = orderParts[2]; // subscription_{userId}_{planId}_{timestamp}

        // 구독 활성화
        if (user) {
          await activateSubscription(user.uid, {
            type: result.method || "card",
            last4: result.card?.number?.slice(-4) || "",
            brand: result.card?.company || "",
            amount: result.totalAmount,
            currency: "KRW",
            planId: planId,
            transactionId: result.paymentKey,
            receiptUrl: result.receipt?.url || "",
          });

          showSuccess("구독이 활성화되었습니다!");
        }
      } catch (error) {
        console.error("결제 처리 실패:", error);
        showError(error.message || "결제 처리에 실패했습니다.");
        navigate("/subscription");
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams, user, navigate, showSuccess, showError]);

  if (loading) {
    return (
      <div className="payment-result-page">
        <div className="payment-result-container">
          <div className="loading-spinner">처리 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-page">
      <div className="payment-result-container">
        <div className="payment-success">
          <FaCheckCircle className="success-icon" />
          <h1>결제가 완료되었습니다!</h1>
          {paymentData && (
            <div className="payment-details">
              <p>주문 번호: {paymentData.orderId}</p>
              <p>결제 금액: {paymentData.totalAmount.toLocaleString()}원</p>
              <p>결제 수단: {paymentData.method === "card" ? "카드" : paymentData.method}</p>
            </div>
          )}
          <div className="payment-actions">
            <button className="btn-primary" onClick={() => navigate("/subscription")}>
              구독 관리로 이동
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
