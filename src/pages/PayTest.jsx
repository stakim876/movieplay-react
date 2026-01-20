import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

export default function PayTest() {
  const handlePay = async () => {
    const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;

    if (!clientKey) {
      alert("VITE_TOSS_CLIENT_KEY 없음 (.env 확인 + dev 재시작)");
      return;
    }

    const tossPayments = await loadTossPayments(clientKey);

    const orderId = `order_${crypto.randomUUID()}`;

    await tossPayments.requestPayment("CARD", {
      amount: 1000,
      orderId,
      orderName: "토스 테스트 결제",
      customerName: "테스트유저",
      successUrl: import.meta.env.VITE_TOSS_SUCCESS_URL,
      failUrl: import.meta.env.VITE_TOSS_FAIL_URL,
    });
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>PayTest</h2>
      <button onClick={handlePay}>토스 결제 요청</button>
    </div>
  );
}
