import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { getPlanById, getAllPlans } from "@/constants/subscriptionPlans";
import { getPaymentHistory } from "@/services/subscription";
import PaymentModal from "@/components/subscription/PaymentModal";
import "./SubscriptionPage.css";

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [billing, setBilling] = useState("monthly");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const isYearly = billing === "yearly";
  const plans = useMemo(() => {
    const all = getAllPlans(isYearly);
    const badge = { standard: "인기" };
    return all.map((plan) => {
      const f = plan.features || {};
      const features = [
        `최대 ${f.profiles ?? 0}개 프로필`,
        `${f.maxQuality ?? "-"} 화질`,
        f.ads ? "광고 포함" : "광고 없음",
        (f.downloads ?? 0) > 0 ? `${f.downloads}대 다운로드` : "다운로드 불가",
        `동시 시청 ${f.simultaneousStreams ?? 1}대`,
      ];
      return {
        key: plan.id,
        name: plan.name,
        priceText: `${plan.price.toLocaleString()}원`,
        periodText: isYearly ? "/월 (연간 결제)" : "/월",
        savingsText: plan.savings != null ? `연간 약 ${(plan.savings / 10000).toFixed(0)}만원 절약` : null,
        features,
        badge: badge[plan.id] || null,
        desc: plan.description,
      };
    });
  }, [billing]);

  useEffect(() => {
    if (!user?.uid) {
      setPaymentHistory([]);
      return;
    }
    let cancelled = false;
    setHistoryLoading(true);
    getPaymentHistory(user.uid, 20)
      .then((list) => {
        if (!cancelled) setPaymentHistory(list);
      })
      .catch(() => {
        if (!cancelled) setPaymentHistory([]);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?.uid]);

  const onSelectPlan = (planKey) => {
    if (!user) {
      navigate("/login", { state: { from: "/subscription" } });
      return;
    }
    setSelectedPlanId(planKey);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    setSelectedPlanId(null);
  };

  return (
    <main className="subscription-page">
      <div className="subscription-container">
        <section className="subscription-hero">
          <p className="hero-kicker">MoviePlay 구독</p>

          <h1 className="subscription-title">구독 플랜 선택</h1>
          <p className="subscription-subtitle">원하는 플랜을 선택하고 무료로 14일간 체험해보세요</p>

          <div className="billing-toggle" role="group" aria-label="결제 주기">
            <span className={billing === "monthly" ? "active" : ""}>월간</span>

            <button
              type="button"
              className={`toggle-switch ${billing === "yearly" ? "yearly" : ""}`}
              onClick={() => setBilling((prev) => (prev === "monthly" ? "yearly" : "monthly"))}
              aria-label="월간/연간 전환"
            >
              <span className="toggle-slider" />
            </button>

            <span className={billing === "yearly" ? "active" : ""}>
              연간 <span className="savings-badge">최대 15% 절약</span>
            </span>
          </div>
        </section>

        <section className="subscription-plans" aria-label="구독 플랜">
          <div className="plans-grid">
            {plans.map((p) => (
              <article
                key={p.key}
                className={`plan-card ${p.badge ? "popular" : ""}`}
                aria-label={`${p.name} 플랜`}
              >
                {p.badge && <div className="popular-badge">{p.badge}</div>}

                <h3 className="plan-name">{p.name}</h3>

                <div className="plan-price">
                  <span className="price-amount">{p.priceText}</span>
                  <span className="price-period">{p.periodText}</span>
                </div>

                {p.savingsText && <div className="plan-savings">{p.savingsText}</div>}

                {p.desc && <div className="plan-description">{p.desc}</div>}

                <ul className="plan-features">
                  {p.features.map((f) => (
                    <li key={f}>
                      <span className="feature-icon">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={`btn-plan ${p.badge ? "upgrade" : "subscribe"}`}
                  onClick={() => onSelectPlan(p.key)}
                >
                  {p.badge ? "가장 인기 플랜 선택" : "구독하기"}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="subscription-trust" aria-label="구독 안내">
          <div className="trust-grid">
            <div className="trust-card">
              <h4>언제든지 해지 가능</h4>
              <p>무료 체험 기간에도 동일하게 언제든지 해지할 수 있어요.</p>
            </div>
            <div className="trust-card">
              <h4>기기 간 이어보기</h4>
              <p>모바일에서 보다가 TV에서 이어보는 몰입형 시청 경험을 제공합니다.</p>
            </div>
            <div className="trust-card">
              <h4>감성 큐레이션</h4>
              <p>좋아요/태그/기록 기반으로 너 취향에 맞는 작품을 더 잘 찾게 해줘요.</p>
            </div>
          </div>
        </section>

        <section className="subscription-faq" aria-label="FAQ">
          <h2>자주 묻는 질문</h2>

          <div className="faq-item">
            <h3>무료 체험은 어떻게 적용되나요?</h3>
            <p>첫 구독 시 14일 무료 체험이 적용됩니다. 체험 기간 내 해지하면 요금이 청구되지 않습니다.</p>
          </div>

          <div className="faq-item">
            <h3>연간 결제는 언제든지 변경할 수 있나요?</h3>
            <p>연간/월간 전환은 설정에서 변경할 수 있도록 구성할 수 있습니다. (결제 정책에 따라 환불 규칙을 정하세요)</p>
          </div>

          <div className="faq-item">
            <h3>동시 시청은 몇 대까지 가능한가요?</h3>
            <p>플랜마다 동시 시청 가능 기기 수가 다릅니다. 플랜 카드의 “동시 시청” 항목을 확인해주세요.</p>
          </div>

          <div className="faq-item">
            <h3>다운로드 기능은 어떤 기기에서 되나요?</h3>
            <p>일반적으로 모바일 앱 환경에서 제공하는 방식이 많습니다. 프로젝트 방향에 맞게 지원 범위를 정하면 됩니다.</p>
          </div>
        </section>

        {user && (
          <section className="subscription-payment-history" aria-label="결제 내역">
            <h2 className="payment-history-title">결제 내역</h2>
            {historyLoading ? (
              <p className="payment-history-loading">불러오는 중...</p>
            ) : paymentHistory.length === 0 ? (
              <p className="payment-history-empty">결제 내역이 없습니다.</p>
            ) : (
              <ul className="payment-history-list">
                {paymentHistory.map((item) => (
                  <li key={item.id} className="payment-history-item">
                    <span className="payment-history-date">
                      {item.paymentDate
                        ? new Date(item.paymentDate).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </span>
                    <span className="payment-history-plan">{item.planId || "구독"}</span>
                    <span className="payment-history-amount">
                      {item.amount?.toLocaleString()}원
                    </span>
                    {item.receiptUrl && (
                      <a
                        href={item.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="payment-history-receipt"
                      >
                        영수증
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedPlanId(null);
          }}
          planId={selectedPlanId}
          isYearly={isYearly}
          userId={user?.uid}
          userEmail={user?.email ?? ""}
          userName={user?.displayName ?? ""}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    </main>
  );
}
