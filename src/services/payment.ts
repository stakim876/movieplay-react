import { loadPaymentWidget, ANONYMOUS } from "@tosspayments/payment-widget-sdk";
import { getPlanById } from "@/constants/subscriptionPlans";

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY;

export async function initializePaymentWidget(customerKey) {
  if (!TOSS_CLIENT_KEY) {
    throw new Error("토스페이먼츠 클라이언트 키가 설정되지 않았습니다.");
  }

  const key = customerKey || ANONYMOUS;
  const paymentWidget = await loadPaymentWidget(TOSS_CLIENT_KEY, key);
  return paymentWidget;
}

export async function requestSubscriptionPayment(planId, isYearly, customerKey) {
  const plan = getPlanById(planId, isYearly);
  if (!plan) {
    throw new Error("유효하지 않은 플랜입니다.");
  }

  const widgetContainer = document.getElementById("payment-widget");
  const agreementContainer = document.getElementById("agreement");
  
  if (!widgetContainer) {
    throw new Error("결제 위젯 컨테이너(#payment-widget)를 찾을 수 없습니다.");
  }
  
  if (!agreementContainer) {
    throw new Error("약관 동의 컨테이너(#agreement)를 찾을 수 없습니다.");
  }

  const paymentWidget = await initializePaymentWidget(customerKey);

  const amount = plan.price;

  try {
    await paymentWidget.renderPaymentMethods(
      "#payment-widget",
      { value: amount },
      { variantKey: "DEFAULT" }
    );

    await paymentWidget.renderAgreement("#agreement", { variantKey: "AGREEMENT" });
  } catch (error) {
    console.error("결제 위젯 렌더링 실패:", error);
    throw new Error(`결제 위젯 렌더링 실패: ${error.message || "알 수 없는 오류"}`);
  }

  return paymentWidget;
}

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

export function generateOrderId(userId, planId) {
  const timestamp = Date.now();
  const suffix = Math.random().toString(36).slice(2, 8);
  return `subscription_${userId}_${planId}_${timestamp}_${suffix}`;
}

export async function handlePaymentSuccess(orderId, paymentKey, amount) {
  if (import.meta.env.PROD) {
    throw new Error("운영 환경에서는 서버 사이드에서 결제를 검증해야 합니다.");
  }

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