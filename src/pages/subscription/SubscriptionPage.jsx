import { useMemo, useState } from "react";
import "./SubscriptionPage.css";

export default function SubscriptionPage() {
  const [billing, setBilling] = useState("monthly"); 

  const plans = useMemo(() => {
    const base = [
      {
        key: "basic",
        name: "베이직",
        monthlyPrice: 9900,
        desc: "모바일/태블릿 중심",
        features: ["최대 1개 프로필", "720p 화질", "광고 포함", "다운로드 불가", "동시 시청 1대"],
      },
      {
        key: "standard",
        name: "스탠다드",
        monthlyPrice: 14900,
        badge: "인기",
        desc: "대부분 사용자에게 추천",
        features: ["최대 2개 프로필", "1080p 화질", "광고 없음", "2대 다운로드", "동시 시청 2대"],
      },
      {
        key: "premium",
        name: "프리미엄",
        monthlyPrice: 19900,
        desc: "가족/고화질/다중 기기",
        features: ["최대 4개 프로필", "4K+HDR 화질", "광고 없음", "6대 다운로드", "동시 시청 4대"],
      },
    ];

    const YEARLY_DISCOUNT = 0.15;

    return base.map((p) => {
      if (billing === "monthly") {
        return {
          ...p,
          priceText: `${p.monthlyPrice.toLocaleString()}원`,
          periodText: "/월",
          savingsText: null,
        };
      }

      const yearlyTotal = Math.round(p.monthlyPrice * 12 * (1 - YEARLY_DISCOUNT));
      const monthlyEquivalent = Math.round(yearlyTotal / 12);

      return {
        ...p,
        priceText: `${monthlyEquivalent.toLocaleString()}원`,
        periodText: "/월 (연간 결제)",
        savingsText: `연간 총 ${yearlyTotal.toLocaleString()}원 · 약 ${Math.round(
          YEARLY_DISCOUNT * 100
        )}% 절약`,
      };
    });
  }, [billing]);

  const onSelectPlan = (planKey) => {
    alert(`${planKey} 플랜 선택 (${billing === "monthly" ? "월간" : "연간"})`);
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

                <div className="plan-description">{p.desc}</div>

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
      </div>
    </main>
  );
}
