import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/stores/authStore";
import { useSubscription } from "@/stores/subscriptionStore";
import { getPlanById, getAllPlans } from "@/shared/constants/subscriptionPlans";
import { PORTFOLIO_SCOPE } from "@/shared/constants/portfolioScope";
import { getPaymentHistory } from "@/features/subscription/api/subscription";
import PaymentModal from "@/features/subscription/components/PaymentModal";
import "@/styles/subscription/subscription.css";

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [billing, setBilling] = useState("monthly");
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [selectedPlanId, setSelectedPlanId] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  const isYearly = billing === "yearly";
  const plans = useMemo(() => {
    const all = getAllPlans(isYearly);
    const badge = { standard: "인기" };
    return all.map((plan: any) => {
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
          <p className="hero-kicker">{PORTFOLIO_SCOPE.subscription.kicker}</p>

          <h1 className="subscription-title">{PORTFOLIO_SCOPE.subscription.title}</h1>
          <p className="subscription-subtitle">{PORTFOLIO_SCOPE.subscription.subtitle}</p>

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
                  {p.badge ? PORTFOLIO_SCOPE.subscription.ctaPopular : PORTFOLIO_SCOPE.subscription.ctaDefault}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="subscription-trust" aria-label="구독 안내">
          <div className="trust-grid">
            <div className="trust-card">
              <h4>결제 UI 데모</h4>
              <p>토스 위젯 호출 → 성공/실패 페이지 → Firestore 상태 반영까지의 클라이언트 흐름을 확인할 수 있습니다.</p>
            </div>
            <div className="trust-card">
              <h4>프로필·플랜 연동</h4>
              <p>플랜별 프로필 수·화질·동시 시청 옵션을 UI로 비교하는 패턴을 구현했습니다.</p>
            </div>
            <div className="trust-card">
              <h4>실무에서 추가할 것</h4>
              <p>서버 webhook 승인, 환불 정책, 영수증 검증은 백엔드와 함께 붙이는 영역입니다.</p>
            </div>
          </div>
        </section>

        <section className="subscription-faq" aria-label="FAQ">
          <h2>자주 묻는 질문</h2>

          <div className="faq-item">
            <h3>이 결제는 실제 구독인가요?</h3>
            <p>
              포트폴리오용 결제 UI 데모입니다. 토스 테스트 키로 위젯 흐름을 확인할 수 있으며,
              프로덕션에서는 서버 승인 검증이 필수입니다.
            </p>
          </div>

          <div className="faq-item">
            <h3>플랜 정보는 어디서 오나요?</h3>
            <p>
              <code>subscriptionPlans.ts</code>에 정의된 클라이언트 상수입니다.
              실무에서는 CMS 또는 billing API에서 내려받습니다.
            </p>
          </div>

          <div className="faq-item">
            <h3>동시 시청·다운로드 옵션은?</h3>
            <p>플랜 카드에 표시된 항목은 UI 비교용입니다. 실제 권한은 서버 entitlements로 관리합니다.</p>
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
