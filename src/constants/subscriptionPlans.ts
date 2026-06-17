/**
 * 구독 플랜 정의
 */
export const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic',
    name: '베이직',
    price: 9900,
    currency: 'KRW',
    interval: 'month', // 'month' or 'year'
    features: {
      profiles: 1,
      maxQuality: '720p',
      devices: ['mobile', 'tablet'],
      ads: true,
      downloads: 0,
      simultaneousStreams: 1,
      originalContent: false,
    },
    description: '모바일과 태블릿에서 시청',
    popular: false,
  },
  standard: {
    id: 'standard',
    name: '스탠다드',
    price: 14900,
    currency: 'KRW',
    interval: 'month',
    features: {
      profiles: 2,
      maxQuality: '1080p',
      devices: ['all'],
      ads: false,
      downloads: 2,
      simultaneousStreams: 2,
      originalContent: false,
    },
    description: '모든 기기에서 Full HD로 시청',
    popular: true,
  },
  premium: {
    id: 'premium',
    name: '프리미엄',
    price: 19900,
    currency: 'KRW',
    interval: 'month',
    features: {
      profiles: 4,
      maxQuality: '4K',
      devices: ['all'],
      ads: false,
      downloads: 4,
      simultaneousStreams: 4,
      originalContent: true,
    },
    description: '최고 화질과 모든 기능',
    popular: false,
  },
};

/**
 * 연간 구독 플랜 (2개월 할인)
 */
export const SUBSCRIPTION_PLANS_YEARLY = {
  basic: {
    ...SUBSCRIPTION_PLANS.basic,
    price: 99000, // 12개월 - 2개월 = 10개월 가격
    interval: 'year',
    savings: 19800, // 2개월 할인
  },
  standard: {
    ...SUBSCRIPTION_PLANS.standard,
    price: 149000, // 12개월 - 2개월 = 10개월 가격
    interval: 'year',
    savings: 29800,
  },
  premium: {
    ...SUBSCRIPTION_PLANS.premium,
    price: 199000, // 12개월 - 2개월 = 10개월 가격
    interval: 'year',
    savings: 39800,
  },
};

/**
 * 플랜 ID로 플랜 정보 가져오기
 */
export function getPlanById(planId, isYearly = false) {
  const plans = isYearly ? SUBSCRIPTION_PLANS_YEARLY : SUBSCRIPTION_PLANS;
  return plans[planId] || null;
}

/**
 * 플랜의 기능 가져오기
 */
export function getPlanFeatures(planId, isYearly = false) {
  const plan = getPlanById(planId, isYearly);
  return plan?.features || null;
}

/**
 * 모든 플랜 목록 가져오기
 */
export function getAllPlans(isYearly = false) {
  const plans = isYearly ? SUBSCRIPTION_PLANS_YEARLY : SUBSCRIPTION_PLANS;
  return Object.values(plans);
}
