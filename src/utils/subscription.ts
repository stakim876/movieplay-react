import { getPlanFeatures } from "@/constants/subscriptionPlans";

/**
 * 구독 제한 체크
 */
export function checkSubscriptionLimit(subscription, action) {
  if (!subscription) {
    return { allowed: false, reason: '구독이 필요합니다.' };
  }

  if (subscription.status !== 'active' && subscription.status !== 'trial') {
    return { allowed: false, reason: '활성 구독이 필요합니다.' };
  }

  const features = getPlanFeatures(subscription.planId, subscription.isYearly);

  if (!features) {
    return { allowed: false, reason: '플랜 정보를 찾을 수 없습니다.' };
  }

  switch (action) {
    case 'download':
      if (features.downloads === 0) {
        return { 
          allowed: false, 
          reason: '다운로드는 스탠다드 이상 플랜에서만 가능합니다.',
          requiredPlan: 'standard'
        };
      }
      break;
    
    case 'quality_4k':
      if (features.maxQuality !== '4K') {
        return { 
          allowed: false, 
          reason: '4K 화질은 프리미엄 플랜에서만 가능합니다.',
          requiredPlan: 'premium'
        };
      }
      break;
    
    case 'quality_1080p':
      if (features.maxQuality === '480p' || features.maxQuality === '720p') {
        return { 
          allowed: false, 
          reason: '1080p 화질은 스탠다드 이상 플랜에서만 가능합니다.',
          requiredPlan: 'standard'
        };
      }
      break;
    
    case 'profiles':
      // 프로필 수는 별도로 체크
      break;
    
    case 'original_content':
      if (!features.originalContent) {
        return { 
          allowed: false, 
          reason: '오리지널 콘텐츠는 프리미엄 플랜에서만 가능합니다.',
          requiredPlan: 'premium'
        };
      }
      break;
    
    case 'no_ads':
      if (features.ads) {
        return { 
          allowed: false, 
          reason: '광고 제거는 스탠다드 이상 플랜에서만 가능합니다.',
          requiredPlan: 'standard'
        };
      }
      break;
  }

  return { allowed: true };
}

/**
 * 최대 화질 가져오기
 */
export function getMaxQuality(subscription) {
  if (!subscription) return '480p';
  const features = getPlanFeatures(subscription.planId, subscription.isYearly);
  return features?.maxQuality || '480p';
}

/**
 * 다운로드 가능 여부
 */
export function canDownload(subscription) {
  if (!subscription) return false;
  const features = getPlanFeatures(subscription.planId, subscription.isYearly);
  return features?.downloads > 0 || false;
}

/**
 * 프로필 수 제한 체크
 */
export function checkProfileLimit(subscription, currentProfileCount) {
  if (!subscription) {
    return { allowed: false, reason: '구독이 필요합니다.' };
  }

  const features = getPlanFeatures(subscription.planId, subscription.isYearly);
  const maxProfiles = features?.profiles || 0;

  if (currentProfileCount >= maxProfiles) {
    return { 
      allowed: false, 
      reason: `최대 ${maxProfiles}개의 프로필만 생성할 수 있습니다.`,
      maxProfiles
    };
  }

  return { allowed: true, maxProfiles };
}

/**
 * 동시 시청 제한 체크
 */
export function checkSimultaneousStreams(subscription, currentStreams) {
  if (!subscription) {
    return { allowed: false, reason: '구독이 필요합니다.' };
  }

  const features = getPlanFeatures(subscription.planId, subscription.isYearly);
  const maxStreams = features?.simultaneousStreams || 1;

  if (currentStreams >= maxStreams) {
    return { 
      allowed: false, 
      reason: `최대 ${maxStreams}개의 기기에서 동시에 시청할 수 있습니다.`,
      maxStreams
    };
  }

  return { allowed: true, maxStreams };
}

/**
 * 화질 선택 가능 여부
 */
export function canSelectQuality(subscription, quality) {
  if (!subscription) return false;
  
  const maxQuality = getMaxQuality(subscription);
  const qualityOrder = { '480p': 1, '720p': 2, '1080p': 3, '4K': 4 };
  const requestedOrder = qualityOrder[quality] || 0;
  const maxOrder = qualityOrder[maxQuality] || 0;

  return requestedOrder <= maxOrder;
}
