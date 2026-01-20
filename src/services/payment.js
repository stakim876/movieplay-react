/**
 * 토스페이먼츠 결제 서비스
 */
import { loadPaymentWidget, ANONYMOUS } from "@tosspayments/payment-widget-sdk";
import { getPlanById } from "@/constants/subscriptionPlans";

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY;

/**
 * 결제 위젯 초기화
 * @param {string} customerKey - 고객 키 (사용자 ID, 없으면 ANONYMOUS 사용)
 */
export async function initializePaymentWidget(customerKey) {
  if (!TOSS_CLIENT_KEY) {
    throw new Error("토스페이먼츠 클라이언트 키가 설정되지 않았습니다.");
  }

  // customerKey가 없으면 ANONYMOUS 사용
  const key = customerKey || ANONYMOUS;
  const paymentWidget = await loadPaymentWidget(TOSS_CLIENT_KEY, key);
  return paymentWidget;
}

/**
 * 구독 결제 요청
 * @param {string} planId - 플랜 ID
 * @param {boolean} isYearly - 연간 구독 여부
 * @param {string} customerKey - 고객 키 (사용자 ID)
 * @returns {Promise} 결제 위젯 인스턴스
 */
export async function requestSubscriptionPayment(planId, isYearly, customerKey) {
  const plan = getPlanById(planId, isYearly);
  if (!plan) {
    throw new Error("유효하지 않은 플랜입니다.");
  }

  // 위젯 컨테이너 확인
  const widgetContainer = document.getElementById("payment-widget");
  const agreementContainer = document.getElementById("agreement");
  
  if (!widgetContainer) {
    throw new Error("결제 위젯 컨테이너(#payment-widget)를 찾을 수 없습니다.");
  }
  
  if (!agreementContainer) {
    throw new Error("약관 동의 컨테이너(#agreement)를 찾을 수 없습니다.");
  }

  const paymentWidget = await initializePaymentWidget(customerKey);

  // 결제 금액 (원 단위)
  const amount = plan.price;

  try {
    // 결제 정보 설정
    await paymentWidget.renderPaymentMethods(
      "#payment-widget",
      { value: amount },
      { variantKey: "DEFAULT" }
    );

    // 약관 동의 UI 렌더링
    await paymentWidget.renderAgreement("#agreement", { variantKey: "AGREEMENT" });
  } catch (error) {
    console.error("결제 위젯 렌더링 실패:", error);
    throw new Error(`결제 위젯 렌더링 실패: ${error.message || "알 수 없는 오류"}`);
  }

  return paymentWidget;
}

/**
 * 결제 실행
 * @param {Object} paymentWidget - 결제 위젯 인스턴스
 * @param {string} orderId - 주문 ID
 * @param {string} orderName - 주문명
 * @param {string} customerName - 고객명
 * @param {string} customerEmail - 고객 이메일
 * @param {string} successUrl - 성공 시 리다이렉트 URL
 * @param {string} failUrl - 실패 시 리다이렉트 URL
 */
export async function executePayment(
  paymentWidget,
  orderId,
  orderName,
  customerName,
  customerEmail,
  successUrl,
  failUrl
) {
  try {
    await paymentWidget.requestPayment({
      orderId,
      orderName,
      customerName,
      customerEmail,
      successUrl,
      failUrl,
    });
  } catch (error) {
    console.error("결제 요청 실패:", error);
    throw error;
  }
}

/**
 * 주문 ID 생성
 */
export function generateOrderId(userId, planId) {
  const timestamp = Date.now();
  return `subscription_${userId}_${planId}_${timestamp}`;
}

/**
 * 결제 성공 콜백 처리
 * @param {string} orderId - 주문 ID
 * @param {string} paymentKey - 결제 키
 * @param {number} amount - 결제 금액
 * @returns {Promise<Object>} 결제 정보
 * 
 * ⚠️ 보안 주의: 
 * 실제 운영 환경에서는 이 함수를 서버 사이드(Firebase Functions 등)에서 호출해야 합니다.
 * 시크릿 키는 절대 클라이언트에 노출되어서는 안 됩니다.
 */
export async function handlePaymentSuccess(orderId, paymentKey, amount) {
  // 개발 환경에서는 클라이언트에서 직접 호출 (테스트용)
  // 운영 환경에서는 Firebase Functions를 통해 서버에서 처리해야 합니다
  
  if (import.meta.env.PROD) {
    // 운영 환경: 서버 사이드에서 처리
    // Firebase Functions의 verifyPayment 함수 호출 예시
    // const functions = getFunctions();
    // const verifyPayment = httpsCallable(functions, 'verifyPayment');
    // return await verifyPayment({ orderId, paymentKey, amount });
    
    throw new Error("운영 환경에서는 서버 사이드에서 결제를 검증해야 합니다.");
  }

  // 개발 환경: 클라이언트에서 직접 호출 (테스트용)
  // ⚠️ 시크릿 키는 환경 변수에 저장하지 말고, 서버에서만 사용하세요
  const secretKey = import.meta.env.VITE_TOSS_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error("토스페이먼츠 시크릿 키가 설정되지 않았습니다.");
  }

  const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${btoa(`${secretKey}:`)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId,
      paymentKey,
      amount,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "결제 확인 실패");
  }

  const paymentData = await response.json();
  return paymentData;
}
