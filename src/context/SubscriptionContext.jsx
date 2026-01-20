import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/services/firebase";
import { getPlanFeatures } from "@/constants/subscriptionPlans";

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid, "subscription", "current"),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          // Firestore Timestamp를 Date로 변환
          const subscriptionData = {
            id: snapshot.id,
            ...data,
            startDate: data.startDate?.toDate?.() || data.startDate,
            endDate: data.endDate?.toDate?.() || data.endDate,
            nextBillingDate: data.nextBillingDate?.toDate?.() || data.nextBillingDate,
            trialEndDate: data.trialEndDate?.toDate?.() || data.trialEndDate,
            canceledAt: data.canceledAt?.toDate?.() || data.canceledAt,
          };
          setSubscription(subscriptionData);
        } else {
          setSubscription(null);
        }
        setLoading(false);
      },
      (error) => {
        // 권한 문제나 문서가 없는 경우는 정상적인 상황일 수 있으므로 조용히 처리
        if (error.code === 'permission-denied' || error.code === 'not-found') {
          // 권한이 없거나 문서가 없는 경우는 구독이 없는 것으로 처리
          setSubscription(null);
          setLoading(false);
        } else {
          // 다른 에러는 개발 환경에서만 로그 출력
          if (import.meta.env.DEV) {
            console.error("구독 정보 로드 실패:", error);
          }
          setSubscription(null);
          setLoading(false);
        }
      }
    );

    return unsubscribe;
  }, [user]);

  // 구독 상태 체크
  const isSubscribed = subscription?.status === 'active' || subscription?.status === 'trial';
  const isTrial = subscription?.status === 'trial';
  const isPremium = subscription?.planId === 'premium';
  const isStandard = subscription?.planId === 'standard';
  const isBasic = subscription?.planId === 'basic';
  
  // 기능 체크
  const planFeatures = subscription ? getPlanFeatures(subscription.planId) : null;
  const canDownload = planFeatures?.downloads > 0 || false;
  const maxQuality = planFeatures?.maxQuality || '480p';
  const maxProfiles = planFeatures?.profiles || 0;
  const hasAds = planFeatures?.ads !== false; // 기본값은 광고 있음
  const canAccessOriginalContent = planFeatures?.originalContent || false;
  const maxSimultaneousStreams = planFeatures?.simultaneousStreams || 1;

  // 구독 만료 체크
  const isExpired = subscription?.status === 'expired' || 
    (subscription?.endDate && new Date(subscription.endDate) < new Date());

  // 구독 만료까지 남은 일수
  const daysUntilExpiry = subscription?.endDate 
    ? Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  // 무료 체험 만료까지 남은 일수
  const daysUntilTrialEnd = subscription?.trialEndDate
    ? Math.ceil((new Date(subscription.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        // 상태
        isSubscribed,
        isTrial,
        isPremium,
        isStandard,
        isBasic,
        isExpired,
        // 기능
        canDownload,
        maxQuality,
        maxProfiles,
        hasAds,
        canAccessOriginalContent,
        maxSimultaneousStreams,
        planFeatures,
        // 기타
        daysUntilExpiry,
        daysUntilTrialEnd,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
